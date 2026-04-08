

## Plan: Fallback de best sellers con documentación

### Cambio

**Archivo: `src/hooks/useProducts.ts`** — modificar el `useMemo` de `bestSellers` (líneas 88-91):

```typescript
// [2026-04-08] Fallback de best sellers: si la vista best_sellers_food está vacía
// (sin ventas en los últimos 15 días), se usan productos destacados como respaldo.
// Si tampoco hay destacados, se toman los primeros 8 productos activos del catálogo.
// Esto garantiza que las secciones "Best Seller" y "Complementa tu pedido" nunca queden vacías.
const bestSellers = useMemo(() => {
  if (bestSellersData && bestSellersData.length > 0) {
    return bestSellersData.map(transformProduct);
  }
  if (productsData) {
    const featured = productsData.filter(p => p.destacado).map(transformProduct);
    if (featured.length > 0) return featured.slice(0, 8);
    return productsData.slice(0, 8).map(transformProduct);
  }
  return [];
}, [bestSellersData, productsData]);
```

### Resultado
- Con ventas recientes → best sellers reales
- Sin ventas + con destacados → productos destacados (máx 8)
- Sin ventas ni destacados → primeros 8 productos del catálogo
- Un solo archivo modificado, sin cambios en DB

