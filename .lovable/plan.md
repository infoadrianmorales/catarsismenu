

## Auditoría (Fase 1)

| Elemento | Clases/estilos actuales |
|----------|----------------------|
| `<h2>` (L41) | `font-display text-2xl md:text-3xl font-bold`, color `#F2B60F` |
| `<p>` (L47 wrapper) | `text-gray-300 leading-relaxed` (sin tamaño explícito = `text-base` por defecto) |
| Badges (L89) | `text-sm`, `px-4 py-2` |

## Plan: Reducir tipografía en SemanticSEOSection.tsx

### Archivo a modificar
`src/components/SemanticSEOSection.tsx` — único cambio

### Cambios

1. **H2 (L41)**: `text-2xl md:text-3xl font-bold` → `text-xl md:text-2xl font-semibold`
2. **Wrapper de párrafos (L47)**: agregar `text-sm md:text-base` al div (mantiene `text-gray-300 leading-relaxed`)
3. **Badges (L89)**: `text-sm` → `text-xs md:text-sm`, `px-4 py-2` → `px-3 py-1.5`
4. **Comentario**: Agregar bloque explicativo sobre tipografía reducida después del comentario de badges (L82)

### Sin cambios
- Contenido de texto idéntico
- Colores, fondo, iconos intactos
- Sección sigue visible

