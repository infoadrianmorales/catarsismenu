// FEATURE [UPSELL]: Componente de sugerencias de compra para aumentar el ticket promedio.
// Muestra best sellers (sin bebidas) + sección dedicada de bebidas.
// [2026-04-08] SOURCE TRACKING: Pasa source='suggestion' a addToCart.

import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { useCurrency } from '@/hooks/useCurrency';
import { Plus, TrendingUp, GlassWater } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { usePublicCategories } from '@/hooks/usePublicCategories';

interface UpsellSuggestionsProps {
  maxItems?: number;
  compact?: boolean;
}

export const UpsellSuggestions = ({ maxItems = 6, compact = false }: UpsellSuggestionsProps) => {
  const { items, addToCart } = useCart();
  const { bestSellers, products } = useProducts();
  const { currency, displayMode, getPrices } = useCurrency();
  const { categories } = usePublicCategories();

  const cartIds = new Set(items.map(i => i.id));
  const bebidasActive = categories.some(c => c.slug === 'bebidas');

  const formatPrice = (priceUsd: number) => {
    const p = getPrices(priceUsd);
    if (displayMode === 'solo_usd') return p.formattedUSD;
    if (displayMode === 'solo_ves') return p.formattedVES;
    return currency === 'USD' ? p.formattedUSD : p.formattedVES;
  };

  // Best sellers sin bebidas
  const filteredBestSellers = bestSellers.filter(p =>
    !cartIds.has(p.id) && p.is_orderable !== false && p.categoria !== 'bebidas'
  ).slice(0, maxItems);

  // Bebidas exclusivamente
  const drinks = bebidasActive
    ? products.filter(p =>
        p.categoria === 'bebidas' && !cartIds.has(p.id) && p.is_orderable !== false
      ).slice(0, maxItems)
    : [];

  if (filteredBestSellers.length === 0 && drinks.length === 0) return null;

  const renderCarousel = (items: MenuItem[]) => (
    <div className={`flex gap-3 overflow-x-auto pb-2 scrollbar-hide ${compact ? '-mx-6 px-6' : ''}`}>
      {items.map(product => (
        <div
          key={product.id}
          className={`flex-shrink-0 rounded-xl border border-border/50 bg-muted/30 overflow-hidden
            ${compact ? 'w-[130px]' : 'w-[150px]'}`}
        >
          <div className={`bg-white ${compact ? 'h-20' : 'h-24'}`}>
            <img
              src={product.imagen}
              alt={product.nombre}
              loading="lazy"
              width="150"
              height="96"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-2">
            <p className={`font-medium truncate ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {product.nombre}
            </p>
            <div className="flex items-center justify-between mt-1.5">
              <span className={`font-bold text-secondary ${compact ? 'text-[11px]' : 'text-xs'}`}>
                {formatPrice(product.precio_usd)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary"
                onClick={() => addToCart(product, 'suggestion')}
                aria-label={`Agregar ${product.nombre} al carrito`}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={compact ? 'py-3' : 'py-4'}>
      {/* Sección 1: Best Sellers */}
      {filteredBestSellers.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-secondary" />
            <h3 className={`font-display font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
              Complementa tu pedido
            </h3>
          </div>
          {renderCarousel(filteredBestSellers)}
        </div>
      )}

      {/* Sección 2: Bebidas */}
      {drinks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GlassWater className="h-4 w-4 text-secondary" />
            <h3 className={`font-display font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
              ¿Algo para tomar?
            </h3>
          </div>
          {renderCarousel(drinks)}
        </div>
      )}
    </div>
  );
};
