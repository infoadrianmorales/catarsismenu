El producto **Ceviche Mixto** ya existe en la categoría Entradas (`slug: ceviche-mixto-tropical`). Se actualiza en vez de duplicarse. Se conservan precio, tags y demás campos existentes.

## Cambios

**1. Optimizar imagen**
- Fuente: `user-uploads://ceviche_mixto.png`.
- Procesar con Python/Pillow: componer sobre fondo blanco puro, ajustar a lienzo 800×800, exportar WebP con calidad para quedar < 200 KB (objetivo 20–60 KB).
- Subir a bucket `product-images` como `ceviche-mixto.webp`.

**2. Actualizar el producto**
- `UPDATE products` en la fila `f20ef2b6-...` (Ceviche Mixto):
  - `nombre` = "Ceviche Mixto"
  - `descripcion_corta` = "Fresca combinación de mariscos marinados en una leche de tigre cítrica, con cebolla morada, cilantro y el toque tropical de Catarsis."
  - `imagen_url` = URL pública del WebP subido
- No se toca precio, categoría, tags ni slug.

**3. Reordenar Entradas (nuevos valores de `orden`)**
- Tequeños → 0
- Alitas de Pollo → 1
- Ceviche Mixto → 2
- Crispy Bites → 3
- Resto conserva su orden relativo actual: Animal Fries 4, Papas con Queso Fundido 5, Rebozados del Mar 6, Aros de Cebolla 7, Chili con Papas 8, Ración de Papas 9, Tenders de Pollo 10.

**4. Accesibilidad / performance**
- El componente de tarjetas (`MenuCard`) ya aplica `loading="lazy"`, `object-contain`, fondo blanco, 1:1 y dimensiones fijas — no requiere cambios de código.
- El `alt` del `<img>` usa `producto.nombre`, por lo que quedará "Ceviche Mixto". Como pediste el texto exacto **"Ceviche Mixto Catarsis"**, la única forma de garantizarlo sin tocar el componente global es guardar ese literal en `nombre`; en caso contrario dejamos el `alt = "Ceviche Mixto"` (recomendado, para no cambiar el título mostrado).

## Confirmación necesaria

¿Prefieres mantener el título visible como **"Ceviche Mixto"** (alt será igual) o forzar el alt a **"Ceviche Mixto Catarsis"** aunque implique un pequeño ajuste en `MenuCard.tsx` para usar `` `${nombre} Catarsis` `` sólo en el atributo alt? Procedo con la opción 1 (sin tocar código) salvo que indiques lo contrario.