## Diagnóstico confirmado
- El backend está activo y saludable; no hay saturación de memoria, conexiones ni disco.
- Las consultas públicas de productos responden con datos, pero la página móvil muestra banner de respaldo y placeholders porque el frontend trata algunos estados parciales como error visible.
- Las imágenes nuevas de bebidas usan una ruta distinta (`product-images/...`) a la ruta antigua (`product-images/products/...`); el componente actual no las maneja de forma óptima.
- Las páginas individuales dependen de cargar todo el catálogo global para encontrar un producto; si esa carga está lenta o en retry, la página puede quedar en skeleton o terminar en “Producto no encontrado”.
- La home carga varias consultas y scripts desde el inicio; el banner hero y `best_sellers_food` aparecen como puntos de costo/latencia relevantes.

## Plan de implementación
1. **Separar carga crítica de carga secundaria en home**
   - Hacer que el menú principal dependa solo de productos + categorías.
   - Cargar best sellers como mejora secundaria, sin bloquear categorías ni productos.
   - Mostrar el banner de error solo si realmente no hay productos renderizables después de agotar fallbacks.

2. **Optimizar carga de productos**
   - Pedir solo las columnas necesarias en `useProducts`, en vez de `select('*')`.
   - Aumentar resiliencia sin dejar la pantalla vacía: si hay catálogo estático o datos previos, usarlos mientras se reintenta.
   - Evitar que una respuesta lenta de best sellers marque toda la home como cargando.

3. **Arreglar páginas individuales de producto**
   - Crear una consulta puntual por `slug` para `ProductPage`, en vez de depender únicamente del catálogo completo.
   - Mantener validación de categoría y redirección canónica `/{categoria}/{slug}`.
   - Si el catálogo global falla, la página individual seguirá cargando por su propio producto.

4. **Corregir imágenes y placeholders en móvil**
   - Ampliar `OptimizedImage` para reconocer tanto rutas antiguas como nuevas de imágenes.
   - Mantener fallback seguro, pero evitar mostrar placeholder si la URL original sí existe.
   - Revisar el hero para que, si una imagen de banner falla, use el banner local de respaldo y no quede el ícono roto.

5. **Mejorar rendimiento percibido en móvil**
   - Reducir bloqueo inicial del hero en móvil si los slides tardan.
   - Priorizar productos visibles y no bloquear el menú por datos decorativos/marketing.
   - Mantener lazy loading para secciones inferiores.

6. **Validación**
   - Probar home móvil, home desktop y varias URLs de producto (`/hamburguesas/thousand-smash`, `/entradas/tequenos-clasicos`, `/bebidas/jugo-de-fresa`).
   - Confirmar que no aparece el banner de respaldo cuando los productos sí cargan.
   - Confirmar que imágenes reales sustituyen placeholders y que las páginas individuales abren correctamente.

## Detalles técnicos
- Archivos principales a modificar: `src/hooks/useProducts.ts`, `src/pages/Index.tsx`, `src/pages/ProductPage.tsx`, `src/components/OptimizedImage.tsx`, `src/components/HeroSection.tsx` y posiblemente `src/hooks/useHeroSlides.ts`.
- No cambiaré precios, productos ni estructura de base de datos salvo que durante la implementación aparezca un índice claramente necesario para rendimiento.
- No eliminaré configuraciones históricas de Vercel ni tocaré URLs canónicas actuales.