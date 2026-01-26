import { useState, useRef, useEffect } from 'react';
import { MenuItem, Currency } from '@/types/menu';
import { PriceDisplayMode } from '@/hooks/useCurrency';
import { CompactProductCard } from './CompactProductCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ProductCarouselProps {
  items: MenuItem[];
  currency: Currency;
  displayMode?: PriceDisplayMode;
}

// Hook to detect when the carousel section enters viewport
const useCarouselVisibility = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Fallback: If IntersectionObserver not supported, load immediately
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    // Check if already in viewport on mount
    const rect = element.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight + 300 && rect.bottom > -300;
    if (inViewport) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px', threshold: 0.01 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

export const ProductCarousel = ({ items, currency, displayMode = 'ambas' }: ProductCarouselProps) => {
  const { ref, isVisible } = useCarouselVisibility();

  return (
    <div ref={ref}>
      <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex gap-3 snap-x snap-mandatory scroll-smooth items-stretch">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="snap-start shrink-0 w-[150px] sm:w-[185px] h-full"
            >
              <CompactProductCard 
                item={item} 
                currency={currency} 
                displayMode={displayMode}
                forceLoad={isVisible}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="mt-2" />
      </ScrollArea>
    </div>
  );
};
