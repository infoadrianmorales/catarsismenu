// FEATURE [UPSELL]: Componente de sugerencias de compra para aumentar el ticket promedio.
// Muestra best sellers y bebidas que no estén ya en el carrito.
// Se usa tanto en Cart.tsx (versión completa) como en CartDrawer.tsx (compacta).

import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { useCurrency } from '@/hooks/useCurrency';
import { Plus, TrendingUp } from 'lucide-react';
import { MenuItem } from '@/types/menu';

interface UpsellSuggestionsProps {
  /** Número máximo de sugerencias a mostrar */
  maxItems?: number;
  /** Modo compacto para el drawer lateral */
  compact?: boolean;
}

export const UpsellSuggestions = ({ maxItems = 6, compact = false }: UpsellSuggestionsProps) => {
  const { items, addToCart } = useCart();
  const { bestSellers, products } = useProducts();
  const { currency, displayMode, getPrices } = useCurrency();

  const cartIds = new Set(items.map(i => i.id));

  // FEATURE [UPSELL]: Filtrar sugerencias que no estén en el carrito
  // Prioridad: best sellers primero, luego bebidas
  const drinks = products.filter(p =>
    p.categoria === 'bebidas' && !cartIds.has(p.id) && p.is_orderable !== false
  );

  const filteredBestSellers = bestSellers.filter(p =>
    !cartIds.has(p.id) && p.is_orderable !== false
  );

  const suggestions: MenuItem[] = [
    ...filteredBestSellers,
    ...drinks.filter(d => !filteredBestSellers.some(bs => bs.id === d.id)),
  ].slice(0, maxItems);

  if (suggestions.length === 0) return null;

  const formatPrice = (priceUsd: number) => {
    const p = getPrices(priceUsd);
    if (displayMode === 'solo_usd') return p.formattedUSD;
    if (displayMode === 'solo_ves') return p.formattedVES;
    return currency === 'USD' ? p.formattedUSD : p.formattedVES;
  };

  const handleAdd = (product: MenuItem) => {
    addToCart(product);
  };

  return (
    <div className={compact ? 'py-3' : 'py-4'}>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-secondary" />
        <h3 className={`font-display font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
          Complementa tu pedido
        </h3>
      </div>

      <div className={`flex gap-3 overflow-x-auto pb-2 scrollbar-hide ${compact ? '-mx-6 px-6' : ''}`}>
        {suggestions.map(product => (
          <div
            key={product.id}
            className={`flex-shrink-0 rounded-xl border border-border/50 bg-muted/30 overflow-hidden
              ${compact ? 'w-[130px]' : 'w-[150px]'}`}
          >
            {/* Imagen del producto */}
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
            {/* Info + botón */}
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
                  onClick={() => handleAdd(product)}
                  aria-label={`Agregar ${product.nombre} al carrito`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
