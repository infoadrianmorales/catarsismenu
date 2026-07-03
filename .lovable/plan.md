## Hallazgos sin cambios aplicados

### 1. `index.html` sí tiene Meta Pixel hardcodeado, pero no veo un segundo `fbq('init')`
- `index.html:169-178`: carga el bootstrap base de Meta Pixel (`https://connect.facebook.net/en_US/fbevents.js`) de forma directa, antes de React.
- `index.html:160-161`: tiene un fallback `<noscript>` hardcodeado con Pixel ID `1428549534945171`, pero solo envía `PageView` sin JavaScript.
- No encontré en `index.html` otro `fbq('init', ...)` ni un `fbq('track', 'InitiateCheckout', ...)` hardcodeado.

### 2. GTM está activo y se carga realmente en runtime
- Configuración actual en backend:
  - `gtm_custom_enabled = true`
  - `gtm_enabled = true`
  - `gtm_id = GTM-K8BSZWCM`
  - `gtm_head_snippet` y `gtm_body_snippet` contienen el snippet estándar de GTM.
- Código que lo inyecta:
  - `index.html:13-35`: replay temprano desde `localStorage.__gtm_head_cache`.
  - `index.html:143-157`: replay temprano desde `localStorage.__gtm_body_cache`.
  - `src/components/GoogleTagsProvider.tsx:90-119`: guarda e inyecta snippets personalizados de GTM.
  - `src/components/GoogleTagsProvider.tsx:122-143`: alternativa de inyección por Container ID.
- Validación runtime: el navegador cargó `https://www.googletagmanager.com/gtm.js?id=GTM-K8BSZWCM` y creó `window.google_tag_manager.GTM-K8BSZWCM`.

### 3. El JS público del contenedor GTM no muestra una etiqueta Facebook Pixel directa
Inspeccioné `https://www.googletagmanager.com/gtm.js?id=GTM-K8BSZWCM` y no encontré ocurrencias de:
- `fbq`
- `facebook`
- `fbevents`
- `connect.facebook`
- `InitiateCheckout`
- `AddToCart`
- Pixel ID `1428549534945171`

Esto no prueba al 100% que no exista una plantilla/tag que dispare por configuración interna o permisos/entornos de GTM, pero en el JS público cargado no aparece un Facebook Pixel explícito.

### 4. Otros scripts/terceros encontrados
- `src/components/MetricoolProvider.tsx:25-34`: carga `https://tracker.metricool.com/resources/be.js` con `metricool_hash` desde configuración. No encontré referencias a `fbq`, `facebook`, `fbevents` o `InitiateCheckout` en ese archivo.
- `index.html:43`: meta de verificación de dominio Facebook; no dispara eventos.
- `supabase/functions/meta-capi/index.ts`: maneja CAPI y tiene el mismo Pixel ID hardcodeado del lado servidor; no es fuente del evento fantasma client-side `cs_est: true`.

## Conclusión
No encontré un duplicado directo de `fbq('track', 'InitiateCheckout', ...)` en archivos HTML/config públicos ni otro `fbq('init')` hardcodeado. Sí encontré una integración GTM activa (`GTM-K8BSZWCM`) que carga antes/durante React, pero el contenedor público no expone un tag Facebook Pixel directo. El candidato más fuerte fuera de React sigue siendo GTM/Event Manager/Meta-side configuration, no una segunda llamada visible en el código del proyecto.

## No modifiqué archivos
Solo hice lectura e inspección runtime; no apliqué cambios.