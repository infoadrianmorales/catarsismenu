## Plan: Tracking ampliado con detección de fuente y geo por IP (cliente)

### Cambio de arquitectura
Hoy `useVisitorTracker` invoca la edge function `track-visit` (server-side: geolocalización por `ip-api.com` y clasificación de source). El nuevo enfoque pedido es **client-side puro**: INSERT directo a `page_views` + UPDATE asíncrono con `ipwho.is`.

Migramos a tu enfoque y desactivamos el camino server.

### ⚠️ Bloqueo crítico de RLS — requiere migración

La política actual de `page_views` **prohíbe UPDATE** (solo admins pueden, vía `is_admin`). El flujo propuesto (paso d: `update({country,city}).eq('id', insertedId)`) **fallará silenciosamente** para visitantes anónimos.

**Solución mínima y segura**: agregar una política de UPDATE restringida a:
- el mismo `session_id` del cliente (validado por header `x-session-id` ya existente vía `get_client_session_id()`),
- solo dentro de los últimos 5 minutos (`created_at > now() - interval '5 minutes'`),
- y solo permite escribir `country` y `city` (se enforza con un trigger BEFORE UPDATE que rechaza cambios a otras columnas).

Sin esto, la geo nunca se registrará desde el cliente.

### Archivos a modificar

1. **`src/hooks/useVisitorTracker.ts`**
   - Eliminar `supabase.functions.invoke('track-visit', ...)`.
   - Añadir `detectSource()` (síncrono, exactamente como tu spec).
   - Añadir `getGeoData()` async usando `https://ipwho.is/`.
   - Mantener `getSessionId()` (UUID v4) y `setSupabaseSessionHeader()` (necesario para que la nueva política de UPDATE funcione).
   - Flujo:
     ```ts
     const utm_source = params.get('utm_source') || null;
     const utm_medium = params.get('utm_medium') || null;
     const utm_campaign = params.get('utm_campaign') || null;
     const source = detectSource();

     const { data, error } = await supabase
       .from('page_views')
       .insert({
         session_id, path, referrer: document.referrer || null,
         user_agent: navigator.userAgent || null,
         source, utm_source, utm_medium, utm_campaign,
       })
       .select('id')
       .single();

     if (data?.id) {
       getGeoData().then(({ country, city }) => {
         if (country) {
           supabase.from('page_views')
             .update({ country, city })
             .eq('id', data.id);
         }
       });
     }
     ```
   - Mantener debounce 1s y exclusión de `/admin` y `/auth`.
   - Mantener captura UTM en `sessionStorage` ya existente (compatibilidad con vistas posteriores en la misma sesión sin UTM en URL).

2. **Migración SQL** (nueva)
   - Nueva policy UPDATE en `page_views` permitiendo solo `country`/`city` para el dueño de la sesión durante 5 min.
   - Trigger `BEFORE UPDATE` que aborta si cambian columnas distintas a `country`/`city`.
   ```sql
   CREATE OR REPLACE FUNCTION public.guard_page_views_update()
   RETURNS trigger LANGUAGE plpgsql AS $$
   BEGIN
     IF NEW.session_id IS DISTINCT FROM OLD.session_id
        OR NEW.path IS DISTINCT FROM OLD.path
        OR NEW.source IS DISTINCT FROM OLD.source
        OR NEW.referrer IS DISTINCT FROM OLD.referrer
        OR NEW.user_agent IS DISTINCT FROM OLD.user_agent
        OR NEW.utm_source IS DISTINCT FROM OLD.utm_source
        OR NEW.utm_medium IS DISTINCT FROM OLD.utm_medium
        OR NEW.utm_campaign IS DISTINCT FROM OLD.utm_campaign
        OR NEW.created_at IS DISTINCT FROM OLD.created_at
        OR NEW.id IS DISTINCT FROM OLD.id THEN
       RAISE EXCEPTION 'Only country/city can be updated by clients';
     END IF;
     RETURN NEW;
   END $$;

   CREATE TRIGGER trg_guard_page_views_update
   BEFORE UPDATE ON public.page_views
   FOR EACH ROW EXECUTE FUNCTION public.guard_page_views_update();

   CREATE POLICY "Owner can patch geo within 5 min"
   ON public.page_views FOR UPDATE TO public
   USING (
     session_id = get_client_session_id()
     AND session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
     AND created_at > now() - interval '5 minutes'
   );
   ```

3. **Edge function `track-visit` y `supabase/config.toml`**
   - Quedan **huérfanos**. Opciones:
     - **A (recomendado)**: eliminar `supabase/functions/track-visit/` y el bloque `[functions.track-visit]` en `config.toml` para evitar código muerto.
     - B: dejarlos en disco como respaldo. Recomiendo A porque ya nadie los invoca.

### Trade-offs a considerar
- **Privacidad/CORS**: `ipwho.is` se llama desde el navegador → expone la IP del visitante a un tercero (lo mismo ya pasaba server-side con ip-api). Sin bloqueo técnico.
- **Bloqueadores**: extensiones como uBlock pueden bloquear `ipwho.is`. El INSERT principal ya quedó hecho, solo se pierde geo.
- **Doble request por visita** (INSERT + UPDATE) vs. 1 sola con la edge function. Aceptable.
- **Cuota ipwho.is**: dicen "sin límite", pero si crece tráfico convendría volver a server-side.

### Preguntas para confirmar antes de implementar
1. ¿Apruebas la migración de RLS + trigger para permitir el UPDATE de geo? (Sin esto, country/city nunca se registran.)
2. ¿Eliminamos la edge function `track-visit` y su entrada en `config.toml`? (Recomendado.)
3. La memoria del proyecto guarda el patrón anterior; tras aplicar esto, ¿actualizo la memoria para reflejar el nuevo flujo client-side?
