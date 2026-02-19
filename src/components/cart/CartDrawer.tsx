import { ShoppingCart, Trash2, ShoppingBag, X, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface CartDrawerProps {
  variant?: 'header' | 'sticky';
}

export const CartDrawer = ({ variant = 'header' }: CartDrawerProps) => {
  const { items, totalItems, subtotal, removeFromCart, updateQuantity, updateItemNotes } = useCart();
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const toggleNotesExpanded = (itemId: string) => {
    setExpandedNotes(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };
  const { currency, displayMode, getPrices } = useCurrency();
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [open, setOpen] = useState(false);

  const prices = getPrices(subtotal);

  // Animate when items change
  useEffect(() => {
    if (totalItems > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  const handleCheckout = () => {
    setOpen(false);
    navigate('/checkout');
  };


  const formatPrice = (priceUsd: number) => {
    const p = getPrices(priceUsd);
    if (displayMode === 'solo_usd') return p.formattedUSD;
    if (displayMode === 'solo_ves') return p.formattedVES;
    return currency === 'USD' ? p.formattedUSD : p.formattedVES;
  };

  const TriggerButton = variant === 'sticky' ? (
    <Button
      id="cart-drawer-sticky"
      data-meta-event="ViewCart"
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
  ) : (
    <Button
      id="cart-drawer-header"
      data-meta-event="ViewCart"
      variant={totalItems > 0 ? "default" : "ghost"}
      size="icon"
      className={cn(
        "relative",
        totalItems > 0 && "bg-secondary hover:bg-secondary/90",
        isAnimating && "scale-110",
        "transition-all duration-200"
      )}
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {TriggerButton}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-card border-border">
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-foreground">
              <ShoppingCart className="h-5 w-5" />
              Tu Carrito
              {totalItems > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </Badge>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Tu carrito está vacío</p>
            <p className="text-sm text-muted-foreground mb-6">
              Agrega productos desde el menú
            </p>
            <SheetClose asChild>
              <Button variant="outline" onClick={() => navigate('/')}>
                Ver menú
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => {
                  const itemTotal = item.precio_usd * item.quantity;
                  
                  return (
                    <div 
                      key={item.id} 
                      className="flex gap-3 p-3 rounded-lg bg-muted/50 animate-fade-in"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 rounded-md bg-white overflow-hidden flex-shrink-0">
                        <img 
                          src={item.imagen} 
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm truncate">{item.nombre}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.precio_usd)} c/u
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 bg-background rounded-full border border-border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <span className="text-lg leading-none">−</span>
                            </Button>
                            <span className="text-sm font-medium w-4 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <span className="text-lg leading-none">+</span>
                            </Button>
                          </div>
                          
                          {/* Line total */}
                          <span className="text-sm font-bold text-secondary">
                            {formatPrice(itemTotal)}
                          </span>
                        </div>

                        {/* Notes Section */}
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <button
                            onClick={() => toggleNotesExpanded(item.id)}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>{item.notes ? 'Editar nota' : 'Agregar nota'}</span>
                            {expandedNotes[item.id] ? (
                              <ChevronUp className="h-3 w-3 ml-auto" />
                            ) : (
                              <ChevronDown className="h-3 w-3 ml-auto" />
                            )}
                          </button>
                          
                          {expandedNotes[item.id] && (
                            <div className="mt-1.5 animate-in slide-in-from-top-2 duration-200">
                              <Textarea
                                value={item.notes || ''}
                                onChange={(e) => updateItemNotes(item.id, e.target.value)}
                                placeholder="Ej: sin vegetales, extra salsa..."
                                className="min-h-[50px] text-xs resize-none"
                                maxLength={200}
                              />
                              <p className="text-[10px] text-muted-foreground mt-0.5 text-right">
                                {(item.notes?.length || 0)}/200
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t border-border pt-4 space-y-4 mt-auto">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-secondary">
                    {displayMode === 'solo_usd' && prices.formattedUSD}
                    {displayMode === 'solo_ves' && prices.formattedVES}
                    {displayMode === 'ambas' && (
                      currency === 'USD' ? prices.formattedUSD : prices.formattedVES
                    )}
                  </span>
                  {displayMode === 'ambas' && (
                    <p className="text-xs text-muted-foreground">
                      {currency === 'USD' ? prices.formattedVES : prices.formattedUSD}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="grid gap-2">
                <Button 
                  id="checkout-btn"
                  data-meta-event="InitiateCheckout"
                  className="w-full gap-2" 
                  size="lg"
                  onClick={handleCheckout}
                >
                  <ShoppingBag className="h-5 w-5" />
                  Finalizar Compra
                </Button>
              <SheetClose asChild>
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  Seguir comprando
                </Button>
              </SheetClose>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};