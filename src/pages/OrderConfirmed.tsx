import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MenuHeader } from '@/components/MenuHeader';
import { Footer } from '@/components/Footer';
import { ReviewCTA } from '@/components/ReviewCTA';

import { useCurrency } from '@/hooks/useCurrency';

const OrderConfirmed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currency, toggleCurrency, displayMode } = useCurrency();
  
  const orderId = location.state?.orderId;
  const orderNumber = location.state?.orderNumber || sessionStorage.getItem('lastOrderNumber');
  const orderTotal = location.state?.total as number | undefined;

  // [MARKETING-PANEL] Dispara conversión de Google Ads una sola vez
  const firedRef = useRef(false);
  useEffect(() => {
    if (firedRef.current) return;
    if (typeof window.trackAdsConversion === 'function') {
      window.trackAdsConversion(orderTotal, 'USD', orderNumber || orderId);
      firedRef.current = true;
    }
  }, [orderTotal, orderNumber, orderId]);

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader 
        currency={currency} 
        onCurrencyToggle={toggleCurrency}
        displayMode={displayMode}
      />
      
      <div className="container px-4 py-16">
        <Card className="max-w-lg mx-auto text-center">
          <CardContent className="p-8 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-bold">¡Pedido Confirmado!</h1>
              <p className="text-muted-foreground">
                Tu pedido ha sido registrado exitosamente
              </p>
            </div>

            {(orderNumber || orderId) && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Número de orden</p>
                <p className="font-mono font-bold text-lg">
                  {orderNumber || `#${orderId.slice(0, 8).toUpperCase()}`}
                </p>
              </div>
            )}

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Se abrió WhatsApp con tu pedido.</p>
              <p>Envía el mensaje para confirmar con el local.</p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={() => navigate('/')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al Menú
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <ReviewCTA />
        </div>
      </div>
      
      <Footer />
    </div>

  );
};

export default OrderConfirmed;
