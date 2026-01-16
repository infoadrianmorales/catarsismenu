import { MenuItem, Currency } from '@/types/menu';
import { MenuCard } from '@/components/MenuCard';
import { PriceDisplayMode } from '@/hooks/useCurrency';
import { Star } from 'lucide-react';

interface FeaturedProductsProps {
  items: MenuItem[];
  currency: Currency;
  displayMode?: PriceDisplayMode;
}

export const FeaturedProducts = ({ items, currency, displayMode = 'ambas' }: FeaturedProductsProps) => {
  // Show max 4 featured products
  const featuredItems = items.slice(0, 4);

  if (featuredItems.length === 0) {
    return null;
  }

  return (
    <section className="py-8 px-4 sm:px-6 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Star className="h-6 w-6 text-secondary fill-secondary" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center">
            Productos Destacados
          </h2>
          <Star className="h-6 w-6 text-secondary fill-secondary" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {featuredItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              currency={currency}
              displayMode={displayMode}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
