# Botón de reseña de Google

## Ubicación
Insertar la tarjeta justo antes del `Footer` en la home (`src/pages/Index.tsx`), después de la última sección de contenido. Así queda visible al final del recorrido, cuando el usuario ya vio el menú y es más probable que quiera dejar reseña.

Alternativa: sólo mostrarla en la página de "Pedido confirmado" (`OrderConfirmed.tsx`) tras completar la orden. Por defecto voy con la home + confirmación de pedido para maximizar visibilidad.

## Componente
Crear `src/components/ReviewCTA.tsx` con el diseño Raspberry seleccionado:
- Fondo `#DB1F51`, sombra dura amarilla `#FFB800`, borde negro, textura halftone.
- Título "CUÉNTANOS" en Phudu, 5 estrellas amarillas, botón blanco con logo de Google + "DÉJANOS TU RESEÑA".
- Usar tokens semánticos del design system (raspberry, xanthous, rich-black) — sin hardcodear colores.
- Hover: leve translate + sombra extendida (como el prototipo).

## Link de Google
El botón abrirá el link de reseñas del negocio. Necesito la URL exacta — usaré un placeholder por ahora: `https://g.page/r/CATARSIS/review` y lo dejaré como constante fácil de editar en el componente. Se abre en nueva pestaña (`target="_blank"`, `rel="noopener"`).

## Tracking
Disparar evento `Contact` de Meta Pixel (`trackContact('google_review')`) al hacer clic para medir intención.

## Archivos
- Crear: `src/components/ReviewCTA.tsx`
- Editar: `src/pages/Index.tsx` (insertar `<ReviewCTA />` antes del Footer)
- Editar: `src/pages/OrderConfirmed.tsx` (insertar también tras el mensaje de confirmación)

## Pregunta pendiente
¿Cuál es el link real de reseñas de Google del negocio? Si no lo tienes a mano, dejo el placeholder y lo actualizas después en el componente.
