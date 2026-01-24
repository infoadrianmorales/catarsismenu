import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useConfig } from '@/hooks/useConfig';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MenuHeader } from '@/components/MenuHeader';
import { Footer } from '@/components/Footer';
import { PaymentDetailsStep } from '@/components/checkout/PaymentDetailsStep';
import { PaymentConfirmationStep } from '@/components/checkout/PaymentConfirmationStep';
import { z } from 'zod';

type CheckoutStep = 'form' | 'payment-details' | 'confirmation' | 'success';

// Validate Google Maps URL pattern
const isValidMapsUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
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
  paymentMethod: z.string().min(1, 'Selecciona un método de pago'),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { currency, toggleCurrency, displayMode, getPrices, exchangeRate } = useCurrency();
  const { config } = useConfig();
  const { methods, loading: methodsLoading, getMethodById, getMethodsForCurrency, getInstructions } = usePaymentMethods();
  
  const [step, setStep] = useState<CheckoutStep>('form');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    deliveryAddress: '',
    deliveryMapsUrl: '',
    paymentMethod: '',
  });
  const [paymentCurrency, setPaymentCurrency] = useState<'USD' | 'VES'>(
    displayMode === 'solo_ves' ? 'VES' : 'USD'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentInstructionsSnapshot, setPaymentInstructionsSnapshot] = useState<string>('');

  const prices = getPrices(subtotal);
  const whatsappNumber = config?.whatsapp || '584249056438';

  // Get available payment methods based on selected currency
  const availableMethods = getMethodsForCurrency(paymentCurrency);

  // Reset payment method if it doesn't support the selected currency
  useEffect(() => {
    if (formData.paymentMethod) {
      const method = getMethodById(formData.paymentMethod);
      const supportsCurrentCurrency = paymentCurrency === 'USD' ? method?.supports_usd : method?.supports_ves;
      if (!supportsCurrentCurrency) {
        setFormData(prev => ({ ...prev, paymentMethod: '' }));
      }
    }
  }, [paymentCurrency, formData.paymentMethod, getMethodById]);

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

  const generateWhatsAppMessage = (orderIdParam: string, reference: string, notes: string): string => {
    const itemLines = items.map(item => {
      const lineTotal = item.precio_usd * item.quantity;
      const linePrices = getPrices(lineTotal);
      const priceStr = paymentCurrency === 'USD' 
        ? linePrices.formattedUSD
        : linePrices.formattedVES;
      return `- ${item.quantity}x ${item.nombre} — ${priceStr}`;
    }).join('\n');

    const totalStr = paymentCurrency === 'USD' ? prices.formattedUSD : prices.formattedVES;
    const paymentMethodLabel = getMethodById(formData.paymentMethod)?.label || formData.paymentMethod;

    // Build delivery section
    let deliverySection = '';
    if (formData.deliveryAddress.trim()) {
      deliverySection = `\n\n*Entrega: Delivery*\nDirección: ${formData.deliveryAddress.trim()}`;
      if (formData.deliveryMapsUrl.trim()) {
        deliverySection += `\nUbicación (Maps): ${formData.deliveryMapsUrl.trim()}`;
      }
      if (notes.trim()) {
        deliverySection += `\nReferencia: ${notes.trim()}`;
      }
      deliverySection += `\n⚠️ _El costo del delivery NO está incluido._`;
    }

    const message = `Hola 👋 Soy ${formData.firstName} ${formData.lastName}. Ya realicé el pago de mi pedido en Catarsis.

*Pedido:*
${itemLines}

*Total: ${totalStr}*
⚠️ _Este monto no incluye el costo del delivery._${deliverySection}

*Moneda de pago:* ${paymentCurrency}
*Método de pago:* ${paymentMethodLabel}
*Referencia:* ${reference}

*Datos del cliente:*
Teléfono: ${normalizePhone(formData.phone)}
Correo: ${formData.email.toLowerCase()}

*Orden:* #${orderIdParam.slice(0, 8).toUpperCase()}`;

    return message;
  };

  const handleFormSubmit = async () => {
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

    // Get payment instructions
    const instructions = getInstructions(formData.paymentMethod, paymentCurrency);
    if (!instructions) {
      toast.error('No hay instrucciones de pago configuradas para este método');
      return;
    }

    setPaymentInstructionsSnapshot(instructions);
    setStep('payment-details');
  };

  const handlePaymentDetailsContinue = () => {
    setStep('confirmation');
  };

  const handleFinalSubmit = async (reference: string, notes: string) => {
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

      // Create order in database
      const newOrderId = crypto.randomUUID();
      const whatsappMessage = generateWhatsAppMessage(newOrderId, reference, notes);
      const { error: orderError } = await supabase
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
          payment_instructions_snapshot: paymentInstructionsSnapshot,
          payment_reference: reference,
          payment_confirmed_at: new Date().toISOString(),
          notes: notes || null,
          delivery_address: formData.deliveryAddress.trim() || null,
          delivery_maps_url: formData.deliveryMapsUrl.trim() || null,
          subtotal: subtotal,
          total: subtotal,
          status: 'PAYMENT_SUBMITTED',
          whatsapp_message: whatsappMessage,
        });

      if (orderError) throw orderError;

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

      // Clear cart
      clearCart();
      
      // Store order info
      setOrderId(newOrderId);
      sessionStorage.setItem('lastOrderId', newOrderId);
      
      // Open WhatsApp
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const cleanNumber = whatsappNumber.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp in new tab/window and show success screen
      window.open(whatsappUrl, '_blank');
      
      toast.success('¡Pedido enviado correctamente!');
      
      // Show success screen
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

              {/* Delivery Address Section */}
              <div className="border-t border-border pt-4 mt-4">
                <h3 className="font-medium mb-3">Datos de Entrega (Delivery)</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">Dirección de entrega</Label>
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
              </div>
            </CardContent>
          </Card>

          {/* Currency Selection (only if displayMode is 'ambas') */}
          {displayMode === 'ambas' && (
            <Card>
              <CardHeader>
                <CardTitle>Moneda de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentCurrency}
                  onValueChange={(value) => setPaymentCurrency(value as 'USD' | 'VES')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="USD" id="currency-usd" />
                    <Label htmlFor="currency-usd" className="cursor-pointer">
                      Pagar en USD ({prices.formattedUSD})
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="VES" id="currency-ves" />
                    <Label htmlFor="currency-ves" className="cursor-pointer">
                      Pagar en Bolívares ({prices.formattedVES})
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Método de Pago *</CardTitle>
            </CardHeader>
            <CardContent>
              {methodsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : availableMethods.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No hay métodos de pago disponibles para {paymentCurrency}
                </p>
              ) : (
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}
                  className="grid sm:grid-cols-2 gap-3"
                >
                  {availableMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="cursor-pointer">
                        {method.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {errors.paymentMethod && (
                <p className="text-xs text-destructive mt-2">{errors.paymentMethod}</p>
              )}
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

              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handleFormSubmit}
              >
                Continuar al Pago
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
        
        {step === 'payment-details' && (
          <PaymentDetailsStep
            paymentMethod={formData.paymentMethod}
            paymentMethodLabel={getMethodById(formData.paymentMethod)?.label || formData.paymentMethod}
            paymentCurrency={paymentCurrency}
            instructions={paymentInstructionsSnapshot}
            totalFormatted={paymentCurrency === 'USD' ? prices.formattedUSD : prices.formattedVES}
            onBack={() => setStep('form')}
            onContinue={handlePaymentDetailsContinue}
          />
        )}

        {step === 'confirmation' && (
          <PaymentConfirmationStep
            onBack={() => setStep('payment-details')}
            onSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 'success' && (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="mb-8">
              <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✅</span>
              </div>
              <h1 className="text-2xl font-display font-bold mb-3">
                ¡Listo! Gracias 💛
              </h1>
              <p className="text-muted-foreground">
                ¿Se te antoja algo más?
              </p>
              {orderId && (
                <p className="text-sm text-muted-foreground mt-2">
                  Orden: #{orderId.slice(0, 8).toUpperCase()}
                </p>
              )}
            </div>
            
            <Button 
              size="lg" 
              className="w-full gap-2 text-lg py-6"
              onClick={() => navigate('/')}
            >
              Seguir comprando 🛒
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
