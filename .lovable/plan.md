

## Plan: Ocultar sección "¿Algo para tomar?" si la categoría bebidas está desactivada

### Concepto
La sección de bebidas en el carrito solo debe aparecer si la categoría `bebidas` existe y está activa (`activo = true`) en la base de datos. Si un admin desactiva la categoría, la sección desaparece automáticamente. Al reactivarla, vuelve a aparecer sin necesidad de cambios en código.

### Cambio

**Archivo: `src/components/cart/UpsellSuggestions.tsx`**

- Importar `usePublicCategories` y verificar si existe una categoría con slug `bebidas` en las categorías activas
- Condicionar la obtención y renderizado de bebidas a que la categoría esté activa:

```text
const { categories } = usePublicCategories();
const bebidasActive = categories.some(c => c.slug === 'bebidas');

// Solo buscar bebidas si la categoría está activa
const drinks = bebidasActive
  ? products.filter(p => p.categoria === 'bebidas' && !cartIds.has(p.id) && p.is_orderable !== false).slice(0, maxItems)
  : [];
```

- Sin cambios en la lógica de renderizado (ya tiene `drinks.length > 0` como condición)

### Resultado
- Categoría bebidas desactivada en admin → sección "¿Algo para tomar?" no aparece
- Categoría bebidas activada → aparece automáticamente
- Un solo archivo modificado, sin cambios en DB ni otros componentes

