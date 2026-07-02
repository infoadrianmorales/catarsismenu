## Rediseño de `SearchBar.tsx` — variante "Borde inclinado"

Elimino el toggle (colapsado/expandido) y dejo la barra siempre abierta con el botón **Buscar** integrado a la izquierda.

### Estructura visual (basada en la selección v3)

- Píldora `h-14 rounded-full` en `bg-background` con `border border-white/10 ring-1 ring-white/5` y `shadow-2xl`.
- Botón submit a la izquierda: `bg-primary text-primary-foreground` con ícono lupa + label "BUSCAR" (Phudu uppercase, tracking amplio).
- **Borde inclinado**: div absoluto `w-8 h-full -skew-x-12 bg-primary` fusionado al borde derecho del botón (efecto "cuchilla").
- **Yellow top-border** sobre el botón: línea `h-[2px] bg-secondary/70` en la parte superior (Xanthous).
- **Noise overlay**: capa absoluta con SVG turbulence + `opacity-[0.04] mix-blend-overlay` sobre toda la píldora.
- **Glow raspberry pulsante en focus**: capa `-inset-1.5 blur-2xl bg-primary` con `opacity-20`, `group-focus-within:opacity-50` + `animate-pulse` sólo cuando el input está enfocado.
- Detalle Xanthous a la derecha (barrita `w-1 h-4 bg-secondary/30`).

### Comportamiento

- Siempre visible (sin estado colapsado). Elimino `useState(open)` y `handleOpen`.
- El botón submit dispara `handleSubmit` → `trackSearch(value)` (evento Meta Pixel).
- Enter dentro del input también ejecuta submit → mismo evento (nativo del `<form>`).
- Botón mantiene `id="search-submit-btn"` y `data-meta-event="Search"` para validación.
- Ícono X a la derecha (dentro del input) sólo aparece si hay `value`, para limpiar.

### Fuera de alcance

No se modifica `useSearch`, ni `trackSearch`, ni la lógica de filtrado. Solo el componente `src/components/SearchBar.tsx`.
