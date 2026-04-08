// [2026-04-08] SOURCE TRACKING: Acepta prop `source` para registrar
// el origen de la adición al carrito. Se pasa a addToCart del CartContext.
import { Plus, Minus, ShoppingCart, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { CartItemSource } from '@/contexts/CartContext';
import { MenuItem } from '@/types/menu';
import { toast } from 'sonner';
import { trackAddToCart, trackRemoveFromCart } from '@/lib/metaPixel';

interface AddToCartButtonProps {
  product: MenuItem;
  variant?: 'default' | 'compact' | 'icon';
  source?: CartItemSource;
}

export const AddToCartButton = ({ product, variant = 'default', source = 'menu' }: AddToCartButtonProps) => {
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
    const success = addToCart(product, source);
    if (success) {
      toast.success(`${product.nombre} agregado al carrito`);
      trackAddToCart({ id: product.id, nombre: product.nombre, precio_usd: product.precio_usd }, 1);
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
      trackRemoveFromCart({ id: product.id, nombre: product.nombre, precio_usd: product.precio_usd });
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  };

  if (quantity === 0) {
    if (variant === 'icon') {
      return (
        // ACCESIBILIDAD [ARIA]: aria-label describe la acción para lectores de pantalla
        <Button
          size="icon"
          onClick={handleAdd}
          className="h-8 w-8 bg-primary hover:bg-primary/90 shrink-0"
          data-meta-event="AddToCart"
          id={`add-to-cart-${product.id}`}
          aria-label={`Agregar ${product.nombre} al carrito`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      );
    }
    
    return (
      <Button
        size={variant === 'compact' ? 'sm' : 'default'}
        onClick={handleAdd}
        className="gap-2 bg-primary hover:bg-primary/90"
        data-meta-event="AddToCart"
        id={`add-to-cart-${product.id}`}
      >
        <ShoppingCart className="h-4 w-4" />
        {variant !== 'compact' && <span>Agregar</span>}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
      {/* ACCESIBILIDAD [ARIA]: aria-labels en botones +/- para lectores de pantalla. */}
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={handleDecrease}
        aria-label="Disminuir cantidad"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center font-semibold">{quantity}</span>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={handleIncrease}
        aria-label="Aumentar cantidad"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
