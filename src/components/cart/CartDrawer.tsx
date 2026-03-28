// FEATURE [EXTRAS + UPSELL]: CartDrawer con soporte de extras inline
// y sugerencias de compra compactas antes del checkout.

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
import { useEffect, useState, useRef, useCallback } from 'react';
import { useProductExtras } from '@/hooks/useProductExtras';
import { ProductExtras } from '@/components/cart/ProductExtras';
import { UpsellSuggestions } from '@/components/cart/UpsellSuggestions';

interface CartDrawerProps {
  variant?: 'header' | 'sticky' | 'floating';
}

export const CartDrawer = ({ variant = 'header' }: CartDrawerProps) => {
  const { items, totalItems, subtotal, removeFromCart, updateQuantity, updateItemNotes, addExtra, removeExtra } = useCart();
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const toggleNotesExpanded = (itemId: string) => {
    setExpandedNotes(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };
  const { currency, displayMode, getPrices } = useCurrency();
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [open, setOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // FEATURE [EXTRAS]: cargar extras disponibles
  const { getExtrasForProduct, categoryHasExtras } = useProductExtras();

  const prices = getPrices(subtotal);

  const handleMouseEnter = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoverOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimer.current = setTimeout(() => setHoverOpen(false), 200);
  }, []);

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

  const handleHeaderClick = (e: React.MouseEvent) => {
    if (variant === 'header' && totalItems > 0) {
      e.preventDefault();
      navigate('/carrito');
    }
  };

  const TriggerButton = variant === 'floating' ? (
    <Button
      id="cart-drawer-floating"
      data-meta-event="ViewCart"
      className={cn(
        "relative gap-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold",
        "h-14 px-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      )}
    >
      <div className="relative">
        <ShoppingCart className="h-5 w-5" />
        <Badge className="absolute -top-2 -right-3 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-[10px] bg-primary text-primary-foreground">
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      </div>
      <span className="text-sm">{formatPrice(subtotal)}</span>
    </Button>
  ) : variant === 'sticky' ? (
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
  ) : totalItems > 0 ? (
    <div
      className="relative hidden sm:block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button
        id="cart-btn-header"
        data-meta-event="ViewCart"
        onClick={handleHeaderClick}
        className={cn(
          "relative gap-2 px-3 h-10 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold",
          isAnimating && "scale-110",
          "transition-all duration-300"
        )}
        aria-label={`Carrito con ${totalItems} items`}
      >
        <ShoppingCart className="h-5 w-5" />
        <Badge 
          className="h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs bg-primary text-primary-foreground"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
        <span className="text-sm">{formatPrice(subtotal)}</span>
      </Button>

      {/* Hover preview popup */}
      <div
        className={cn(
          "absolute right-0 top-full mt-2 w-80 z-50 rounded-lg border border-border bg-card shadow-xl transition-all duration-300",
          hoverOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-4 opacity-0 pointer-events-none"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-3 border-b border-border flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-secondary" />
          <span className="text-sm font-semibold text-foreground">
            Tu carrito ({totalItems})
          </span>
        </div>
        <div className="p-2 space-y-1.5 max-h-64 overflow-y-auto">
          {items.slice(0, 4).map((item) => {
            const extrasTotal = (item.extras || []).reduce((s, e) => s + e.precio_usd, 0);
            const lineTotal = (item.precio_usd + extrasTotal) * item.quantity;
            return (
              <div key={item.id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/50">
                <div className="w-10 h-10 rounded bg-white overflow-hidden flex-shrink-0">
                  <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" loading="lazy" width="40" height="40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.nombre}</p>
                  <p className="text-[10px] text-muted-foreground">x{item.quantity}</p>
                </div>
                <span className="text-xs font-semibold text-secondary whitespace-nowrap">
                  {formatPrice(lineTotal)}
                </span>
              </div>
            );
          })}
          {items.length > 4 && (
            <p className="text-[11px] text-muted-foreground text-center py-1">
              y {items.length - 4} más...
            </p>
          )}
        </div>
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Subtotal</span>
            <span className="text-sm font-bold text-secondary">{formatPrice(subtotal)}</span>
          </div>
          <Button
            size="sm"
            className="w-full gap-1.5 text-xs"
            onClick={() => { setHoverOpen(false); navigate('/carrito'); }}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Ver carrito completo
          </Button>
        </div>
      </div>
    </div>
  ) : totalItems > 0 ? (
    // Mobile fallback (no hover)
    <Button
      id="cart-btn-header"
      data-meta-event="ViewCart"
      onClick={handleHeaderClick}
      className={cn(
        "relative gap-2 px-3 h-10 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold sm:hidden",
        isAnimating && "scale-110",
        "transition-all duration-300"
      )}
      aria-label={`Carrito con ${totalItems} items`}
    >
      <ShoppingCart className="h-5 w-5" />
      <Badge 
        className="h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs bg-primary text-primary-foreground"
      >
        {totalItems > 99 ? '99+' : totalItems}
      </Badge>
      <span className="text-sm">{formatPrice(subtotal)}</span>
    </Button>
  ) : (
    <Button
      id="cart-btn-header"
      data-meta-event="ViewCart"
      variant="ghost"
      size="icon"
      className="relative transition-all duration-200"
      aria-label="Carrito vacío"
    >
      <ShoppingCart className="h-5 w-5" />
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
                  // FEATURE [EXTRAS]: incluir extras en el total de línea
                  const extrasTotal = (item.extras || []).reduce((s, e) => s + e.precio_usd, 0);
                  const itemTotal = (item.precio_usd + extrasTotal) * item.quantity;
                  
                  return (
                    <div 
                      key={item.id} 
                      className="flex gap-3 p-3 rounded-lg bg-muted/50 animate-fade-in"
                    >
                      {/* Image */}
                      {/* OPTIMIZACIÓN DE PERFORMANCE — CartDrawer item image
                          loading="lazy", width/height para CLS, alt con marca */}
                      <div className="w-16 h-16 rounded-md bg-white overflow-hidden flex-shrink-0">
                        <img 
                          src={item.imagen} 
                          alt={`${item.nombre} — Catarsis Drinks & Food, Lechería`}
                          loading="lazy"
                          width="64"
                          height="64"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm truncate">{item.nombre}</h4>
                          {/* ACCESIBILIDAD [ARIA]: aria-label en botón eliminar */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => removeFromCart(item.id)}
                            aria-label="Eliminar producto del carrito"
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
                            {/* ACCESIBILIDAD [ARIA]: aria-labels en botones +/- del carrito */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Disminuir cantidad"
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
                              aria-label="Aumentar cantidad"
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

                        {/* FEATURE [EXTRAS]: Extras inline en el drawer */}
                        {categoryHasExtras(item.categoria) && (
                          <div className="mt-1.5 pt-1.5 border-t border-border/30">
                            <ProductExtras
                              extras={getExtrasForProduct(item.id, item.categoria)}
                              selectedExtras={item.extras || []}
                              onToggleExtra={(extra) => {
                                const isSelected = (item.extras || []).some(e => e.extraId === extra.id);
                                if (isSelected) {
                                  removeExtra(item.id, extra.id);
                                } else {
                                  addExtra(item.id, { extraId: extra.id, nombre: extra.nombre, precio_usd: extra.precio_usd });
                                }
                              }}
                              compact
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FEATURE [UPSELL]: Sugerencias compactas en el drawer */}
              <UpsellSuggestions maxItems={3} compact />
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