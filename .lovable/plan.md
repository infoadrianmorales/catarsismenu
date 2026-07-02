## Objetivo
Que al hacer clic en el logo de Catarsis (header y footer) el usuario vuelva al inicio del sitio.

## Cambios

### 1. `src/components/MenuHeader.tsx`
Envolver el `<img>` del logo en un `<Link to="/">` de `react-router-dom` con `aria-label="Ir al inicio"`. Se usa ruta interna (no URL absoluta a catarsiszone.com) para:
- Evitar recargar la página completa (mejor UX y no perder el carrito).
- Funcionar correctamente en los 4 dominios activos (catarsiszone.com, catarsisve.com, lovable.app) — todos apuntan al mismo sitio, así que `/` siempre lleva al home correcto.

### 2. `src/components/Footer.tsx`
Envolver el `<img>` del logo blanco en un `<Link to="/">` con el mismo `aria-label`. Mantener `loading="lazy"` y dimensiones para no romper CLS.

## Nota sobre la URL
No se usará `https://www.catarsiszone.com` como href absoluto porque forzaría una recarga y sacaría al usuario del dominio en el que está navegando (por ejemplo, si entró por `catarsisve.com`). Si prefieres que SIEMPRE redirija al dominio principal aunque estén en otro, dímelo y lo cambio a `<a href="https://www.catarsiszone.com">`.

## Fuera de alcance
`menuPdfExport.ts` (el logo ahí es una imagen embebida en el PDF, no navegable).