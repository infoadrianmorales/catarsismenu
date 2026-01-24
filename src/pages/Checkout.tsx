import { useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MenuHeader } from '@/components/MenuHeader';
import { Footer } from '@/components/Footer';
import { z } from 'zod';

const PAYMENT_METHODS = [
  { id: 'PAGOMOVIL', label: 'Pago Móvil' },
  { id: 'ZELLE', label: 'Zelle' },
  { id: 'USDT', label: 'USDT' },
  { id: 'ZINLI', label: 'Zinli' },
  { id: 'TRANSFER', label: 'Transferencia Bancaria' },
];

const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es requerido').max(100),
  lastName: z.string().trim().min(1, 'El apellido es requerido').max(100),
  phone: z.string().trim().min(1, 'El teléfono es requerido').max(20),
  email: z.string().trim().email('Correo inválido').max(255),
  paymentMethod: z.string().min(1, 'Selecciona un método de pago'),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { currency, toggleCurrency, displayMode, getPrices, exchangeRate } = useCurrency();
  const { config } = useConfig();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    paymentMethod: '',
  });
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'VES'>(
    displayMode === 'solo_ves' ? 'VES' : 'USD'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prices = getPrices(subtotal);
  const whatsappNumber = config?.whatsapp || '584249056438';

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

  const generateWhatsAppMessage = (orderId: string): string => {
    const itemLines = items.map(item => {
      const lineTotal = item.precio_usd * item.quantity;
      const linePrices = getPrices(lineTotal);
      const unitPrices = getPrices(item.precio_usd);
      const priceStr = selectedCurrency === 'USD' 
        ? `${unitPrices.formattedUSD} → ${linePrices.formattedUSD}`
        : `${unitPrices.formattedVES} → ${linePrices.formattedVES}`;
      return `- ${item.quantity}x ${item.nombre} — ${priceStr}`;
    }).join('\n');

    const totalStr = selectedCurrency === 'USD' ? prices.formattedUSD : prices.formattedVES;
    const otherTotalStr = selectedCurrency === 'USD' ? prices.formattedVES : prices.formattedUSD;
    
    const paymentLabel = PAYMENT_METHODS.find(m => m.id === formData.paymentMethod)?.label || formData.paymentMethod;

    let message = `Hola 👋 Soy ${formData.firstName} ${formData.lastName}. Quiero hacer un pedido en Catarsis:

*Items:*
${itemLines}

*Total: ${totalStr}*`;

    if (displayMode === 'ambas') {
      message += `\nTambién: ${otherTotalStr}`;
    }

    message += `

*Método de pago:* ${paymentLabel}
*Teléfono:* ${normalizePhone(formData.phone)}
*Correo:* ${formData.email.toLowerCase()}
*Orden:* #${orderId.slice(0, 8).toUpperCase()}`;

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

    setIsSubmitting(true);

    try {
      // Create order in database
      const orderId = crypto.randomUUID();
      const whatsappMessage = generateWhatsAppMessage(orderId);

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          phone: normalizePhone(formData.phone),
          email: formData.email.toLowerCase().trim(),
          currency_mode: selectedCurrency,
          exchange_rate: selectedCurrency === 'VES' ? exchangeRate : null,
          payment_method: formData.paymentMethod,
          subtotal: subtotal,
          total: subtotal,
          status: 'NEW',
          whatsapp_message: whatsappMessage,
        });

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderId,
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

      // Open WhatsApp
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const cleanNumber = whatsappNumber.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      
      // Clear cart and redirect
      clearCart();
      toast.success('¡Pedido creado! Abriendo WhatsApp...');
      
      // Small delay to show toast
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        navigate('/orden-confirmada', { state: { orderId } });
      }, 500);

    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al crear el pedido. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader 
        currency={currency} 
        onCurrencyToggle={toggleCurrency}
        displayMode={displayMode}
      />
      
      <div className="container px-4 py-8">
        {/* Header */}
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
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Método de Pago *</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}
                  className="grid sm:grid-cols-2 gap-3"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="cursor-pointer">
                        {method.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.paymentMethod && (
                  <p className="text-xs text-destructive mt-2">{errors.paymentMethod}</p>
                )}
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
                    value={selectedCurrency}
                    onValueChange={(value) => setSelectedCurrency(value as 'USD' | 'VES')}
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
                          {selectedCurrency === 'USD' ? linePrices.formattedUSD : linePrices.formattedVES}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold text-secondary">
                      {selectedCurrency === 'USD' ? prices.formattedUSD : prices.formattedVES}
                    </span>
                  </div>
                  {displayMode === 'ambas' && (
                    <p className="text-sm text-muted-foreground text-right">
                      {selectedCurrency === 'USD' ? prices.formattedVES : prices.formattedUSD}
                    </p>
                  )}
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
                  {isSubmitting ? 'Procesando...' : 'Comprar por WhatsApp'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
