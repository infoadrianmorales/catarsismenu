

## Plan: Reemplazar contenido de SemanticSEOSection.tsx

### Archivo a modificar
`src/components/SemanticSEOSection.tsx` — reemplazo completo

### Qué se hace
Sobreescribir todo el contenido del archivo con el código exacto proporcionado por el usuario. Cambios respecto a la versión actual:

- **Padding sección**: `py-16` → `py-10`
- **Max-width**: `max-w-4xl` → `max-w-3xl`
- **Spacing**: `space-y-6` → `space-y-4`
- **H2**: `text-xl md:text-2xl font-semibold` → `text-base md:text-lg font-semibold tracking-wide` (elimina `font-display`)
- **Párrafos**: `text-sm md:text-base text-gray-300` → `text-xs md:text-sm text-gray-400`, spacing `space-y-4` → `space-y-3`
- **Horario simplificado**: texto del tercer párrafo condensado
- **Badge horario**: texto actualizado a formato más corto
- **Badges**: `text-xs md:text-sm` → `text-xs`, padding `px-3 py-1.5` → `px-3 py-1`, gap `gap-3` → `gap-2`, iconos `h-4 w-4` → `h-3 w-3`, fondo opacity `0.1` → `0.08`
- **Comentarios**: simplificados, se eliminan los bloques extensos previos

### Sin cambios
- Estructura general (section > div > h2 + párrafos + badges)
- Colores base (#010C23, #F2B60F, #DB1F51)
- Contenido semántico (mismos 4 párrafos, mismo H2)

