import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Loader2, MapPin, Store, CreditCard, Banknote, Wallet, Building2 } from 'lucide-react';
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

// Generate a unique session ID for abandoned cart tracking
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('checkout_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('checkout_session_id', sessionId);
  }
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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    deliveryAddress: '',
    deliveryMapsUrl: '',
    notes: '',
    paymentMethod: '',
  });
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

  if (items.length === 0) {
    navigate('/carrito');
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

  const generateWhatsAppMessage = (orderNum: string): string => {
    const itemLines = items.map(item => {
      const lineTotal = item.precio_usd * item.quantity;
      const linePrices = getPrices(lineTotal);
      const priceStr = paymentCurrency === 'USD' 
        ? linePrices.formattedUSD
        : linePrices.formattedVES;
      return `- ${item.quantity}x ${item.nombre} — ${priceStr}`;
    }).join('\n');

    const totalStr = paymentCurrency === 'USD' ? prices.formattedUSD : prices.formattedVES;

    // Build delivery/pickup section
    let entregaSection = '';
    if (deliveryType === 'delivery') {
      entregaSection = `\n\n*Entrega: Delivery 🛵*`;
      if (formData.deliveryAddress.trim()) {
        entregaSection += `\nDirección: ${formData.deliveryAddress.trim()}`;
      }
      if (formData.deliveryMapsUrl.trim()) {
        entregaSection += `\nUbicación (Maps): ${formData.deliveryMapsUrl.trim()}`;
      }
      if (formData.notes.trim()) {
        entregaSection += `\nReferencia: ${formData.notes.trim()}`;
      }
      entregaSection += `\n⚠️ _El costo del delivery NO está incluido y será coordinado por este chat._`;
    } else {
      entregaSection = `\n\n*Entrega: Pickup (Retiro en local) 🏪*`;
      if (formData.notes.trim()) {
        entregaSection += `\nNotas: ${formData.notes.trim()}`;
      }
    }

    const paymentMethodLabel = getPaymentMethodLabel(formData.paymentMethod);

    const message = `Hola 👋 Soy ${formData.firstName} ${formData.lastName}. Quiero realizar el siguiente pedido en Catarsis.

*Pedido:*
${itemLines}

*Total: ${totalStr}*${entregaSection}

*💳 Método de pago preferido:*
Moneda: ${paymentCurrency === 'USD' ? 'Dólares (USD)' : 'Bolívares (VES)'}
Método: ${paymentMethodLabel}

_Por favor envíame los datos para realizar el pago_ 🙏

*Datos del cliente:*
Teléfono: ${normalizePhone(formData.phone)}
Correo: ${formData.email.toLowerCase()}

*Orden:* ${orderNum}`;

    return message;
  };

  const handleSubmit = async () => {
    // Validate form
    const validation = checkoutSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
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

      // Create order in database - let Postgres generate the order_number
      const newOrderId = crypto.randomUUID();
      
      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: newOrderId,
          customer_id: customerId,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          phone: normalizePhone(formData.phone),
          email: formData.email.toLowerCase().trim(),
          currency_mode: paymentCurrency,
          payment_currency: paymentCurrency,
          exchange_rate: paymentCurrency === 'VES' ? exchangeRate : null,
          payment_method: formData.paymentMethod,
          notes: formData.notes.trim() || null,
          delivery_type: deliveryType,
          delivery_address: deliveryType === 'delivery' ? formData.deliveryAddress.trim() || null : null,
          delivery_maps_url: deliveryType === 'delivery' ? formData.deliveryMapsUrl.trim() || null : null,
          subtotal: subtotal,
          total: subtotal,
          status: 'NEW',
          whatsapp_message: '', // Placeholder, will update after
        })
        .select('order_number')
        .single();

      if (orderError) throw orderError;

      const generatedOrderNumber = insertedOrder?.order_number || `#${newOrderId.slice(0, 8).toUpperCase()}`;
      
      // Generate WhatsApp message with the real order number
      const whatsappMessage = generateWhatsAppMessage(generatedOrderNumber);
      
      // Update the order with the actual WhatsApp message
      await supabase
        .from('orders')
        .update({ whatsapp_message: whatsappMessage })
        .eq('id', newOrderId);

      // Create order items
      const orderItems = items.map(item => ({
        order_id: newOrderId,
        product_id: item.id,
        product_name_snapshot: item.nombre,
        unit_price_snapshot: item.precio_usd,
        quantity: item.quantity,
        line_total: item.precio_usd * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart and delete pending checkout
      clearCart();
      await deletePendingCheckout();
      
      // Store order info
      setOrderId(newOrderId);
      setOrderNumber(generatedOrderNumber);
      sessionStorage.setItem('lastOrderId', newOrderId);
      sessionStorage.setItem('lastOrderNumber', generatedOrderNumber);
      
      // Open WhatsApp
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const cleanNumber = whatsappNumber.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      
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
            <CardHeader>
              <CardTitle>Datos de Contacto</CardTitle>
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
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName}</p>
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
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName}</p>
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
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
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
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
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
                      />
                      {errors.deliveryAddress && (
                        <p className="text-xs text-destructive">{errors.deliveryAddress}</p>
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
                      />
                      <p className="text-xs text-muted-foreground">
                        Recomendado para mayor precisión en la ubicación.
                      </p>
                      {errors.deliveryMapsUrl && (
                        <p className="text-xs text-destructive">{errors.deliveryMapsUrl}</p>
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
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}
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
                  <p className="text-xs text-destructive">{errors.paymentMethod}</p>
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

              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
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
