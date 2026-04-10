// FEATURE [EXTRAS + UPSELL]: Página del carrito con soporte de extras por producto
// y sección de sugerencias de compra para aumentar el ticket promedio.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, ShoppingBag, MessageSquare, ChevronDown, ChevronUp, Minus, Plus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/hooks/useCurrency';
import { MenuHeader } from '@/components/MenuHeader';
import { Footer } from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProductExtras } from '@/hooks/useProductExtras';
import { ProductExtras } from '@/components/cart/ProductExtras';
import { UpsellSuggestions } from '@/components/cart/UpsellSuggestions';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, clearCart, subtotal, totalItems, updateQuantity, updateItemNotes, addExtra, removeExtra } = useCart();
  const { currency, toggleCurrency, displayMode, getPrices } = useCurrency();
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();
  // FEATURE [EXTRAS]: cargar extras disponibles
  const { getExtrasForProduct, categoryHasExtras } = useProductExtras();

  const toggleNotesExpanded = (itemId: string) => {
    setExpandedNotes(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const formatPrice = (priceUsd: number) => {
    const p = getPrices(priceUsd);
    if (displayMode === 'solo_usd') return p.formattedUSD;
    if (displayMode === 'solo_ves') return p.formattedVES;
    return currency === 'USD' ? p.formattedUSD : p.formattedVES;
  };

  const formatPriceAlt = (priceUsd: number) => {
    const p = getPrices(priceUsd);
    if (displayMode !== 'ambas') return null;
    return currency === 'USD' ? p.formattedVES : p.formattedUSD;
  };

  const prices = getPrices(subtotal);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <MenuHeader 
          currency={currency} 
          onCurrencyToggle={toggleCurrency}
          displayMode={displayMode}
        />
        
        <div className="container px-4 py-20 text-center flex flex-col items-center">
          <div className="animate-cart-bounce mb-8">
            <div className="w-28 h-28 rounded-full bg-muted/50 flex items-center justify-center">
              <ShoppingCart className="h-14 w-14 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold mb-3">¡Tu carrito está vacío!</h1>
          <p className="text-muted-foreground mb-10 max-w-sm">
            Explora nuestro menú y agrega tus platos favoritos para comenzar tu pedido
          </p>
          <Button 
            onClick={() => navigate('/')} 
            size="lg"
            className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-8 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-5 w-5" />
            Explorar menú
          </Button>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader 
        currency={currency} 
        onCurrencyToggle={toggleCurrency}
        displayMode={displayMode}
      />
      
      <div className={`container px-4 py-8 ${isMobile ? 'pb-28' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Tu Carrito</h1>
              <p className="text-sm text-muted-foreground">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive gap-2">
            <Trash2 className="h-4 w-4" />
            Vaciar
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, index) => {
              const isNotesExpanded = expandedNotes[item.id] || !!item.notes;
              
              return (
                <Card 
                  key={item.id} 
                  className="overflow-hidden border-border/50 hover:border-border transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary)/0.08)] animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      {/* OPTIMIZACIÓN DE PERFORMANCE — Cart item image
                          loading="lazy", width/height para CLS, alt con marca */}
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-white overflow-hidden flex-shrink-0 shadow-md">
                        <img 
                          src={item.imagen} 
                          alt={`${item.nombre} — Catarsis Drinks & Food, Lechería`}
                          loading="lazy"
                          width="96"
                          height="96"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display font-semibold truncate text-base">{item.nombre}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full flex-shrink-0"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatPrice(item.precio_usd)} c/u
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          {/* Pill quantity controls */}
                          <div className="flex items-center gap-0 bg-background rounded-full border border-border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-muted"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-sm font-bold w-6 text-center tabular-nums">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-muted"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            {/* FEATURE [EXTRAS]: el total de línea incluye extras */}
                            {(() => {
                              const extrasTotal = (item.extras || []).reduce((s, e) => s + e.precio_usd, 0);
                              const lineTotal = (item.precio_usd + extrasTotal) * item.quantity;
                              return (
                                <>
                                  <span className="font-bold text-secondary">
                                    {formatPrice(lineTotal)}
                                  </span>
                                  {formatPriceAlt(lineTotal) && (
                                    <p className="text-[11px] text-muted-foreground">
                                      {formatPriceAlt(lineTotal)}
                                    </p>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FEATURE [EXTRAS]: Sección de extras si la categoría tiene disponibles */}
                    {categoryHasExtras(item.categoria) && (
                      <div className="mt-2 px-1">
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
                        />
                      </div>
                    )}
                    
                    {/* Notes Section */}
                    <div className="mt-3 pt-3 border-t border-border/40">
                      <button
                        onClick={() => toggleNotesExpanded(item.id)}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{item.notes ? 'Editar nota' : 'Agregar nota'}</span>
                        {isNotesExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 ml-auto" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 ml-auto" />
                        )}
                        {item.notes && !expandedNotes[item.id] && (
                          <span className="text-[11px] text-secondary ml-1 truncate max-w-[120px]">
                            📝 {item.notes}
                          </span>
                        )}
                      </button>
                      
                      {isNotesExpanded && (
                        <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                          <Textarea
                            value={item.notes || ''}
                            onChange={(e) => updateItemNotes(item.id, e.target.value)}
                            placeholder="Ej: sin vegetales, extra salsa, poco picante..."
                            className="min-h-[56px] text-xs resize-none bg-muted/30"
                            maxLength={200}
                          />
                          <p className="text-[10px] text-muted-foreground mt-1 text-right">
                            {(item.notes?.length || 0)}/200
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

            {/* FEATURE [UPSELL]: Sugerencias de compra para aumentar el ticket */}
            <div className="lg:col-span-2">
              {/* [2026-04-10] Aumentar de 6 a 10 para más opciones de upsell */}
              <UpsellSuggestions maxItems={10} />
            </div>

          <div className="lg:col-span-1 hidden lg:block">
            <Card className="sticky top-4 bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-[0_0_20px_hsl(var(--primary)/0.08)]">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-lg font-display font-bold">Resumen del pedido</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                </div>
                
                <div className="border-t border-border/50 pt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-display font-bold text-base">Total</span>
                    <span className="text-2xl font-bold text-secondary">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  {formatPriceAlt(subtotal) && (
                    <p className="text-sm text-muted-foreground text-right">
                      {formatPriceAlt(subtotal)}
                    </p>
                  )}
                </div>

                <Button 
                  className="w-full gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-base h-12 hover:scale-[1.02] transition-transform animate-checkout-glow" 
                  size="lg"
                  onClick={() => navigate('/checkout')}
                >
                  <ShoppingBag className="h-5 w-5" />
                  Finalizar Compra
                </Button>
                
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Pedido seguro</span>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => navigate('/')}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Seguir comprando
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-50 md:hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <div className="text-right">
              <span className="text-lg font-bold text-secondary">{formatPrice(subtotal)}</span>
              {formatPriceAlt(subtotal) && (
                <p className="text-[11px] text-muted-foreground">{formatPriceAlt(subtotal)}</p>
              )}
            </div>
          </div>
          <Button 
            className="w-full gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold h-12 animate-checkout-glow" 
            size="lg"
            onClick={() => navigate('/checkout')}
          >
            <ShoppingBag className="h-5 w-5" />
            Finalizar Compra
          </Button>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Cart;
