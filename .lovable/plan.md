
## Problema

En la vista de PC (grid de 4 columnas en `Productos Destacados` y el menú), las tarjetas se ven disparejas: el precio y el botón **AGREGAR AL CARRITO** del producto "Chicken Mayo" quedan más arriba que los demás.

**Causa raíz:** dos fuentes de variación de altura dentro del bloque de contenido:

1. **Título (`h3`)** — algunos nombres ocupan 1 línea ("Hot Honey", "Chicken Mayo") y otros pueden ocupar 2.
2. **Descripción + "Ver más"** — el botón "Ver más" en `ExpandableText` solo aparece cuando el texto se trunca. "Chicken Mayo" tiene descripción corta que cabe en 2 líneas → no se muestra "Ver más" → la tarjeta es ~20px más baja.

Aunque las tarjetas tienen `h-full` y el bloque de precio usa `mt-auto`, el `Card` raíz no está estirando porque el grid padre no fuerza `items-stretch` explícito sobre cards con contenido dinámico (la imagen `aspect-square` fija + contenido variable produce alturas distintas por tarjeta y el `h-full` solo igualaría si el grid row se estirara, lo cual sí ocurre pero el `mt-auto` no compensa porque el inner `flex-1` del CardContent termina exactamente donde acaba el contenido cuando no hay más altura disponible en esa fila específica).

## Solución

Reservar alturas mínimas consistentes en los dos elementos variables, para que el bloque precio+CTA quede siempre a la misma altura visual:

### Cambio 1: `src/components/MenuCard.tsx` (línea 81)

Reservar 2 líneas para el título siempre:

```diff
- <h3 className="font-display text-lg font-bold leading-tight group-hover:text-primary transition-colors">
+ <h3 className="font-display text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
    {item.nombre}
  </h3>
```

### Cambio 2: `src/components/ExpandableText.tsx`

Reservar siempre el espacio del botón "Ver más" (placeholder invisible cuando no se trunca), para que la altura del bloque descripción sea idéntica entre tarjetas:

```diff
- {isTruncated && (
-   <button ...>
-     {isExpanded ? 'Ver menos' : 'Ver más'}
-   </button>
- )}
+ {isTruncated ? (
+   <button ...>
+     {isExpanded ? 'Ver menos' : 'Ver más'}
+   </button>
+ ) : (
+   <span className="block text-xs font-medium opacity-0 select-none" aria-hidden="true">
+     Ver más
+   </span>
+ )}
```

## Resultado esperado

- Todos los títulos ocupan el mismo alto (2 líneas) → títulos cortos como "Hot Honey" reservan la 2ª línea vacía.
- Todas las descripciones reservan el mismo alto (2 líneas + slot "Ver más") → tarjetas sin "Ver más" mantienen el espacio.
- Bloque precio + botón **AGREGAR AL CARRITO** alineado horizontalmente en las 4 tarjetas.

## Alcance

Solo presentación (CSS/Tailwind). Sin cambios de lógica, datos ni API. Aplica al menú principal y a Productos Destacados (ambos usan `MenuCard`).
