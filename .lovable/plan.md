

## Rediseno del Dashboard de Analiticas

### Problemas detectados

1. **Ingresos y productos muestran $0**: El hook `useSalesAnalytics` filtra ingresos y top productos solo para ordenes con status `PAID` o `DELIVERED`. De 49 ordenes, 29 tienen status `NEW` y solo 12 son `PAID`. Las ordenes `NEW` no se cuentan para ingresos ni productos vendidos, lo cual distorsiona los datos.

2. **No existe tracking de visitas**: No hay tabla ni sistema para registrar visitas a la pagina. El Meta Pixel trackea PageView pero esos datos solo estan en Meta, no en el dashboard.

3. **Best sellers desconectados**: La vista `best_sellers_food` muestra `total_sold: 0` para todos los productos porque depende de ordenes `PAID/DELIVERED`, y la mayoria estan en `NEW`.

4. **Dashboard limitado**: Solo muestra pedidos e ingresos en el grafico, sin poder alternar entre metricas clave.

---

### Plan de implementacion

#### 1. Crear tabla `page_views` para tracking de visitas

Nueva tabla en la base de datos para registrar cada visita a la pagina:

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | uuid | PK |
| session_id | text | ID de sesion del visitante |
| path | text | Ruta visitada (/, /carrito, /producto/x) |
| referrer | text | De donde viene el visitante |
| user_agent | text | Navegador/dispositivo |
| created_at | timestamptz | Momento de la visita |

- RLS: insercion publica (cualquier visitante), lectura solo admins
- Se insertara desde el frontend en cada cambio de ruta (similar al PageView de Meta Pixel)

#### 2. Crear hook `usePageViews` para consultar visitas

Hook que consulta la tabla `page_views` agrupando por periodo:
- Visitas totales, visitantes unicos (por session_id), paginas mas visitadas
- Soporte para granularidad horaria/diaria igual que el hook de ventas

#### 3. Crear componente `useVisitorTracker` para registrar visitas

Componente ligero que se monta en `App.tsx` y registra cada navegacion:
- Inserta en `page_views` el path, referrer y user_agent
- Usa debounce para no duplicar inserciones rapidas
- No registra visitas en rutas de admin/auth

#### 4. Corregir filtro de ordenes en `useSalesAnalytics`

Cambiar la logica para que **todas las ordenes** (excepto CANCELED) cuenten para:
- Ingresos totales (usar todas, no solo PAID/DELIVERED)
- Top productos (consultar order_items de todas las ordenes, no solo PAID)
- Metodos de pago (contar todas las ordenes, no solo PAID)
- Mantener el KPI de "Ticket Promedio" basado en todas las ordenes

Esto arregla el problema de que el dashboard muestra $0 en ingresos y productos.

#### 5. Redisenar el AnalyticsPanel con metricas interactivas

**KPIs superiores (4 tarjetas clickeables):**
- Pedidos | Ingresos | Ticket Promedio | Visitas
- Cada tarjeta es clickeable y cambia el grafico principal a esa metrica
- Incluir comparacion porcentual vs periodo anterior (ej: "+12% vs semana pasada")

**Grafico principal:**
- Cambia segun el KPI seleccionado (pedidos, ingresos, ticket promedio, visitas)
- Mantiene los selectores de periodo actuales (Hoy, 7 dias, 30 dias, etc.)

**Widgets inferiores (3 columnas en desktop):**
- **Top Productos**: Los 5 mas vendidos con cantidad y revenue (corregido para usar todas las ordenes)
- **Metodos de Pago**: Distribucion con barras de progreso (corregido)
- **Paginas Populares**: Top 5 rutas mas visitadas con conteo

---

### Archivos a crear/modificar

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| Migracion SQL | Crear | Tabla `page_views` con RLS |
| `src/hooks/usePageViews.ts` | Crear | Hook para consultar visitas agrupadas |
| `src/hooks/useVisitorTracker.ts` | Crear | Hook para registrar visitas en cada navegacion |
| `src/hooks/useSalesAnalytics.ts` | Modificar | Corregir filtros: usar TODAS las ordenes (no solo PAID/DELIVERED) para ingresos, productos y metodos de pago |
| `src/components/admin/AnalyticsPanel.tsx` | Modificar | Redisenar con KPIs clickeables, grafico multi-metrica, widget de paginas populares, comparacion vs periodo anterior |
| `src/App.tsx` | Modificar | Montar `useVisitorTracker` para registrar visitas |

---

### Detalle tecnico

**Tabla `page_views` - Migracion:**
```text
CREATE TABLE page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  path text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_created ON page_views(created_at DESC);
CREATE INDEX idx_page_views_session ON page_views(session_id);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
-- Insercion publica, lectura solo admins
```

**useVisitorTracker:**
- Se ejecuta en cada cambio de `location.pathname`
- Genera un `session_id` persistente en `sessionStorage`
- No registra rutas `/admin` ni `/auth`
- Debounce de 1 segundo para evitar duplicados

**useSalesAnalytics - Correccion de filtros:**
- Revenue: sumar `total` de TODAS las ordenes (excepto CANCELED), no solo PAID/DELIVERED
- Top productos: consultar `order_items` de TODAS las ordenes validas
- Metodos de pago: contar TODAS las ordenes validas
- Esto refleja mejor la realidad del negocio donde las ordenes `NEW` ya representan pedidos reales

**AnalyticsPanel - KPIs interactivos:**
- Las 4 tarjetas KPI se vuelven clickeables con un estado `selectedKPI`
- Al hacer clic en una tarjeta, el grafico cambia para mostrar esa metrica
- Cada tarjeta muestra un delta porcentual comparando el periodo actual vs el periodo anterior de igual duracion
- Nuevo widget "Paginas Populares" muestra las rutas mas visitadas

**Flujo de datos resultante:**
```text
Visitante navega la pagina
    |
    v
useVisitorTracker -> INSERT page_views
    |
    v
Admin abre Analiticas
    |
    +--> useSalesAnalytics (ordenes, productos, pagos)
    +--> usePageViews (visitas, unicos, paginas populares)
    |
    v
Dashboard interactivo con 4 KPIs + grafico + 3 widgets
```

