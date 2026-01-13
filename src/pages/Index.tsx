import { MenuHeader } from '@/components/MenuHeader';
import { HeroSection } from '@/components/HeroSection';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { MenuGrid } from '@/components/MenuGrid';
import { Footer } from '@/components/Footer';
import { StickyActionBar } from '@/components/StickyActionBar';
import { useCurrency } from '@/hooks/useCurrency';
import { useSearch } from '@/hooks/useSearch';
import { useProducts } from '@/hooks/useProducts';

const Index = () => {
  const { currency, toggleCurrency } = useCurrency();
  const { products } = useProducts();
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
      />
      
      <HeroSection />
      
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
      />
      
      <Footer />
      
      <StickyActionBar 
        currency={currency}
        onCurrencyToggle={toggleCurrency}
      />
    </div>
  );
};

export default Index;
