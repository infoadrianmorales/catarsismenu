import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { MenuItem, Currency } from '@/types/menu';
import { PriceDisplayMode } from '@/hooks/useCurrency';
import { MenuCard } from './MenuCard';

interface CategorySectionProps {
  slug: string;
  title: string;
  subtitle?: string;
  items: MenuItem[];
  currency: Currency;
  displayMode?: PriceDisplayMode;
}

export const CategorySection = ({ 
  slug, 
  title, 
  subtitle, 
  items, 
  currency, 
  displayMode = 'ambas' 
}: CategorySectionProps) => {
  if (items.length === 0) return null;

  return (
    <section className="py-6">
      <div className="container px-4">
        {/* Header with title and "Ver todo" CTA */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            to={`/categoria/${slug}`}
            className="group flex items-center gap-2 hover:text-primary transition-colors"
          >
            <h2 className="text-xl md:text-2xl font-display font-black text-foreground group-hover:text-primary transition-colors">
              {title}
            </h2>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
          
          <Link 
            to={`/categoria/${slug}`}
            className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
          >
            Ver todo
          </Link>
        </div>

        {subtitle && (
          <p className="text-muted-foreground text-sm mb-4 max-w-2xl">
            {subtitle}
          </p>
        )}

        {/* Products in grid - standard browser loading */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
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
