import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/hooks/useCurrency';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

export const FloatingCart = () => {
  const { totalItems, subtotal } = useCart();
  const { currency, displayMode, getPrices } = useCurrency();
  const [bounce, setBounce] = useState(false);
  const prevItems = useRef(totalItems);

  // Bounce animation when items change
  useEffect(() => {
    if (totalItems > 0 && totalItems !== prevItems.current) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 600);
      prevItems.current = totalItems;
      return () => clearTimeout(timer);
    }
    prevItems.current = totalItems;
  }, [totalItems]);

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
    <div
      className={cn(
        "hidden md:block fixed bottom-6 right-6 z-50",
        "animate-scale-in"
      )}
    >
      <div className={cn(bounce && "animate-bounce")}>
        <CartDrawer variant="floating" />
      </div>
    </div>
  );
};
