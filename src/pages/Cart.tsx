import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/hooks/useCurrency';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { MenuHeader } from '@/components/MenuHeader';
import { Footer } from '@/components/Footer';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, clearCart, subtotal, totalItems } = useCart();
  const { currency, toggleCurrency, displayMode, getPrices } = useCurrency();

  const prices = getPrices(subtotal);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <MenuHeader 
          currency={currency} 
          onCurrencyToggle={toggleCurrency}
          displayMode={displayMode}
        />
        
        <div className="container px-4 py-16 text-center">
          <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-2xl font-display font-bold mb-4">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-8">
            Agrega productos desde nuestro menú para comenzar tu pedido
          </p>
          <Button onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Ver menú
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
      
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Tu Carrito</h1>
              <p className="text-muted-foreground">{totalItems} productos</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive gap-2">
            <Trash2 className="h-4 w-4" />
            Vaciar
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const itemPrices = getPrices(item.precio_usd);
              const linePrices = getPrices(item.precio_usd * item.quantity);
              
              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-24 h-24 rounded-lg bg-white overflow-hidden flex-shrink-0">
                        <img 
                          src={item.imagen} 
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold truncate">{item.nombre}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-2">
                          {displayMode === 'solo_usd' && itemPrices.formattedUSD}
                          {displayMode === 'solo_ves' && itemPrices.formattedVES}
                          {displayMode === 'ambas' && (
                            currency === 'USD' ? itemPrices.formattedUSD : itemPrices.formattedVES
                          )}
                          {' c/u'}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <AddToCartButton 
                            product={{
                              id: item.id,
                              nombre: item.nombre,
                              slug: '',
                              descripcion_corta: '',
                              precio_usd: item.precio_usd,
                              categoria: item.categoria as any,
                              imagen: item.imagen,
                              ratio: '1x1',
                              tags: [],
                              orden: 0,
                            }} 
                            variant="compact" 
                          />
                          
                          <div className="text-right">
                            <div className="font-bold text-secondary">
                              {displayMode === 'solo_usd' && linePrices.formattedUSD}
                              {displayMode === 'solo_ves' && linePrices.formattedVES}
                              {displayMode === 'ambas' && (
                                currency === 'USD' ? linePrices.formattedUSD : linePrices.formattedVES
                              )}
                            </div>
                            {displayMode === 'ambas' && (
                              <div className="text-xs text-muted-foreground">
                                {currency === 'USD' ? linePrices.formattedVES : linePrices.formattedUSD}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-display font-bold">Resumen</h2>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      {displayMode === 'solo_usd' && prices.formattedUSD}
                      {displayMode === 'solo_ves' && prices.formattedVES}
                      {displayMode === 'ambas' && (
                        currency === 'USD' ? prices.formattedUSD : prices.formattedVES
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold text-secondary">
                      {displayMode === 'solo_usd' && prices.formattedUSD}
                      {displayMode === 'solo_ves' && prices.formattedVES}
                      {displayMode === 'ambas' && (
                        currency === 'USD' ? prices.formattedUSD : prices.formattedVES
                      )}
                    </span>
                  </div>
                  {displayMode === 'ambas' && (
                    <p className="text-sm text-muted-foreground text-right">
                      {currency === 'USD' ? prices.formattedVES : prices.formattedUSD}
                    </p>
                  )}
                </div>

                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={() => navigate('/checkout')}
                >
                  <ShoppingBag className="h-5 w-5" />
                  Finalizar Compra
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/')}
                >
                  Seguir Comprando
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
