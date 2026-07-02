## Cambios (dos archivos, solo presentación)

### 1) `src/components/ReviewCTA.tsx` — más compacto y mejor responsive

- Reducir padding del bloque: `py-14 px-4 sm:px-8` → `py-8 sm:py-10 px-4 sm:px-6`.
- Reducir tamaño del heading: `text-4xl md:text-5xl` → `text-2xl sm:text-3xl md:text-4xl`.
- Reducir párrafo: `text-base md:text-lg` → `text-sm md:text-base`, con `max-w-sm`.
- Reducir estrellas de `w-6 h-6` a `w-5 h-5` con `gap-1`.
- Botón más pequeño: `px-8 py-4` → `px-5 sm:px-6 py-2.5 sm:py-3`, texto `text-sm`, ícono `w-4 h-4`.
- Layout: en móvil apilar centrado (`flex-col text-center`), a partir de `md:` volver a split. Reducir gap a `gap-6 md:gap-8`.
- Reducir halos decorativos (`w-40 h-40` en móvil, `md:w-64 md:h-64`) para que no invadan.

### 2) `src/components/SearchBar.tsx` — mejor responsive

- Reducir contenedor: `py-8` → `py-4 sm:py-6`, altura `h-14` → `h-12 sm:h-14`.
- Botón "Buscar":
  - En móvil ocultar la palabra ("Buscar" visible sólo desde `sm:`): `<span className="hidden sm:inline …">Buscar</span>`.
  - Reducir padding móvil: `pl-6 pr-8` → `pl-4 pr-5 sm:pl-6 sm:pr-8`.
  - Ajustar `gap-3` → `gap-2 sm:gap-3` e ícono `h-5 w-5` (ok) o `h-[18px] w-[18px]` en móvil.
- Input: reducir padding izquierda en móvil `pl-8` → `pl-4 sm:pl-8`, `text-base` → `text-sm sm:text-base`, y placeholder más corto en móvil (usar prop existente si ya se pasa, si no dejar el default).
- Botón limpiar: `h-9 w-9` → `h-8 w-8 sm:h-9 sm:w-9`, `mr-2` sin cambios.
- Cuchilla inclinada (`-right-4 w-8`) mantener; solo verificar que no rompa en móvil por el reducido padding.
- Sin cambios de lógica, tracking Meta Pixel intacto.

Sin cambios en tokens de Tailwind ni en otros archivos.