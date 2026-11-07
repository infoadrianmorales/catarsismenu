# Corrección móvil: carrito, checkout y carga estable

Solo estructura y comportamiento. Sin cambios de colores, tipografías, textos, tarjetas, extras, notas, sugerencias ni tracking (IDs, data-meta-event, Pixel/CAPI, GTM).

## 1. Carrito (src/pages/Cart.tsx)
- Quitar h-[100dvh], overflow-hidden y scroll interno; scroll normal del documento.
- Barra inferior (chevron + Total + "Finalizar" con glow) fija: bottom-0 left-0 right-0 z-50, padding inferior con env(safe-area-inset-bottom). Desglose expandible igual.
- Padding inferior del contenido ≈ 96px + safe area.
- Reemplazar useIsMobile por clases: barra `lg:hidden`, resumen escritorio `hidden lg:block` (cubre el hueco 768–1023px, sin parpadeo).
- Footer visible en móvil por encima del espacio reservado.

## 2. Checkout (src/pages/Checkout.tsx)
- Barra fija `lg:hidden`: "Total · X productos" (total en amarillo) + botón "Enviar pedido por WhatsApp" con mismo handleSubmit y estado de carga.
- Botón de escritorio en el resumen con `hidden lg:flex`.
- Tracking: un único `checkout-submit-btn` con data-meta-event="Purchase" activo según breakpoint (renderizado condicionado por media query CSS-safe: se verifica que el evento Purchase se dispara una sola vez desde handleSubmit, no por el clic duplicado).
- Padding inferior en móvil para no tapar vista previa ni sugerencias.

## 3. Carga estable (src/App.tsx, src/components/ErrorBoundary.tsx)
- Helper `lazyWithRetry`: 2 reintentos con espera corta; si es error de chunk, recarga una sola vez (marca en sessionStorage, se limpia al cargar bien).
- Aplicarlo a todas las rutas lazy.
- "Recargar página" ya no borra `catarsis_cart`.

## 4. CartDrawer (src/components/cart/CartDrawer.tsx)
- Corregir la rama "Mobile fallback" inalcanzable: bajo sm mostrar botón con contador y total sin popup de hover.

## Verificación
Playwright en 375, 390, 414, 800 y 1280 px: botón a checkout y botón de envío siempre visibles, barra sin tapar contenido, mismos IDs y data-meta-event que antes.
