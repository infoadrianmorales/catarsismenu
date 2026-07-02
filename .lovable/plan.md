Mostrar el `TopBar` también en móvil, con una versión compacta que no sature.

## Cambios en `src/components/TopBar.tsx`

- Quitar `hidden md:block` → siempre visible.
- Móvil: altura `h-8`, íconos IG/Maps más pequeños, y en el botón de horarios ocultar el separador `|` y acortar el copy a solo `"Ver horarios"` con la lupa del reloj. En `md+` conservar el texto completo actual ("Abrimos todos los días | Click para ver los horarios").
- Reducir `gap` y `text-[11px]` en móvil, `text-xs` desde `md`.
- Popover mantiene el mismo contenido; `align="end"` sigue funcionando en móvil.

Resultado: en móvil se ve una franja delgada azul con IG + pin a la izquierda y "🕒 Ver horarios" a la derecha; en desktop no cambia nada.