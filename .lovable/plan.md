## Objetivo
Mostrar la ciudad de cada visita en el panel **Visitantes**, además del país. La ciudad ya se está guardando en `page_views` (verificado: la última visita de prueba quedó como `Groningen, Netherlands`). Solo falta exponerla en el dashboard.

## Cambios

### 1. Nueva agregación por ciudad (backend)
Crear una RPC `get_visits_by_city(p_start, p_end)` siguiendo el mismo patrón que `get_visits_by_country`:
- `SECURITY DEFINER`, restringida a admins.
- Devuelve `country`, `city`, `total`, ordenado por `total DESC`, limitado a las 10 ciudades top.
- Agrupa por `(country, city)` para distinguir, por ejemplo, "Caracas (Venezuela)" de otra ciudad homónima.

### 2. Hook `useVisitorAnalytics`
Agregar `byCity` al hook, llamando a la nueva RPC en paralelo con las otras tres.

### 3. Widget "Ciudades top" en `VisitorsPanel`
Añadir una cuarta tarjeta junto a *Fuentes / Países / Páginas populares*:
- Mismo diseño visual (lista con `Progress` y porcentaje).
- Cada fila muestra `🏙️ Ciudad — País` y el conteo.
- Layout: pasar el grid de `md:grid-cols-3` a `md:grid-cols-2 xl:grid-cols-4` para que las cuatro tarjetas respiren bien en pantallas grandes y se apilen en móvil.

### 4. KPI opcional
Reemplazar o complementar el KPI "Países" con uno de "Ciudades" si aporta más detalle — a confirmar contigo si lo prefieres así o dejar ambos.

## Archivos afectados
- `supabase/migrations/...` (nueva migración con la RPC).
- `src/hooks/useVisitorAnalytics.ts`.
- `src/components/admin/VisitorsPanel.tsx`.

## Notas
- Las visitas históricas con `city = null` se agruparán como "Desconocida", igual que hoy se hace con países.
- No se toca el tracking ni la edge function: ya está registrando ciudad correctamente.
- No requiere cambios en RLS ni nuevos secretos.