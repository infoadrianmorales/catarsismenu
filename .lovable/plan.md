## Problema

El cliente Supabase global inyecta el header `x-session-id` en TODAS las requests (ver `src/lib/supabaseHeaders.ts`), incluyendo `supabase.functions.invoke('meta-capi', ...)`. El `corsHeaders` importado desde `npm:@supabase/supabase-js@2/cors` solo permite `authorization, x-client-info, apikey, content-type` — no incluye `x-session-id`, por lo que el preflight OPTIONS falla y bloquea AddToCart, InitiateCheckout, Lead, Search y Purchase (PageView/ViewContent probablemente pasan porque disparan antes de que se setee el header de sesión).

## Cambio

**Archivo:** `supabase/functions/meta-capi/index.ts`

Reemplazar el import de `corsHeaders` por una constante local que incluya explícitamente `x-session-id` (y deje espacio para futuros headers custom del proyecto):

```ts
// (quitar) import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-session-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

Todo lo demás queda igual — el handler ya usa `corsHeaders` en el preflight y en todas las respuestas (200/400/405/500/502).

## Verificación de otros headers custom

Búsqueda en el proyecto: el único header custom que el cliente inyecta globalmente es `x-session-id` (definido en `src/lib/supabaseHeaders.ts`, usado por RLS de `pending_checkouts`, `orders`, `order_items`). No hay otros headers custom en el frontend que viajen a edge functions.

## Otras Edge Functions a revisar (mismo riesgo)

Las demás funciones invocadas desde el cliente vía `supabase.functions.invoke()` heredarán el mismo problema si usan el `corsHeaders` del SDK:

- `supabase/functions/track-visit/index.ts`
- `supabase/functions/meta-catalog-feed/index.ts` (probablemente solo GET público, bajo riesgo)
- `supabase/functions/sync-bcv-rate/index.ts` (cron, sin browser)
- `supabase/functions/create-admin-user/index.ts` (admin)

**Propuesta:** aplicar el mismo `corsHeaders` local con `x-session-id` en `track-visit` (que sí se invoca desde el navegador con sesión activa). Las otras las dejo intactas salvo que confirmes.

## Fuera de alcance

- No se toca el schema de validación, el hashing PII, ni la lógica de eventos.
- No se toca `metaPixel.ts` ni `metaCapi.ts`.
- No se remueve el `CAPI_TEST_EVENT_CODE = 'TEST71445'` (sigue vigente hasta que confirmes los 7 eventos).

¿Aplico también el fix a `track-visit`, o solo a `meta-capi`?
