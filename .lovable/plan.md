## Objetivo
Migrar URLs de producto de `/producto/{slug}` → `/{categoria}/{slug}`, sin romper enlaces existentes.

## Sugerencias / ajustes al prompt

Reviso el prompt y encontré varios puntos críticos que hay que ajustar para que la migración no rompa nada:

### 1. La ruta `/:categoria/:slug` es un cazador demasiado amplio ⚠️
En `App.tsx` existen rutas de un solo segmento (`/menu`, `/carrito`, `/checkout`, `/admin`, `/auth`, `/local`, `/orden-confirmada`, `/terminos-y-condiciones`) y de categoría (`/hamburguesas`, `/pizzas`, etc.). Un patrón `/:categoria/:slug` no colisiona con las de un solo segmento, pero sí colisiona con `/categoria/:slug` (fallback largo de categoría) — porque React Router matchea la primera declarada. Solución: **declarar `/:categoria/:slug` DESPUÉS de `/categoria/:slug`** (así "categoria" como literal gana) y validar dentro de `ProductPage` que `categoria` sea un slug de categoría válido; si no, mostrar `NotFound`. Sin esta guarda, cualquier URL de dos segmentos renderiza ProductPage y termina en pantalla en blanco.

### 2. Faltan archivos que también usan la ruta vieja
El prompt cubre `ProductPage`, `MenuCard`, `CompactProductCard`. Detecté otros que también hay que actualizar para consistencia y SEO:
- `src/components/ProductSchema.tsx` — JSON-LD schema.org `"url"`.
- `src/components/HamburgerMenu.tsx` — `navigate('/producto/${slug}')` en la búsqueda.
- `src/components/admin/MetaCatalogPanel.tsx` — texto informativo del formato de URL.
- `supabase/functions/meta-catalog-feed/index.ts` — feed XML que Meta usa para el catálogo. **Crítico**: si no se actualiza, los anuncios de Meta seguirán enviando a `/producto/{slug}` (funciona por el redirect, pero pierde señales de conversión y añade un salto extra).

### 3. `ProductRedirect` con `useProducts()` carga TODOS los productos solo para leer una categoría
Sobrecarga de red innecesaria. Alternativa mejor: consulta puntual a Supabase (`select categoria from products where slug = ?`). Más liviano y no depende del hook global. Mientras la lista carga, el prompt hace `return null` — deja pantalla en blanco. Añadir un fallback mínimo (spinner del layout ya existente) o un `<meta http-equiv="refresh">` de respaldo.

### 4. Redirect real vs client-side
El prompt aclara que es client-side. Ok mientras vivan en Lovable. Añado también un `<link rel="canonical">` apuntando a la nueva URL desde `ProductPage` para que Google consolide señales cuanto antes (ya existe `SEO` component — verificar si soporta canonical).

### 5. Sitemap: el prompt se cortó y NO genera URLs de producto
El `public/sitemap.xml` actual tiene solo 2 URLs (home + /menu), hecho a mano. No incluye productos ni categorías. Recomendación: pasar a **generador `scripts/generate-sitemap.ts`** que:
- Lea productos desde Supabase.
- Emita `/{categoria}/{slug}` por cada producto.
- Incluya cada ruta de categoría.
- Se ejecute en `predev` + `prebuild`.

Esto no está en el prompt original y **cambia el mecanismo** — según reglas del proyecto necesita tu confirmación explícita. Alternativa mínima: agregar las URLs a mano.

### 6. Slugs de categoría dinámicos
`useProducts` normaliza `categoria` a un `MenuCategory` (enum tipado). Si en el futuro se crea una categoría nueva desde el panel admin, la URL `/{nueva-categoria}/{slug}` funcionará solo si `NotFound` no la captura. La guarda de la sección 1 debe validar contra la lista dinámica de `usePublicCategories`, no contra una lista hardcodeada.

### 7. Compatibilidad con la home actual
La home usa short URLs (`/hamburguesas`) para categorías. Con la nueva regla, `/hamburguesas/mi-slug` es el producto y `/hamburguesas` es la categoría — bien, no chocan porque una es 1 segmento y la otra 2.

## Plan de implementación

**A. Router (`src/App.tsx`)**
- Import lazy: `const ProductRedirect = lazy(() => import("./pages/ProductRedirect"));`
- Reemplazar `/producto/:slug` → apunta a `<ProductRedirect />`.
- Añadir `<Route path="/:categoria/:slug" element={<ProductPage />} />` **después** de `/categoria/:slug` y todas las categorías cortas, antes de `*`.

**B. `src/pages/ProductRedirect.tsx` (nuevo)**
- Query puntual con `supabase.from('products').select('categoria').eq('slug', slug).maybeSingle()`.
- Loading → spinner discreto. Sin match → `<Navigate to="/" replace />`.
- Con match → `<Navigate to={`/${categoria}/${slug}`} replace />`.
- Comentarios con fecha.

**C. `src/pages/ProductPage.tsx`**
- `useParams<{ categoria: string; slug: string }>()`.
- Guarda: si `categoria` no está en la lista de categorías válidas → `NotFound`.
- Si `product && categoria !== product.categoria` → `<Navigate to={`/${product.categoria}/${slug}`} replace />` (URL canónica).
- Reemplazar 2 usos internos de `/producto/${slug}` por `/${product.categoria}/${product.slug}`.

**D. Componentes que enlazan a producto**
- `src/components/MenuCard.tsx`: envolver imagen + título en `<Link to={`/${item.categoria}/${item.slug}`}>`, sin envolver el botón "agregar".
- `src/components/CompactProductCard.tsx`: reemplazar los 2 `Link to`.
- `src/components/HamburgerMenu.tsx`: `navigate(`/${p.categoria}/${p.slug}`)`.
- `src/components/ProductSchema.tsx`: aceptar `categoria` como prop y usarlo en `"url"`.
- `src/components/admin/MetaCatalogPanel.tsx`: actualizar el texto de ejemplo.

**E. Edge function del feed de Meta**
- `supabase/functions/meta-catalog-feed/index.ts`: `link = ${SITE_URL}/${p.categoria}/${p.slug}`. Re-deploy.

**F. Sitemap (te consulto abajo)**

Cada archivo tocado lleva comentario `[2026-07-02] CATARSIS — …`.

## Preguntas para ti antes de ejecutar

1. **Sitemap**: ¿migro a `scripts/generate-sitemap.ts` (lee productos de la DB y emite todas las URLs automáticamente en cada build), o mantengo el estático y solo agrego un comentario recordatorio como pide el prompt?
2. **Edge function `meta-catalog-feed`**: ¿la actualizo y re-despliego en esta misma tanda? (recomendado para que Meta Ads no siga apuntando al redirect).
3. **Guarda de categorías válidas en ProductPage**: ¿ok validar contra `usePublicCategories` (dinámico, incluye nuevas categorías creadas desde admin) en vez de lista hardcodeada?