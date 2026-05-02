## Objetivo

Eliminar el UPDATE post-INSERT (bloqueado por RLS de sesión anónima) y resolver país/ciudad **antes** del INSERT, con timeout duro de 3s. Si la geo falla o tarda más de 3s, se inserta igual con `country = null` y `city = null`.

## Cambio único: `src/hooks/useVisitorTracker.ts`

### 1. Reemplazar el bloque del `setTimeout` (líneas 99-142)

Nuevo flujo dentro del `setTimeout(async () => { ... }, 1000)`:

```ts
// [2026-05-02] FIX: geo incluida en INSERT directo con timeout 3s
// Razón: UPDATE post-INSERT bloqueado por RLS policy de sesión anónima
lastTrackedPath.current = path;

try {
  const session_id = getSessionId();
  const utm = captureUtm();
  const source = detectSource();

  // Esperar geo con timeout duro de 3s — nunca bloquea más de eso.
  const geo = await Promise.race([
    getGeoData(),
    new Promise<{ country: null; city: null }>((resolve) =>
      setTimeout(() => resolve({ country: null, city: null }), 3000)
    ),
  ]);

  await supabase.from('page_views').insert({
    session_id,
    path,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent || null,
    source,
    utm_source: utm.utm_source || null,
    utm_medium: utm.utm_medium || null,
    utm_campaign: utm.utm_campaign || null,
    country: geo.country,
    city: geo.city,
  });
} catch {
  // Silent fail — analytics nunca debe romper la app.
}
```

### 2. Cambios derivados

- **Eliminar** el bloque `getGeoData().then(({ country, city }) => { ... UPDATE ... })` completo.
- **Eliminar** el `.select('id').single()` y la rama `if (error || !data?.id) return;` (ya no se necesita el id porque no hay UPDATE).
- **Mantener** `setSupabaseSessionHeader(sessionId)` dentro de `getSessionId()` (no estorba; queda como defensa en profundidad por si en el futuro algo necesita el header).
- **Mantener** `detectSource()`, `captureUtm()` y `getGeoData()` sin cambios de lógica.

### 3. API de geolocalización

Se mantiene `https://ipwho.is/`. Con el timeout de 3s, si tarda demasiado o cae, el INSERT igual ocurre con geo nula. Si en pruebas posteriores `ipwho.is` no responde de forma consistente, se puede sustituir por `https://ipapi.co/json/` (campos `country_name` y `city`) — fuera del alcance de este paso salvo que el usuario lo confirme.

## No se toca

- `supabase/migrations/20260502172217_*.sql` — la policy "Owner can patch geo within 5 minutes" y el trigger `guard_page_views_update()` quedan vigentes como defensa en profundidad, aunque ya no se usen desde el cliente.
- Dashboards, RPCs, `VisitorsPanel`, `useVisitorAnalytics`.
- `supabase/config.toml` ni ningún otro archivo.

## Verificación post-cambio

1. Navegar a `/` y revisar en `page_views` que el registro nuevo trae `country` y `city` poblados (no nulos) en el mismo INSERT.
2. Confirmar en consola que no hay errores 401/403 de UPDATE (ya no se ejecuta).
3. Simular latencia (DevTools throttling) y verificar que tras 3s el INSERT igual ocurre con `country = null`.