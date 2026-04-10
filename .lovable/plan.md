

## Plan: Flechas visibles en mobile + cards oscuras en carrusel de sugerencias

### Problema 1: Flechas ocultas en mobile
Las flechas tienen dos bloqueos: (1) la condición `!isMobile` en líneas 144 y 153 impide que se rendericen en mobile, y (2) la clase `hidden md:flex` las oculta por CSS en pantallas pequeñas. Hay que quitar ambos filtros.

### Problema 2: Cards con fondo blanco
Las cards usan `bg-muted/30` y la imagen tiene `bg-white` (línea 108). No es coherente con la paleta oscura de Catarsis (#010C23 Rich Black).

### Cambios en `src/components/cart/UpsellSuggestions.tsx`

**Flechas — líneas 143-161:**
- Quitar `!isMobile &&` de las condiciones de renderizado (líneas 144 y 153)
- Cambiar clase de `hidden md:flex` a `flex` para que sean visibles en todas las pantallas
- Cambiar fondo de `bg-black/50` a `bg-[#010C23]/85 border border-gray-700/50` para coherencia de marca
- Posición: `left-1` / `right-1` para no pegarse al borde en mobile

**Cards — líneas 103 y 108:**
- Cambiar `bg-muted/30 border-border/50` a `bg-[#0a1628] border-gray-700/50`
- Quitar `bg-white` del contenedor de imagen
- Texto nombre: agregar `text-[#F7F8F9]`
- Precio: cambiar `text-secondary` a `text-[#F2B60F]`
- Botón (+): cambiar a `border border-[#F2B60F] text-[#F2B60F] hover:bg-[#F2B60F]/20`

### Archivos

| Acción | Archivo |
|--------|---------|
| Modificar | `src/components/cart/UpsellSuggestions.tsx` |

### Verificación
Flechas visibles en mobile (390px), se ocultan según posición de scroll, cards con fondo oscuro y colores de marca, desktop sin regresiones.

