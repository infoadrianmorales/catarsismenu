# Compactar home: 4 productos por categoría + botón "Ver todo"

## Objetivo
Reducir el largo de la página principal mostrando máximo 4 productos por categoría, con un botón llamativo "Ver todo" que lleve a la página completa de esa categoría (que ya existe en `/categoria/:slug`).

## Alcance
Solo afecta la vista "Todos" del menú principal (home). No cambia:
- Vistas de categoría individual (`/categoria/:slug`) — siguen mostrando todos los productos.
- Vista Best Seller — se mantiene con sus 8.
- Vistas cuando el usuario filtra por una categoría específica desde los tabs — se muestran completos (ya que quiere ver esa categoría entera).
- Búsqueda / resultados filtrados — no se recortan.

## Cambios

### 1. `src/components/MenuGrid.tsx`
En el bloque "Show all categories with sections" (cuando `selectedCategory === 'todos'`):
- Recortar cada `categoryItems` a los primeros 4 antes de renderizar.
- Si la categoría tiene más de 4 productos, agregar debajo del grid un botón grande "Ver todo (N)" que enlace a `/categoria/${category}`.
- Si tiene 4 o menos, no mostrar el botón (se muestran todos).

### 2. Diseño del botón "Ver todo"
Llamativo pero coherente con el sistema:
- Ancho completo del grid en móvil, centrado con ancho auto en desktop.
- Fondo Raspberry (`bg-primary`), texto blanco, borde redondeado, padding generoso (`py-4 px-8`), tipografía Phudu en mayúsculas.
- Icono `ChevronRight` con animación de translate al hover.
- Texto: `VER TODAS LAS {CATEGORÍA} ({N})` — por ejemplo "VER TODAS LAS HAMBURGUESAS (12)".
- Ubicado con `mt-6` bajo el grid de esa categoría.

## Resultado esperado
La home queda mucho más corta: cada categoría muestra 4 tarjetas + un CTA grande. El usuario que quiera ver más hace clic y va a la página dedicada de la categoría, o usa los tabs superiores (que ya filtran a la vista completa de esa categoría).
