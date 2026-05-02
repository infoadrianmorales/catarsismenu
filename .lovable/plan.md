## Objetivo
Agregar comentarios fechados [2026-05-02] en los archivos del paso anterior, sin tocar lógica.

## Estado actual
- `src/hooks/useVisitorTracker.ts` — ya tiene header [2026-05-02] cubriendo `detectSource()`, `getGeoData()` e INSERT+UPDATE en background. **Se ampliarán comentarios inline** sobre cada bloque (detectSource, getGeoData, flujo INSERT/UPDATE) para mayor trazabilidad.
- `supabase/config.toml` — ya comentado.
- `supabase/migrations/20260502172217_...sql` — **falta** el bloque de cabecera fechado describiendo policy + trigger de 5 minutos.

## Cambios (solo comentarios, cero lógica)

### 1. `supabase/migrations/20260502172217_5e8ab3ac-5005-4f79-b097-e954ef08e84e.sql`
Agregar al inicio:
```
-- [2026-05-02] CATARSIS — migración geo-patch page_views
-- Propósito: Permitir que el visitante anónimo enriquezca su propio page_view
--            con country/city dentro de los primeros 5 minutos.
-- Modificaciones:
--   * Función guard_page_views_update(): bloquea cambios en cualquier columna
--     que no sea country/city.
--   * Trigger BEFORE UPDATE asociado a public.page_views.
--   * Policy "Owner can patch geo within 5 minutes": UPDATE permitido solo si
--     session_id == get_client_session_id() y created_at > now() - 5 min.
```

### 2. `src/hooks/useVisitorTracker.ts`
Mantener el header existente y agregar/normalizar comentarios fechados sobre:
- bloque `detectSource()`
- bloque `getGeoData()`
- bloque INSERT inmediato
- bloque UPDATE asíncrono de geo

Formato uniforme `// [2026-05-02] ...`. Sin cambios de código.

## Fuera de alcance
- Cualquier cambio de lógica, RLS, nombres o flujos.
- Modificar `config.toml` o archivos no tocados en el paso anterior.