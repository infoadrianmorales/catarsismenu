## Ajuste de fondos en `src/components/SocialProofSection.tsx`

Mantener el bloque unificado (una sola card redondeada) pero con dos zonas de color diferenciadas:

**Zona 1 — Testimonios (arriba): fondo blanco**
- Contenedor: `bg-white`.
- Nombre y quote: `text-[#010C23]`.
- Rol: `text-[#010C23]/60`.
- Flechas del carrusel: `text-[#010C23]/50 → hover:text-[#010C23]`.
- Dots: activo `bg-[#010C23]` (w-6), inactivos `bg-[#010C23]/25`.

**Separador**: se elimina la línea divisoria (el cambio de color ya separa visualmente).

**Zona 2 — CTA reseña (abajo): fondo azul de marca `#010C23` (Rich Black / azul noche)**
- Contenedor: `bg-[#010C23]`.
- Título en blanco con "Catarsis" en `#DB1F51`.
- Descripción: `text-white/70`.
- Estrellas amarillas `#FFB800` sin cambios.
- Botón Raspberry `#DB1F51` sin cambios.

**Wrapper de la card**: quitar el `bg-[#010C23]` global y el `border-white/10` (cada zona ya trae su fondo); mantener `rounded-3xl overflow-hidden` para que las esquinas recorten limpiamente ambas zonas.

Sin cambios en tipografías, estructura, ni contenido de las reseñas.