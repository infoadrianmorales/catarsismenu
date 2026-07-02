## Problema
Aunque el recuadro tiene altura mínima fija, los controles (flechas + dots) se mueven verticalmente porque están inmediatamente debajo del texto y el bloque completo está centrado con `justify-center`. Testimonios cortos suben los controles; los largos los bajan.

## Solución en `src/components/SocialProofSection.tsx`

Anclar los controles al fondo del recuadro para que su posición sea constante:

1. Cambiar el contenedor blanco de `justify-center` a `justify-between` y añadir un spacer superior (`<div />`) para mantener el testimonio centrado ópticamente entre el spacer y los controles.
2. Los controles (flechas + dots) quedan siempre pegados al borde inferior del recuadro con padding constante.
3. Mantener la altura mínima ya establecida (`min-h-[300px] sm:min-h-[340px]`) para que el bloque no colapse.

Resultado: el deslizador (flechas y dots) permanece en la misma coordenada Y sin importar el largo del testimonio.