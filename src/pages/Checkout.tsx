import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Loader2, MapPin, Store, CreditCard, Banknote, Wallet, Building2, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useConfig } from '@/hooks/useConfig';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MenuHeader } from '@/components/MenuHeader';
import { Footer } from '@/components/Footer';
import { z } from 'zod';
import { trackInitiateCheckout, trackPurchase, trackContact, trackAddPaymentInfo, trackLead } from '@/lib/metaPixel';
import { setSupabaseSessionHeader } from '@/lib/supabaseHeaders';
// [2026-04-08] Sugerencias de último momento en checkout
import { UpsellSuggestions } from '@/components/cart/UpsellSuggestions';

// SEGURIDAD [C3]: session_id se genera una vez por sesión de checkout.
// Se usa para vincular pedidos, items y pending_checkouts al mismo cliente.
// Nunca generar uno nuevo durante el flujo — debe ser consistente.
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('checkout_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('checkout_session_id', sessionId);
  }
  // SEGURIDAD: Configurar header para que get_client_session_id() en la DB
  // pueda leer el session_id del request HTTP
  setSupabaseSessionHeader(sessionId);
  return sessionId;
};

type CheckoutStep = 'form' | 'success';
type DeliveryType = 'pickup' | 'delivery';

// Payment methods by currency
const USD_PAYMENT_METHODS = [
  { id: 'usdt', label: 'USDT (Crypto)', icon: Wallet },
  { id: 'zinli', label: 'Zinli', icon: CreditCard },
  { id: 'zelle', label: 'Zelle', icon: CreditCard },
  { id: 'cash_usd', label: 'Divisas en Efectivo', icon: Banknote },
];

const VES_PAYMENT_METHODS = [
  { id: 'pago_movil', label: 'Pago Móvil', icon: CreditCard },
  { id: 'transferencia', label: 'Transferencia Bancaria', icon: Building2 },
];

// Validate Google Maps URL pattern
const isValidMapsUrl = (url: string): boolean => {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.includes('google.com') ||
      parsed.hostname.includes('goo.gl') ||
      parsed.hostname.includes('maps.google') ||
      parsed.hostname === 'maps.app.goo.gl'
    );
  } catch {
    return false;
  }
};

