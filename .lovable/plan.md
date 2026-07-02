## Cambio en `SearchBar.tsx` (estado colapsado)

Convertir el botón redondo pequeño en una **píldora horizontal amplia** que integra ícono lupa + texto "Buscar", para que se lea como acción clara y no como un punto suelto.

### Detalles

- Forma: `rounded-full` tipo pill, alto `h-14` (igual que la barra abierta para no saltar layout al expandir).
- Ancho: `min-w-[220px]` en mobile, `min-w-[280px]` en desktop (queda amplio y centrado, sin quedarse chico).
- Contenido: `<Search />` (24px) + label `Buscar` (Phudu/uppercase, `text-lg`, tracking amplio).
- Color: fondo `bg-primary` (Raspberry), texto `text-primary-foreground`, sombra `shadow-primary/30` + glow.
- Micro-interacción: `hover:scale-[1.02]`, `active:scale-95`, ícono lupa hace `group-hover:rotate-12`.
- Al hacer click: sigue disparando `trackSearch('abrir_buscador')` y expande la barra a ancho completo con la animación slide actual.
- Estado abierto: sin cambios (barra completa con input, X y submit).

### Fuera de alcance

No se toca la barra expandida, el placeholder, ni la lógica de tracking del Pixel.
