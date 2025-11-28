import { useState } from 'react';
import { Currency, MenuCategory } from '@/types/menu';
import { menuItems } from '@/data/menuItems';
import { MenuHeader } from '@/components/MenuHeader';
import { HeroSection } from '@/components/HeroSection';
import { CategoryFilter } from '@/components/CategoryFilter';
import { MenuGrid } from '@/components/MenuGrid';
import { WhatsAppFAB } from '@/components/WhatsAppFAB';
import { Footer } from '@/components/Footer';

const Index = () => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('todos');
  
  // Exchange rate: 1 USD = 50 VES (adjust as needed)
  const exchangeRate = 50;

  const handleCurrencyToggle = () => {
    setCurrency(prev => prev === 'USD' ? 'VES' : 'USD');
  };

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader 
        currency={currency} 
        onCurrencyToggle={handleCurrencyToggle}
      />
      
      <HeroSection />
      
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      <MenuGrid 
        items={menuItems}
        currency={currency}
        exchangeRate={exchangeRate}
        selectedCategory={selectedCategory}
      />
      
      <Footer />
      
      <WhatsAppFAB />
    </div>
  );
};

export default Index;
