# Validador de Eventos Meta Pixel en Admin

## Contexto

La API pública de Meta no permite leer desde el browser los eventos configurados en Events Manager (requiere un token de Business + revisión de app). Por eso el validador funcionará con **dos fuentes** que ya tenemos a mano:

1. **Manifest de la app** — fuente de verdad de qué eventos dispara realmente el código (`src/lib/metaPixel.ts`).
2. **Lista declarada por el admin** — los eventos que el usuario ve hoy en Meta Events Manager (pegados o marcados manualmente, guardados en la tabla `config`).

El diff entre ambos responde la pregunta "¿qué eventos están de más en Meta?".

## Componentes

### 1. Manifest tipado en código
Nuevo archivo `src/lib/metaPixelManifest.ts` con la lista canónica de los 10 eventos que la app dispara después del refactor anterior:

```ts
export const APP_PIXEL_EVENTS = [
  { name: 'PageView', standard: true, surface: 'Toda navegación' },
  { name: 'ViewContent', standard: true, surface: 'Producto / hover card' },
  { name: 'Search', standard: true, surface: 'Buscador (3+ chars)' },
  { name: 'AddToCart', standard: true, surface: 'Botón agregar' },
  { name: 'ViewCart', standard: false, surface: 'Apertura del drawer' },
  { name: 'InitiateCheckout', standard: true, surface: 'Entrar a /checkout' },
  { name: 'AddPaymentInfo', standard: true, surface: 'Seleccionar pago' },
  { name: 'Purchase', standard: true, surface: 'Confirmar orden' },
  { name: 'Contact', standard: true, surface: 'Click WhatsApp' },
  { name: 'Lead', standard: true, surface: '1er WhatsApp/sesión' },
] as const;
```

Cualquier evento nuevo que se agregue al pixel se registra aquí — el panel lo detecta automáticamente.

### 2. Telemetría runtime (sin backend)
En `metaPixel.ts` añadimos un interceptor: cada vez que `safeFbq` dispara un evento, registra `{ name, lastFiredAt }` en `localStorage` bajo `__fb_event_log`. Esto permite que el panel muestre **"última vez visto en esta sesión"** y confirme en vivo si un evento dispara o no — útil cuando el admin recorre el sitio en otra pestaña para validar.

### 3. Persistencia de la lista de Meta
Reutilizamos la tabla `config` (ya está cableada): nueva clave `meta_pixel_configured_events` con un JSON array de strings. Sin migración nueva — `config` ya soporta valores arbitrarios.

### 4. UI: `MetaPixelValidatorCard.tsx`
Card dentro de la pestaña **Marketing > Meta** (debajo del campo Pixel ID), con tres secciones:

**a) Inventario de la app** — tabla con los 10 eventos del manifest, columna "Última vez disparado" leyendo `localStorage`, badge "Estándar" / "Custom".

**b) Eventos configurados en Meta** — textarea (uno por línea) **o** lista de chips con los 18 eventos estándar de Meta + custom, donde el admin marca los que ve en Events Manager. Botón "Guardar" persiste en `config.meta_pixel_configured_events`.

**c) Resultado del diff** — tres listas:
- ✅ **Configurado y disparado** (todo bien).
- 🗑️ **Configurado en Meta, NO usado por la app** → "Borra estos en Events Manager".
- ⚠️ **Disparado por la app, NO configurado en Meta** → "Agrega estos para no perder señal" (raro tras el refactor, pero útil).

Cada item en "no usados" tiene botón **Copiar nombre** para pegar fácil en Meta al borrarlo.

### 5. Reset & ayuda
- Botón "Limpiar log de sesión" → borra `__fb_event_log`.
- Link "¿Cómo veo mis eventos en Meta?" → abre `https://business.facebook.com/events_manager2/list/pixel/{pixelId}/test_events` en nueva pestaña.

## Archivos a crear / modificar

- **NEW** `src/lib/metaPixelManifest.ts` — lista canónica.
- **EDIT** `src/lib/metaPixel.ts` — interceptor que escribe `__fb_event_log` en cada `safeFbq`.
- **NEW** `src/components/admin/marketing/MetaPixelValidatorCard.tsx` — la UI.
- **EDIT** `src/components/admin/MetaCatalogPanel.tsx` — insertar el card al final.
- **EDIT** `src/hooks/useConfig.ts` — exponer `meta_pixel_configured_events` (string[]).

Sin migración SQL: `config` ya almacena valores libres.

## Pregunta antes de implementar

1. La "lista del lado Meta" la quieres como **textarea de copiar/pegar** (más rápido para listas largas) o como **checklist de los 18 eventos estándar + entrada custom** (más guiado, evita typos)?
