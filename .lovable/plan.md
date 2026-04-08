

## Plan: Corregir límite de 1000 visitas en analíticas

### Problema confirmado
- La DB tiene **24,945 page views** totales
- Días como abril 3-5 tienen más de 1,200 visitas cada uno
- El hook `usePageViews.ts` usa `.select()` sin paginación → Supabase retorna máximo 1,000 filas
- Resultado: datos truncados e inexactos en el dashboard

### Solución
Crear una **función SQL en la base de datos** que haga la agregación (GROUP BY) directamente en PostgreSQL y devuelva solo los datos resumidos (máx ~30 filas para un mes). Esto elimina el límite de 1,000 y es mucho más eficiente.

### Cambios

**1. Migración SQL — crear función `get_page_views_summary`**

```sql
CREATE OR REPLACE FUNCTION public.get_page_views_summary(
  p_start timestamptz,
  p_end timestamptz,
  p_granularity text DEFAULT 'daily'
)
RETURNS TABLE(
  period text,
  views bigint,
  unique_visitors bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    CASE
      WHEN p_granularity = 'hourly'
        THEN to_char(date_trunc('hour', created_at), 'YYYY-MM-DD"T"HH24')
      ELSE to_char(date_trunc('day', created_at), 'YYYY-MM-DD')
    END AS period,
    count(*)::bigint AS views,
    count(DISTINCT session_id)::bigint AS unique_visitors
  FROM page_views
  WHERE created_at >= p_start AND created_at <= p_end
  GROUP BY period
  ORDER BY period
$$;
```

**2. Función SQL adicional — `get_popular_pages`**

```sql
CREATE OR REPLACE FUNCTION public.get_popular_pages(
  p_start timestamptz,
  p_end timestamptz,
  p_limit int DEFAULT 5
)
RETURNS TABLE(path text, views bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT path, count(*)::bigint AS views
  FROM page_views
  WHERE created_at >= p_start AND created_at <= p_end
  GROUP BY path
  ORDER BY views DESC
  LIMIT p_limit
$$;
```

**3. Función SQL — `get_page_views_totals` (resumen global)**

```sql
CREATE OR REPLACE FUNCTION public.get_page_views_totals(
  p_start timestamptz,
  p_end timestamptz
)
RETURNS TABLE(total_views bigint, unique_visitors bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    count(*)::bigint AS total_views,
    count(DISTINCT session_id)::bigint AS unique_visitors
  FROM page_views
  WHERE created_at >= p_start AND created_at <= p_end
$$;
```

**4. Actualizar `src/hooks/usePageViews.ts`**

Reemplazar la consulta que trae filas crudas por llamadas RPC a las funciones:

- `supabase.rpc('get_page_views_summary', { p_start, p_end, p_granularity })` → serie temporal
- `supabase.rpc('get_page_views_totals', { p_start, p_end })` → resumen
- `supabase.rpc('get_popular_pages', { p_start, p_end })` → páginas populares

Eliminar todo el procesamiento con `useMemo` (filtrado, conteo, Set) ya que la DB lo hace.

### Resultado
- Visitas mostradas correctas sin límite de 1,000
- Rendimiento mejorado (la DB devuelve ~30 filas en vez de miles)
- Datos verídicos: conteos exactos desde PostgreSQL

### Archivo modificado
- `src/hooks/usePageViews.ts`

### Comentario en código
Se agregará comentario con fecha `[2026-04-08]` documentando el cambio.

