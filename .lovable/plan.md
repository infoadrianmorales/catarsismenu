

## Optimizaciones de UX y Rendimiento

### 1. Agregar `<noscript>` fallback para Meta Pixel

Actualmente falta el tag `<noscript>` en `index.html`. Este tag es necesario para que Meta pueda rastrear usuarios que tienen JavaScript deshabilitado, y tambien es requerido por el verificador de Pixel de Meta.

**Archivo:** `index.html`
- Agregar el tag `<noscript>` con el pixel image justo despues de `<body>`, usando el pixel ID desde la configuracion dinamica (hardcoded como fallback)

### 2. Imagen del ProductPage sin OptimizedImage

La pagina de detalle de producto (`ProductPage.tsx`) usa un `<img>` directo en lugar de `OptimizedImage`. Esto significa que no aprovecha WebP responsivo, lazy loading con IntersectionObserver, ni srcset.

**Archivo:** `src/pages/ProductPage.tsx`
- Reemplazar el `<img>` por `<OptimizedImage>` con `variant="full"` y `loading="eager"`
- Eliminar el estado `imageLoaded` manual ya que `OptimizedImage` lo gestiona internamente

### 3. Prefetch de la pagina de producto al hover

Cuando un usuario pasa el dedo o mouse sobre una tarjeta de producto, podemos pre-cargar la imagen en tamano completo para que al entrar a la pagina de detalle, la imagen ya este en cache.

**Archivo:** `src/components/CompactProductCard.tsx` y `src/components/MenuCard.tsx`
- Agregar `onMouseEnter` / `onTouchStart` en el Link que haga un `new Image().src = item.imagen` para pre-cargar la imagen full

### 4. Skeleton del Hero con altura fija para evitar CLS

El Hero Section no muestra skeleton mientras carga los slides, lo que puede causar Content Layout Shift (CLS). Si los slides tardan, el contenido salta.

**Archivo:** `src/components/HeroSection.tsx`
- Agregar un skeleton/placeholder con `min-h-[60vh]` mientras `loading` es true, evitando el salto de contenido

### 5. Mejorar accesibilidad del formulario de checkout

El formulario de checkout no tiene `aria-describedby` para los mensajes de error, ni `aria-invalid` en los campos con error. Esto afecta la experiencia con lectores de pantalla.

**Archivo:** `src/pages/Checkout.tsx`
- Agregar `aria-invalid={!!errors.fieldName}` y `aria-describedby` a los inputs con error
- Agregar `role="alert"` a los mensajes de error

### Resumen de cambios

| Archivo | Cambio | Impacto |
|---------|--------|---------|
| `index.html` | Agregar `<noscript>` pixel tag | Meta Pixel: tracking sin JS |
| `src/pages/ProductPage.tsx` | Usar `OptimizedImage` en vez de `<img>` | Rendimiento: WebP + srcset |
| `src/components/CompactProductCard.tsx` | Prefetch imagen al hover | UX: carga instantanea del detalle |
| `src/components/MenuCard.tsx` | Prefetch imagen al hover | UX: carga instantanea del detalle |
| `src/components/HeroSection.tsx` | Skeleton durante carga de slides | Rendimiento: menos CLS |
| `src/pages/Checkout.tsx` | Atributos ARIA en campos de error | Accesibilidad |

