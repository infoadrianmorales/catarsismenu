// [2026-04-08] SOURCE TRACKING: Acepta prop `source` para registrar
// el origen de la adición al carrito. Se pasa a addToCart del CartContext.
import { Plus, Minus, ShoppingCart, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { CartItemSource } from '@/contexts/CartContext';
import { MenuItem } from '@/types/menu';
import { toast } from 'sonner';
// [2026-06-10] RemoveFromCart eliminado: ensuciaba datos sin valor para optimización.
import { trackAddToCart } from '@/lib/metaPixel';

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
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  };

  if (quantity === 0) {
    // [2026-06-05] CTA DYNAMIC v2: pill raspberry con ícono Xanthous,
    // texto pequeño Phudu uppercase tracking-widest, animación spring
    // del carrito al hover, underline amarilla animada bajo el pill y
    // pulse sutil de fondo. Tokens del design system (no hex literales).
    return (
      <div className="relative w-full pb-2">
        <Button
          onClick={handleAdd}
          className="group relative w-full h-11 gap-2 rounded-full bg-primary px-4 py-3 font-display font-bold uppercase tracking-widest text-primary-foreground text-[10px] shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all duration-300 hover:bg-primary hover:brightness-110 hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] active:scale-95"
          data-meta-event="AddToCart"
          id={`add-to-cart-${product.id}`}
          aria-label={`Agregar ${product.nombre} al carrito`}
        >
          {/* Pulse amarillo sutil al hover */}
          <span className="pointer-events-none absolute inset-0 rounded-full bg-secondary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {/* Ícono carrito Xanthous con spring-bounce */}
          <ShoppingCart
            className="relative h-3.5 w-3.5 text-secondary group-hover:animate-cart-spring"
            strokeWidth={2.5}
          />
          <span className="relative select-none">Agregar al carrito</span>
          {/* Underline amarilla animada */}
          <span className="pointer-events-none absolute -bottom-2 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-secondary opacity-0 transition-all duration-300 ease-out group-hover:w-16 group-hover:opacity-100 group-active:w-24 group-active:bg-white" />
        </Button>
      </div>
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
