# CAPI: keepalive + retry + panel de fallos

## 1. `src/lib/metaCapi.ts` — transporte keepalive con retry único
- Reemplazar `supabase.functions.invoke('meta-capi', ...)` por `fetch` directo:
  - URL: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-capi`
  - Headers: `Content-Type: application/json`, `apikey: <VITE_SUPABASE_PUBLISHABLE_KEY>`, `Authorization: Bearer <VITE_SUPABASE_PUBLISHABLE_KEY>`
  - `keepalive: true` para sobrevivir a navegación.
- Función interna `postCapi(payload)`:
  - Intento 1 → si network error o `!res.ok` → esperar 800ms → intento 2.
  - Si el intento 2 también falla, registrar en el log de fallos (paso 2).
- Sigue siendo fire-and-forget, sin bloquear UI, sin loguear PII/payload.
- Comentario `// [2026-07-05] CATARSIS — fetch keepalive + 1 retry a los 800ms; registra fallos en __capi_fail_log.`

## 2. `src/lib/metaPixelManifest.ts` — nueva key + tipo compartido
- Exportar `CAPI_FAIL_LOG_KEY = '__capi_fail_log'` y `type CapiFailLog = Record<string, { lastFiredAt: number; count: number }>` (mismo shape que `PixelEventLog` para reutilizar helpers en el card).
- Comentario `// [2026-07-05] CATARSIS — log de fallos CAPI: solo event_name + timestamp + count. Nunca payload ni PII.`

## 3. `src/lib/metaCapi.ts` — helper `recordCapiFail(event_name)`
- Lee `__capi_fail_log` (try/catch), incrementa `count` y actualiza `lastFiredAt = Date.now()` para `event_name`, reescribe. Solo string + números — jamás payload ni PII.

## 4. `src/components/admin/marketing/MetaPixelValidatorCard.tsx` — sección "Estado de CAPI"
- Reutilizar el patrón existente `tick`/`setInterval(5000)`:
  - Añadir `capiLog` state, `readCapiLog()` helper y refrescarlo en el mismo `useEffect` que ya hace tick (evita un segundo interval).
- Nueva subsección al final de `CardContent` (antes del cierre) con:
  - Título "Estado de CAPI (sesión actual)".
  - Total de fallos: suma de `count` de todos los eventos en el log.
  - Lista compacta por evento fallido: nombre + count + `formatRelative(lastFiredAt)` (helper ya existente).
  - Estado "sin fallos" (verde) cuando el log está vacío.
  - Botón "Limpiar log de CAPI" que hace `localStorage.removeItem(CAPI_FAIL_LOG_KEY)` y resetea state — análogo a `handleClearLog` del Pixel.
- Comentario `// [2026-07-05] CATARSIS — visibilidad de fallos CAPI en sesión actual, sin abrir consola.`

## Fuera de alcance
- No se toca la Edge Function `meta-capi` (contrato idéntico).
- No se cambia deduplicación ni event_id.
- No se persiste el log fuera de localStorage (es telemetría de sesión).
- No se loguean payload ni PII en el log de fallos — solo `event_name`.
