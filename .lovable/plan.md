## Objetivo
Agregar 4 nuevos productos a la categoría **Bebidas**: Jugo de fresa, Jugo de parchita, Jugo de piña y Limonada — todos a **$4 USD**, etiquetados como **"Nuevo"**.

## Pasos

### 1. Optimizar imágenes
- Convertir las 4 imágenes subidas a **WebP**, 800×800, fondo blanco, peso <200 KB.
- Subir cada una vía `lovable-assets` al CDN y luego al bucket `product-images` de Cloud (que es donde el resto de productos guardan `imagen_url`).

### 2. Insertar productos en la tabla `products`
Cuatro filas nuevas en categoría `bebidas`, activas, con:
- `nombre`, `slug`, `descripcion_corta` según lo indicado
- `precio_usd = 4`
- `tags = ['Nuevo']`
- `imagen_url` = URL pública del bucket
- `orden` continuando desde 12 (después de las cervezas)

### 3. Verificación
- Confirmar que aparecen en Home → sección Bebidas y en `/bebidas`.
- Validar responsive y que se conserve el grid/card actual (no se toca ningún componente de UI).

## Detalles técnicos
- **No se modifica ningún componente React.** El `MenuCard` existente ya usa `loading="lazy"`, `object-contain`, aspect-ratio 1:1 y alt semántico — solo se aprovecha.
- El `alt` se toma del campo `nombre`; se garantiza que quede como "Jugo de fresa Catarsis" ajustando el nombre o dejando que MenuCard concatene la marca (verificar antes de insertar).
- No se toca `menuItems.ts` (fallback estático); los productos vienen de la BD.