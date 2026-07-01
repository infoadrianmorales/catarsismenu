## Contexto

El evento `Search` ya se dispara en dos puntos:

- `src/hooks/useSearch.ts` — debounce 800 ms cuando el usuario escribe (mín. 3 caracteres).
- `src/components/SearchBar.tsx` — al enviar el formulario (submit).

Ambos llaman a `trackSearch(query)` en `src/lib/metaPixel.ts`, que envía `fbq('track', 'Search', { search_string })` con `eventID` único y además registra el disparo en `localStorage.__fb_event_log`.

Si Meta Events Manager no lo está viendo, las causas más probables son:

1. El pixel aún no está inicializado cuando se dispara (queda encolado, pero si el usuario cierra la pestaña antes del init, se pierde).
2. Un bloqueador de anuncios/DNS filtra `connect.facebook.net` o `www.facebook.com/tr`.
3. Se está mirando la pestaña **Overview** (que tarda ~20 min y solo muestra volúmenes altos) en vez de **Test Events**.
4. `Search` está desactivado o filtrado en la config del pixel en Meta.

## Plan

### 1. Verificación en vivo (sin código)

Antes de tocar nada, confirmar en `catarsiszone.com`:

1. Abrir DevTools → Network → filtrar por `facebook.com/tr`.
2. Escribir en la barra de búsqueda "coca" y esperar 1 segundo.
3. Debería aparecer una request `GET https://www.facebook.com/tr/?id=<PIXEL_ID>&ev=Search&cd[search_string]=coca...`.
4. En consola: `JSON.parse(localStorage.__fb_event_log).Search` — debe mostrar `count` y `lastFiredAt`.
5. En Meta Events Manager → **Test Events** con el navegador conectado, debería listar `Search` en tiempo real.

Con eso sabemos exactamente en qué eslabón se rompe (cliente no dispara / dispara pero red bloquea / red ok pero Meta no lo cuenta).

### 2. Endurecer el disparo (código)

Aunque el trigger existe, hay 3 mejoras concretas:

**a) Disparar `Search` también al presionar Enter aunque tenga <3 chars ignorar, pero flushear el debounce al submit para evitar duplicados**
En `SearchBar.tsx` el submit ya llama `trackSearch` — mantener, pero limpiar el timeout del hook para no enviar dos `Search` seguidos con el mismo string.

**b) Reintento tras init del pixel**
Actualmente `safeFbq` encola si el pixel no está listo y drena tras `initMetaPixel`. Confirmar que la cola realmente se drena en el orden correcto y añadir un `console.debug('[MetaPixel] flushed', N)` para verlo en Network.

**c) Fallback con `sendBeacon`**
Si la búsqueda ocurre justo antes de navegar a la página de producto, la request de `fbq` puede cancelarse. Añadir un ping `navigator.sendBeacon('https://www.facebook.com/tr/?...&ev=Search&...')` en paralelo cuando `document.visibilityState === 'hidden'` está por cambiar. Esto es un patch defensivo — solo si el paso 1 muestra requests canceladas.

### 3. Validar

- Tras desplegar, repetir el paso 1 y confirmar la request `ev=Search` con status 200 y `search_string` correcto.
- En **Events Manager → Test Events**, ver `Search` con "Received".

## Preguntas para el usuario

Antes de tocar código me sirve saber:

1. ¿En qué pantalla de Meta estás mirando? (Overview, Diagnostics, Test Events)
2. ¿Estás probando desde el dominio publicado `catarsiszone.com` o desde el preview?
3. ¿Puedes abrir DevTools → Network en `catarsiszone.com`, buscar algo, y decirme si aparece una request a `facebook.com/tr?...ev=Search...`?

Con esa info aplico el fix mínimo necesario en vez de reescribir todo el flujo.
