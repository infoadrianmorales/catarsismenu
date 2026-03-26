

## Plan: Eliminar texto descriptivo duplicado del Footer

### Problema
El Footer contiene un bloque de texto SEO (líneas 23-45) con contenido redundante respecto a `SemanticSEOSection.tsx` que aparece justo antes. El usuario ve el mismo contenido dos veces.

### Archivo a modificar
`src/components/Footer.tsx` — único cambio

### Qué se hace
- **Eliminar** líneas 23-45 (el `div` con clase `container px-4 mb-8` que contiene los 3 párrafos descriptivos)
- **Reemplazar** con el comentario indicado:
```tsx
{/* TEXTO DESCRIPTIVO ELIMINADO: Reemplazado por SemanticSEOSection
    que contiene el mismo contenido optimizado para SEO e IA.
    Ver src/components/SemanticSEOSection.tsx */}
```

### Sin cambios
- Banner "TU SPOT PARA DESCONECTAR" (líneas 16-21) se mantiene
- Logo, info, redes sociales y copyright se mantienen
- `SemanticSEOSection.tsx` no se toca
- `Index.tsx` no se toca

### Verificación
| # | Check |
|---|-------|
| 1 | Texto descriptivo aparece una sola vez (en SemanticSEOSection) |
| 2 | SemanticSEOSection con H2 y badges sigue visible |
| 3 | Banner "TU SPOT PARA DESCONECTAR" intacto |
| 4 | Ningún otro componente eliminado |
| 5 | Home carga sin errores |

