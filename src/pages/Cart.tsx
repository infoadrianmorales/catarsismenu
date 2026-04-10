// FEATURE [EXTRAS + UPSELL]: Página del carrito con soporte de extras por producto
// y sección de sugerencias de compra para aumentar el ticket promedio.
// [2026-04-10] REDISEÑO MOBILE-FIRST: resumen sticky/expandible,
// items compactos, carrusel de sugerencias con snap.

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

  // [2026-04-10] Estado para expandir/colapsar resumen en mobile
  const [summaryExpanded, setSummaryExpanded] = useState(false);

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
    <div className={`bg-background ${isMobile ? 'h-[100dvh] flex flex-col overflow-hidden' : 'min-h-screen'}`}>
      <MenuHeader 
        currency={currency} 
        onCurrencyToggle={toggleCurrency}
        displayMode={displayMode}
      />
      
      {/* [2026-04-10] Contenido principal — en mobile ocupa el espacio restante */}
      <div className={`${isMobile ? 'flex-1 flex flex-col overflow-hidden px-4 pt-2 pb-0' : 'container px-4 py-8'}`}>
        {/* [2026-04-10] Header compacto */}
        <div className="flex items-center justify-between mb-2 md:mb-6 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full h-8 w-8 md:h-10 md:w-10">
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold">Tu Carrito</h1>
              <p className="text-xs md:text-sm text-muted-foreground">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive gap-1.5 md:gap-2 text-xs md:text-sm">
            <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Vaciar
          </Button>
        </div>

        <div className={`${isMobile ? 'flex-1 flex flex-col overflow-hidden min-h-0' : 'grid lg:grid-cols-3 gap-8'}`}>
          {/* [2026-04-10] Items List — en mobile ocupa flex-1 con scroll interno */}
          <div className={`${isMobile ? 'flex-1 overflow-y-auto min-h-0 pr-1' : 'lg:col-span-2'}`}>
            <div className="space-y-2 md:space-y-3">
              {items.map((item, index) => {
                const isNotesExpanded = expandedNotes[item.id] || !!item.notes;
                
                return (
                  <Card 
                    key={item.id} 
                    className="overflow-hidden border-border/50 hover:border-border transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary)/0.08)] animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
                  >
                    {/* [2026-04-10] Padding reducido en mobile: p-3 vs p-4 */}
                    <CardContent className="p-3 md:p-4">
                      {/* [2026-04-10] FIX: Layout horizontal explícito con flex-row
                          para garantizar imagen + detalles visibles en mobile */}
                      <div className="flex flex-row gap-3 md:gap-4 items-start">
                        {/* [2026-04-10] FIX: Imagen con dimensiones explícitas,
                            sin bg-white para coherencia con tema oscuro */}
                        <div className="w-[60px] h-[60px] md:w-24 md:h-24 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0 shadow-md bg-muted/30">
                          <img 
                            src={item.imagen} 
                            alt={`${item.nombre} — Catarsis Drinks & Food, Lechería`}
                            loading="eager"
                            width="96"
                            height="96"
                            className="w-full h-full object-cover block"
                          />
                        </div>
                        
                        {/* Details */}
                        {/* [2026-04-10] FIX: flex-1 con min-w-0 y overflow visible */}
                        <div className="flex-1 min-w-0 overflow-visible">
                          <div className="flex items-start justify-between gap-2">
                            {/* [2026-04-10] FIX: Nombre siempre visible con color explícito */}
                            <h3 className="font-display font-semibold truncate text-sm md:text-base text-foreground">{item.nombre}</h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full flex-shrink-0"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            </Button>
                          </div>
                          
                          <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
                            {formatPrice(item.precio_usd)} c/u
                          </p>
                          
                          <div className="flex items-center justify-between mt-2 md:mt-3">
                            {/* [2026-04-10] Controles más compactos en mobile */}
                            <div className="flex items-center gap-0 bg-background rounded-full border border-border">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 md:h-8 md:w-8 rounded-full hover:bg-muted"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3 md:h-3.5 md:w-3.5" />
                              </Button>
                              <span className="text-xs md:text-sm font-bold w-5 md:w-6 text-center tabular-nums">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 md:h-8 md:w-8 rounded-full hover:bg-muted"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3 md:h-3.5 md:w-3.5" />
                              </Button>
                            </div>
                            
                            <div className="text-right">
                              {/* FEATURE [EXTRAS]: el total de línea incluye extras */}
                              {(() => {
                                const extrasTotal = (item.extras || []).reduce((s, e) => s + e.precio_usd, 0);
                                const lineTotal = (item.precio_usd + extrasTotal) * item.quantity;
                                return (
                                  <>
                                    <span className="font-bold text-secondary text-sm md:text-base">
                                      {formatPrice(lineTotal)}
                                    </span>
                                    {formatPriceAlt(lineTotal) && (
                                      <p className="text-[10px] md:text-[11px] text-muted-foreground">
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
                      
                      {/* [2026-04-10] Notes Section — menos espacio vertical en mobile */}
                      <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-border/40">
                        <button
                          onClick={() => toggleNotesExpanded(item.id)}
                          className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
                        >
                          <MessageSquare className="h-3 w-3 md:h-3.5 md:w-3.5" />
                          <span>{item.notes ? 'Editar nota' : 'Agregar nota'}</span>
                          {isNotesExpanded ? (
                            <ChevronUp className="h-3 w-3 md:h-3.5 md:w-3.5 ml-auto" />
                          ) : (
                            <ChevronDown className="h-3 w-3 md:h-3.5 md:w-3.5 ml-auto" />
                          )}
                          {item.notes && !expandedNotes[item.id] && (
                            <span className="text-[10px] md:text-[11px] text-secondary ml-1 truncate max-w-[100px] md:max-w-[120px]">
                              📝 {item.notes}
                            </span>
                          )}
                        </button>
                        
                        {isNotesExpanded && (
                          <div className="mt-1.5 md:mt-2 animate-in slide-in-from-top-2 duration-200">
                            <Textarea
                              value={item.notes || ''}
                              onChange={(e) => updateItemNotes(item.id, e.target.value)}
                              placeholder="Ej: sin vegetales, extra salsa..."
                              className="min-h-[48px] md:min-h-[56px] text-xs resize-none bg-muted/30"
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

          </div>

          {/* [2026-04-10] Sugerencias — flex-shrink-0 para que no se comprima, overflow-hidden para aislar scroll horizontal */}
          {isMobile ? null : (
            <div className="mt-6">
              <UpsellSuggestions maxItems={10} />
            </div>
          )}

          {/* [2026-04-10] Desktop: resumen sticky con top que respeta el header */}
          <div className="lg:col-span-1 hidden lg:block">
            <Card className="sticky top-24 bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-[0_0_20px_hsl(var(--primary)/0.08)]">
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

      {/* [2026-04-10] Mobile: barra fija inferior expandible con desglose */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50 md:hidden transition-all duration-300">
          {/* [2026-04-10] Área expandida con desglose — solo visible si summaryExpanded */}
          {summaryExpanded && (
            <div className="px-4 pt-3 pb-1 border-b border-border/40 animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {formatPriceAlt(subtotal) && (
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Equivalente</span>
                  <span className="text-muted-foreground">{formatPriceAlt(subtotal)}</span>
                </div>
              )}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pb-1">
                <Shield className="h-3 w-3" />
                <span>Pedido seguro</span>
              </div>
            </div>
          )}

          {/* [2026-04-10] Barra compacta: chevron + total + botón */}
          <div className="px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-3">
              {/* [2026-04-10] Chevron para expandir/colapsar desglose */}
              <button
                onClick={() => setSummaryExpanded(prev => !prev)}
                className="flex items-center gap-2 flex-1 min-w-0"
                aria-label={summaryExpanded ? 'Ocultar desglose' : 'Ver desglose'}
              >
                <div className="flex items-center gap-1">
                  {summaryExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-[11px] text-muted-foreground leading-none mb-0.5">Total</p>
                  <p className="text-lg font-bold text-secondary leading-none">{formatPrice(subtotal)}</p>
                </div>
              </button>

              <Button 
                className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold h-11 px-6 animate-checkout-glow flex-shrink-0" 
                onClick={() => navigate('/checkout')}
              >
                <ShoppingBag className="h-4 w-4" />
                Finalizar
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* [2026-04-10] Footer oculto en mobile — la barra fija lo reemplaza */}
      {!isMobile && <Footer />}
    </div>
  );
};

export default Cart;
