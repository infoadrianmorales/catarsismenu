import { useMemo, useEffect, lazy, Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';

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
const LazySocialProof = lazy(() =>
  import('@/components/SocialProofSection').then(m => ({ default: m.SocialProofSection }))
);
const LazyNewsletter = lazy(() =>
  import('@/components/NewsletterSection').then(m => ({ default: m.NewsletterSection }))
);
const LazyTopBar = lazy(() =>
  import('@/components/TopBar').then(m => ({ default: m.TopBar }))
);


const Index = () => {
  const queryClient = useQueryClient();
  const { currency, toggleCurrency, displayMode } = useCurrency();
  const { products, featuredProducts, bestSellers, loading: productsLoading, error: productsError } = useProducts();
  const { sectionCategories, categoryLabels, loading: categoriesLoading, error: categoriesError, usingFallback } = usePublicCategories();
  
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
  // [2026-07-22] Estado de degradación: la home no logró leer datos frescos.
  // Mostramos banner + botón "Reintentar" y dejamos que el fallback estático
  // + fallback de categorías rendericen algo útil en vez de página en blanco.
  const hasBackendIssue = !loading && (!!productsError || !!categoriesError || usingFallback);

  useEffect(() => {
    if (!loading && hasBackendIssue) {
      console.error('[HOME_DEGRADED]', {
        productsError: productsError?.message,
        categoriesError: categoriesError?.message,
        usingFallback,
        productsCount: products.length,
      });
    }
  }, [loading, hasBackendIssue, productsError, categoriesError, usingFallback, products.length]);

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['best-sellers'] });
    queryClient.invalidateQueries({ queryKey: ['public-categories'] });
  };


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
      <Suspense fallback={null}>
        <LazyTopBar />
      </Suspense>
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
        // [2026-04-10] Búsqueda desde la home.
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
      
      
      {/* [2026-07-02] CATARSIS — ORDEN FINAL, no modificar esta secuencia:
          1. SocialProof — testimonios + CTA de reseña Google unificados
          2. SemanticSEOSection — texto SEO para Google e IAs + ubicación/mapa
          3. Franja de marca — elemento visual de separación
          4. Newsletter — captación de correos
          5. Footer — contacto, horario y ubicación */}
      <Suspense fallback={null}>
        <LazySocialProof />
      </Suspense>
      <SemanticSEOSection />
      <Suspense fallback={null}>
        <LazyTapeDivider />
      </Suspense>
      <Suspense fallback={null}>
        <LazyNewsletter />
      </Suspense>
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
