## Problema

En desktop (`/cart`), la grilla `lg:grid-cols-3` coloca:
- Items (col-span-2) | UpsellSuggestions (col-span-1, default) | Resumen (col-span-1)

Como suman 4 columnas en un grid de 3, las sugerencias caen a la derecha de los items, no debajo.

## Cambio (1 línea en `src/pages/Cart.tsx`)

En el wrapper de `UpsellSuggestions` (línea ~274), añadir `lg:col-span-2` para que ocupe el mismo ancho de la columna izquierda y se ubique **debajo** de los productos, dejando el resumen sticky a la derecha intacto.

```diff
- <div className="mt-6">
+ <div className="lg:col-span-2 mt-6">
    <UpsellSuggestions maxItems={10} />
  </div>
```

## Resultado

```text
Desktop (lg+):
┌──────────────────────┬──────────┐
│ Productos            │ Resumen  │
│                      │ (sticky) │
├──────────────────────┤          │
│ Sugerencias (full L) │          │
└──────────────────────┴──────────┘
```

Mobile sin cambios (la rama `isMobile` ya las renderiza fuera del grid).
