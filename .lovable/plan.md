

## Plan: Sección de bebidas en sugerencias del carrito + categoría de ejemplo

### Contexto
No existe la categoría "bebidas" en la base de datos. Se creará con productos de ejemplo. En el carrito, debajo de "Complementa tu pedido" (best sellers mezclados con bebidas como está ahora), se agregará una segunda sección exclusiva de bebidas: "¿Algo para tomar?".

### Cambios

**1. Datos: crear categoría "bebidas" + productos de ejemplo**
- Insertar categoría `bebidas` (type: DRINK, icono: GlassWater, orden: 7)
- Insertar 4 productos de ejemplo: Coca-Cola ($2.00), Agua Mineral ($1.50), Jugo Natural ($3.00), Cerveza ($3.50)
- Luego se editan/eliminan desde el admin

**2. `src/components/cart/UpsellSuggestions.tsx`**
- Mantener la sección actual "Complementa tu pedido" con best sellers (excluyendo bebidas para no duplicar)
- Agregar una segunda sección debajo: "¿Algo para tomar?" con icono `GlassWater`
- Filtrar solo productos de categoría `bebidas` que no estén en el carrito
- Mismo estilo de carrusel horizontal con tarjetas
- Extraer el JSX del carrusel a una función interna para reutilizar sin duplicar código
- Ambas secciones se ocultan independientemente si no tienen items

### Archivo modificado
- `src/components/cart/UpsellSuggestions.tsx`

### Sin cambios
- CartContext, Cart.tsx, CartDrawer.tsx, checkout, schemas, admin panels

