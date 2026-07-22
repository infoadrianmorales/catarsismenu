// ================================================
// [2026-07-02] CATARSIS — SUGGESTION CAROUSEL (compartido)
// Extraído de UpsellSuggestions para reutilizarlo desde
// la página de producto (ProductSuggestions) sin duplicar UI.
// Renderiza un carrusel horizontal de tarjetas de producto con
// scroll-snap, flechas de navegación y botón "+" para agregar.
// ================================================
import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { OptimizedImage } from '@/components/OptimizedImage';

interface SuggestionCarouselProps {
  items: MenuItem[];
  compact?: boolean;
  formatPrice: (priceUsd: number) => string;
  onAdd: (product: MenuItem) => void;
}

export const SuggestionCarousel = ({
  items,
  compact = false,
  formatPrice,
  onAdd,
}: SuggestionCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(items.length > 3);
  const isMobile = useIsMobile();

  // Detecta si aún hay contenido a la izquierda/derecha para mostrar flechas.
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(updateScrollState);
    const timer = setTimeout(updateScrollState, 150);
    el.addEventListener('scroll', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, items]);

  // Desplaza aproximadamente 3 tarjetas por click.
  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const containerWidth = el.clientWidth;
    const gap = 10;
    const cardWidth = (containerWidth - 2 * gap) / 3;
    const amount = cardWidth * 3 + gap * 3;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <div
        ref={scrollRef}
        className="flex flex-row flex-nowrap overflow-x-auto gap-2.5 hide-scrollbar"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {items.map(product => (
          <div
            key={product.id}
            className={`flex-shrink-0 flex-grow-0 rounded-lg border border-gray-700/50 bg-[#0a1628] overflow-hidden ${compact ? 'w-[130px]' : ''}`}
            style={{
              scrollSnapAlign: 'start',
              ...(!compact ? { width: isMobile ? 'calc((100% - 30px) / 3.5)' : '150px' } : {}),
            }}
          >
            <OptimizedImage
                src={product.imagen?.trim() || '/placeholder.svg'}
                alt={product.nombre}
                loading="lazy"
                variant="thumb"
                containerClassName={`${compact ? 'h-20' : isMobile ? 'h-[80px]' : 'h-24'} bg-white`}
                className="w-full h-full object-cover"
              />
            <div className="p-1.5">
              <p className="font-medium text-[#F7F8F9] text-[10px] md:text-[11px] leading-tight line-clamp-2 min-h-[24px]">
                {product.nombre}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-[#F2B60F] text-[11px]">
                  {formatPrice(product.precio_usd)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full border border-[#F2B60F] text-[#F2B60F] hover:bg-[#F2B60F]/20"
                  onClick={() => onAdd(product)}
                  aria-label={`Agregar ${product.nombre} al carrito`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[#010C23]/90 border border-[#F2B60F] text-[#F2B60F] shadow-lg transition-colors"
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[#010C23]/90 border border-[#F2B60F] text-[#F2B60F] shadow-lg transition-colors"
          aria-label="Ver más sugerencias"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0a1628] to-transparent pointer-events-none rounded-r-lg" />
      )}
    </div>
  );
};
