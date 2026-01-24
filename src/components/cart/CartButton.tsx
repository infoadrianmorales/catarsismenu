import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface CartButtonProps {
  variant?: 'header' | 'sticky';
}

export const CartButton = ({ variant = 'header' }: CartButtonProps) => {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate when items change
  useEffect(() => {
    if (totalItems > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  if (variant === 'sticky') {
    return (
      <Button
        onClick={() => navigate('/carrito')}
        className={cn(
          "relative gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold",
          isAnimating && "scale-110",
          "transition-transform duration-200"
        )}
        size="sm"
      >
        <ShoppingCart className="h-4 w-4" />
        <span>Carrito</span>
        {totalItems > 0 && (
          <Badge 
            className="h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs bg-primary text-primary-foreground"
          >
            {totalItems > 99 ? '99+' : totalItems}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={totalItems > 0 ? "default" : "ghost"}
      size="icon"
      className={cn(
        "relative",
        totalItems > 0 && "bg-secondary hover:bg-secondary/90",
        isAnimating && "scale-110",
        "transition-all duration-200"
      )}
      onClick={() => navigate('/carrito')}
      aria-label={`Carrito con ${totalItems} items`}
    >
      <ShoppingCart className={cn("h-5 w-5", totalItems > 0 && "text-secondary-foreground")} />
      {totalItems > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs bg-primary text-primary-foreground animate-pulse"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      )}
    </Button>
  );
};
