import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, AlertCircle } from 'lucide-react';
import { MenuHeader } from '@/components/MenuHeader';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/useCurrency';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { currency, toggleCurrency, displayMode, getPrices } = useCurrency();
  const { products, loading } = useProducts();
  const { addToCart, getItemQuantity, updateQuantity, isProductOrderable } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);

  const product = useMemo(() => {
    return products.find(p => p.slug === slug);
  }, [products, slug]);

  const quantity = product ? getItemQuantity(product.id) : 0;
  const isOrderable = product ? isProductOrderable(product) : false;

  const handleAddToCart = () => {
    if (product && addToCart(product)) {
      toast.success(`${product.nombre} agregado al carrito`);
    }
  };

  const handleIncrement = () => {
    if (product) {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (product && quantity > 0) {
      updateQuantity(product.id, quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MenuHeader 
          currency={currency} 
          onCurrencyToggle={toggleCurrency}
          displayMode={displayMode}
        />
        <div className="container px-4 py-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="aspect-square max-w-md mx-auto rounded-lg mb-6" />
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2 mb-4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <MenuHeader 
          currency={currency} 
          onCurrencyToggle={toggleCurrency}
          displayMode={displayMode}
        />
        <div className="container px-4 py-16 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Producto no encontrado</h1>
          <p className="text-muted-foreground mb-6">El producto que buscas no existe o ha sido eliminado.</p>
          <Button asChild>
            <Link to="/">Volver al menú</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const prices = getPrices(product.precio_usd);

  const renderPrices = () => {
    if (displayMode === 'solo_usd') {
      return <span className="text-3xl font-display font-black text-secondary">{prices.formattedUSD}</span>;
    }
    if (displayMode === 'solo_ves') {
      return <span className="text-3xl font-display font-black text-secondary">{prices.formattedVES}</span>;
    }
    return (
      <div className="flex flex-col">
        <span className={`text-3xl font-display font-black ${currency === 'USD' ? 'text-secondary' : 'text-muted-foreground text-xl'}`}>
          {prices.formattedUSD}
        </span>
        <span className={`text-lg ${currency === 'VES' ? 'text-secondary font-bold' : 'text-muted-foreground'}`}>
          {prices.formattedVES}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader 
        currency={currency} 
        onCurrencyToggle={toggleCurrency}
        displayMode={displayMode}
      />
      
      <div className="container px-4 py-6 pb-32">
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-white border border-foreground/10 shadow-lg">
              {!imageLoaded && (
                <Skeleton className="absolute inset-0" />
              )}
              <img 
                src={product.imagen} 
                alt={`Foto de ${product.nombre}`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className={`h-full w-full object-cover p-4 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
            
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-display font-black text-foreground mb-2">
              {product.nombre}
            </h1>
            
            <p className="text-muted-foreground capitalize text-sm mb-4">
              {product.categoria}
            </p>

            {product.descripcion_corta && (
              <p className="text-foreground/80 text-lg mb-6 leading-relaxed">
                {product.descripcion_corta}
              </p>
            )}

            {/* Price */}
            <div className="mb-6">
              {renderPrices()}
            </div>

            {/* Add to cart or not orderable message */}
            {isOrderable ? (
              <div className="mt-auto space-y-4">
                {quantity === 0 ? (
                  <Button 
                    size="lg" 
                    className="w-full gap-2 text-lg py-6"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Agregar al carrito
                  </Button>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-secondary/10 rounded-full p-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={handleDecrement}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-xl font-bold min-w-[2rem] text-center">
                        {quantity}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={handleIncrement}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      size="lg" 
                      className="flex-1 gap-2"
                      asChild
                    >
                      <Link to="/carrito">
                        <ShoppingCart className="h-5 w-5" />
                        Ver carrito
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-auto p-4 bg-muted/50 rounded-lg border border-border flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Solo disponible en el local. No disponible para pedido.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductPage;
