## Cambio

**Archivo:** `supabase/functions/meta-capi/index.ts`

Reemplazar el `corsHeaders` estático actual por el patrón dinámico de `track-visit`:

```ts
const BASE_ALLOWED_HEADERS =
  'authorization, x-client-info, apikey, content-type, x-session-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version';

function buildCorsHeaders(req?: Request): Record<string, string> {
  const requested = req?.headers.get('access-control-request-headers');
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': requested ?? BASE_ALLOWED_HEADERS,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Access-Control-Request-Headers',
  };
}
```

En el handler `Deno.serve`, calcular `const corsHeaders = buildCorsHeaders(req);` al inicio y usarlo en todas las respuestas: preflight OPTIONS, 200, 400 (JSON inválido y validación Zod), 405, 500 (token faltante), 502 (upstream).

## Fuera de alcance
- Lógica CAPI, schema Zod, hashing PII, envío a Graph API: sin cambios.
- `metaPixel.ts` y `metaCapi.ts`: sin cambios.
- `track-visit`: sin cambios (ya tiene el patrón).
