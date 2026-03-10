
Objetivo: crear una exportación en PDF del menú completo con foto, descripción y precio (solo USD), agrupado por categoría, con portada, y disponible desde el panel Admin.

Alcance confirmado (según tus respuestas):
- Incluir todos los productos (activos e inactivos).
- Agrupar por categoría.
- Incluir portada.
- Mostrar precios solo en USD.
- Botón de descarga desde Admin.

Plan de implementación

1) Añadir motor de PDF en frontend
- Instalar una librería de generación de PDF orientada a imágenes y layout (jsPDF).
- No requiere cambios de base de datos ni backend functions.

2) Crear utilidad de exportación de menú a PDF
- Archivo nuevo: `src/lib/menuPdfExport.ts`
- Responsabilidades:
  - Recibir `products` + `categories`.
  - Ordenar por `categoría` y luego `orden`.
  - Generar portada con:
    - Logo del restaurante.
    - Título “Menú Catarsis”.
    - Fecha/hora de generación.
  - Renderizar secciones por categoría (nombre de categoría como encabezado).
  - Por producto:
    - Foto (con fallback a placeholder si falla).
    - Nombre.
    - Descripción corta.
    - Precio en USD (`$xx.xx`).
    - Estado opcional visual (activo/inactivo) para que realmente sea “todos”.
  - Manejar salto de página automático para evitar cortes de tarjetas.
  - Descargar archivo con nombre tipo: `menu-catarsis-YYYY-MM-DD.pdf`.

3) Traer datos correctos para exportar (todos los productos)
- En vez de reutilizar `useProducts` (que filtra activos para vista pública), en el panel Admin se hará consulta directa a `products` sin filtro de `activo`.
- Usar categorías de `categories` para nombres y orden reales.
- Si algún producto tiene categoría no encontrada, enviarlo a sección “Sin categoría”.

4) Agregar botón en Admin
- Ubicación: pestaña de Productos (`src/components/admin/ProductsPanel.tsx`) en la barra superior de acciones.
- Botón “Exportar PDF” con estado de carga:
  - “Generando PDF…” mientras procesa imágenes y páginas.
  - Toast de éxito/error con mensaje claro si alguna imagen no pudo cargarse.
- Mantener UX consistente con el resto del panel (Button + Loader + toast).

5) Manejo de robustez
- Si una imagen externa no permite carga/cors: usar placeholder sin romper la exportación.
- Si no hay productos: bloquear export y mostrar aviso.
- Optimizar tamaño:
  - Reescalar imágenes antes de insertarlas en PDF para que no pese demasiado.

Prueba de verificación (incluida en la entrega)
- Prueba funcional desde Admin → Productos:
  1. Click en “Exportar PDF”.
  2. Confirmar descarga del archivo.
  3. Verificar que incluye portada.
  4. Verificar agrupación por categorías.
  5. Verificar que salen fotos, descripciones y precio USD en cada producto.
  6. Verificar que aparecen productos activos e inactivos.
- Validación visual rápida en móvil/escritorio del botón (sin romper layout).

Detalles técnicos
- Archivos a tocar:
  - `src/components/admin/ProductsPanel.tsx` (botón + handler + fetch completo para export).
  - `src/lib/menuPdfExport.ts` (generador PDF).
  - `package.json` (dependencia jsPDF).
- No se requieren migraciones ni cambios de RLS.
