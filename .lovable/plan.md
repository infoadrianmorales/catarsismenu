## Problema

Hoy el panel de Extras muestra todos los extras en una lista plana vertical, uno debajo de otro. Cuando hay 30+ extras (hamburguesas, pizzas, emparedados, etc.) se ve "regado" y cuesta encontrar lo que se busca.

## Propuesta: agrupar por categoría con secciones colapsables

Reorganizar la vista en **acordeones por categoría** (Hamburguesas, Pizzas, Emparedados…), con un **grid de tarjetas compactas** dentro de cada sección. Es el patrón más claro porque coincide con cómo el cliente ve los extras en el carrito (filtrados por categoría del producto).

### Estructura visual

```text
┌─ Toolbar ──────────────────────────────────────────────────┐
│ [Buscar nombre…]   [Filtro categoría ▾]   [+ Nuevo Extra]  │
└────────────────────────────────────────────────────────────┘

▼ Hamburguesas              8 extras · 7 activos
  ┌──────────────┬──────────────┬──────────────┐
  │ Tocineta     │ Carne 150gr  │ Pollo        │
  │ +$1.50  ●    │ +$3.00  ●    │ +$2.50  ●    │
  │ Toda categ.  │ 9 productos  │ Toda categ.  │
  │ ✎  🗑         │ ✎  🗑         │ ✎  🗑         │
  └──────────────┴──────────────┴──────────────┘

▶ Pizzas                   14 extras · 14 activos
▶ Emparedados               6 extras · 6 activos
▶ Entradas                  0 extras
```

### Cambios concretos

1. **Agrupación por categoría**: reemplazar la lista plana por `Accordion` (shadcn) con una sección por categoría que tenga extras. Categorías sin extras quedan colapsadas al final en gris.
2. **Header de cada sección**: nombre de categoría + badge con conteo (`8 extras · 7 activos`) + total acumulado opcional.
3. **Grid de tarjetas compactas** dentro de cada sección: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. Cada tarjeta muestra: nombre, precio en grande, alcance ("Toda la categoría" o "N productos"), switch activo, editar, borrar.
4. **Hamburguesas → caso especial**: cuando un extra tenga el mismo nombre y precio pero esté ligado a varios `product_id` (ej. "Carne 150gr" en 9 hamburguesas), seguir agrupando en **una sola tarjeta** que diga "9 productos" y al hacer click expanda la lista de productos asignados (popover o expand interno). Hoy ya se agrupa por `nombre+categoria+precio`, se mantiene esa lógica.
5. **Buscador por nombre**: input de texto arriba que filtra dentro de las secciones abiertas.
6. **Filtro de categoría**: se mantiene; si se elige una, solo abre esa sección y oculta el resto.
7. **Orden por defecto**: dentro de cada sección, ordenar por `orden ASC, nombre ASC` (ya viene así del query).
8. **Apertura inicial**: la primera categoría con extras abierta; las demás cerradas para evitar scroll infinito.

### Archivos a modificar

- `src/components/admin/ExtrasPanel.tsx` — refactor de la sección de listado (de `div.grid gap-3` plano a `Accordion` + grid interno). El diálogo de crear/editar y las mutaciones no cambian.
- Reutiliza `Accordion` de `src/components/ui/accordion.tsx` (ya existe).

### Lo que NO cambia

- Esquema de base de datos.
- Lógica de creación/edición/eliminación.
- Hook `useProductExtras` que usa el carrito.
- Lógica de agrupación por `nombre+categoria+precio`.
