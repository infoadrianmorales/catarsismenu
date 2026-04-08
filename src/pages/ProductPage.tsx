import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, AlertCircle } from 'lucide-react';
import { OptimizedImage } from '@/components/OptimizedImage';
import { MenuHeader } from '@/components/MenuHeader';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/useCurrency';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { trackViewContent, trackAddToCart } from '@/lib/metaPixel';
import { SEO } from '@/components/SEO';
import { ProductSchema } from '@/components/ProductSchema';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { currency, toggleCurrency, displayMode, getPrices } = useCurrency();
  const { products, loading } = useProducts();
  const { addToCart, getItemQuantity, updateQuantity, isProductOrderable } = useCart();

  const product = useMemo(() => {
    return products.find(p => p.slug === slug);
  }, [products, slug]);

  const quantity = product ? getItemQuantity(product.id) : 0;
  const isOrderable = product ? isProductOrderable(product) : false;

  // Track ViewContent when product is loaded
  useEffect(() => {
    if (product) {
      trackViewContent({
        id: product.id,
        nombre: product.nombre,
        categoria: product.categoria,
        precio_usd: product.precio_usd,
      });
    }
  }, [product?.id]);

  // [2026-04-08] SOURCE TRACKING: desde página de producto se registra como 'menu'
  const handleAddToCart = () => {
    if (product && addToCart(product, 'menu')) {
      toast.success(`${product.nombre} agregado al carrito`);
      trackAddToCart({ id: product.id, nombre: product.nombre, precio_usd: product.precio_usd }, 1);
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
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
          <title>Producto no encontrado | Catarsis Drinks & Food</title>
        </Helmet>
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

  const categoryLabel = product.categoria.charAt(0).toUpperCase() + product.categoria.slice(1);
  
  const breadcrumbItems = [
    { name: 'Inicio', url: 'https://www.catarsiszone.com/' },
    { name: categoryLabel, url: `https://www.catarsiszone.com/categoria/${product.categoria}` },
    { name: product.nombre, url: `https://www.catarsiszone.com/producto/${product.slug}` }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={product.nombre}
        description={product.descripcion_corta || `${product.nombre} en Catarsis Drinks & Food`}
        image={product.imagen}
        url={`/producto/${product.slug}`}
        type="product"
      />
      <ProductSchema
        name={product.nombre}
        description={product.descripcion_corta || undefined}
        image={product.imagen}
        priceUSD={product.precio_usd}
        slug={product.slug}
        category={categoryLabel}
        isAvailable={isOrderable}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
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
          asChild
          className="mb-4 -ml-2"
        >
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al menú
          </Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-white border border-foreground/10 shadow-lg">
              <OptimizedImage 
                src={product.imagen} 
                alt={`Foto de ${product.nombre}`}
                className="h-full w-full object-cover p-4"
                containerClassName="h-full w-full"
                variant="full"
                loading="eager"
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
                  <div className="space-y-3">
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
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        size="lg" 
                        className="flex-1 gap-2"
                        asChild
                      >
                        <Link to="/">
                          <ArrowLeft className="h-4 w-4" />
                          Seguir comprando
                        </Link>
                      </Button>
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
