// ================================================
// [2026-04-08] REFACTOR: Sugerencias contextuales
// [2026-04-10] CARRUSEL DE SUGERENCIAS
// ANTES: grid estático con 6 items, el último se cortaba.
// AHORA: carrusel con scroll horizontal suave, flechas de
// navegación y 10 productos para más opciones de upsell.
// [2026-04-10] MOBILE: scroll-snap, sin flechas, degradados
// en ambos bordes, swipe nativo con momentum.
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

// [2026-04-10] Sub-componente de carrusel con scroll horizontal animado,
// flechas de navegación (solo desktop), snap en mobile y degradados indicadores.
// [2026-04-10] FIX MOBILE: Cards compactas con overflow-hidden vertical,
// flex-nowrap explícito y altura controlada para no expandir la página.
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
  const [canScrollRight, setCanScrollRight] = useState(false);
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

    // [2026-04-10] RAF para esperar a que el DOM refleje los items
    const raf = requestAnimationFrame(updateScrollState);

    el.addEventListener('scroll', updateScrollState, { passive: true });

    // [2026-04-10] ResizeObserver para recalcular al cambiar tamaño
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, items]);

  // [2026-04-10] Desplazar ~2.5 cards por click
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = compact ? 130 : 150;
    const amount = cardWidth * 2.5 + 12 * 2; // cards + gaps
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    // [2026-04-10] overflow-hidden en Y para contener la altura
    <div className="relative group overflow-hidden">
      {/* [2026-04-10] Contenedor de scroll — flex-nowrap explícito, snap en mobile */}
      <div
        ref={scrollRef}
        className={`flex flex-nowrap gap-2 md:gap-3 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide
          ${isMobile ? 'snap-x snap-mandatory' : ''}
          ${compact ? '-mx-6 px-6' : ''}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map(product => (
          <div
            key={product.id}
            className={`flex-shrink-0 rounded-lg md:rounded-xl border border-border/50 bg-muted/30 overflow-hidden
              ${isMobile ? 'snap-start' : ''}
              ${compact ? 'w-[130px]' : isMobile ? 'w-[140px]' : 'w-[150px]'}`}
          >
            {/* [2026-04-10] Imagen: 100px en mobile, 96px desktop, 80px compact */}
            <div className={`bg-white ${compact ? 'h-20' : isMobile ? 'h-[100px]' : 'h-24'}`}>
              <img
                src={product.imagen}
                alt={product.nombre}
                loading="lazy"
                width="150"
                height="100"
                className="w-full h-full object-cover"
              />
            </div>
            {/* [2026-04-10] Info compacta: nombre truncado + precio + botón */}
            <div className="p-1.5 md:p-2">
              <p className={`font-medium truncate ${compact ? 'text-[11px]' : 'text-[11px] md:text-xs'}`}>
                {product.nombre}
              </p>
              <div className="flex items-center justify-between mt-1 md:mt-1.5">
                <span className={`font-bold text-secondary ${compact ? 'text-[11px]' : 'text-[11px] md:text-xs'}`}>
                  {formatPrice(product.precio_usd)}
                </span>
                {/* [2026-04-08] Source 'suggestion' para analytics */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary"
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

      {/* [2026-04-10] Flechas de navegación — solo desktop, solo modo no-compact */}
      {!compact && !isMobile && canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      {!compact && !isMobile && canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Desplazar a la derecha"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* [2026-04-10] Degradados en los bordes — indican más contenido */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      )}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      )}
    </div>
  );
};

export const UpsellSuggestions = ({ maxItems = 10, compact = false }: UpsellSuggestionsProps) => {
  const { addToCart } = useCart();
  const { currency, displayMode, getPrices } = useCurrency();

  // [2026-04-08] Hook contextual: analiza el carrito y genera sugerencias inteligentes
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
      {/* Sección 1: Complementos contextuales */}
      {foodSuggestions.length > 0 && (
        <div className="mb-3 md:mb-4">
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-secondary" />
            <h3 className={`font-display font-semibold ${compact ? 'text-sm' : 'text-sm md:text-base'}`}>
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

      {/* [2026-04-08] Sección 2: Bebidas */}
      {beverageSuggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <GlassWater className="h-3.5 w-3.5 md:h-4 md:w-4 text-secondary" />
            <h3 className={`font-display font-semibold ${compact ? 'text-sm' : 'text-sm md:text-base'}`}>
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
