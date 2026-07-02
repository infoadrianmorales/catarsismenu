## Objetivo
Reducir el espacio vertical entre el botón "Agregar al carrito" y la sección "También te puede gustar" en la página de producto (visible en móvil y desktop).

## Cambios
- **`src/pages/ProductPage.tsx`**: reducir el margen superior del bloque `<ProductSuggestions />` (y/o el margen inferior del contenedor del botón de agregar) para acercar visualmente ambas secciones.
- **`src/components/product/ProductSuggestions.tsx`**: ajustar el `padding-top` / `margin-top` del wrapper si aporta espacio adicional.

## Detalle técnico
Pasar el spacing actual (probablemente `mt-8`/`mt-12` o `py-8`) a un valor más compacto (`mt-3` o `mt-4`) manteniendo respiración pero eliminando el hueco excesivo que se ve en la captura. Sin cambios de lógica ni de contenido.