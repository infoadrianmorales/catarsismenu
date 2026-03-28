

## Plan: Multi-select de productos en ExtrasPanel

### Problema actual
El formulario de extras solo permite seleccionar UN producto específico o "toda la categoría". El usuario necesita poder asignar un extra a varios productos específicos a la vez.

### Enfoque
Mantener el esquema actual (`product_id` como UUID único por fila). Cuando el admin seleccione N productos, se crean N filas en `product_extras` (una por producto). No se necesita migración DB.

### Cambios en `src/components/admin/ExtrasPanel.tsx`

1. **Cambiar `product_id: string` a `product_ids: string[]`** en el tipo `ExtraForm`
2. **Reemplazar el Select de producto** por una lista de checkboxes con los productos de la categoría seleccionada, más una opción "Toda la categoría" que deselecciona los individuales
3. **Al guardar (crear)**:
   - Si `product_ids` está vacío → insertar 1 fila con `product_id: null` (toda la categoría)
   - Si hay IDs seleccionados → insertar N filas (una por producto) con el mismo nombre, precio, categoría, orden
4. **Al editar**: mantener el comportamiento actual (edita solo esa fila individual)
5. **En la lista de extras**: agrupar visualmente los que comparten nombre+categoría y mostrar los nombres de productos asignados

### Archivos
- `src/components/admin/ExtrasPanel.tsx` — único archivo modificado

### Sin cambios
- Base de datos, `useProductExtras`, `CartContext`, checkout, schemas, SEO

