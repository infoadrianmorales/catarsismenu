import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { MenuHeader } from '@/components/MenuHeader';
import { Footer } from '@/components/Footer';
import { StickyActionBar } from '@/components/StickyActionBar';
import { SearchBar } from '@/components/SearchBar';
import { MenuCard } from '@/components/MenuCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/useCurrency';
import { useProducts } from '@/hooks/useProducts';
import { usePublicCategories } from '@/hooks/usePublicCategories';
import { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { SEO } from '@/components/SEO';
import { trackCustomEvent } from '@/lib/metaPixel';

const CategoryPage = () => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  // Support both /categoria/:slug and short URLs like /hamburguesas
  const slug = paramSlug || location.pathname.replace('/', '');
  const { currency, toggleCurrency, displayMode } = useCurrency();
  const { products, bestSellers, loading: productsLoading } = useProducts();
  const { getCategoryBySlug, loading: categoriesLoading } = usePublicCategories();
  const [searchQuery, setSearchQuery] = useState('');

  const loading = productsLoading || categoriesLoading;

  // Get category info from DB
  const categoryInfo = getCategoryBySlug(slug || '');
  const isBestSeller = slug === 'best-seller';
  const isValidCategory = isBestSeller || !!categoryInfo;
  
  // Fallback for unknown categories
  const displayTitle = categoryInfo?.nombre || (slug?.charAt(0).toUpperCase() + (slug?.slice(1) || ''));
  const displaySubtitle = categoryInfo?.descripcion || '';

  // Track ViewCategory event for Meta Pixel
  useEffect(() => {
    if (slug && isValidCategory) {
      trackCustomEvent('ViewCategory', { category: slug });
    }
  }, [slug, isValidCategory]);

  const categoryProducts = useMemo(() => {
    let items = slug === 'best-seller' 
      ? bestSellers 
      : products.filter(p => p.categoria === slug);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        p => p.nombre.toLowerCase().includes(query) || 
             p.descripcion_corta?.toLowerCase().includes(query) ||
             p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return items;
  }, [slug, products, bestSellers, searchQuery]);

  if (!loading && !isValidCategory) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
          <title>Categoría no encontrada | Catarsis Drinks & Food</title>
        </Helmet>
        <MenuHeader 
          currency={currency} 
          onCurrencyToggle={toggleCurrency}
          displayMode={displayMode}
        />
        <div className="container px-4 py-16 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Categoría no encontrada</h1>
          <p className="text-muted-foreground mb-6">La categoría que buscas no existe.</p>
          <Button variant="outline" asChild>
            <Link to="/">Volver al menú</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={displayTitle}
        description={displaySubtitle || `${displayTitle} en Catarsis Drinks & Food`}
        url={`/categoria/${slug}`}
      />
      <Helmet>
        <link rel="canonical" href={`https://www.catarsiszone.com/categoria/${slug}`} />
      </Helmet>
      <MenuHeader 
        currency={currency} 
        onCurrencyToggle={toggleCurrency}
        displayMode={displayMode}
      />
      
      <div className="container px-4 py-6">
        {/* Back button and title */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-black text-foreground">
              {slug === 'best-seller' ? `🔥 ${displayTitle}` : displayTitle}
            </h1>
            {displaySubtitle && (
              <p className="text-muted-foreground text-sm mt-1">
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Search within category */}
        <div className="mb-6">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery}
            placeholder={`Buscar en ${displayTitle}...`}
          />
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        ) : categoryProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? 'No encontramos coincidencias.' : 'No hay productos en esta categoría.'}
            </p>
            <Button variant="outline" asChild className="mt-4">
              <Link to="/">Volver al menú</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* [2026-04-10] Distinguir compras desde página de categoría. */}
            {categoryProducts.map(item => (
              <MenuCard 
                key={item.id} 
                item={item} 
                currency={currency}
                displayMode={displayMode}
                source="category"
              />
            ))}
          </div>
        )}
      </div>
      
      <Footer />
      
      <StickyActionBar 
        currency={currency}
        onCurrencyToggle={toggleCurrency}
        displayMode={displayMode}
      />
    </div>
  );
};

export default CategoryPage;
