import { MenuItem, Currency } from '@/types/menu';
import { PriceDisplayMode } from '@/hooks/useCurrency';
import { CompactProductCard } from './CompactProductCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ProductCarouselProps {
  items: MenuItem[];
  currency: Currency;
  displayMode?: PriceDisplayMode;
}

export const ProductCarousel = ({ items, currency, displayMode = 'ambas' }: ProductCarouselProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap pb-4">
      <div className="flex gap-4 snap-x snap-mandatory scroll-smooth">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="snap-start shrink-0 w-[160px] sm:w-[180px]"
          >
            <CompactProductCard 
              item={item} 
              currency={currency} 
              displayMode={displayMode}
            />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="mt-2" />
    </ScrollArea>
  );
};
