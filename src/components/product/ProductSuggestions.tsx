// ================================================
// [2026-07-02] CATARSIS — PRODUCT SUGGESTIONS
// Sección "También te puede gustar" que se renderiza al final
// de cada página de producto. Reutiliza SuggestionCarousel
// (mismo estilo del carrito) y useProductSuggestions para la
// lógica contextual al producto visto.
// ================================================
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useProductSuggestions } from '@/hooks/useProductSuggestions';
import { SuggestionCarousel } from '@/components/shared/SuggestionCarousel';
import { MenuItem } from '@/types/menu';
import { Sparkles, GlassWater } from 'lucide-react';

interface ProductSuggestionsProps {
  product: MenuItem;
  maxItems?: number;
}

export const ProductSuggestions = ({ product, maxItems = 8 }: ProductSuggestionsProps) => {
  const { addToCart } = useCart();
  const { currency, displayMode, getPrices } = useCurrency();
  const { complementSuggestions, beverageSuggestions } = useProductSuggestions(product, maxItems);

  // Formatea el precio según la moneda seleccionada por el usuario.
  const formatPrice = (priceUsd: number) => {
    const p = getPrices(priceUsd);
    if (displayMode === 'solo_usd') return p.formattedUSD;
    if (displayMode === 'solo_ves') return p.formattedVES;
    return currency === 'USD' ? p.formattedUSD : p.formattedVES;
  };

  // Sin nada que mostrar → no renderizar (evita huecos vacíos).
  if (complementSuggestions.length === 0 && beverageSuggestions.length === 0) return null;

  return (
    <section
      className="container px-4 pb-10"
      aria-label="Sugerencias de productos relacionados"
    >
      <div className="max-w-4xl mx-auto space-y-3">
        {complementSuggestions.length > 0 && (
          <div className="bg-[#0a1628] border border-gray-700/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-[#F2B60F]" />
              <h2 className="text-[#F7F8F9] text-xs font-bold uppercase tracking-wider">
                También te puede gustar
              </h2>
            </div>
            <SuggestionCarousel
              items={complementSuggestions}
              formatPrice={formatPrice}
              onAdd={(p) => addToCart(p, 'suggestion')}
            />
          </div>
        )}

        {beverageSuggestions.length > 0 && (
          <div className="bg-[#0a1628] border border-gray-700/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <GlassWater className="h-3.5 w-3.5 text-[#F2B60F]" />
              <h2 className="text-[#F7F8F9] text-xs font-bold uppercase tracking-wider">
                ¿Algo para tomar?
              </h2>
            </div>
            <SuggestionCarousel
              items={beverageSuggestions}
              formatPrice={formatPrice}
              onAdd={(p) => addToCart(p, 'suggestion')}
            />
          </div>
        )}
      </div>
    </section>
  );
};
