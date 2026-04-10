// ================================================
// [2026-04-08] REFACTOR: Sugerencias contextuales
// [2026-04-10] BANNER DE SUGERENCIAS con carrusel horizontal,
// botón explícito de "ver más" y cards con ancho exacto para
// mostrar 3 completas dentro del banner.
// ================================================

import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/hooks/useCurrency';
import { Plus, TrendingUp, GlassWater, ChevronLeft, ChevronRight } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { useCartSuggestions } from '@/hooks/useCartSuggestions';
import { useIsMobile } from '@/hooks/use-mobile';

interface UpsellSuggestionsProps {
  maxItems?: number;
  compact?: boolean;
}

// [2026-04-10] Sub-componente: carrusel horizontal dentro de un banner contenido.
// Muestra exactamente 3 cards visibles + botón de flecha para ver más.
const SuggestionCarousel = ({
  items,
  compact,
  formatPrice,
  onAdd,
}: {
  items: MenuItem[];
  compact: boolean;
  formatPrice: (priceUsd: number) => string;
  onAdd: (product: MenuItem) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(items.length > 3);
  const isMobile = useIsMobile();

  // [2026-04-10] Calcular si hay scroll disponible en cada dirección
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
    // [2026-04-10] Delay para mobile donde el layout puede tardar
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

  // [2026-04-10] Desplazar 3 cards por click
  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    // [2026-04-10] Calcular ancho de 1 card = (containerWidth - 2 gaps) / 3
    const containerWidth = el.clientWidth;
    const gap = 10; // gap-2.5 ≈ 10px
    const cardWidth = (containerWidth - 2 * gap) / 3;
    const amount = cardWidth * 3 + gap * 3;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      {/* [2026-04-10] Hide scrollbar CSS */}
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>

      {/* [2026-04-10] Contenedor flex horizontal con scroll-snap */}
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
            // [2026-04-10] Ancho exacto: 3 cards visibles dentro del banner
            // calc((100% - 2 * 10px) / 3) = exactamente 1/3 del espacio útil
            className={`flex-shrink-0 flex-grow-0 rounded-lg border border-gray-700/50 bg-[#0a1628] overflow-hidden
              ${compact ? 'w-[130px]' : ''}`}
            style={{
              scrollSnapAlign: 'start',
              ...(!compact ? { width: isMobile ? 'calc((100% - 30px) / 3.5)' : '150px' } : {}),
            }}
          >
            {/* [2026-04-10] Imagen */}
            <div className={`${compact ? 'h-20' : isMobile ? 'h-[80px]' : 'h-24'}`}>
              <img
                src={product.imagen}
                alt={product.nombre}
                loading="lazy"
                width="150"
                height="100"
                className="w-full h-full object-cover"
              />
            </div>
            {/* [2026-04-10] Info: nombre + precio + botón */}
            <div className="p-1.5">
              <p className="font-medium truncate text-[#F7F8F9] text-[11px]">
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

      {/* [2026-04-10] Botón flecha izquierda */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[#010C23]/90 border border-[#F2B60F] text-[#F2B60F] shadow-lg transition-colors"
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* [2026-04-10] Botón flecha derecha — indicador explícito de "ver más" */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[#010C23]/90 border border-[#F2B60F] text-[#F2B60F] shadow-lg transition-colors"
          aria-label="Ver más sugerencias"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* [2026-04-10] Degradado derecho sutil para reforzar la pista visual */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0a1628] to-transparent pointer-events-none rounded-r-lg" />
      )}
    </div>
  );
};

export const UpsellSuggestions = ({ maxItems = 10, compact = false }: UpsellSuggestionsProps) => {
  const { addToCart } = useCart();
  const { currency, displayMode, getPrices } = useCurrency();

  const { foodSuggestions, beverageSuggestions } = useCartSuggestions(maxItems);

  const formatPrice = (priceUsd: number) => {
    const p = getPrices(priceUsd);
    if (displayMode === 'solo_usd') return p.formattedUSD;
    if (displayMode === 'solo_ves') return p.formattedVES;
    return currency === 'USD' ? p.formattedUSD : p.formattedVES;
  };

  if (foodSuggestions.length === 0 && beverageSuggestions.length === 0) return null;

  return (
    <div className={compact ? 'py-3' : 'py-3 md:py-4'}>
      {/* [2026-04-10] Sección 1: Complementos — envuelto en banner */}
      {foodSuggestions.length > 0 && (
        <div className="mb-3 md:mb-4 bg-[#0a1628] border border-gray-700/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 md:gap-2 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-[#F2B60F]" />
            <h3 className="text-[#F7F8F9] text-xs font-bold uppercase tracking-wider">
              Complementa tu pedido
            </h3>
          </div>
          <SuggestionCarousel
            items={foodSuggestions}
            compact={compact}
            formatPrice={formatPrice}
            onAdd={(product) => addToCart(product, 'suggestion')}
          />
        </div>
      )}

      {/* [2026-04-10] Sección 2: Bebidas — envuelto en banner */}
      {beverageSuggestions.length > 0 && (
        <div className="bg-[#0a1628] border border-gray-700/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 md:gap-2 mb-2">
            <GlassWater className="h-3.5 w-3.5 text-[#F2B60F]" />
            <h3 className="text-[#F7F8F9] text-xs font-bold uppercase tracking-wider">
              ¿Algo para tomar?
            </h3>
          </div>
          <SuggestionCarousel
            items={beverageSuggestions}
            compact={compact}
            formatPrice={formatPrice}
            onAdd={(product) => addToCart(product, 'suggestion')}
          />
        </div>
      )}
    </div>
  );
};
