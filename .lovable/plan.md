## Plan

1. Ajustar el bloque de testimonios para que tenga una estructura vertical fija: encabezado del cliente arriba, texto en un área central estable y controles siempre abajo.
2. Dar altura mínima fija al área del mensaje, en lugar de centrar todo el contenido con `my-auto`, para que el tamaño del testimonio no empuje los botones.
3. Anclar el deslizador y flechas en una franja inferior con altura reservada, usando `mt-auto` y dimensiones constantes.
4. Verificar visualmente en desktop y móvil que los controles queden en la misma ubicación al cambiar testimonios automáticamente o manualmente.

## Detalle técnico

- Modificar solo `src/components/SocialProofSection.tsx`.
- Reemplazar el centrado variable del contenido por una grilla/flex con zonas fijas.
- Mantener autoplay, pausa al hover y diseño actual sin agregar nuevas secciones.