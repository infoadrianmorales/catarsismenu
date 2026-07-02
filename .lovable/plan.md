## Cambio en `src/components/SocialProofSection.tsx`

Cambiar el fondo del bloque unificado (testimonios + CTA reseña) de gris claro `#F5F6F8` a **Rich Black `#010C23`** (color de marca), manteniendo la estructura de un solo bloque.

Ajustes de contraste dentro del mismo bloque:
- **Card wrapper**: `bg-[#010C23]` + un borde sutil `border border-white/10` para separarlo del fondo oscuro de la página.
- **Testimonio**: nombre y quote en blanco (`text-white`), rol y quote secundaria en `text-white/60`.
- **Controles del carrusel**: flechas y dots en tonos `white/40 → white/90` (activo blanco sólido, ancho `w-6`).
- **Separador**: `border-white/10`.
- **CTA reseña**: título en blanco con "Catarsis" en `#DB1F51`, descripción en `text-white/70`, estrellas amarillas `#FFB800` sin cambios, botón Raspberry `#DB1F51` sin cambios.

No se toca la estructura, tipografías, ni la lógica del carrusel. Solo tokens de color para asegurar legibilidad sobre el nuevo fondo oscuro.