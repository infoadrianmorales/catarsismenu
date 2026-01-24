import { Plus, Minus, ShoppingCart, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { MenuItem } from '@/types/menu';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  product: MenuItem;
  variant?: 'default' | 'compact';
}

export const AddToCartButton = ({ product, variant = 'default' }: AddToCartButtonProps) => {
  const { addToCart, removeFromCart, getItemQuantity, updateQuantity, isProductOrderable } = useCart();
  
  const quantity = getItemQuantity(product.id);
  const isOrderable = isProductOrderable(product);

  if (!isOrderable) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Ban className="h-4 w-4" />
        <span className="text-xs">Solo en el local</span>
      </div>
    );
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = addToCart(product);
    if (success) {
      toast.success(`${product.nombre} agregado al carrito`);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity <= 1) {
      removeFromCart(product.id);
      toast.info(`${product.nombre} eliminado del carrito`);
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  };

  if (quantity === 0) {
    return (
      <Button
        size={variant === 'compact' ? 'sm' : 'default'}
        onClick={handleAdd}
        className="gap-2 bg-primary hover:bg-primary/90"
      >
        <ShoppingCart className="h-4 w-4" />
        {variant !== 'compact' && <span>Agregar</span>}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={handleDecrease}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center font-semibold">{quantity}</span>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={handleIncrease}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
