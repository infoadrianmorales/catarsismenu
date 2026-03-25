import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MenuHeader } from '@/components/MenuHeader';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { CategorySection } from '@/components/CategorySection';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { FilteredProductsGrid } from '@/components/FilteredProductsGrid';
import { Footer } from '@/components/Footer';
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
        <FilteredProductsGrid
          items={filteredItems}
          currency={currency}
          displayMode={displayMode}
          onClearFilters={clearFilters}
          searchQuery={searchQuery}
          categoryLabel={categoryLabels[selectedCategory]}
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
      
      
      <Footer />
      
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
