# Ajustes: unificar Testimonios+Reseña y restaurar info original del Footer

## 1) Bloque unificado Testimonios + Reseña Google

Fusionar `TestimonialsSection` y `ReviewCTA` en un único componente `SocialProofSection.tsx` con un solo contenedor visual:

- Card gris claro (`#F5F6F8`) grande y redondeada.
- Arriba: título "TESTIMONIOS DE NUESTROS CLIENTES" (Phudu blanco, fuera de la card).
- Dentro de la card: carrusel de testimonios (nombre + rol + cita en cursiva serif + dots).
- Separador sutil horizontal.
- Debajo (misma card): bloque "¿Qué te pareció **Catarsis**?" a la izquierda + 5 estrellas amarillas y botón "Déjanos tu reseña" a la derecha (mismo diseño actual del ReviewCTA pero adaptado a fondo claro: texto oscuro, botón raspberry).
- Se elimina el import y uso separado de `ReviewCTA` y `TestimonialsSection` en `Index.tsx`.
- Se conserva el tracking `trackContact('google_review')`.

## 2) Footer — restaurar datos originales de Catarsis

Corregir los datos que se inventaron y volver a la información real:

- **Horarios**: solo Lechería. `Lun-Dom · 12:00 PM – 1:00 AM` (dato original).
- **Dirección**: solo Lechería. `CC Aventura Plaza, Lechería, Anzoátegui` con enlace a `https://maps.google.com/?q=Catarsis+Lecheria` (original).
- **Contáctanos**: solo un WhatsApp → `+58 424-905-6438` (link `https://api.whatsapp.com/send?phone=584249056438`). Íconos sociales: **Instagram, TikTok, Facebook, YouTube** (se quitan Mail y WhatsApp de la fila de íconos, y también los teléfonos/direcciones inventados de Caracas).
- **Información**: solo `Términos y condiciones` (`/terminos-y-condiciones`) y `Sitemap` (`/sitemap.xml`) — los enlaces que existían antes. Se eliminan las políticas de Privacidad/Reembolso/Delivery que no existen como rutas.
- Se mantiene el layout de 4 columnas, tipografía Phudu para títulos y el copyright inferior con "Diseñado por Adrian Morales".

## Archivos afectados

- Nuevo: `src/components/SocialProofSection.tsx` (fusiona testimonios + reseña).
- Modificado: `src/components/Footer.tsx` (datos originales restaurados).
- Modificado: `src/pages/Index.tsx` (reemplaza los 2 lazy imports por uno solo).
- Eliminar: `src/components/TestimonialsSection.tsx` y `src/components/ReviewCTA.tsx` — o dejarlos sin uso. Propuesta: eliminarlos para mantener el código limpio.

## Sobre el almacenamiento del newsletter

Los correos ya se guardan en la tabla `newsletter_subscribers` de Lovable Cloud (visible solo para admins). Si quieres, en un paso siguiente puedo añadir una vista en el panel de administrador (Marketing → Suscriptores) con lista, buscador y exportación CSV. **Fuera del alcance de este plan** salvo que lo confirmes.

## Fuera de alcance

- No se modifica la TopBar ni el bloque de Newsletter (ya aprobados en el paso anterior).
- No se cambia la información visible en la SemanticSEOSection.
