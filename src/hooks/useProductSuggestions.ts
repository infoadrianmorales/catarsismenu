// ================================================
// [2026-07-02] CATARSIS — USE PRODUCT SUGGESTIONS
// Hook contextual para la página de producto. Genera hasta
// 2 pools de sugerencias basados en el producto que el usuario
// está viendo actualmente (no en el carrito).
//
// REGLAS:
// 1. Nunca sugerir el producto actual.
// 2. Nunca sugerir coctelería ni postres (excluidos por negocio).
// 3. Solo productos ordenables (is_orderable) y de categorías activas.
// 4. Pool A (complementos): productos de categorías DISTINTAS a la del
//    producto actual, priorizando best sellers. Si no alcanza, se
//    rellena con productos de la misma categoría (excluyendo el actual).
// 5. Pool B (bebidas): si "bebidas" está activa y el producto actual
//    no es una bebida, se muestran hasta N bebidas.
// 6. Rotación diaria con seededShuffle para frescura sin caos.
// ================================================
import { useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { usePublicCategories } from '@/hooks/usePublicCategories';
import { MenuItem } from '@/types/menu';

const EXCLUDED_CATEGORIES = ['cocteleria', 'postres'];

const seededShuffle = <T,>(arr: T[], seed: number): T[] => {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

interface ProductSuggestionsResult {
  complementSuggestions: MenuItem[];
  beverageSuggestions: MenuItem[];
  isLoading: boolean;
}

export const useProductSuggestions = (
  product: MenuItem | null | undefined,
  maxItems: number = 6,
): ProductSuggestionsResult => {
  const { bestSellers, products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = usePublicCategories();

  return useMemo(() => {
    const isLoading = productsLoading || categoriesLoading;

    if (!product || products.length === 0) {
      return { complementSuggestions: [], beverageSuggestions: [], isLoading };
    }

    // [2026-07-22] RESILIENCIA MÓVIL: si la query secundaria de categorías
    // llega tarde, el catálogo real sigue siendo la fuente de verdad para
    // mostrar bebidas en sugerencias.
    const hasBeverageProducts = products.some(p => p.categoria === 'bebidas' && p.is_orderable !== false);
    const activeCategorySlugs = new Set([
      ...categories.map(c => c.slug),
      ...products.map(p => p.categoria),
    ]);
    const bebidasActive = categories.some(c => c.slug === 'bebidas') || hasBeverageProducts;
    const bestSellerIds = new Set(bestSellers.map(b => b.id));

    // Filtro base: no es el producto actual, es ordenable, categoría activa
    // y no está en las categorías excluidas.
    const baseFilter = (p: MenuItem) =>
      p.id !== product.id &&
      p.is_orderable !== false &&
      !EXCLUDED_CATEGORIES.includes(p.categoria) &&
      activeCategorySlugs.has(p.categoria);

    // Pool A — Complementos: otras categorías (best sellers primero)
    const otherCategoryPool = products
      .filter(p => baseFilter(p) && p.categoria !== 'bebidas' && p.categoria !== product.categoria)
      .sort((a, b) => {
        const aBS = bestSellerIds.has(a.id) ? 0 : 1;
        const bBS = bestSellerIds.has(b.id) ? 0 : 1;
        return aBS - bBS;
      });

    // Fallback: misma categoría (útil cuando el catálogo por categoría es amplio
    // o cuando el producto es de una categoría única).
    const sameCategoryPool = products.filter(
      p => baseFilter(p) && p.categoria === product.categoria,
    );

    // Pool B — Bebidas (solo si aplica y el producto actual no es bebida)
    const beveragePool =
      bebidasActive && product.categoria !== 'bebidas'
        ? products.filter(p => baseFilter(p) && p.categoria === 'bebidas')
        : [];

    const daySeed = (Date.now() / 86400000) | 0;

    // Combinar complementos: primero otras categorías, luego misma categoría
    // como relleno hasta alcanzar maxItems.
    const shuffledOther = seededShuffle(otherCategoryPool, daySeed);
    const shuffledSame = seededShuffle(sameCategoryPool, daySeed + 2);
    const combined = [...shuffledOther, ...shuffledSame];
    // De-dup preservando orden.
    const seen = new Set<string>();
    const complementSuggestions: MenuItem[] = [];
    for (const p of combined) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      complementSuggestions.push(p);
      if (complementSuggestions.length >= maxItems) break;
    }

    const beverageSuggestions: MenuItem[] = seededShuffle(beveragePool, daySeed + 1).slice(0, maxItems);

    return { complementSuggestions, beverageSuggestions, isLoading };
  }, [product, products, bestSellers, categories, maxItems, productsLoading, categoriesLoading]);
};
