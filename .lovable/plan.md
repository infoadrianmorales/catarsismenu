# Actualizar y organizar `/menu`

## Objetivo
Convertir `/menu` en una carta siempre sincronizada con la página principal, mostrando todas las categorías y productos activos con sus nombres, descripciones, precios y orden vigentes.

## Cambios
1. **Fuente única del catálogo**
   - Eliminar la lista manual y desactualizada que actualmente vive dentro de `/menu`.
   - Usar los mismos productos y categorías que alimentan la página principal.
   - Respetar el orden configurado desde el panel administrador.

2. **Organización de la carta**
   - Mostrar todas las categorías activas, incluida **Bebidas**.
   - Agrupar los productos por categoría y calcular automáticamente el precio “desde”.
   - Mantener la presentación compacta de `/menu`, mejorando su lectura en móvil y escritorio sin convertirla en otra copia de la página principal.
   - Añadir estados claros de carga, catálogo vacío y error con opción de reintento.

3. **Información para buscadores**
   - Generar automáticamente los datos estructurados de menú desde los mismos productos visibles.
   - Actualizar cantidades, categorías, nombres, descripciones y precios sin listas duplicadas dentro de la página.
   - Ajustar el título y la descripción de `/menu` para que no anuncien precios mínimos antiguos.

4. **Verificación**
   - Comparar `/menu` contra la página principal para confirmar que coincidan productos, precios, descripciones y orden.
   - Revisar que todas las categorías activas aparezcan y que los enlaces de productos funcionen.
   - Validar la presentación en móvil y escritorio, además de comprobar que no existan errores de carga.

## Detalles técnicos
- Se reutilizarán los datos ya obtenidos por los hooks del catálogo y de categorías públicas.
- El esquema `Menu` de buscadores se construirá a partir del catálogo renderizado, evitando una segunda copia manual dentro de `/menu`.
- No se modificarán precios ni productos en la base de datos; `/menu` reflejará automáticamente lo que ya está vigente en la página principal.
