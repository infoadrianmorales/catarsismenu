## Objetivo

Hoy el contenedor `GTM-K8BSZWCM` está fijo en `index.html` (head + noscript en body). Quieres poder **ver, editar y reemplazar ese snippet completo** desde el panel de administrador (pestaña Marketing → Google), manteniendo carga lo más temprana posible.

## Cómo va a quedar

### 1. Quitar el hardcode de `index.html`
Se eliminan los bloques:
- `<!-- Google Tag Manager -->` en `<head>`
- `<!-- Google Tag Manager (noscript) -->` al inicio de `<body>`

En su lugar, `index.html` queda con un pequeño script bootstrap inline que:
- Lee de `localStorage` una copia cacheada del snippet GTM (`__gtm_head_cache` y `__gtm_body_cache`).
- Si existe, la inyecta inmediatamente (head + noscript en body) antes de que React monte.
- Esto preserva la carga temprana en visitas recurrentes.

En la **primera visita** (sin cache), el snippet se inyecta cuando React lee la config — unos ms más tarde, pero solo una vez por dispositivo.

### 2. Nueva sección en el admin: "Google Tag Manager — Snippets"
Dentro de `GoogleTab.tsx`, sobre la card actual de "Container ID", se añade una nueva card "Snippets GTM" con:
- **Textarea 1**: snippet completo del `<head>` (precargado con el bloque actual `GTM-K8BSZWCM`).
- **Textarea 2**: snippet completo `<noscript>` del `<body>` (precargado con el bloque actual).
- **Switch** "Usar snippets personalizados" — si está OFF, vuelve al comportamiento por defecto (snippet generado desde el Container ID).
- Botón **Guardar** que persiste en `config` y refresca el cache `localStorage` para que la próxima carga sea instantánea.
- Botón **Restaurar default** que repone los bloques originales con `GTM-K8BSZWCM`.

El campo "Container ID" actual se mantiene para el caso simple (sin snippet personalizado).

### 3. Inyección runtime
`GoogleTagsProvider.tsx`:
- Si `gtm_custom_enabled` está ON → inyecta `gtm_head_snippet` en `<head>` y `gtm_body_snippet` al inicio de `<body>` (ejecutando los `<script>` correctamente, como ya hace `injectHtmlInto`).
- Si está OFF → comportamiento actual basado en `gtm_id`.
- Sigue siendo idempotente (detecta si el bootstrap ya cargó el mismo snippet vía `data-gtm-bootstrap` y no duplica).
- Excluido en `/local`.

### 4. Base de datos
Tres nuevas claves en `config` (seed con los valores actuales hardcodeados):
- `gtm_head_snippet` (text)
- `gtm_body_snippet` (text)
- `gtm_custom_enabled` (boolean, default `true` para mantener exactamente el comportamiento actual)

### 5. Tipos y hook
`useConfig.ts`: agregar las 3 claves a `Config`, `defaultConfig`, `STRING_KEYS`, `BOOL_KEYS`.

## Archivos a tocar

- `index.html` — quitar GTM hardcode, añadir bootstrap inline que lee `localStorage`.
- `src/components/GoogleTagsProvider.tsx` — branch para snippets personalizados + sync a `localStorage`.
- `src/components/admin/marketing/GoogleTab.tsx` — nueva card con los dos textareas, switch y botón restaurar.
- `src/hooks/useConfig.ts` — 3 claves nuevas.
- Migración/seed en `config` con los snippets actuales de `GTM-K8BSZWCM`.

## Notas importantes

- **Trade-off de velocidad**: en la primerísima visita de cada dispositivo, GTM tarda ~unos ms más en cargar (espera a leer la config). A partir de la segunda visita es idéntico al hardcode actual gracias al cache en `localStorage`.
- El switch maestro de "Scripts personalizados (head/body)" que ya existe queda para **otras** etiquetas (Hotjar, Clarity, etc.). El nuevo bloque es exclusivo para GTM.
- En modo `/local` no se inyecta nada, igual que hoy.

¿Procedo con esta implementación?
