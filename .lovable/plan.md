## Plan: Actualizar favicon

1. Copiar la imagen subida (`Mesa_de_trabajo_2-2.png`) a `public/favicon.png`, sobrescribiendo el actual.
2. Eliminar `public/favicon.ico` (si existe) para que no sobrescriba el nuevo PNG en el request por defecto del navegador.
3. Subir el cache-buster de `index.html` (`?v=catarsis-20260325` → nuevo valor) para forzar a navegadores a recargar el favicon.

No se requieren cambios adicionales — los `<link rel="icon">` ya apuntan a `/favicon.png`.

**Nota:** El logo es horizontal (1920x1080 con mucho espacio en blanco). En tamaño favicon (32x32) el texto "CATARSIS" se verá muy pequeño/ilegible. ¿Quieres que use la imagen tal cual, o prefieres que recorte/ajuste a un cuadrado más legible (por ejemplo solo la "C" en amarillo sobre fondo Rich Black)?