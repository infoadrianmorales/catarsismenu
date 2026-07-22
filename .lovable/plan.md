## Diagnóstico

Reproduje la home en `catarsiszone.com` con viewport móvil (390×1800, user-agent iPhone) desde Playwright y **todos los productos y categorías cargan bien** (10 encabezados de categoría + 45 imágenes). También confirmé que **no hay Service Worker** ni PWA cacheando builds viejos.

Tu captura, sin embargo, muestra un salto directo desde el filtro de categorías a "TESTIMONIOS" — es decir, **desaparecen** `Productos Destacados` **y las 8 secciones de categoría**. Sólo se ven las chips virtuales "Todos" y "Best Seller" (que no vienen de la DB).

Cruzando eso con el código (`src/pages/Index.tsx` + `src/hooks/useProducts.ts` + `src/hooks/usePublicCategories.ts`), la única forma de llegar a ese estado exacto es:

- La consulta a `products` devuelve vacío o falla **y**
- La consulta a `categories` también devuelve vacío o falla

Cuando eso pasa hoy:

- `FeaturedProducts` recibe `[]` → retorna `null` (desaparece).
- `sectionCategories` queda sólo con la virtual `best-seller` → como los productos también están vacíos, cada `CategorySection` retorna `null` (desaparece).
- El `loading` ya resolvió a `false`, así que **no se muestra skeleton, no se muestra error, no se muestra fallback** — simplemente todo se colapsa y aparece el bloque siguiente (Testimonios).

Es un fallo silencioso: cualquier cosa que rompa las peticiones a Cloud en Safari iOS de ese dispositivo específico (una extensión bloqueando, un TLS handshake que falla, un `fetch` cortado, etc.) resulta en una página muerta sin ninguna pista para el usuario.

## Objetivo

Que **nunca** vuelva a pasar que la home aparezca vacía en móvil, y si algo falla, tener señal clara para diagnosticarlo.

## Cambios propuestos

### 1. Fallback robusto de categorías (`src/hooks/usePublicCategories.ts`)

Si la consulta a `categories` devuelve error o vacío, usar una **lista hardcodeada de las 8 categorías reales** (entradas, hamburguesas, emparedados, pizzas, parrilla, ensaladas, bebidas, coctelería) como respaldo. Esto asegura que `sectionCategories` **nunca** sea sólo `best-seller`, y por lo tanto los productos (aunque vengan del fallback estático) siempre encuentren dónde renderizarse.

### 2. Exponer error real en `useProducts` y `usePublicCategories`

Actualmente el error de la query se traga silenciosamente. Retornar `error` explícito para que `Index.tsx` pueda distinguir entre "cargando", "ok con datos" y "falló la conexión".

### 3. Estado de error visible en `src/pages/Index.tsx`

Si ambas queries fallan, mostrar un banner suave (no bloqueante) tipo "Estamos teniendo problemas para cargar el menú, reintentando…" con botón **Reintentar** que invalide el cache de React Query. Nunca dejar la página en blanco entre filtros y testimonios.

### 4. Reintento agresivo en React Query para las queries críticas

Añadir `retry: 3` con `retryDelay` exponencial a las queries de `products`, `best-sellers` y `categories`. Hoy no tienen `retry` explícito (usan el default de React Query, pero con `staleTime` largo se puede quedar pegado a un fallo temprano).

### 5. Telemetría de fallo (opcional pero recomendado)

Registrar en `page_views` (o en un `console.error` con etiqueta `[HOME_EMPTY]`) cuando `products.length === 0 && sectionCategories.length <= 1` después de resolver loading. Así, si vuelve a pasar en un dispositivo real, queda huella para revisar.

### 6. Verificación

Después de aplicar los cambios:

- Correr Playwright contra `localhost:8080` con viewport móvil y **simular fallo de red hacia `qucqigemdbyclxqjzkbs.supabase.co`** para confirmar que el fallback estático sí renderiza las 8 categorías.
- Correr contra `catarsiszone.com` publicado (después del deploy) para confirmar que el estado normal sigue intacto.

## Detalles técnicos

Archivos a tocar (todos frontend, sin cambios de schema ni edge functions):

```text
src/hooks/usePublicCategories.ts   -> fallback hardcoded + expose error
src/hooks/useProducts.ts           -> retry config + expose error
src/pages/Index.tsx                -> error banner + retry button + siempre renderizar algo
```

Ninguna migración de DB, ningún cambio en las RLS/GRANTs (ya validé que los datos están y son accesibles desde el anon key), ningún cambio en Meta Pixel/CAPI.

## Fuera de alcance

- No voy a tocar el layout mobile de `MenuHeader`, `SearchBar`, `CategoryFilter` ni testimonios — se ven correctos en la captura.
- No voy a eliminar el fallback `staticMenuItems`; al contrario, este plan lo aprovecha mejor.
