## Cambios

**1. `src/components/TopBar.tsx` — centrar el mensaje "Abrimos todos los días"**
- Cambiar el layout de `justify-between` a un grid de 3 columnas: íconos IG/Maps a la izquierda, texto centrado, y un placeholder invisible a la derecha para mantener la simetría (o usar `grid-cols-3` con `justify-self`).
- En móvil el texto centrado sigue siendo el corto "🕒 Ver horarios"; en desktop "🕒 Abrimos todos los días | Click para ver los horarios".
- Aplica a todos los breakpoints (móvil, tablet, desktop).

**2. `src/components/MenuHeader.tsx` — ocultar Instagram y ubicación en móvil**
- Añadir `hidden md:inline-flex` a los dos `<Button>` (Instagram y MapPin) del header para que en móvil no dupliquen los que ya están en el TopBar. En desktop/tablet se conservan tal cual.
- WhatsApp y el carrito quedan visibles en todos los tamaños.

Sin cambios en `HamburgerMenu` — allí también existen los enlaces, pero es el menú desplegable (no redundante con el TopBar).