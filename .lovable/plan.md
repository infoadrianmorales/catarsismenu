## Diagnóstico confirmado

- El backend está activo y saludable; no parece ser una caída de Cloud.
- La consulta pública de productos responde con 86 productos activos y la categoría `bebidas` tiene 30 productos activos.
- Las imágenes del catálogo cargan correctamente en navegador local para los primeros productos revisados.
- Hay 2 productos activos sin imagen (`Brownie con Helado`, `Sweet Bites`), ambos en `postres`; no explican que toda la home se vea vacía, pero sí pueden producir placeholders si aparecen.
- Las funciones y permisos básicos para crear pedidos están disponibles, pero el flujo de checkout aún puede fallar por una de estas causas:
  - la llamada RPC con parámetros nuevos no coincide bien con las sobrecargas existentes;
  - la inserción de `order_items` depende de `x-session-id` y puede fallar si el header no llega igual que el `session_id` de la orden;
  - el error actual del checkout está oculto detrás del toast genérico.

## Plan de corrección

1. **Productos e imágenes**
   - Hacer el render de tarjetas más tolerante a imágenes nulas o inválidas usando fallback visual consistente.
   - Ajustar la generación de URLs responsive para no asumir que todos los WebP tienen variantes `_200/_400`, porque algunas imágenes nuevas están en la raíz del bucket y no siguen el patrón antiguo.
   - Mantener el producto visible aunque la imagen falle.

2. **Sugerencias de bebidas en carrito y checkout**
   - Corregir `useCartSuggestions` para que no dependa de estados transitorios de categorías si ya hay productos `bebidas` activos en el catálogo cargado.
   - Usar fallback desde productos cuando la lista de categorías venga lenta/vacía.
   - Mostrar sugerencias aunque la sección de comida no tenga resultados, siempre que haya bebidas disponibles y el carrito tenga comida.

3. **Checkout y envío de WhatsApp**
   - Simplificar la creación de pedido para llamar una única firma RPC de forma estable.
   - Mover la creación de `order_items` a un RPC seguro o ajustar el flujo para garantizar que `session_id` y `x-session-id` coincidan antes de insertar items.
   - Mejorar el log y el mensaje de error para distinguir: creación de cliente, creación de orden, actualización de WhatsApp e inserción de items.
   - Mantener `window.location.href` para abrir WhatsApp, como está definido en la memoria del proyecto.

4. **Validación**
   - Probar en navegador: home con productos visibles, imágenes visibles/fallback correcto, carrito con sección `¿Algo para tomar?`, checkout con sugerencias y envío sin error.
   - Revisar consola/red para confirmar que no quedan errores de REST/RPC ni imágenes 404 relevantes.

## Archivos a tocar

- `src/components/MenuCard.tsx`
- `src/components/OptimizedImage.tsx` si se decide reutilizarlo para tarjetas/sugerencias
- `src/hooks/useCartSuggestions.ts`
- `src/components/cart/UpsellSuggestions.tsx`
- `src/components/shared/SuggestionCarousel.tsx` si aplica
- `src/pages/Checkout.tsx`
- Una migración de backend solo si hace falta crear/ajustar el RPC seguro para insertar los items del pedido.