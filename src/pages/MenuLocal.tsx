import { useMemo } from 'react';
import { MenuHeader } from '@/components/MenuHeader';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { CategorySection } from '@/components/CategorySection';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { FilteredProductsGrid } from '@/components/FilteredProductsGrid';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/useCurrency';
import { useProducts } from '@/hooks/useProducts';
import { useSearch } from '@/hooks/useSearch';
import { usePublicCategories } from '@/hooks/usePublicCategories';

/**
 * MenuLocal - Simplified menu page for in-store QR scanning
 * 
 * Differences from Index (Delivery mode):
 * - HeroSection shows single static image (no carousel)
 * - Only Instagram CTA button (no WhatsApp, no "Cómo llegar")
 * - No FloatingCartButton
 * - No StickyActionBar
 * - No FloatingWhatsApp (handled at App level)
 */
const MenuLocal = () => {
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
      <MenuHeader 
        currency={currency} 
        onCurrencyToggle={toggleCurrency}
        displayMode={displayMode}
      />
      
      {/* Hero with mode="local" - single image, Instagram only */}
      <HeroSection mode="local" />
      
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
        {/* [2026-04-10] Búsqueda desde el menú local. */}
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
      
      <Footer />
      
      {/* 
        No FloatingCartButton here
        No StickyActionBar here
        FloatingWhatsApp is hidden at App level for /local route
      */}
    </div>
  );
};

export default MenuLocal;
