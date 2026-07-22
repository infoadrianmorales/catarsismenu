## Diagnóstico confirmado

- El backend sí tiene catálogo disponible: 86 productos activos, 30 bebidas activas y ordenables, 8 categorías activas y la categoría `bebidas` activa.
- Las políticas de lectura pública para `products` y `categories` están activas, así que el problema no parece ser de permisos/RLS.
- En la vista previa, la petición del catálogo responde 200 y trae productos, incluyendo bebidas. El síntoma visible en móvil apunta más a render/carga de imágenes y a lógica de sugerencias que a datos inexistentes.
- Las sugerencias de bebidas dependen de que el hook móvil detecte categorías/productos en el momento correcto; si hay un estado transitorio, puede quedarse mostrando solo comida aunque existan bebidas.

## Plan de implementación

1. **Reproducir en viewport móvil antes de editar**
   - Abrir home, página individual y carrito en tamaño móvil.
   - Verificar si el problema real es: tarjetas sin imagen, secciones vacías, sugerencias sin bebidas, o una combinación.

2. **Blindar la carga principal del menú móvil**
   - Ajustar `useProducts` para que no mezcle estados transitorios de backend con fallback de forma que deje secciones incompletas.
   - Mantener el catálogo visible incluso si una query secundaria como best sellers/categorías tarda o falla.
   - Asegurar que `best-seller` y categorías reales no bloqueen el render de productos.

3. **Corregir imágenes rotas/placeholder en móvil**
   - Revisar `OptimizedImage` y el uso de imágenes en carrito/sugerencias.
   - Aplicar fallback inmediato y estable: si una imagen externa falla, no dejar skeleton ni icono roto; usar placeholder local consistente.
   - Evitar que errores de imagen hagan parecer que “no cargó el producto”.

4. **Hacer que bebidas siempre aparezca como sugerencia cuando aplique**
   - Actualizar `useCartSuggestions` y `useProductSuggestions` para que detecten bebidas desde el catálogo activo, no solo desde categorías.
   - En carrito móvil, cuando el usuario abra “Complementar pedido”, mostrar explícitamente el bloque de bebidas si hay bebidas ordenables y el producto actual no es bebida.
   - Evitar que agregar 1 bebida o estados de carga oculten todo el carrusel de bebidas.

5. **Validación final en móvil**
   - Probar home móvil: productos visibles y categorías con contenido.
   - Probar página individual: producto visible, imagen/fallback estable y sugerencias visibles.
   - Probar carrito móvil con una comida: sección de complementos + sección de bebidas disponible.
   - Confirmar que no aparezca el banner de “versión de respaldo” salvo error real.