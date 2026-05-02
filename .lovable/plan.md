## Plan: Agregar comentarios de trazabilidad fechados

Solo se añaden cabeceras de comentario al inicio de cada archivo modificado en el paso anterior. **No se cambia ninguna lógica.**

### Archivos a actualizar

1. **`supabase/functions/track-visit/index.ts`** — Reemplazar las 2 líneas de comentario actual por cabecera fechada (Propósito + Modificaciones).

2. **`supabase/config.toml`** — Agregar comentario SQL-style (`#` para TOML) al inicio del archivo indicando registro de `track-visit`. *Nota: TOML usa `#` para comentarios, no `--`; usaré `#` para que el archivo siga siendo válido.*

3. **`src/hooks/useVisitorTracker.ts`** — Agregar cabecera fechada al inicio (antes de los imports).

4. **`src/hooks/useVisitorAnalytics.ts`** — Reemplazar la línea de comentario actual por cabecera completa.

5. **`src/components/admin/VisitorsPanel.tsx`** — Reemplazar la línea de comentario actual por cabecera completa.

6. **`supabase/migrations/20260502152441_24506c96-3620-4672-b988-f34a8f77ed89.sql`** — Agregar cabecera SQL al inicio (`-- [2026-05-02] ...`).

### Formato aplicado

- `.ts` / `.tsx`:
  ```
  // [2026-05-02] CATARSIS — <nombre corto>
  // Propósito: <una línea>
  // Modificaciones: <cambios del paso anterior>
  ```
- `.sql`: mismo formato con `--`.
- `.toml`: mismo formato con `#` (requisito sintáctico del archivo).

### Garantías
- Sin cambios de lógica, imports, exports ni nombres.
- Solo inserción/reemplazo de comentarios al inicio.