const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es requerido').max(100),
  lastName: z.string().trim().min(1, 'El apellido es requerido').max(100),
  phone: z.string().trim().min(1, 'El teléfono es requerido').max(20),
  email: z.string().trim().email('Correo inválido').max(255),
  deliveryAddress: z.string().trim().max(500).optional(),
  deliveryMapsUrl: z.string().trim().max(500).optional().refine(
    (val) => !val || isValidMapsUrl(val),
    { message: 'Debe ser un enlace válido de Google Maps' }
  ),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.string().min(1, 'Selecciona un método de pago'),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { currency, toggleCurrency, displayMode, getPrices, exchangeRate } = useCurrency();
  const { config } = useConfig();
  
  const [step, setStep] = useState<CheckoutStep>('form');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup');
  const [hasSavedData, setHasSavedData] = useState(false);
  const [formData, setFormData] = useState(() => {
    const defaults = {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      deliveryAddress: '',
      deliveryMapsUrl: '',
      notes: '',
      paymentMethod: '',
    };
    try {
      const saved = localStorage.getItem('checkout_customer_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed, notes: '', paymentMethod: '' };
      }
    } catch {}
    return defaults;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('checkout_customer_data');
      if (saved) setHasSavedData(true);
    } catch {}
  }, []);

  const clearSavedData = () => {
    localStorage.removeItem('checkout_customer_data');
    setHasSavedData(false);
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      deliveryAddress: '',
      deliveryMapsUrl: '',
      notes: '',
      paymentMethod: '',
    });
    toast.success('Datos guardados eliminados');
  };
  const [paymentCurrency, setPaymentCurrency] = useState<'USD' | 'VES'>(
    displayMode === 'solo_ves' ? 'VES' : 'USD'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const pendingCheckoutIdRef = useRef<string | null>(null);
  const checkoutCompletedRef = useRef(false);

  const prices = getPrices(subtotal);
  const whatsappNumber = config?.whatsapp || '584249056438';

  // [2026-07-22] Evita navegar durante render cuando el carrito queda vacío
  // después de completar una compra y antes de redirigir a WhatsApp.
  useEffect(() => {
    if (items.length === 0 && step === 'form') {
      navigate('/carrito', { replace: true });
    }
  }, [items.length, navigate, step]);

  // Track InitiateCheckout once when entering checkout
  const hasTrackedCheckoutRef = useRef(false);
  
  useEffect(() => {
    if (items.length === 0) return;
    
    // Track InitiateCheckout event for Meta Pixel (only once)
    if (!hasTrackedCheckoutRef.current) {
      trackInitiateCheckout(
        items.map(item => ({
          id: item.id,
          precio_usd: item.precio_usd,
          quantity: item.quantity,
        })),
        subtotal
      );
      hasTrackedCheckoutRef.current = true;
    }
  }, [items, subtotal]);

  // Track pending checkout for abandoned cart detection
  useEffect(() => {
    if (items.length === 0) return;

    const sessionId = getSessionId();
    const cartItems = items.map(item => ({
      id: item.id,
      nombre: item.nombre,
      precio_usd: item.precio_usd,
      quantity: item.quantity,
    }));

    // Create or update pending checkout record
    const upsertPendingCheckout = async () => {
      try {
        // Check if we already have a pending checkout for this session
        const { data: existing } = await supabase
          .from('pending_checkouts')
          .select('id')
          .eq('session_id', sessionId)
          .maybeSingle();

        if (existing) {
          // Update existing record
          await supabase
            .from('pending_checkouts')
            .update({
              cart_items: cartItems,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
          pendingCheckoutIdRef.current = existing.id;
        } else {
          // Create new record
          const { data: newRecord } = await supabase
            .from('pending_checkouts')
            .insert({
              session_id: sessionId,
              cart_items: cartItems,
            })
            .select('id')
            .single();
          
          if (newRecord) {
            pendingCheckoutIdRef.current = newRecord.id;
          }
        }
      } catch (error) {
        // Silently fail - this is tracking, not critical functionality
        console.error('Error tracking pending checkout:', error);
      }
    };

    upsertPendingCheckout();
  }, [items]);

  // Update pending checkout with customer info when form changes
  useEffect(() => {
    if (!pendingCheckoutIdRef.current) return;
    if (!formData.email && !formData.phone) return;

    const updateCustomerInfo = async () => {
      try {
        await supabase
          .from('pending_checkouts')
          .update({
            customer_email: formData.email || null,
            customer_phone: formData.phone || null,
            customer_first_name: formData.firstName || null,
            customer_last_name: formData.lastName || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pendingCheckoutIdRef.current);
      } catch (error) {
        // Silently fail
      }
    };

    // Debounce the update
    const timeoutId = setTimeout(updateCustomerInfo, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData.email, formData.phone, formData.firstName, formData.lastName]);

  // Delete pending checkout when order is completed
  const deletePendingCheckout = async () => {
    if (pendingCheckoutIdRef.current && !checkoutCompletedRef.current) {
      checkoutCompletedRef.current = true;
      try {
        await supabase
          .from('pending_checkouts')
          .delete()
          .eq('id', pendingCheckoutIdRef.current);
        sessionStorage.removeItem('checkout_session_id');
      } catch (error) {
        // Silently fail
      }
    }
  };
  
  // Get available payment methods based on currency
  const availablePaymentMethods = paymentCurrency === 'USD' ? USD_PAYMENT_METHODS : VES_PAYMENT_METHODS;
  
  // Get payment method label
  const getPaymentMethodLabel = (methodId: string): string => {
    const allMethods = [...USD_PAYMENT_METHODS, ...VES_PAYMENT_METHODS];
    return allMethods.find(m => m.id === methodId)?.label || methodId;
  };

  // Reset payment method when currency changes
  const handleCurrencyChange = (newCurrency: 'USD' | 'VES') => {
    setPaymentCurrency(newCurrency);
    // Reset payment method since options change based on currency
    setFormData(prev => ({ ...prev, paymentMethod: '' }));
    if (errors.paymentMethod) {
      setErrors(prev => ({ ...prev, paymentMethod: '' }));
    }
  };

  // Track AddPaymentInfo when payment method is selected
  const handlePaymentMethodChange = (method: string) => {
    handleInputChange('paymentMethod', method);
    trackAddPaymentInfo(method, subtotal, paymentCurrency);
  };

  if (items.length === 0) {
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const normalizePhone = (phone: string): string => {
    return phone.replace(/[\s\-\(\)]/g, '');
  };

  // FEATURE [EXTRAS]: El mensaje de WhatsApp agrupa productos por categoría
  // y destaca los extras en una línea con precio individual.
  const generateWhatsAppMessage = (orderNum: string): string => {
    // Agrupar items por categoría preservando orden de inserción
    const grouped = new Map<string, typeof items>();
    items.forEach(item => {
      const key = (item.categoria || 'otros').toLowerCase();
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(item);
    });

    const formatPrice = (usd: number) => {
      const p = getPrices(usd);
      return paymentCurrency === 'USD' ? p.formattedUSD : p.formattedVES;
    };

    const sections: string[] = [];
    grouped.forEach((catItems, catKey) => {
      const header = `*${catKey.toUpperCase()}*`;
      const lines = catItems.map(item => {
        const extrasTotal = (item.extras || []).reduce((s, e) => s + e.precio_usd, 0);
        const lineTotal = (item.precio_usd + extrasTotal) * item.quantity;
        let line = `• ${item.quantity}x ${item.nombre} — ${formatPrice(lineTotal)}`;
        if (item.extras && item.extras.length > 0) {
          // NOTA: se usa formato multi-línea (una línea por extra) para máxima
          // legibilidad en WhatsApp. Se evitan emojis como ➕ porque algunos
          // dispositivos receptores los renderizan como rombos (◇/◆) por falta
          // de glifo en su set de emojis; el marcador *Extras:* siempre renderiza.
          line += `\n   *Extras:*`;
          item.extras.forEach(e => {
            line += `\n   - ${e.nombre} (+${formatPrice(e.precio_usd)})`;
          });
        }
        if (item.notes?.trim()) {
          line += `\n   Nota: ${item.notes.trim()}`;
        }
        return line;
      }).join('\n');

      sections.push(`${header}\n${lines}`);
    });

    const itemLines = sections.join('\n\n');


    const totalStr = paymentCurrency === 'USD' ? prices.formattedUSD : prices.formattedVES;

    // Build delivery/pickup section
    let entregaSection = '';
    if (deliveryType === 'delivery') {
      entregaSection = `\n\n*Entrega: Delivery*`;
      if (formData.deliveryAddress.trim()) {
        entregaSection += `\nDirección: ${formData.deliveryAddress.trim()}`;
      }
      if (formData.deliveryMapsUrl.trim()) {
        entregaSection += `\nUbicación (Maps): ${formData.deliveryMapsUrl.trim()}`;
      }
      if (formData.notes.trim()) {
        entregaSection += `\nReferencia: ${formData.notes.trim()}`;
      }
      entregaSection += `\n_El costo del delivery NO está incluido y será coordinado por este chat._`;
    } else {
      entregaSection = `\n\n*Entrega: Pickup (Retiro en local)*`;
      if (formData.notes.trim()) {
        entregaSection += `\nNotas: ${formData.notes.trim()}`;
      }
    }

    const paymentMethodLabel = getPaymentMethodLabel(formData.paymentMethod);

    const message = `Hola. Soy ${formData.firstName} ${formData.lastName}. Quiero realizar el siguiente pedido en Catarsis.

*Orden:* ${orderNum}

*Pedido:*
${itemLines}

*Total: ${totalStr}*${entregaSection}

*Método de pago preferido:*
Moneda: ${paymentCurrency === 'USD' ? 'Dólares (USD)' : 'Bolívares (VES)'}
Método: ${paymentMethodLabel}

_Por favor envíame los datos para realizar el pago_

*Datos del cliente:*
Teléfono: ${normalizePhone(formData.phone)}
Correo: ${formData.email.toLowerCase()}`;

    return message;
  };

  const handleSubmit = async () => {
    // Validate form
    const validation = checkoutSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Por favor completa todos los campos correctamente');
      return;
    }

    // Validate delivery address if delivery is selected
    if (deliveryType === 'delivery' && !formData.deliveryAddress.trim()) {
      setErrors(prev => ({ ...prev, deliveryAddress: 'La dirección es requerida para delivery' }));
      toast.error('Por favor ingresa la dirección de entrega');
      return;
    }

    setIsSubmitting(true);
    
    // Save cart data before clearing for tracking
    const cartItemsForTracking = items.map(item => ({ id: item.id, quantity: item.quantity }));
    const cartSubtotal = subtotal;

    try {
      // Find or create customer
      const { data: customerResult, error: customerError } = await supabase
        .rpc('find_or_create_customer', {
          p_first_name: formData.firstName.trim(),
          p_last_name: formData.lastName.trim(),
          p_phone: normalizePhone(formData.phone),
          p_email: formData.email.toLowerCase().trim(),
        });

      if (customerError) {
        console.error('Customer error:', customerError);
      }

      const customerId = customerResult || null;

      // Create order and items atomically using SECURITY DEFINER function.
      // [2026-07-22] Esto evita que la orden se cree pero los items fallen por
      // headers/RLS intermedios, que era lo que terminaba bloqueando WhatsApp.
      const newOrderId = crypto.randomUUID();
      
      // Generate WhatsApp message with placeholder for order number
      const placeholderOrderNum = 'CAT-XXXX';
      const whatsappMessageTemplate = generateWhatsAppMessage(placeholderOrderNum);
      
      const sessionId = getSessionId();
      const orderItemsPayload = items.map(item => {
        const extrasTotal = (item.extras || []).reduce((s, e) => s + e.precio_usd, 0);
        return {
          product_id: item.id,
          product_name_snapshot: item.nombre,
          unit_price_snapshot: item.precio_usd,
          quantity: item.quantity,
          line_total: (item.precio_usd + extrasTotal) * item.quantity,
          extras_snapshot: item.extras && item.extras.length > 0 ? JSON.parse(JSON.stringify(item.extras)) : null,
          source: item.source || 'menu',
        };
      });

      const { data: orderResult, error: orderError } = await (supabase as any)
        .rpc('create_order_with_items', {
          p_id: newOrderId,
          p_customer_id: customerId,
          p_first_name: formData.firstName.trim(),
          p_last_name: formData.lastName.trim(),
          p_phone: normalizePhone(formData.phone),
          p_email: formData.email.toLowerCase().trim(),
          p_currency_mode: paymentCurrency,
          p_payment_currency: paymentCurrency,
          p_exchange_rate: paymentCurrency === 'VES' ? exchangeRate : null,
          p_payment_method: formData.paymentMethod,
          p_notes: formData.notes.trim() || null,
          p_delivery_type: deliveryType,
          p_delivery_address: deliveryType === 'delivery' ? formData.deliveryAddress.trim() || null : null,
          p_delivery_maps_url: deliveryType === 'delivery' ? formData.deliveryMapsUrl.trim() || null : null,
          p_subtotal: subtotal,
          p_total: subtotal,
          p_session_id: sessionId,
          p_whatsapp_message: whatsappMessageTemplate.replace(placeholderOrderNum, '{{ORDER_NUMBER}}'),
          p_items: orderItemsPayload,
        });

      if (orderError) {
        // Handle rate limit error specifically
        if (orderError.message?.includes('Rate limit exceeded')) {
          toast.error('Has excedido el límite de pedidos. Por favor intenta más tarde.');
          setIsSubmitting(false);
          return;
        }
        throw orderError;
      }

      if (!orderResult?.success) {
        throw new Error(`create_order_with_items:${orderResult?.error || 'unknown_error'}`);
      }

      const orderNum = orderResult.order_number || `#${newOrderId.slice(0, 8).toUpperCase()}`;
      
      // SEGURIDAD [C3]: session_id se pasa al crear la orden (línea 431).
      // Siempre usar el session_id existente de la sesión actual.
      // Nunca generar uno nuevo en este punto — debe ser el mismo
      // que identifica al cliente durante todo el flujo de compra.

      // Generate final WhatsApp message with real order number
      const whatsappMessage = generateWhatsAppMessage(orderNum);
      
      // SEGURIDAD [C6]: Se reemplazó .update() directo por RPC.
      // La función valida session_id y restringe columnas editables.
      // Ver: función update_order_whatsapp_message en la base de datos.
      const { data: updateResult, error: updateError } = await supabase.rpc(
        'update_order_whatsapp_message',
        {
          p_order_id: newOrderId,
          p_message: whatsappMessage,
          p_session_id: sessionId,
        }
      );

      if (updateError) {
        console.error('Error al actualizar mensaje WhatsApp:', updateError);
      } else if (updateResult && !(updateResult as any).success) {
        console.error('Error al actualizar mensaje WhatsApp:', (updateResult as any).error);
      }

      // Save customer data for future checkouts
      try {
        localStorage.setItem('checkout_customer_data', JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: normalizePhone(formData.phone),
          email: formData.email.toLowerCase().trim(),
          deliveryAddress: formData.deliveryAddress.trim(),
          deliveryMapsUrl: formData.deliveryMapsUrl.trim(),
        }));
      } catch {}

      // Clear cart and delete pending checkout
      clearCart();
      await deletePendingCheckout();
      
      // Store order info
      setOrderId(newOrderId);
      setOrderNumber(orderNum);
      sessionStorage.setItem('lastOrderId', newOrderId);
      sessionStorage.setItem('lastOrderNumber', orderNum);
      
      // Open WhatsApp
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const cleanNumber = whatsappNumber.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      
      window.location.href = whatsappUrl;
      
      // Track Meta Pixel events (using saved cart data)
      trackPurchase(
        orderNum,
        cartSubtotal,
        cartItemsForTracking
      );
      trackContact('checkout_whatsapp');
      trackLead('checkout_whatsapp');
      
      toast.success('¡Pedido enviado correctamente!');
      setStep('success');

    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al crear el pedido. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormStep = () => (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/carrito')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-display font-bold">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Datos de Contacto</CardTitle>
              {hasSavedData && (
                <button
                  type="button"
                  onClick={clearSavedData}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <UserX className="h-3 w-3" />
                  No soy yo
                </button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Tu nombre"
                    className={errors.firstName ? 'border-destructive' : ''}
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  />
                  {errors.firstName && (
                    <p id="firstName-error" role="alert" className="text-xs text-destructive">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Tu apellido"
                    className={errors.lastName ? 'border-destructive' : ''}
                    aria-invalid={!!errors.lastName}
                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  />
                  {errors.lastName && (
                    <p id="lastName-error" role="alert" className="text-xs text-destructive">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+58 424 123 4567"
                  className={errors.phone ? 'border-destructive' : ''}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {errors.phone && (
                  <p id="phone-error" role="alert" className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="tu@correo.com"
                  className={errors.email ? 'border-destructive' : ''}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Delivery Type Selection */}
              <div className="border-t border-border pt-4 mt-4">
                <h3 className="font-medium mb-3">Tipo de Entrega *</h3>
                
                <RadioGroup
                  value={deliveryType}
                  onValueChange={(value) => setDeliveryType(value as DeliveryType)}
                  className="grid grid-cols-2 gap-3"
                >
                  <Label
                    htmlFor="type-pickup"
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      deliveryType === 'pickup' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="pickup" id="type-pickup" className="sr-only" />
                    <Store className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium">Pickup</p>
                      <p className="text-xs text-muted-foreground">Retiro en local</p>
                    </div>
                  </Label>
                  
                  <Label
                    htmlFor="type-delivery"
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      deliveryType === 'delivery' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="delivery" id="type-delivery" className="sr-only" />
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium">Delivery</p>
                      <p className="text-xs text-muted-foreground">Envío a domicilio</p>
                    </div>
                  </Label>
                </RadioGroup>

                {/* Delivery Address Fields */}
                {deliveryType === 'delivery' && (
                  <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3 mb-4">
                      <p className="text-sm text-secondary flex items-center gap-2">
                        <span>⚠️</span>
                        El costo del delivery <strong>no está incluido</strong> y será coordinado por WhatsApp.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="deliveryAddress">Dirección de entrega *</Label>
                      <Input
                        id="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                        placeholder="Av. Principal, Edificio XYZ, Piso 3, Apto 5"
                        className={errors.deliveryAddress ? 'border-destructive' : ''}
                        aria-invalid={!!errors.deliveryAddress}
                        aria-describedby={errors.deliveryAddress ? 'deliveryAddress-error' : undefined}
                      />
                      {errors.deliveryAddress && (
                        <p id="deliveryAddress-error" role="alert" className="text-xs text-destructive">{errors.deliveryAddress}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="deliveryMapsUrl">
                        Link de Google Maps <span className="text-muted-foreground font-normal">(opcional)</span>
                      </Label>
                      <Input
                        id="deliveryMapsUrl"
                        type="url"
                        value={formData.deliveryMapsUrl}
                        onChange={(e) => handleInputChange('deliveryMapsUrl', e.target.value)}
                        placeholder="Pega aquí el enlace de Google Maps…"
                        className={errors.deliveryMapsUrl ? 'border-destructive' : ''}
                        aria-invalid={!!errors.deliveryMapsUrl}
                        aria-describedby={errors.deliveryMapsUrl ? 'deliveryMapsUrl-error' : undefined}
                      />
                      <p className="text-xs text-muted-foreground">
                        Recomendado para mayor precisión en la ubicación.
                      </p>
                      {errors.deliveryMapsUrl && (
                        <p id="deliveryMapsUrl-error" role="alert" className="text-xs text-destructive">{errors.deliveryMapsUrl}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  {deliveryType === 'delivery' ? 'Referencia / Notas' : 'Notas adicionales'}{' '}
                  <span className="text-muted-foreground font-normal">(opcional)</span>
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder={deliveryType === 'delivery' 
                    ? "Ej: Frente al Centro Comercial, casa con portón azul..." 
                    : "Cualquier información adicional..."
                  }
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Currency and Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Método de Pago *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Currency Selection */}
              {displayMode === 'ambas' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">¿En qué moneda deseas pagar?</Label>
                  <RadioGroup
                    value={paymentCurrency}
                    onValueChange={(value) => handleCurrencyChange(value as 'USD' | 'VES')}
                    className="grid grid-cols-2 gap-3"
                  >
                    <Label
                      htmlFor="currency-usd"
                      className={`flex flex-col items-center gap-1 p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                        paymentCurrency === 'USD' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="USD" id="currency-usd" className="sr-only" />
                      <Banknote className="h-5 w-5 text-primary" />
                      <span className="font-medium">Dólares (USD)</span>
                      <span className="text-xs text-muted-foreground">{prices.formattedUSD}</span>
                    </Label>
                    <Label
                      htmlFor="currency-ves"
                      className={`flex flex-col items-center gap-1 p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                        paymentCurrency === 'VES' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="VES" id="currency-ves" className="sr-only" />
                      <Building2 className="h-5 w-5 text-primary" />
                      <span className="font-medium">Bolívares (VES)</span>
                      <span className="text-xs text-muted-foreground">{prices.formattedVES}</span>
                    </Label>
                  </RadioGroup>
                </div>
              )}

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {paymentCurrency === 'USD' ? 'Método de pago en dólares' : 'Método de pago en bolívares'}
                </Label>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => handlePaymentMethodChange(value)}
                  className="grid grid-cols-2 gap-3"
                >
                  {availablePaymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <Label
                        key={method.id}
                        htmlFor={`payment-${method.id}`}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.paymentMethod === method.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={method.id} id={`payment-${method.id}`} className="sr-only" />
                        <IconComponent className="h-5 w-5 text-primary shrink-0" />
                        <span className="font-medium text-sm">{method.label}</span>
                      </Label>
                    );
                  })}
                </RadioGroup>
                {errors.paymentMethod && (
                  <p id="paymentMethod-error" role="alert" className="text-xs text-destructive">{errors.paymentMethod}</p>
                )}
              </div>

              {/* Info note */}
              <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Te enviaremos los datos de pago por WhatsApp según el método que selecciones.</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const linePrices = getPrices(item.precio_usd * item.quantity);
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.nombre}
                      </span>
                      <span>
                        {paymentCurrency === 'USD' ? linePrices.formattedUSD : linePrices.formattedVES}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold text-secondary">
                    {paymentCurrency === 'USD' ? prices.formattedUSD : prices.formattedVES}
                  </span>
                </div>
                {displayMode === 'ambas' && (
                  <p className="text-sm text-muted-foreground text-right">
                    {paymentCurrency === 'USD' ? prices.formattedVES : prices.formattedUSD}
                  </p>
                )}
              </div>

              {/* Info about payment */}
              <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary shrink-0" />
                  Los detalles de pago se coordinarán por WhatsApp
                </p>
              </div>

              {/* [2026-04-08] Sugerencias de último momento en checkout.
                  Oportunidad de upsell antes de confirmar el pedido.
                  Máximo 3 sugerencias en modo compact. */}
              <UpsellSuggestions maxItems={3} compact />

              {/* PREVIEW [WA-MSG]: Vista previa en vivo del mensaje que se enviará
                  por WhatsApp. Usa CAT-XXXX como placeholder del número de orden
                  y refleja formData/paymentCurrency/deliveryType en tiempo real.
                  El <details> mantiene la UI compacta hasta que el usuario decida
                  verificar el formato antes de comprar. */}
              <details className="group rounded-lg border border-border bg-muted/30 overflow-hidden">
                <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    Vista previa del mensaje
                  </span>
                  <span className="text-xs text-muted-foreground group-open:hidden">Mostrar</span>
                  <span className="text-xs text-muted-foreground hidden group-open:inline">Ocultar</span>
                </summary>
                <div className="p-3 border-t border-border bg-background">
                  <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-foreground max-h-72 overflow-y-auto">
{generateWhatsAppMessage('CAT-XXXX')}
                  </pre>
                  <p className="mt-2 text-[10px] text-muted-foreground italic">
                    El número de orden real se generará al enviar el pedido.
                  </p>
                </div>
              </details>


              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                data-meta-event="Purchase"
                id="checkout-submit-btn"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <MessageCircle className="h-5 w-5" />
                )}
                {isSubmitting ? 'Enviando...' : 'Enviar pedido por WhatsApp'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader 
        currency={currency} 
        onCurrencyToggle={toggleCurrency}
        displayMode={displayMode}
      />
      
      <div className="container px-4 py-8">
        {step === 'form' && renderFormStep()}

        {step === 'success' && (
          <div className="max-w-md mx-auto text-center py-8 sm:py-12 px-4">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-secondary/30 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                <span className="text-5xl">🎉</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">
                ¡Pedido listo! 🎉
              </h1>
              <p className="text-muted-foreground text-lg">
                Gracias por tu orden 💛
              </p>
              <p className="text-muted-foreground mt-1">
                ¿Quieres seguir viendo el menú o sumar algo más?
              </p>
            </div>

            {/* Order Number Badge */}
            {(orderNumber || orderId) && (
              <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2 mb-6">
                <span className="text-xs text-muted-foreground">Orden:</span>
                <span className="font-mono font-bold text-sm">
                  {orderNumber || `#${orderId?.slice(0, 8).toUpperCase()}`}
                </span>
              </div>
            )}

            {/* Cart Reset Notice */}
            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3 mb-6">
              <p className="text-sm text-secondary flex items-center justify-center gap-2">
                <span>✨</span>
                Carrito reiniciado para tu próxima orden
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full gap-2 text-lg py-6"
                onClick={() => navigate('/')}
              >
                Seguir comprando 🛒
              </Button>
              
              <Button 
                variant="outline"
                size="lg" 
                className="w-full gap-2"
                onClick={() => navigate('/#menu')}
              >
                Ver Best Sellers 🔥
              </Button>
            </div>

            {/* Friendly footer message */}
            <p className="text-xs text-muted-foreground mt-8">
              Tu pedido fue enviado por WhatsApp. ¡Te contactaremos pronto para coordinar el pago!
            </p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
