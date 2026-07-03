## Objetivo
Dejar la integración Meta Pixel + CAPI lista para producción quitando el modo "Probar eventos".

## Cambio único
**`src/lib/metaCapi.ts`**
- Cambiar `const CAPI_TEST_EVENT_CODE: string | null = 'TEST71445';` → `const CAPI_TEST_EVENT_CODE: string | null = null;`
- Actualizar el comentario del encabezado para reflejar que el modo test está desactivado (dejando la constante como interruptor futuro por si se necesita re-testear).
- El guard `if (CAPI_TEST_EVENT_CODE) payload.test_event_code = ...` ya omite el campo cuando es `null`, así que no hay que tocar más lógica.

## Verificación de otros hardcodes
`rg` confirma que `TEST71445` solo aparece en `src/lib/metaCapi.ts`. En `supabase/functions/meta-capi/index.ts` `test_event_code` existe únicamente como campo opcional del schema Zod y se reenvía a Graph solo si el cliente lo manda — comportamiento correcto para producción, no requiere cambios.

## Resumen final de archivos modificados en toda la implementación
- `supabase/functions/meta-capi/index.ts` — Edge Function CAPI: schema Zod, hashing SHA-256 server-side de PII (em, ph, fn, ln, ct, st, country, external_id), extracción server-side de IP/UA, CORS dinámico, envío a Graph API v20.0, soporte opcional de `test_event_code`.
- `src/lib/metaCapi.ts` — Cliente ligero: lee cookies `_fbc`/`_fbp`, merge con `pendingCheckoutData` de sessionStorage, invoca la Edge Function fire-and-forget. **(Este cambio: `CAPI_TEST_EVENT_CODE = null`.)**
- `src/lib/metaPixel.ts` — Refactor del pixel: `event_id` único por evento para deduplicación con CAPI, cola pre-init, duplicación a CAPI en los 7 eventos (PageView, ViewContent, AddToCart, InitiateCheckout, Search, Lead, Purchase), fallback `sendBeacon` para Search, `fbq('set','autoConfig', false, pixelId)` antes del init para eliminar los eventos fantasma `cs_est:true`.

## Después de publicar
1. En Meta Events Manager desactivar "Probar eventos" (el código de prueba deja de recibir tráfico).
2. Verificar en "Información general" que los 7 eventos siguen llegando con `event_id` y deduplicación Browser+Server.
