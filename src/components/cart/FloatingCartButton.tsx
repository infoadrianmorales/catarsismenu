import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const FloatingCartButton = () => {
  const { totalItems, subtotal } = useCart();
  const { currency, displayMode, getPrices } = useCurrency();
  const navigate = useNavigate();

  // No mostrar si no hay items
  if (totalItems === 0) return null;

  const prices = getPrices(subtotal);
  
  const formattedPrice = displayMode === 'solo_usd' 
    ? prices.formattedUSD 
    : displayMode === 'solo_ves' 
      ? prices.formattedVES 
      : currency === 'USD' 
        ? prices.formattedUSD 
        : prices.formattedVES;

  return (
    <div className="fixed bottom-[72px] left-4 right-4 z-40 md:hidden">
      {/* [2026-06-05] CTA UNIFICADO botón flotante carrito mobile. */}
      <Button
        onClick={() => navigate('/carrito')}
        variant="cta"
        size="ctaSm"
        className="w-full h-14 justify-between px-4 animate-fade-in"
        data-meta-event="ViewCart"
        id="floating-cart-btn"
        aria-label="Abrir carrito"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            <Badge className="absolute -top-2 -right-2 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-secondary text-secondary-foreground">
              {totalItems}
            </Badge>
          </div>
          <span className="font-bold normal-case tracking-normal">
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold">{formattedPrice}</span>
          <span className="text-sm opacity-80 normal-case">Ver →</span>
        </div>
      </Button>
    </div>
  );
};
