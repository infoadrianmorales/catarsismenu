// ================================================
// [2026-04-08] USE CART SUGGESTIONS - CATARSIS DRINKS & FOOD
// Hook inteligente que genera sugerencias contextuales
// basadas en el contenido actual del carrito.
//
// REGLAS DE SUGERENCIA:
// 1. Nunca sugerir productos que ya están en el carrito
// 2. NUNCA sugerir coctelería ni postres (excluidos por negocio)
// 3. Priorizar complementos de categorías que NO estén en el carrito
// 4. Si el carrito tiene solo comida y la categoría bebidas
//    está activa con productos → sugerir bebidas
// 5. Si bebidas no está activa o no tiene productos → ignorar
//    sin errores, solo sugerir comida
// 6. Rotar el orden para frescura visual
//
// CATEGORÍAS EXCLUIDAS (no modificar sin autorización):
// FUENTES DE DATOS:
// - bestSellers de useProducts() → vista best_sellers_food
// - products de useProducts() → catálogo completo
// - items del carrito desde CartContext
// - usePublicCategories() → verificar si bebidas está activa
// ================================================

import { useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { usePublicCategories } from '@/hooks/usePublicCategories';
import { MenuItem } from '@/types/menu';

const EXCLUDED_CATEGORIES = ['cocteleria', 'postres'];

// [2026-04-08] Shuffle determinístico con seed diario.
// Usa un generador lineal congruente (LCG) para que el orden
// sea consistente durante la misma visita pero varíe entre días.
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

interface CartSuggestionsResult {
  foodSuggestions: MenuItem[];
  beverageSuggestions: MenuItem[];
  isLoading: boolean;
}

export const useCartSuggestions = (maxItems: number = 6): CartSuggestionsResult => {
  const { items } = useCart();
  const { bestSellers, products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = usePublicCategories();

  return useMemo(() => {
    const isLoading = productsLoading || categoriesLoading;

    // [2026-04-08] Carrito vacío → no mostrar sugerencias
    if (items.length === 0 || products.length === 0) {
      return { foodSuggestions: [], beverageSuggestions: [], isLoading };
    }

    const cartIds = new Set(items.map(i => i.id));
    const categoriesInCart = new Set(items.map(i => i.categoria));
    const hasFoodItems = items.some(i => i.categoria !== 'bebidas');
    const hasBeverages = items.some(i => i.categoria === 'bebidas');

    // [2026-04-08] Verificar si "bebidas" está activa en la DB
    // Se lee dinámicamente — cuando se active, las sugerencias aparecen solas
    const bebidasActive = categories.some(c => c.slug === 'bebidas');

    // Set de categorías activas en DB (para filtrar productos de categorías desactivadas)
    const activeCategorySlugs = new Set(categories.map(c => c.slug));

    const bestSellerIds = new Set(bestSellers.map(b => b.id));

    // [2026-04-08] Filtro base: excluir carrito, no ordenables, categorías excluidas y desactivadas
    const baseFilter = (p: MenuItem) =>
      !cartIds.has(p.id) &&
      p.is_orderable !== false &&
      !EXCLUDED_CATEGORIES.includes(p.categoria) &&
      activeCategorySlugs.has(p.categoria);

    // Pool A — COMPLEMENTOS CONTEXTUALES
    // Productos de categorías de comida que NO están en el carrito
    const poolA = products
      .filter(p => baseFilter(p) && p.categoria !== 'bebidas' && !categoriesInCart.has(p.categoria))
      .sort((a, b) => {
        const aBS = bestSellerIds.has(a.id) ? 0 : 1;
        const bBS = bestSellerIds.has(b.id) ? 0 : 1;
        return aBS - bBS;
      });

    // [2026-04-08] Si no hay complementos de categorías nuevas, usar best sellers de comida
    // que no estén en el carrito (sin restricción de categoría)
    const poolAFallback = poolA.length > 0
      ? poolA
      : products.filter(p => baseFilter(p) && p.categoria !== 'bebidas');

    // Pool B — BEBIDAS (solo si la categoría está activa en la DB)
    const poolB = bebidasActive
      ? products.filter(p => baseFilter(p) && p.categoria === 'bebidas')
      : [];

    // [2026-04-08] Seed diario para rotación consistente por día
    const daySeed = (Date.now() / 86400000) | 0;
    const shuffledA = seededShuffle(poolAFallback, daySeed);
    const shuffledB = seededShuffle(poolB, daySeed + 1);

    // [2026-04-08] REGLAS DE MEZCLA CONTEXTUAL
    let foodSuggestions: MenuItem[] = [];
    let beverageSuggestions: MenuItem[] = [];

    if (hasFoodItems && bebidasActive && !hasBeverages) {
      // Comida + bebidas activa + sin bebidas en carrito → 60% bebidas + 40% comida
      const beverageCount = Math.ceil(maxItems * 0.6);
      const foodCount = maxItems - beverageCount;
      beverageSuggestions = shuffledB.slice(0, beverageCount);
      foodSuggestions = shuffledA.slice(0, foodCount);
    } else if (hasFoodItems) {
      // Comida + (bebidas inactiva O ya tiene bebidas) → 100% complementos
      foodSuggestions = shuffledA.slice(0, maxItems);
    } else {
      // Solo bebidas en carrito → sugerir comida
      foodSuggestions = shuffledA.slice(0, maxItems);
    }

    return { foodSuggestions, beverageSuggestions, isLoading };
  }, [items, products, bestSellers, categories, maxItems, productsLoading, categoriesLoading]);
};
