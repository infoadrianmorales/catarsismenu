# Hardcodear GTM-K8BSZWCM en index.html + reflejarlo en panel

## 1. `index.html`
- Insertar el snippet `<!-- Google Tag Manager -->` lo más arriba posible del `<head>`, justo después de `<meta name="viewport">` (línea 6, antes del bloque de favicons) para máxima prioridad de carga.
- Insertar el snippet `<!-- Google Tag Manager (noscript) -->` como **primer elemento dentro de `<body>`** (antes del actual noscript del Meta Pixel).
- ID fijo: `GTM-K8BSZWCM`.
- Añadir comentario explicando que el ID también vive en `config` y que `GoogleTagsProvider` lo detecta para evitar doble carga.

## 2. Evitar doble carga en `GoogleTagsProvider.tsx`
El provider ya inyecta GTM dinámicamente cuando `gtm_enabled=true`. Con el script ya presente en `index.html` habría **dos cargas del mismo contenedor**.

- Antes de inyectar GTM, comprobar si `window.google_tag_manager?.['GTM-K8BSZWCM']` ya existe, o si `document.querySelector('script[src*="googletagmanager.com/gtm.js?id=GTM-K8BSZWCM"]')` ya está en el DOM. Si está, marcar como cargado y solo asegurar `dataLayer`.
- Lógica genérica: si **el `gtm_id` configurado coincide** con un GTM ya cargado en página, omitir el snippet y simplemente usar el `dataLayer` existente para `pageview`.
- Mantener GA4-vía-GTM (GA4 directo sigue desactivado si GTM está activo).

## 3. Reflejar el valor en el panel de admin
Sembrar en la tabla `config`:
- `gtm_id = 'GTM-K8BSZWCM'`
- `gtm_enabled = 'true'`

Esto hará que el `GoogleTab` abra ya con el ID precargado y el switch en "Activo". El usuario podrá modificarlo desde la UI normalmente — pero el script en `index.html` queda fijo (es lo que pidió: "lo más arriba posible"). Documentar esto en el `CardDescription` del bloque GTM: *"El snippet ya está hardcodeado en index.html para máxima prioridad. Cambiar el ID aquí solo afecta la inyección dinámica del provider."*

## 4. Memoria
Actualizar `mem://features/admin/marketing-panel`:
- GTM container `GTM-K8BSZWCM` está hardcodeado en `index.html` (head + body noscript).
- `GoogleTagsProvider` detecta GTM ya cargado para evitar duplicar.

## Archivos a tocar
- `index.html` (insertar 2 snippets).
- `src/components/GoogleTagsProvider.tsx` (detección de GTM duplicado).
- `src/components/admin/marketing/GoogleTab.tsx` (nota en description del card GTM).
- Migración `INSERT ... ON CONFLICT DO UPDATE` para sembrar `gtm_id` y `gtm_enabled`.
- `mem://features/admin/marketing-panel` (actualizar nota).
