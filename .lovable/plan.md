## Objetivo
Hacer que el país/ciudad de las visitas se registre de forma confiable en `page_views`, porque ahora las visitas sí se guardan pero están entrando como `null` y el panel muestra todo como `Desconocido`.

## Hallazgos confirmados
- El tracking sí inserta visitas en `page_views`.
- En las visitas recientes, `country` y `city` están vacíos en todos los registros revisados.
- El panel `Visitantes` solo refleja lo que ya existe en base; no es el origen del fallo.
- La ruta `/auth` está excluida del tracking, así que probar allí no genera visitas.
- La geolocalización actual depende de `fetch('https://ipwho.is/')` desde el navegador; si falla, el código hace fallback a `null` y aun así inserta la visita.

## Plan
### 1. Mover la resolución de geo al backend
Crear una función backend pequeña para registrar la visita y resolver `country/city` del lado servidor usando la IP real del request.

### 2. Mantener la lógica de atribución en cliente
Conservar en `useVisitorTracker.ts` la detección de `source`, `utm_source`, `utm_medium`, `utm_campaign`, `path`, `referrer` y `user_agent`, pero enviar esos datos a la función backend en vez de insertar directamente desde el cliente.

### 3. Añadir fallback de proveedor de geo
Usar `ipwho.is` como primera opción y `ipapi.co/json/` como respaldo si el primero falla o no responde a tiempo, para evitar más visitas con geo vacía.

### 4. Registrar en una sola escritura
Hacer que la función backend inserte `country` y `city` directamente en el `INSERT` de `page_views`, sin `UPDATE` posterior.

### 5. Verificar el panel existente
Comprobar que `VisitorsPanel` y las RPC `get_visits_by_country`, `get_visits_by_source` y `get_visits_daily` sigan funcionando sin cambios visuales, mostrando países reales una vez entren nuevos datos.

## Archivos previstos
- `src/hooks/useVisitorTracker.ts`
- `supabase/functions/...` (nueva función backend para tracking)
- `supabase/config.toml` solo si la función requiere configuración específica; si no, no se toca.

## Detalles técnicos
- No hace falta cambiar la tabla `page_views` ni sus RPC actuales.
- No hace falta tocar el panel admin salvo validación.
- Las visitas históricas que ya están con `country = null` seguirán viéndose como `Desconocido`; el arreglo aplica a visitas nuevas.
- También ajustaré los comentarios del hook para que reflejen el flujo real y no el flujo antiguo cliente-only.

## Resultado esperado
Después del cambio, una visita nueva a `/` o cualquier ruta trackeada deberá guardarse con país/ciudad poblados, y la pestaña `Visitantes` empezará a mostrar países reales en lugar de solo `Desconocido`.