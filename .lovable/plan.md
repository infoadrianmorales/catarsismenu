## Plan: Métricas ampliadas de visitantes (geo + fuente de tráfico)

Ampliar `page_views` con país/ciudad/fuente, registrar la geolocalización vía Edge Function, y crear una nueva pestaña **Visitantes** en el panel de admin con 3 widgets nuevos alimentados por RPCs `SECURITY DEFINER`.

---

### 1. Migración SQL — Esquema y RPCs

**Tabla `page_views`** — agregar columnas (la columna `referrer` ya existe, no se duplica):

```sql
ALTER TABLE page_views
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Directo',
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views(country);
CREATE INDEX IF NOT EXISTS idx_page_views_source ON page_views(source);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
```

**RLS** — La política de INSERT existente solo valida `path` y `session_id`; los nuevos campos quedan opcionales y se aceptan automáticamente. No requiere cambios.

**RPCs** (3 funciones, `SECURITY DEFINER`, `SET search_path = public`, restringidas a admin con `is_admin(auth.uid())` por consistencia con el resto de funciones de analytics):

- `get_visits_by_source(p_start, p_end)` → `(source TEXT, total BIGINT)` ordenado desc.
- `get_visits_by_country(p_start, p_end)` → `(country TEXT, total BIGINT)` top 10.
- `get_visits_daily(p_start, p_end)` → `(date DATE, total BIGINT, unique_visitors BIGINT)` ordenado asc.

> Nota de seguridad: en lugar de `GRANT … TO anon`, las funciones validan `is_admin(auth.uid())` internamente — alinea con `get_page_views_*` ya existentes y mantiene los datos de tráfico fuera del cliente público.

---

### 2. Edge Function `track-visit`

Nueva función en `supabase/functions/track-visit/index.ts` con `verify_jwt = false`.

Responsabilidades:
1. Leer IP del request (`x-forwarded-for` / `cf-connecting-ip`).
2. Resolver geolocalización con **ip-api.com** (`http://ip-api.com/json/{ip}?fields=status,country,city`) — gratis, sin API key, 45 req/min por IP del servidor (suficiente para este tráfico).
3. Recibir del cliente: `session_id`, `path`, `referrer`, `user_agent`, `utm_source`, `utm_medium`, `utm_campaign`.
4. Calcular `source`:
   - Si hay `utm_source` → usarlo (capitalizado).
   - Si no, parsear `referrer`: `google.*` → "Google", `facebook.*|fb.*` → "Facebook", `instagram.*` → "Instagram", `t.co|twitter|x.com` → "Twitter/X", `wa.me|whatsapp` → "WhatsApp", `tiktok` → "TikTok", `bing` → "Bing", otros → "Referido (dominio.com)".
   - Sin referrer ni UTM → "Directo".
5. Insertar en `page_views` usando service role (bypassa RLS y permite escribir geo/source).
6. Validar `session_id` con regex UUID v4 (mismo patrón que la RLS actual). Devolver 400 si inválido.
7. CORS abierto (`*`) para llamadas desde el sitio público.

**`supabase/config.toml`** — añadir bloque:
```toml
[functions.track-visit]
verify_jwt = false
```

---

### 3. Cliente — Reemplazar inserción directa por llamada a la función

`src/hooks/useVisitorTracker.ts`:
- Sustituir `supabase.from('page_views').insert(...)` por `supabase.functions.invoke('track-visit', { body: {...} })`.
- Extraer parámetros UTM de `window.location.search` (`utm_source`, `utm_medium`, `utm_campaign`) y enviarlos en el body.
- Mantener la lógica de debounce, paths excluidos y dedupe por path.
- Mantener el silent-fail.

---

### 4. UI — Nueva pestaña "Visitantes" en Admin

**Hook nuevo `src/hooks/useVisitorAnalytics.ts`** — invoca las 3 RPCs en paralelo (mismo patrón que `usePageViews`), recibe `startDate`/`endDate`.

**Componente nuevo `src/components/admin/VisitorsPanel.tsx`** con:
- Selector de fechas reutilizando los presets de `AnalyticsPanel` (Hoy / Ayer / 7 días / 30 días / Este mes / Todo / Personalizado).
- **KPIs arriba**: Total visitas, Visitantes únicos, Países distintos, Fuente top.
- **Gráfica de tendencia diaria** (AreaChart de recharts) con `get_visits_daily`.
- **Widget "Fuentes de tráfico"** — barras horizontales con porcentaje.
- **Widget "Países top"** — lista con bandera (emoji) + total + barra de progreso.
- **Widget "Páginas populares"** — reutiliza `get_popular_pages` ya existente.

**Integración en `src/pages/Admin.tsx`**:
- Añadir tab `<TabsTrigger value="visitors">` con icono `Globe` entre "Clientes" y "Banner".
- `<TabsContent value="visitors"><VisitorsPanel /></TabsContent>`.
- Cambiar `grid-cols-10` → `grid-cols-11`.

---

### 5. Verificación

1. Migración aplicada — columnas y RPCs creadas sin warnings del linter.
2. Visitar el sitio en preview → en `page_views` se ve el nuevo registro con `country`, `city`, `source` poblados.
3. Visitar con `?utm_source=facebook&utm_campaign=test` → `source="Facebook"`, `utm_campaign="test"`.
4. Visitar desde un link de Google → `source="Google"`.
5. Pestaña **Visitantes** en `/admin` carga y muestra los 4 KPIs, gráfica diaria y los 3 widgets.
6. Cambiar el rango de fechas actualiza todos los widgets.

---

### Archivos

| Acción | Archivo |
|---|---|
| Migración | (SQL) `page_views` + 3 RPCs |
| Crear | `supabase/functions/track-visit/index.ts` |
| Modificar | `supabase/config.toml` |
| Modificar | `src/hooks/useVisitorTracker.ts` |
| Crear | `src/hooks/useVisitorAnalytics.ts` |
| Crear | `src/components/admin/VisitorsPanel.tsx` |
| Modificar | `src/pages/Admin.tsx` |
