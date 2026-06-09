## Editor de Scripts Personalizados en el Admin

Agregar una sección dentro de la pestaña **Marketing → Google** para pegar/editar scripts arbitrarios (head y body) que se inyectarán dinámicamente en runtime, sin tocar `index.html`. El snippet hardcodeado de `GTM-K8BSZWCM` se mantiene intacto para máxima velocidad de carga.

### 1. Base de datos

Agregar 3 claves nuevas a la tabla `config` (ya existente):

- `custom_head_scripts` (text) — HTML/JS que se inyecta en `<head>`
- `custom_body_scripts` (text) — HTML/JS que se inyecta al final de `<body>`
- `custom_scripts_enabled` (boolean) — switch maestro

No requiere tabla nueva, solo seed inicial vacío vía `supabase--insert`.

### 2. Componente nuevo: `CustomScriptsCard.tsx`

Ubicado en `src/components/admin/marketing/CustomScriptsCard.tsx`. Se renderiza dentro de `GoogleTab.tsx` debajo del card de GTM. Contiene:

- Switch para activar/desactivar la inyección.
- Textarea grande para "Scripts del `<head>`" con monospace.
- Textarea grande para "Scripts del `<body>`" con monospace.
- Botón **Guardar**.
- Advertencia visible: "Los scripts se ejecutan tal cual los pegues. Solo pega código de proveedores confiables."
- Nota informativa: "El GTM principal (`GTM-K8BSZWCM`) ya está hardcodeado en `index.html` y no se modifica desde aquí. Esta área es para scripts ADICIONALES (GTM secundarios, Hotjar, Clarity, Pixel custom, etc.)."

### 3. Inyector dinámico: extender `GoogleTagsProvider.tsx`

Agregar un `useEffect` adicional que:

1. Lee `custom_scripts_enabled`, `custom_head_scripts`, `custom_body_scripts` del config.
2. Si está activado, parsea cada bloque y crea los `<script>` / `<noscript>` correspondientes usando `document.createRange().createContextualFragment(html)` para soportar HTML completo (no solo JS puro).
3. Inserta los del head en `document.head` y los del body en `document.body`.
4. Idempotente: marca cada nodo inyectado con un atributo `data-custom-injected="head|body"` y los elimina antes de re-inyectar cuando cambia el config.
5. Cleanup en unmount.

### 4. Hook `useConfig.ts`

Añadir las 3 nuevas claves a los tipos (`gtm_id | ga4_id | ... | custom_head_scripts | custom_body_scripts | custom_scripts_enabled`) para que el upsert funcione sin cambios adicionales.

### 5. Memoria

Actualizar `mem://features/admin/marketing-panel` agregando: "Marketing → Google incluye editor de scripts custom (head/body) inyectados en runtime. GTM-K8BSZWCM permanece hardcodeado en index.html."

### Detalles técnicos

```text
runtime flow:
  config (Supabase)
    └─> useConfig hook
         └─> GoogleTagsProvider
              ├─ inyecta GTM dinámico (si gtm_id distinto al hardcoded)
              ├─ inyecta GA4/Ads/GSC
              └─ inyecta custom_head_scripts + custom_body_scripts  ← NUEVO
```

Seguridad: los scripts solo se editan desde el admin (tabla `config` ya tiene RLS admin-only para escritura), pero la lectura es pública para poder inyectarlos en el cliente — esto es igual que cualquier `<script>` en `index.html` y no expone datos sensibles.

### Archivos afectados

- **Migración + insert**: 3 nuevas filas en `config`.
- **Crear**: `src/components/admin/marketing/CustomScriptsCard.tsx`.
- **Editar**: `src/components/admin/marketing/GoogleTab.tsx` (montar el card), `src/components/GoogleTagsProvider.tsx` (inyección dinámica), `src/hooks/useConfig.ts` (tipos).
- **Memoria**: actualizar `mem://features/admin/marketing-panel`.
