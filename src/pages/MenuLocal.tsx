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

const categoryConfig = [
  { slug: 'best-seller', title: '🔥 Best Seller', subtitle: 'Los favoritos de nuestros clientes' },
  { slug: 'entradas', title: 'Entradas & Aperitivos', subtitle: 'El comienzo perfecto' },
  { slug: 'hamburguesas', title: 'Hamburguesas Gourmet', subtitle: 'Jugosas y sabrosas' },
  { slug: 'emparedados', title: 'Emparedados Premium', subtitle: 'Artesanales con calidad' },
  { slug: 'pizzas', title: 'Pizzas Artesanales', subtitle: 'Masa horneada a la perfección' },
  { slug: 'parrilla', title: 'Parrilla', subtitle: 'Carnes en su punto perfecto' },
  { slug: 'ensaladas', title: 'Ensaladas Frescas', subtitle: 'Opciones ligeras y nutritivas' },
  { slug: 'cocteleria', title: 'Coctelería Premium', subtitle: 'Combinaciones únicas' },
  { slug: 'postres', title: 'Postres', subtitle: 'El final perfecto' },
];

// Map category slugs to display labels
const categoryLabels: Record<string, string> = {
  'todos': 'Todos',
  'best-seller': 'Best Seller',
  'entradas': 'Entradas',
  'hamburguesas': 'Hamburguesas',
  'emparedados': 'Emparedados',
  'pizzas': 'Pizzas',
  'parrilla': 'Parrilla',
  'ensaladas': 'Ensaladas',
  'cocteleria': 'Coctelería',
  'postres': 'Postres',
};

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
  const { products, featuredProducts, bestSellers, loading } = useProducts();
  
  // Use search hook for filtering
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredItems,
    clearFilters,
    hasFilters
  } = useSearch(products);

  const groupedProducts = useMemo(() => {
    const groups: Record<string, typeof products> = {};
    
    // Best sellers first
    groups['best-seller'] = bestSellers;
    
    // Group by category
    categoryConfig.slice(1).forEach(cat => {
      groups[cat.slug] = products.filter(p => p.categoria === cat.slug);
    });
    
    return groups;
  }, [products, bestSellers]);

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
          {categoryConfig.map(cat => (
            <CategorySection
              key={cat.slug}
              slug={cat.slug}
              title={cat.title}
              subtitle={cat.subtitle}
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
