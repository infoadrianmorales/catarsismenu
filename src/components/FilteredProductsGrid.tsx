import { MenuItem, Currency } from '@/types/menu';
import { PriceDisplayMode } from '@/hooks/useCurrency';
import { MenuCard } from './MenuCard';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FilteredProductsGridProps {
  items: MenuItem[];
  currency: Currency;
  displayMode?: PriceDisplayMode;
  onClearFilters: () => void;
  searchQuery: string;
  categoryLabel?: string;
}

export const FilteredProductsGrid = ({ 
  items, 
  currency, 
  displayMode = 'ambas',
  onClearFilters,
  searchQuery,
  categoryLabel
}: FilteredProductsGridProps) => {
  const hasResults = items.length > 0;
  
  // Build filter description
  const filterDescription = [
    searchQuery && `"${searchQuery}"`,
    categoryLabel && categoryLabel !== 'Todos' && categoryLabel
  ].filter(Boolean).join(' en ');

  return (
    <section className="py-6">
      <div className="container px-4">
        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-black text-foreground">
              {hasResults ? `${items.length} resultado${items.length !== 1 ? 's' : ''}` : 'Sin resultados'}
            </h2>
            {filterDescription && (
              <p className="text-muted-foreground text-sm mt-1">
                Buscando: {filterDescription}
              </p>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="gap-2 rounded-full"
          >
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        </div>

        {hasResults ? (
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
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              No encontramos productos con esos filtros
            </p>
            <Button onClick={onClearFilters} variant="default" className="rounded-full">
              Ver todo el menú
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
