## Problema

En la captura (catarsiszone.com en iPhone) el botón **"¡HAZLO ÉPICO! AGREGA EXTRAS"** aparece, pero al tocarlo no se despliega la lista de extras.

## Hipótesis principales

1. **El dominio publicado está desactualizado.** El desplegable colapsable se implementó en el turno anterior; si aún no se publica, `catarsiszone.com` sigue mostrando una versión donde el wrapper colapsable existe pero el contenido interno se rompió (o la query de extras devolvía vacío). El preview de Lovable sí tiene el código nuevo.
2. **Bug real en mobile:** el `<button>` toggle vive dentro de un `<Card>` con `overflow-hidden` y el contenido expandido usa `animate-in slide-in-from-top-2`. En algunos navegadores móviles las clases `tailwindcss-animate` mantienen el elemento con `opacity:0` si la animación no se registra. Posible también: la categoría del producto en el carrito difiere en mayúsculas/acentos del valor en `product_extras.categoria` y `getExtrasForProduct` devuelve `[]`, por lo que `ProductExtras` retorna `null` al abrirse (botón visible porque `categoryHasExtras` matchea, pero lista vacía).

## Cambios

### 1. Robustecer el matching de categoría
**Archivo:** `src/hooks/useProductExtras.ts`

Normalizar comparación: `extra.categoria.trim().toLowerCase() === categoria.trim().toLowerCase()` tanto en `getExtrasForProduct` como en `categoryHasExtras`. Esto blinda contra variaciones tipo `Hamburguesas` vs `hamburguesas`.

### 2. Garantizar render del contenido expandido
**Archivo:** `src/pages/Cart.tsx` (líneas 244-259)

- Quitar `animate-in slide-in-from-top-2 duration-200` del wrapper expandido (sustituir por simple `mt-2`) para descartar el problema de animación en mobile.
- Añadir un fallback visible cuando `getExtrasForProduct(...)` retorna `[]`: mostrar un texto pequeño *"No hay extras disponibles"* en lugar de que `ProductExtras` retorne `null` silenciosamente. Así, si el bug es de data, el usuario al menos ve respuesta al tap.
- Asegurar que el botón use `type="button"` (ya lo tiene) y añadir `onClick` con `e.stopPropagation()` por si algún padre captura.

### 3. Recordatorio de publicación
Después de los cambios, recomendar al usuario hacer **Publish** para que `catarsiszone.com` reciba la corrección. El preview de Lovable ya refleja los cambios al instante; el dominio custom sólo se actualiza al publicar.

## Fuera de alcance

- No se tocan datos en DB (los 6 extras ya están bien insertados con `categoria='hamburguesas'`).
- No se modifica la lógica de bebidas ni el resumen del pedido.
- No se cambia el diseño del botón CTA (sigue con Sparkles + Phudu + chevron).

## Validación

1. En preview mobile (414px), tocar el botón en un Thousand Smash → debe expandir lista con Tocineta, Queso facilita, Pollo crispy, Carne smash, Cebollas caramelizadas, Pepinillos.
2. Tocar de nuevo → colapsa.
3. Marcar 2 extras, colapsar, reabrir → contador `(2 agregados)` visible y checkboxes preservados.
