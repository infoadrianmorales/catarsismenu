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

  // [2026-07-02] Compactación home: máx 4 productos por categoría + CTA grande "Ver todo".
  const totalCount = items.length;
  const visibleItems = items.slice(0, 4);
  const hasMore = totalCount > 4;

  return (
    <section className="py-6">
      <div className="container px-4">
        {/* Header con título y "Ver todo" pequeño (solo si hay más) */}
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
          
          {hasMore && (
            <Link 
              to={`/categoria/${slug}`}
              // ACCESIBILIDAD [CONTRASTE]: #FF4D7A (ratio ~5.2:1) reemplaza text-primary (ratio 3.93:1)
              className="text-sm font-medium text-[#FF4D7A] hover:text-[#FF4D7A]/80 hover:underline transition-colors"
            >
              Ver todo
            </Link>
          )}
        </div>

        {subtitle && (
          <p className="text-muted-foreground text-sm mb-4 max-w-2xl">
            {subtitle}
          </p>
        )}

        {/* Grid limitado a 4 productos */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleItems.map((item) => (
            <MenuCard 
              key={item.id}
              item={item} 
              currency={currency} 
              displayMode={displayMode}
            />
          ))}
        </div>

        {/* CTA grande cuando hay más de 4 productos */}
        {hasMore && (
          <div className="mt-6 flex justify-center">
            <Link
              to={`/categoria/${slug}`}
              className="group inline-flex items-center gap-2 rounded-full bg-[#C88600] px-8 py-4 font-display font-black uppercase tracking-wide text-white shadow-lg transition-all hover:bg-[#B07400] hover:shadow-xl hover:-translate-y-0.5"
            >
              <span>Ver toda la categoría ({totalCount})</span>
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
