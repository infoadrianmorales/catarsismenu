

## Best Seller como categoria promocionable en Meta Ads

### Problema actual

"Best Seller" es una categoria virtual generada por codigo, no existe en la base de datos. Por eso:
- No aparece en el feed XML que sincroniza con Meta Commerce Manager
- No se puede crear un "Product Set" en Meta para promocionar solo los best sellers
- No tiene una URL limpia para usar en anuncios

### Solucion

Usar el campo `custom_label_0` del estandar de Meta Product Feed para etiquetar automaticamente los productos best seller. Esto permite crear **Product Sets** en Meta Commerce Manager y usarlos en anuncios de Instagram/Facebook sin modificar las categorias reales de los productos.

### Cambios

**1. Edge Function: `meta-catalog-feed/index.ts`**
- Consultar tambien la vista `best_sellers_food` para obtener los IDs de los productos mas vendidos
- Agregar el campo `<g:custom_label_0>Best Seller</g:custom_label_0>` a los productos que aparezcan en esa vista
- Esto permite en Meta Commerce Manager crear un Product Set con filtro `custom_label_0 = "Best Seller"` para promociones

**2. Ruta corta: `src/App.tsx`**
- Agregar ruta `/best-seller` que renderice directamente `CategoryPage` (sin redirect, URL limpia)
- Esto permite usar `catarsiszone.com/best-seller` en anuncios de Meta

**3. Vercel rewrites: `vercel.json`**
- Agregar rewrite de `/best-seller` a `/categoria/best-seller` para produccion (invisible, mantiene URL limpia)
- Agregar rewrites para las demas categorias tambien (`/hamburguesas`, `/pizzas`, etc.)

**4. SEO: `src/pages/CategoryPage.tsx`**
- Agregar `<link rel="canonical">` apuntando a `/categoria/:slug` para evitar contenido duplicado entre `/hamburguesas` y `/categoria/hamburguesas`

### Como funciona con Meta

```text
Meta Commerce Manager
    |
    v
Feed XML (edge function) -> Productos con custom_label_0 = "Best Seller"
    |
    v
Crear Product Set en Meta: filtro custom_label_0 = "Best Seller"
    |
    v
Usar ese Product Set en anuncios de Instagram/Facebook
    |
    v
Link del anuncio: catarsiszone.com/best-seller (URL limpia)
```

### URLs disponibles para Meta Ads

| Destino | URL para anuncios |
|---------|-------------------|
| Best Seller | catarsiszone.com/best-seller |
| Hamburguesas | catarsiszone.com/hamburguesas |
| Pizzas | catarsiszone.com/pizzas |
| Emparedados | catarsiszone.com/emparedados |
| Parrilla | catarsiszone.com/parrilla |
| Entradas | catarsiszone.com/entradas |
| Ensaladas | catarsiszone.com/ensaladas |
| Cocteleria | catarsiszone.com/cocteleria |

### Detalle tecnico

**Feed XML actualizado (ejemplo de producto best seller):**
```text
<entry>
  <g:id>abc-123</g:id>
  <g:title>Smash Burger Doble</g:title>
  <g:product_type>Hamburguesas</g:product_type>
  <g:custom_label_0>Best Seller</g:custom_label_0>
  ...
</entry>
```

**Vercel rewrites (no redirects, mantiene URL visible):**
- `/best-seller` -> `/categoria/best-seller` (rewrite 200)
- `/hamburguesas` -> `/categoria/hamburguesas` (rewrite 200)
- Todas las categorias activas de la base de datos

**React Router:**
- Se agrega una ruta catch-all inteligente que verifica si el slug es una categoria valida antes de mostrar 404
- `CategoryPage` recibe el slug y funciona igual que antes

**Canonical tag:**
- Se agrega `<link rel="canonical" href="https://www.catarsiszone.com/categoria/{slug}">` para evitar penalizacion por contenido duplicado en Google

