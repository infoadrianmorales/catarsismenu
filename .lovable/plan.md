Cambiar el botón "Agregar al carrito" en la página de producto para que sea más grande, con mejor contraste y efectos de hover que inviten al clic.

## Cambios en `src/pages/ProductPage.tsx`

Reemplazar el botón CTA actual (líneas ~229-236) por una versión con:
- Forma **pill/redonda completa** (`rounded-full`)
- Fondo **Raspberry sólido** (`bg-primary`) con texto blanco
- **Texto más grande** en Phudu (`text-xl`, `font-display`, `font-bold`, `uppercase`, `tracking-tight`)
- **Icono de carrito más grande** (`h-6 w-6`) con animación de escala en hover (`group-hover:scale-110`)
- **Hover efecto**: levantamiento sutil (`-translate-y-1`), sombra rosa (`shadow-[...]`) y glow amarillo tenue (`shadow-[...]`) para destacar la acción
- **Línea de acento amarilla** (`bg-secondary`) que aparece en la parte inferior del botón al hacer hover
- Estado active con leve reducción de escala (`active:scale-[0.98]`)

No se toca lógica de negocio (onClick, quantity, etc.) — solo estilos y clases Tailwind.

No se requieren cambios en otros archivos ni nuevas dependencias.