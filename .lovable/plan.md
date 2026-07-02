## Objetivo
Hacer que todas las tarjetas de testimonio tengan el mismo tamaño (sin importar el largo del texto) y que roten automáticamente cada pocos segundos.

## Cambios en `src/components/SocialProofSection.tsx`

1. **Altura uniforme del recuadro**
   - Añadir una altura mínima fija al contenedor blanco del testimonio (`min-h-[280px]` en móvil, `min-h-[320px]` en desktop) para que testimonios cortos y largos ocupen el mismo espacio vertical.
   - Centrar verticalmente el contenido con `flex flex-col justify-center`.
   - Limitar el ancho de la cita (`max-w-2xl mx-auto`) — ya existe — y mantener line-height consistente.

2. **Autoplay del carrusel**
   - Añadir un `useEffect` con `setInterval` de **6 segundos** que llame a `next()` automáticamente.
   - Pausar el autoplay al hacer hover sobre la tarjeta (estado `isPaused`) y al interactuar con los controles (flechas / dots reinician el timer).
   - Limpiar el intervalo en el cleanup del efecto.
   - Respetar `prefers-reduced-motion`: si el usuario lo tiene activado, no se auto-avanza.

3. **Transición suave**
   - Añadir un `key={index}` con animación de fade sutil (clase Tailwind `animate-in fade-in duration-500`) al bloque del testimonio activo para que el cambio no sea brusco.

## Sin cambios
- El CTA de reseña Google (bloque azul inferior) se mantiene igual.
- Los 7 testimonios y su contenido no se modifican.

## Nota técnica
Duración: 6s por testimonio (equilibrio entre lectura cómoda y rotación visible). Si prefieres 4s u 8s, avísame y lo ajusto.