## Eliminar la tarjeta "Scripts personalizados (head / body)"

La tarjeta de la captura es redundante con la nueva "Snippets GTM (código completo)", así que la quitamos del panel.

### Cambios

1. **`src/components/admin/marketing/GoogleTab.tsx`**
   - Quitar el import y el render de `CustomScriptsCard`.

2. **`src/components/admin/marketing/CustomScriptsCard.tsx`**
   - Eliminar el archivo.

3. **`src/components/GoogleTagsProvider.tsx`**
   - Quitar el `useEffect` que inyectaba `custom_head_scripts` / `custom_body_scripts` y las constantes `CUSTOM_HEAD_ATTR` / `CUSTOM_BODY_ATTR`.

4. **`src/hooks/useConfig.ts`**
   - Quitar `custom_head_scripts`, `custom_body_scripts`, `custom_scripts_enabled` de `Config`, `defaultConfig`, `STRING_KEYS` y `BOOL_KEYS`.

5. **Base de datos (`config`)**
   - Borrar las 3 claves: `custom_head_scripts`, `custom_body_scripts`, `custom_scripts_enabled`.

### Nota
La edición de GTM sigue disponible en la tarjeta "Snippets GTM (código completo)" que ya implementamos.
