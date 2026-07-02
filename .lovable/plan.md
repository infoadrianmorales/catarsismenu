## Cambio de fondo del bloque Newsletter (`src/components/NewsletterSection.tsx`)

El fondo azul Rich Black (`#010C23`) se confunde con el fondo general de la página. Cambiar a un **blanco opaco / hueso** para que el bloque destaque.

### Ajustes

**Contenedor**
- Fondo: `bg-[#F5F6F8]` (blanco opaco, mismo tono que usábamos antes en SocialProof).
- Quitar `border-white/5`; agregar `border border-black/5` para un borde sutil.
- Mantener `rounded-3xl shadow-2xl` y el padding actual.

**Ícono avión (Send)**
- Color: `text-[#010C23]` (azul marca) en lugar de blanco.

**Título "¡SUSCRÍBETE!"**
- `text-[#010C23]` (azul marca).

**Input de correo**
- Borde: `border-[#010C23]/20`, focus `border-[#010C23]/50`.
- Texto: `text-[#010C23]`, placeholder: `placeholder:text-[#010C23]/40`.

**Botón "Registrarme"**
- Fondo: `bg-[#DB1F51]` (Raspberry) con `text-white`.
- Hover: `hover:bg-[#c11b47]`.
- Quitar el borde blanco actual.
- Así se convierte en el punto focal llamativo dentro del bloque claro.

**Texto de apoyo**
- `text-[#010C23]/60`.

### Fuera de alcance
- No se toca la estructura, el formulario, ni la lógica de suscripción a Lovable Cloud.
- No se modifica `SocialProofSection` ni ningún otro componente.
