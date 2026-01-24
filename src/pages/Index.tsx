import { MenuHeader } from '@/components/MenuHeader';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { MenuGrid } from '@/components/MenuGrid';
import { Footer } from '@/components/Footer';
import { StickyActionBar } from '@/components/StickyActionBar';
import { useCurrency } from '@/hooks/useCurrency';
import { useSearch } from '@/hooks/useSearch';
import { useProducts } from '@/hooks/useProducts';

const Index = () => {
  const { currency, toggleCurrency, displayMode } = useCurrency();
  const { products, featuredProducts, bestSellers } = useProducts();
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory, 
    filteredItems 
  } = useSearch(products);

  return (
    <div className="min-h-screen bg-background">
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
      
      <SearchBar 
        value={searchQuery}
        onChange={setSearchQuery}
      />
      
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      <MenuGrid 
        items={filteredItems}
        currency={currency}
        selectedCategory={selectedCategory}
        displayMode={displayMode}
        bestSellers={bestSellers}
      />
      
      <Footer />
      
      <StickyActionBar 
        currency={currency}
        onCurrencyToggle={toggleCurrency}
        displayMode={displayMode}
      />
    </div>
  );
};

export default Index;
