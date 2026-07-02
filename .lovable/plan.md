# Preview de mejoras: Footer, Newsletter, Top Bar y Testimonios

Cuatro cambios visuales en la página principal, respetando la identidad de Catarsis (Rich Black, Raspberry, Xanthous, Phudu/DM Sans). Se conservan enlaces y datos actuales; solo cambia la presentación.

## 1) Top Bar superior (imagen 3)

Barra delgada fija en la parte más alta del layout, sobre el `MenuHeader`.

- Alto: ~40 px.
- Fondo: Rich Black con leve tono (por ejemplo `#1a2540`) para diferenciarla del header principal.
- Lado izquierdo: íconos de contacto (email, Instagram, WhatsApp) en blanco, tamaño compacto.
- Centro/derecha: texto "ABRIMOS TODOS LOS DÍAS · Click para ver los horarios" — clickeable, abre un pequeño popover con los horarios de Lechería y Caracas.
- Oculta en móvil (< 768 px) para no saturar; en móvil solo aparece a partir de tablet.
- Nuevo componente: `src/components/TopBar.tsx`.
- Integrado en `src/pages/Index.tsx` (y opcionalmente en las demás páginas públicas).

## 2) Footer reestructurado (imagen 1)

Reemplaza el footer horizontal actual por un layout de **4 columnas** en desktop, apiladas en móvil.

```text
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  HORARIOS   │  DIRECCIÓN  │ CONTÁCTANOS │ INFORMACIÓN │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ LECHERÍA:   │ LECHERÍA    │ WhatsApp    │ Políticas   │
│ Lun-Dom     │ CC Aventura │ Lechería:   │ de          │
│ 12pm–10pm   │ Plaza…      │ 0424-…      │ Privacidad  │
│             │             │             │             │
│ CARACAS:    │ CARACAS     │ WhatsApp    │ Términos    │
│ Lun-Dom     │ Los Palos   │ Caracas:    │ de Servicio │
│ 12pm–10pm   │ Grandes…    │ 0424-…      │             │
│             │             │ [✉][ig][wa] │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
     Powered by Catarsis © 2026        ·        Créditos
```

- Títulos de columna en Phudu, mayúsculas, tamaño pequeño.
- Datos en DM Sans, con horarios en negrita.
- Íconos sociales agrupados en la columna "Contáctanos" en pequeñas cápsulas raspberry (consistentes con el estilo actual).
- Barra inferior con copyright a la izquierda y créditos ("Diseñado por Adrian Morales") a la derecha.
- Se conservan todos los enlaces existentes (Instagram, Facebook, TikTok, YouTube, WhatsApp, Maps, Términos, Sitemap).
- Se elimina el actual bloque de badges centralizados; los datos se reparten en las 4 columnas.
- Archivo afectado: `src/components/Footer.tsx` (reescritura interna, misma export `Footer` y `TapeDivider`).

## 3) Bloque de captación de correos / Newsletter (imagen 2)

Sección nueva ubicada **justo antes del Footer**, después del `ReviewCTA`.

- Contenedor ancho, fondo Rich Black con borde redondeado suave y sombra sutil.
- Ícono avión de papel (Lucide `Send`) centrado en la parte superior.
- Título "¡Suscríbete!" en Phudu blanco.
- Formulario en una sola fila: input `Correo electrónico` + botón `Registrarme` (píldora blanca outline, con hover fucsia).
- Subtítulo bajo el form: "Suscríbete a nuestro newsletter y recibe ofertas y noticias exclusivas."
- Responsive: input y botón apilados en móvil.
- Nuevo componente: `src/components/NewsletterSection.tsx`.
- Backend: guarda los correos en una nueva tabla `newsletter_subscribers` en Lovable Cloud (con RLS + GRANT según convención del proyecto), con `email`, `created_at`, `source`. Tracking Meta Pixel `Lead` (canal `newsletter`).
- Confirmación visual con toast al enviar; validación de email en el cliente.

## 4) Sección de Testimonios (imagen 4)

Nueva sección "Testimonios de nuestros clientes" ubicada **antes** del `ReviewCTA` (para reforzar prueba social antes del CTA de Google Review).

- Título "Testimonios de nuestros clientes" a la izquierda, Phudu.
- Card gris muy claro (`#F5F6F8`), grande, con bordes redondeados.
- Contenido centrado: nombre del cliente (regular) + rol/etiqueta "Cliente" (más pequeño y suave) + testimonio en cursiva serif elegante.
- Carrusel horizontal con flechas ‹ › y dots debajo (el activo alargado en negro).
- 5–6 testimonios reales/placeholder editables.
- Nuevo componente: `src/components/TestimonialsSection.tsx` usando el `Carousel` de shadcn ya presente.
- Datos iniciales hardcodeados en un array dentro del componente; opcional futuro: mover a Supabase.

## Orden final en `Index.tsx`

```text
TopBar
MenuHeader
Hero
FeaturedProducts
Search + Categorías
TestimonialsSection      ← NUEVO
ReviewCTA
NewsletterSection        ← NUEVO
TapeDivider
SemanticSEOSection
Footer (rediseñado)      ← REESTRUCTURADO
```

## Detalles técnicos

- Archivos nuevos: `TopBar.tsx`, `NewsletterSection.tsx`, `TestimonialsSection.tsx`.
- Archivo modificado: `Footer.tsx` (misma API pública), `Index.tsx` (orden y montaje).
- Migración SQL: tabla `newsletter_subscribers` + RLS + GRANT (`INSERT` para `anon`, lectura solo para `authenticated` con rol admin vía `has_role`).
- Tracking: `trackLead('newsletter')` y `trackViewContent('testimonials')` al aparecer en viewport.
- Sin cambios en la paleta ni en los tokens de diseño.
- Todos los componentes lazy-loaded siguiendo el patrón actual del `Index`.

## Fuera de alcance

- No se cambia el header principal, el hero ni las tarjetas de producto.
- No se implementa aún el envío de emails transaccionales al suscriptor (se puede añadir después con Resend/Lovable AI si lo pides).
