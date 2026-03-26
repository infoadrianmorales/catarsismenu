

## Auditoría (Fase 1)

| # | Pregunta | Resultado |
|---|----------|-----------|
| 1 | Fuentes externas | Google Fonts en `index.html` L41-44 con `<link rel="stylesheet">` síncrono. Ya tiene `preconnect` y `display=swap`, pero **bloquea el render** porque es un `<link rel="stylesheet">` normal |
| 2 | Scripts sin defer/async | El Facebook Pixel (L92-101) es inline `<script>` sin defer. Ya carga `fbevents.js` con `t.async=!0` internamente |
| 3 | Facebook Pixel defer | No tiene defer. El script inline está en `<head>`. Internamente usa `async=true` para el JS externo |
| 4 | Imagen hero principal | `src/assets/banner-hero.png` — importada como módulo en HeroSection. En producción Vite la hashea, así que no se puede hacer preload estático con ruta fija. Las imágenes reales vienen de la DB (`useHeroSlides`) |
| 5 | Min-height en hero | Ya tiene: `min-h-[45vh] md:min-h-[70vh]` en el contenedor de imagen, y `md:min-h-[70vh]` en la section |
| 6 | Navigate /menu | No existe. `/menu` renderiza `<Menu />` directamente (L66) |

---

## Plan de Correcciones (Fase 2)

### Corrección 1 — Fuentes no bloqueantes
**`index.html` L41-44** — Reemplazar el `<link rel="stylesheet">` síncrono de Google Fonts con carga no bloqueante usando `media="print" onload="this.media='all'"` + `<noscript>` fallback. Mantener los `preconnect` existentes. Agregar comentario de performance.

### Corrección 2 — Facebook Pixel al final del body
**`index.html` L92-101** — Mover el bloque inline del Facebook Pixel desde `<head>` al final de `<body>` (antes de `</body>`), justo después de `<script type="module" src="/src/main.tsx">`. No agregar defer al script inline (no aplica). Agregar comentario explicativo.

### Corrección 3 — Preload de imagen hero
**`index.html`** — No aplicar. La imagen hero viene de la DB (URLs dinámicas de Supabase Storage vía `useHeroSlides`), y el fallback es un asset de Vite con hash dinámico. Un `<link rel="preload">` con ruta estática no funcionaría. **Documentar con comentario** en `index.html` explicando por qué no se aplica preload estático.

### Corrección 4 — Min-height hero (ya existe)
Sin cambios. HeroSection ya tiene `min-h-[45vh] md:min-h-[70vh]`. Agregar un comentario de performance en `HeroSection.tsx` documentando que el min-height ya previene CLS.

### Corrección 5 — Redirect /menu (ya correcto)
Sin cambios. No existe `<Navigate>` de `/menu` a `/`. Ya tiene comentario en App.tsx confirmándolo.

### Resumen de archivos

| Archivo | Cambio |
|---------|--------|
| `index.html` | Fuentes no bloqueantes (media=print+onload), mover Pixel al body, comentario sobre preload no aplicable |
| `src/components/HeroSection.tsx` | Solo comentario documentando min-height existente |

### Lo que NO se toca
- Schemas (RestaurantSchema, LocalBusinessSchema, FAQSchema)
- SemanticSEOSection
- Contenido existente
- App.tsx (ya correcto)

