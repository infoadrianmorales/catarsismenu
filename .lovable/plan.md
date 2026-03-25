

## Plan: Agregar sección semántica SEO antes del Footer

### Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `src/components/SemanticSEOSection.tsx` | **Crear** — componente con texto semántico, badges y comentarios |
| `src/pages/Index.tsx` | **Modificar** — importar y agregar `<SemanticSEOSection />` antes de `<Footer />` |

### CAMBIO 1 — SemanticSEOSection.tsx (nuevo)

Componente `<section>` con:
- Fondo `#010C23` (Rich Black), borde superior `#DB1F51` al 20% opacidad
- `py-16 px-6`, `max-w-4xl mx-auto`
- `<h2>` con la pregunta SEO en color `#F2B60F` (Xanthous), fuente display
- 4 `<p>` con el texto exacto del prompt, color `text-gray-300`
- 3 badges debajo: ubicación, horario, pagos — con iconos y fondo sutil `#DB1F51/10`
- Bloque de comentarios explicativo al inicio del componente

### CAMBIO 2 — Index.tsx

- Agregar import de `SemanticSEOSection`
- Insertar `<SemanticSEOSection />` justo antes de `<Footer />` (línea ~113 actual)
- Comentario explicativo junto al import y en el JSX

### Sin cambios
- Ningún componente existente se elimina ni se mueve
- El orden de renderizado se mantiene idéntico salvo la inserción

