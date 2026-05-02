## Diagnóstico

Investigué los logs y encontré la causa real:

1. **`page_views` recibe POSTs directos a `/rest/v1/page_views`** (confirmado en edge_logs desde iPhones reales con status 201). Estos inserts NO pasan por la edge function `track-visit`, por lo que entran sin `country` ni `city`.
2. **La edge function `track-visit` solo recibe OPTIONS, cero POSTs** (confirmado en function_edge_logs). No se está usando en producción.
3. La única fila con geo correcta (`Groningen, Netherlands`) es de mi prueba interna en `/__test_geo`.

**Causa**: Los visitantes en producción cargan un bundle JS antiguo (cacheado por el navegador o por el CDN de Vercel) que aún contiene la versión previa de `useVisitorTracker` que insertaba directo en la tabla. El nuevo código que invoca la edge function ya está desplegado, pero los clientes con caché agresiva siguen ejecutando el viejo.

Adicionalmente, aunque el código nuevo se cargue, hoy no hay nada en la BD que **impida** los inserts directos sin geo: la política RLS `Anyone can insert page views` permite el INSERT sin requerir país/ciudad. Eso significa que cualquier build vieja seguirá ensuciando los datos indefinidamente.

## Plan de fix

### 1. Cerrar la puerta del INSERT directo desde el cliente (BD)

Migración SQL:
- Reemplazar la política `Anyone can insert page views` por `USING (false)` o eliminarla. El INSERT solo será permitido vía SERVICE_ROLE (que es lo que usa `track-visit`).
- Esto fuerza a TODO cliente, viejo o nuevo, a pasar por la edge function. Las builds cacheadas dejarán de poder insertar (fallarán silenciosamente, que es exactamente lo que queremos).

### 2. Mantener `useVisitorTracker.ts` invocando la edge function

Ya está correcto, no se toca.

### 3. Endurecer `track-visit` para evitar nuevos casos de `null`

En `supabase/functions/track-visit/index.ts`:
- Si `getClientIp()` retorna `null`, intentar también `cf-pseudo-ipv4` y `true-client-ip` como último recurso.
- Si los 3 proveedores fallan, registrar el `user_agent` y la IP en el log para diagnóstico, pero seguir insertando la fila (no perder la visita) — el comportamiento actual ya hace esto, solo añadimos mejor logging.

### 4. UX en el panel admin

En `VisitorsPanel.tsx`, los registros con `country = null` se muestran como "Desconocido". Filtrar las filas `Desconocido` del top de países/ciudades para que no dominen la vista mientras los datos viejos siguen en la BD, **o** mostrar "Sin geo" como categoría aparte con un tooltip explicativo. Voy a optar por mostrarlas aparte (más honesto) en una sección colapsable, y excluirlas del cálculo de porcentajes del top.

### 5. (Opcional) Limpieza de datos históricos

Las 3762 filas existentes con `country = null` no se pueden re-resolver (no guardamos la IP, y ya pasaron más de 5 minutos así que la política de UPDATE tampoco aplica). Opciones:
- Dejarlas y filtrar en UI (recomendado: preserva el conteo total de visitas).
- Borrar las filas con `country = null` anteriores a hoy (perdemos 3762 visitas de los KPIs).

Pregunto al usuario antes de borrar nada.

## Detalles técnicos

**Migración SQL propuesta**:
```sql
-- Cerrar INSERT público; solo SERVICE_ROLE (edge function) puede insertar
DROP POLICY "Anyone can insert page views" ON public.page_views;
-- No creamos política nueva: sin INSERT policy + RLS habilitado = INSERT solo vía service_role
```

**Cambios en `VisitorsPanel.tsx`**:
- En `byCountry` y `byCity`, filtrar items con `country === 'Desconocido'` o `city === 'Desconocida'` antes de renderizar el ranking.
- Añadir nota debajo de cada card: "X visitas sin geo resolver" (calculado desde el row Desconocido).

**Cambios en `track-visit`**:
- Añadir headers `cf-pseudo-ipv4`, `true-client-ip`, `fastly-client-ip` al fallback de `getClientIp()`.
- Loggear `req.headers` cuando no se detecta IP, para diagnóstico futuro.

## Archivos modificados

- `supabase/migrations/<timestamp>_lock_page_views_insert.sql` (nuevo)
- `supabase/functions/track-visit/index.ts` (headers extra + logging)
- `src/components/admin/VisitorsPanel.tsx` (filtrar "Desconocido" del top, mostrar contador aparte)
