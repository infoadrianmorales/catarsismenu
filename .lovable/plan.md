## Objetivo
Añadir un menú hamburguesa (☰) a la izquierda del logo con: buscador en vivo, categorías, horario y contacto.

## Sugerencias antes de ejecutar

Reviso el prompt y detecto varios puntos que conviene ajustar antes de codearlo:

**1. JSX roto en el snippet pegado**
El código del prompt llega con las etiquetas `<...>` eliminadas por el formateador de chat (se ve `Icon` suelto, `input` sin apertura, etc.). Voy a reescribir el componente completo desde cero respetando la intención, no copiar tal cual.

**2. Ruta de producto incorrecta**
El prompt navega a `/${categoria}/${slug}`, pero en `App.tsx` la ruta real es `/producto/:slug`. Uso `/producto/${slug}` para no romper la navegación.

**3. Color `#14B2AA` (teal) fuera de branding**
El proyecto usa Raspberry `#DB1F51` y Xanthous `#FFB800` (memoria core). Cambio el focus ring y acentos a Raspberry para respetar la identidad.

**4. Horario duplicado y hardcodeado**
Ya existe `TopBar.tsx` con el horario oficial (Lechería, Lun–Dom 12:00 PM–1:00 AM) en un popover. Repetirlo en el hamburguesa duplica info. Propongo dos opciones:
- **A (recomendada):** Mostrar el horario en el hamburguesa igual, pero leer el string una sola vez desde una constante compartida (o replicar el mismo texto exacto de `TopBar`) para que si mañana cambia, no queden desfasados.
- **B:** Omitir el bloque horario del hamburguesa (ya está en TopBar y Footer).

**5. Redundancia con navegación móvil existente**
Confirmar: ¿el hamburguesa debe aparecer en **desktop + móvil** o solo en móvil? El header actual no tiene un menú móvil dedicado, así que asumo **ambos**, pero conviene confirmarlo.

**6. Best-seller doble ícono**
El prompt renderiza `<Icon />` y además prefija `🔥` al nombre para best-seller. Queda ruidoso. Uso solo el ícono del hook (que ya viene definido en `usePublicCategories`).

**7. `descripcion_corta` puede no existir en el tipo Product**
Uso encadenamiento opcional y también busco por `descripcion` como fallback, para evitar errores TS.

**8. Accesibilidad**
Añadir `aria-label="Abrir menú"` al trigger y `role="dialog"` no es necesario en DropdownMenu (Radix ya lo maneja), pero sí verificar tamaño táctil ≥44×44px (memoria).

## Plan de implementación (si apruebas)

1. **Crear `src/components/HamburgerMenu.tsx`** con:
   - `DropdownMenu` de shadcn, trigger con ícono `Menu` (44×44px).
   - Buscador en vivo (`Input` con `onKeyDown stopPropagation`, resultados ≥2 chars, máx 6).
   - Lista de categorías desde `usePublicCategories().sectionCategories`, usando `CATEGORY_SHORT_ROUTES` con fallback `/categoria/:slug`.
   - Bloque horario (opción A: string compartido con TopBar) y contacto (WhatsApp, Instagram, Ubicación) leídos de `appConfig`.
   - Navegación a producto: `/producto/${slug}`.
   - Colores de marca: Raspberry para acento/focus ring, fondo `#010C23`.
   - Comentarios en español explicando cada bloque.

2. **Editar `src/components/MenuHeader.tsx`**:
   - Import de `HamburgerMenu`.
   - Insertarlo dentro del `<div className="flex items-center">` (línea 37) **antes** del `<Link>` del logo, con un pequeño `gap` para que respire.
   - Comentario explicativo con fecha.

## Preguntas para ti (rápidas)
1. ¿El menú hamburguesa debe verse en **desktop y móvil** o solo en móvil?
2. ¿Prefieres **A** (mostrar horario replicado) o **B** (omitirlo porque ya está en TopBar/Footer)?

Con esas dos respuestas ejecuto de inmediato.