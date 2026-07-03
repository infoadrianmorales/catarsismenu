# Añadir InitiateCheckout al set CAPI (7mo evento)

## Cambios

**1. `supabase/functions/meta-capi/index.ts`**
- Añadir `'InitiateCheckout'` al array `ALLOWED_EVENTS` para que Zod acepte el nuevo `event_name`. Sin más cambios: hashing de PII, IP/UA server-side, fbc/fbp y forwarding a Graph API ya son event-agnostic.

**2. `src/lib/metaPixel.ts` — `trackInitiateCheckout`**
- Actualmente solo browser. Refactor idéntico al patrón `AddToCart`/`ViewContent`:
  - Generar un único `eventID`.
  - Construir `params = { content_ids, content_type: 'product', num_items, value, currency }`.
  - `safeFbq('track', 'InitiateCheckout', params, { eventID })`.
  - `sendCapiEvent({ event_name: 'InitiateCheckout', event_id: eventID, custom_data: params })`.
- `sendCapiEvent` ya inyecta `fbc`/`fbp` de cookies y `email/phone/fn/ln` de `sessionStorage.pendingCheckoutData` — nada nuevo en el cliente.
- No se toca el tipo `CapiEventName` en `metaCapi.ts` porque `event_name` fluye como string genérico dentro del payload; el whitelist real vive en el schema Zod de la Edge Function. (Si tsgo se queja, se añade `'InitiateCheckout'` al union type — cambio mecánico.)

**3. Redeploy `meta-capi`** y verificar con `curl_edge_functions` que `events_received: 1` para un payload `InitiateCheckout` de prueba con `TEST71445`.

## No se toca

- Los otros 6 eventos (PageView, ViewContent, AddToCart, Lead, Search, Purchase).
- Call sites de `trackInitiateCheckout` (ya invocado desde `src/pages/Checkout.tsx:157` — mismo trigger, ahora duplica a CAPI automáticamente).
- `Contact`, `AddPaymentInfo`, `ViewCart` siguen solo browser.
- `CAPI_TEST_EVENT_CODE = 'TEST71445'` sigue activo hasta que confirmes publicar.

## Archivos modificados

- `supabase/functions/meta-capi/index.ts` (1 línea en `ALLOWED_EVENTS`)
- `src/lib/metaPixel.ts` (función `trackInitiateCheckout`)
- `src/lib/metaCapi.ts` (añadir `'InitiateCheckout'` al type `CapiEventName` si TS lo requiere)
