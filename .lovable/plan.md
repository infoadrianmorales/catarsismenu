

## Plan: Fix mobile sugerencias — carrusel contenido y compacto

### Problema
En mobile las cards de sugerencias expanden verticalmente la página en lugar de estar contenidas en un carrusel horizontal compacto. La página se hace interminable.

### Diagnóstico
El código actual en `UpsellSuggestions.tsx` ya tiene `snap-x snap-mandatory` y `overflow-x-auto`, pero las cards tienen imágenes con `h-[76px]` en mobile que son grandes, y el contenedor no tiene restricción de altura explícita. Además el `SuggestionCarousel` no fuerza `overflow-hidden` en Y. El `Footer` siempre se renderiza en Cart.tsx incluso en mobile.

### Cambios

**1. `src/components/cart/UpsellSuggestions.tsx`**

- **Cards mobile más compactas**: Reducir imagen mobile de `h-[76px]` a `h-[100px]` cuadrada (110×110 → imagen cuadrada `aspect-square` con `w-[140px]`). Reducir padding interno.
- **Contenedor**: Agregar `overflow-hidden` al wrapper del carrusel en mobile para que nada se desborde verticalmente.
- **Forzar fila única**: El `flex` ya debería hacer esto, pero asegurar `flex-nowrap` explícito.
- **Título mobile**: Reducir a `text-xs font-medium` con menos margin, quitar ícono en mobile.
- **Degradados**: Mantener en mobile como indicadores.

Cambios específicos en la card mobile:
```
w-[140px], imagen h-[100px] object-cover
nombre: text-[11px] truncate 1 línea
precio + botón: misma línea, text-[11px]
padding: p-1.5
```

Altura total por card: ~100px img + ~36px info = ~136px. Sección total: ~160px (título + carrusel).

**2. `src/pages/Cart.tsx`**

- **Ocultar Footer en mobile**: Envolver `<Footer />` con `{!isMobile && <Footer />}` para que no aparezca en el carrito mobile.
- **Ajustar padding-bottom**: Mantener `pb-36` para la barra fija.

### Archivos

| Acción | Archivo |
|--------|---------|
| Modificar | `src/components/cart/UpsellSuggestions.tsx` |
| Modificar | `src/pages/Cart.tsx` (1 línea: ocultar Footer) |

### Verificación
Cards en fila horizontal sin wrap, ~140px ancho, swipe con snap, sección ≤200px alto total, footer oculto en mobile, desktop sin cambios.

