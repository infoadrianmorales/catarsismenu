# Integración librería oficial de Meta para CAPI

Reemplazar la lectura manual de cookies `_fbc`/`_fbp` en `src/lib/metaCapi.ts` por el wrapper oficial `meta-capi-param-builder-clientjs`, y agregar un `external_id` persistente hasheado client-side en todos los eventos CAPI.

Todos los archivos tocados llevarán un comentario `// [2026-07-05] CATARSIS — [descripción]`.

## Cambios

### 1. Dependencia
- Instalar `meta-capi-param-builder-clientjs` con bun (equivalente a `npm install`, respetando la convención del proyecto de usar bun).

### 2. Nuevo archivo `src/lib/metaClickIds.ts`
Wrapper con:
- `initClickIdParams()` — idempotente, llama `processAndCollectAllParams()` una sola vez y cachea la promesa.
- `getFbc()` / `getFbp()` — devuelven las cookies gestionadas por la librería (respeta cookies existentes, no las sobreescribe).
- `getOrCreateExternalId()` — genera un UUID persistente en `localStorage` bajo la clave `__catarsis_ext_id` y devuelve el valor **ya normalizado y hasheado** vía `getNormalizedAndHashedPII(id, 'external_id')`.
- **No** se usa `getIpFn`: la Edge Function `meta-capi` ya extrae `client_ip_address` de los headers server-side (más confiable).

### 3. `src/App.tsx`
- Llamar `initClickIdParams()` una sola vez al montar la app, antes del primer PageView. Se hará dentro de un `useEffect` en `AppContent` (que ya envuelve `MetaPixelProvider`) para disparar la captura de parámetros lo antes posible, respetando la recomendación de Meta.
- Fire-and-forget (no bloquear render); el wrapper es idempotente y el PageView del pixel puede ejecutarse en paralelo — cuando el evento CAPI se dispare inmediatamente después, `getFbc/getFbp` ya devolverán los valores capturados.

### 4. `src/lib/metaCapi.ts`
- Eliminar `readCookie` y `getFbCookies` (lectura manual).
- Importar `getFbc`, `getFbp`, `getOrCreateExternalId` desde `metaClickIds.ts`.
- En `sendCapiEvent`, construir `merged` con:
  - `fbc: getFbc()`, `fbp: getFbp()`
  - `external_id: getOrCreateExternalId()` (ya hasheado — el server detecta el formato SHA-256 hex y no lo re-hashea, gracias a `isSha256Hex` + `hashIfNeeded`; pero `external_id` en el server usa `sha256Hex(user_data.external_id.trim())` sin ese check).

**Nota técnica importante**: el servidor (`supabase/functions/meta-capi/index.ts`) actualmente re-hashea `external_id` incondicionalmente con `sha256Hex(user_data.external_id.trim())`. Si mandamos el valor ya hasheado desde el cliente, el server lo hashearía dos veces y romperíamos la deduplicación con `external_id` en otros contextos (aunque no afecta los 7 eventos actuales porque no dependen de external_id para dedupe — usan `event_id`).

Para evitar el doble hash sin tocar el contrato del server, se aplicará el patrón que ya usan `email`/`phone`/etc.: en el edge function, cambiar la línea de `external_id` para pasar por `hashIfNeeded` con normalización identidad, así detecta el hex SHA-256 y no lo re-hashea. Este es el único cambio en la Edge Function.

### 5. `supabase/functions/meta-capi/index.ts`
- Cambiar `if (user_data.external_id) ud.external_id = [await sha256Hex(user_data.external_id.trim())];` por el mismo patrón `hashIfNeeded` que el resto de campos PII (normalización = trim + lowercase para consistencia con SHA-256 hex).
- Añadir comentario `// [2026-07-05] CATARSIS — external_id puede venir ya hasheado desde el cliente (librería oficial de Meta); hashIfNeeded lo detecta.`

## Archivos afectados
- `package.json` / `bun.lock` (via bun add)
- `src/lib/metaClickIds.ts` (nuevo)
- `src/App.tsx` (init en useEffect)
- `src/lib/metaCapi.ts` (fbc/fbp + external_id)
- `supabase/functions/meta-capi/index.ts` (external_id via hashIfNeeded)

## Fuera de alcance
- No se cambia `metaPixel.ts` — la librería es solo para CAPI/params, el pixel sigue disparando `fbq('track', ...)` normal.
- No se toca el flujo de deduplicación existente (`event_id` compartido pixel↔CAPI).
- No se activa `getIpFn` (IP se sigue capturando server-side).

## Pregunta antes de implementar
¿Confirmas que quieres el ajuste en la Edge Function (`meta-capi/index.ts`) para evitar el doble hash de `external_id`? Sin ese cambio, el `external_id` llegaría a Meta hasheado dos veces y no serviría para matching cross-device. Es un cambio mínimo (1 línea) y sigue el patrón existente de `hashIfNeeded`.
