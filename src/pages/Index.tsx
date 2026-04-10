import { useMemo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { MenuHeader } from '@/components/MenuHeader';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { CategorySection } from '@/components/CategorySection';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { FilteredProductsGrid } from '@/components/FilteredProductsGrid';
import { StickyActionBar } from '@/components/StickyActionBar';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/useCurrency';
import { useProducts } from '@/hooks/useProducts';
import { useSearch } from '@/hooks/useSearch';
import { usePublicCategories } from '@/hooks/usePublicCategories';
import { FloatingCartButton } from '@/components/cart/FloatingCartButton';
import { RestaurantSchema } from '@/components/RestaurantSchema';
import { FAQSchema } from '@/components/FAQSchema';
import { LocalBusinessSchema } from '@/components/LocalBusinessSchema';
import { SEO } from '@/components/SEO';
// SEO SEMÁNTICO: Sección de texto para indexación por
// Google e IAs. No mover ni eliminar — es la base del
// posicionamiento local de Catarsis en Lechería.
import { SemanticSEOSection } from '@/components/SemanticSEOSection';

/**
 * PERFORMANCE [LAZY LOAD]: Footer y TapeDivider están below the fold
 * — no son visibles en la pantalla inicial. Cargarlos de forma diferida
 * reduce el bundle inicial y mejora FCP/LCP.
 * NOTA: NO aplicar lazy a schemas ni SemanticSEOSection — son SEO críticos.
 */
const LazyFooter = lazy(() =>
  import('@/components/Footer').then(m => ({ default: m.Footer }))
);
const LazyTapeDivider = lazy(() =>
  import('@/components/Footer').then(m => ({ default: m.TapeDivider }))
);

const Index = () => {
  const { currency, toggleCurrency, displayMode } = useCurrency();
  const { products, featuredProducts, bestSellers, loading: productsLoading } = useProducts();
  const { sectionCategories, categoryLabels, loading: categoriesLoading } = usePublicCategories();
  
  // Use search hook for filtering - pass bestSellers for virtual category
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredItems,
    clearFilters,
    hasFilters
  } = useSearch(products, bestSellers);

  const loading = productsLoading || categoriesLoading;

  const groupedProducts = useMemo(() => {
    const groups: Record<string, typeof products> = {};
    
    // Best sellers first
    groups['best-seller'] = bestSellers;
    
    // Group by category slug from DB categories
    sectionCategories.forEach(cat => {
      if (cat.slug !== 'best-seller') {
        groups[cat.slug] = products.filter(p => p.categoria === cat.slug);
      }
    });
    
    return groups;
  }, [products, bestSellers, sectionCategories]);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Las Mejores Hamburguesas de Lechería – Pizzas, Emparedados y Coctelería"
        description="Catarsis es el restaurante de hamburguesas más popular de Lechería. Hamburguesas gourmet, pizzas artesanales, emparedados, parrilla y la mejor coctelería de autor. Ideal para almorzar o disfrutar la noche. ¡Pide delivery!"
        url="/"
      />
      <RestaurantSchema />
      <FAQSchema />
      <LocalBusinessSchema />
      <MenuHeader
        currency={currency} 
        onCurrencyToggle={toggleCurrency}
        displayMode={displayMode}
      />
      
      {/* ACCESIBILIDAD [LANDMARK]: <main> indica a lectores de pantalla
          dónde empieza el contenido principal. Google usa landmarks
          para entender la estructura de la página. */}
      <main role="main" aria-label="Contenido principal">
      <HeroSection />
      
      <FeaturedProducts
        items={featuredProducts}
        currency={currency}
        displayMode={displayMode}
      />
      
      {/* Search and Category Filter */}
      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      {/* Conditional rendering: filtered grid or category sections */}
      {loading ? (
        <div className="container px-4 py-8 space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-4 overflow-hidden">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="w-40 aspect-[3/4] shrink-0 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : hasFilters ? (
        {/* [2026-04-10] Búsqueda desde la home. */}
        <FilteredProductsGrid
          items={filteredItems}
          currency={currency}
          displayMode={displayMode}
          onClearFilters={clearFilters}
          searchQuery={searchQuery}
          categoryLabel={categoryLabels[selectedCategory]}
          source="search"
        />
      ) : (
        <div className="space-y-2">
          {sectionCategories.map(cat => (
            <CategorySection
              key={cat.slug}
              slug={cat.slug}
              title={cat.slug === 'best-seller' ? `🔥 ${cat.nombre}` : cat.nombre}
              subtitle={cat.descripcion || ''}
              items={groupedProducts[cat.slug] || []}
              currency={currency}
              displayMode={displayMode}
            />
          ))}
        </div>
      )}
      
      
      {/* ORDEN FINAL — no modificar esta secuencia:
          1. Franja de marca — elemento visual de separación
          2. SemanticSEOSection — texto SEO para Google e IAs
          3. Footer — contacto, horario y ubicación */}
      <Suspense fallback={null}>
        <LazyTapeDivider />
      </Suspense>
      <SemanticSEOSection />
      </main>
      <Suspense fallback={null}>
        <LazyFooter />
      </Suspense>
      
      <FloatingCartButton />
      
      <StickyActionBar
        currency={currency}
        onCurrencyToggle={toggleCurrency}
        displayMode={displayMode}
      />
    </div>
  );
};

export default Index;
