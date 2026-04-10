// ================================================
// [2026-04-08] REFACTOR: Sugerencias contextuales
// [2026-04-10] CARRUSEL DE SUGERENCIAS
// ANTES: grid estático con 6 items, el último se cortaba.
// AHORA: carrusel con scroll horizontal suave, flechas de
// navegación y 10 productos para más opciones de upsell.
// [2026-04-10] MOBILE: scroll-snap, sin flechas, degradados
// en ambos bordes, swipe nativo con momentum.
// [2026-04-10] Cards adaptativas según ancho de pantalla:
// 320-375px: ~3 cards, 376-430px: ~3.5 cards, 431px+: ~4 cards
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

  // [2026-04-10] Desplazar 3 cards por click para avanzar más rápido
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    // [2026-04-10] Ancho adaptativo: 28vw en mobile, fijo en desktop
    const cardWidth = isMobile ? window.innerWidth * 0.28 : compact ? 130 : 150;
    const amount = cardWidth * 3 + 8 * 3; // 3 cards + 3 gaps
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
            // [2026-04-10] Cards adaptativas: 28vw en mobile (~3-4 cards visibles)
            // Pantalla pequeña: 3 cards + borde de 4ta, mediana: ~3.5, grande: ~4
            // [2026-04-10] Cards oscuras con paleta de marca Catarsis
            className={`flex-shrink-0 rounded-lg md:rounded-xl border border-gray-700/50 bg-[#0a1628] overflow-hidden
              ${isMobile ? 'snap-start' : ''}
              ${compact ? 'w-[130px]' : isMobile ? 'w-[28vw] min-w-[100px] max-w-[140px]' : 'w-[150px]'}`}
          >
            {/* [2026-04-10] Imagen sin fondo blanco, coherente con tema oscuro */}
            <div className={`${compact ? 'h-20' : isMobile ? 'h-[100px]' : 'h-24'}`}>
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
              {/* [2026-04-10] Texto Seasalt sobre fondo oscuro */}
              <p className={`font-medium truncate text-[#F7F8F9] ${compact ? 'text-[11px]' : 'text-[11px] md:text-xs'}`}>
                {product.nombre}
              </p>
              <div className="flex items-center justify-between mt-1 md:mt-1.5">
                {/* [2026-04-10] Precio Xanthous */}
                <span className={`font-bold text-[#F2B60F] ${compact ? 'text-[11px]' : 'text-[11px] md:text-xs'}`}>
                  {formatPrice(product.precio_usd)}
                </span>
                {/* [2026-04-10] Botón (+) con acento Xanthous */}
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

      {/* [2026-04-10] Flechas de navegación — visibles en mobile y desktop */}
      {!compact && canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[#010C23]/85 border border-gray-700/50 text-white hover:bg-[#010C23] transition-colors"
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      {!compact && canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[#010C23]/85 border border-gray-700/50 text-white hover:bg-[#010C23] transition-colors"
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
          {/* [2026-04-10] Título más sutil en mobile para no competir con el carrito */}
          <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-3">
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-secondary hidden md:block" />
            <h3 className={`font-medium md:font-semibold ${compact ? 'text-sm' : 'text-xs md:text-base'} md:font-display`}>
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
          {/* [2026-04-10] Título sutil en mobile */}
          <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-3">
            <GlassWater className="h-3 w-3 md:h-4 md:w-4 text-secondary hidden md:block" />
            <h3 className={`font-medium md:font-semibold ${compact ? 'text-sm' : 'text-xs md:text-base'} md:font-display`}>
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
