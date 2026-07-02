## Problema
La home usa `CategorySection` (no `MenuGrid`), y ese componente renderiza TODOS los productos de cada categoría. Por eso Coctelería, Bebidas, etc. siguen mostrando filas completas: la compactación previa se aplicó al componente equivocado.

## Solución
Aplicar la regla de "máx 4 + botón Ver todo grande" dentro de `src/components/CategorySection.tsx`, para que afecte a TODAS las categorías de la home.

### Cambios en `src/components/CategorySection.tsx`
1. Calcular:
   - `totalCount = items.length`
   - `visibleItems = items.slice(0, 4)`
   - `hasMore = totalCount > 4`
2. Renderizar el grid con `visibleItems` (no `items`).
3. Mantener el enlace pequeño "Ver todo" arriba a la derecha (ya existe).
4. Debajo del grid, cuando `hasMore`, añadir el CTA grande estilo Raspberry que ya usamos en `MenuGrid`:
   - Botón `Link` a `/categoria/${slug}`
   - Texto: `VER TODOS LOS {TITLE} ({totalCount})` en uppercase, font-display black
   - Fondo `bg-primary`, texto `text-primary-foreground`, padding generoso (`px-8 py-4`), esquinas `rounded-full`, sombra y hover con `-translate-y-0.5`
   - Ícono `ChevronRight` con hover-translate
5. Categorías con 4 o menos productos: se muestran completas sin botón grande (el link pequeño superior queda igual, ya que también sirve como acceso directo — o se puede ocultar cuando `!hasMore` para no repetir; propongo ocultarlo también cuando no hay más).

### Comportamiento resultante
- Bebidas (8+): muestra 4 + botón grande "VER TODAS LAS BEBIDAS (N)".
- Coctelería (8+): 4 + botón grande.
- Postres (≤4 si aplica): se muestran todos, sin botón.
- Vista `/categoria/:slug`: sigue mostrando todo el listado sin restricción (no se toca).

No se modifica lógica de negocio, datos, ni `MenuGrid` (queda como fallback para otras vistas).