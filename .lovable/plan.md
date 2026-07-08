# Plan: Añadir 3 productos Chinotto a Bebidas

Crear los 3 refrescos Chinotto en la categoría `bebidas` usando las imágenes subidas, insertándolos directamente en la base de datos (mismo resultado que crearlos desde el panel admin).

## Productos

| Nombre | Slug | Precio USD | Imagen |
|---|---|---|---|
| Chinotto 1.5L | `chinotto-1-5l` | 3.00 | Chinotto_1.5L.jpg |
| Chinotto 1L | `chinotto-1l` | 2.50 | Chinotto_1L.jpg |
| Chinotto 355 ml | `chinotto-355ml` | 1.50 | Chinotto_355ml.png |

Descripciones (≤120 chars) tal como las proporcionó el usuario:
- 1.5L: "Refresco sabor a limón, libre de calorías, ideal para compartir en mesa o acompañar tus comidas favoritas."
- 1L: "Refresco sabor a limón, ligero y burbujeante, perfecto para acompañar tus pedidos de Catarsis."
- 355 ml: "Presentación personal de Chinotto, refrescante y práctica para disfrutar con cualquier plato."

Todos: `categoria = 'bebidas'`, `activo = true`, `destacado = false`, `tags = []`, `orden` = siguiente disponible al final de bebidas.

## Pasos

1. **Subir imágenes al storage** `product-images` del bucket público, en las 3 resoluciones que usa el sistema (thumb 200 / card 400 / full 800), reusando cada archivo tal cual (ya vienen 1:1 con fondo blanco). Rutas: `<slug>/full.jpg|png`, `<slug>/card.jpg|png`, `<slug>/thumb.jpg|png`.
2. **Insertar 3 filas** en `public.products` con `imagen_url` apuntando al `full` con cache-buster (`?t=<ts>`), mismo formato que produce `ProductForm`.
3. **Verificar** con un SELECT que los 3 productos aparecen activos en `bebidas`.

## Notas técnicas

- No se toca esquema ni RLS — solo INSERT de datos y upload a storage.
- No se modifica código de la app; los productos aparecen automáticamente en `/` (categoría Bebidas) vía `useProducts`.
- Las imágenes originales (1024x1024, fondo blanco) cumplen la regla 1:1 del proyecto, así que se suben tal cual a las 3 rutas sin reprocesar (el pipeline de resize solo aplica cuando se sube desde el form; aquí basta con que las 3 URLs existan — el frontend usa la URL `full` como `imagen_url`).
