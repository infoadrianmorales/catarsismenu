## Cambios en `src/components/CategorySection.tsx`

1. **Texto del botón**: reemplazar `Ver todos los {title} ({totalCount})` por `Ver toda la categoría ({totalCount})`. Así se evitan concordancias raras como "VER TODOS LOS COCTELERÍA".

2. **Color del CTA grande**: cambiar de Raspberry a Xanthous (amarillo de marca `#FFB800`).
   - Fondo: `bg-[#FFB800]` con hover `hover:bg-[#FFB800]/90`.
   - Texto: `text-[#010C23]` (Rich Black) para máximo contraste sobre amarillo.
   - Conservar `rounded-full`, `px-8 py-4`, `font-display font-black uppercase`, sombra y micro-interacción hover.

No se modifica nada más: el link pequeño "Ver todo" arriba a la derecha se mantiene en Raspberry accesible, y la lógica de mostrar 4 productos + botón cuando hay más queda igual.