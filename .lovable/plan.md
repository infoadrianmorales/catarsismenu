

# Plan: Actualizar Nombres, Descripciones y Precios de Productos

## Resumen

Actualizar masivamente los productos existentes en la base de datos con los nuevos nombres, descripciones y precios proporcionados.

---

## Análisis de Cambios

### Ajustes de Nombres de Productos

Algunos productos requieren renombrarse para coincidir con los nuevos datos:

| Actual | Nuevo |
|--------|-------|
| Alitas de Pollo Catarsis | Alitas de Pollo |
| Tequeños Clásicos (6 u.) | Tequeños |
| Smash Catarsis | Smash |
| Margarita Catarsis | Margarita |
| Ceviche Mixto Tropical | Ceviche Mixto |
| Papas con Queso y Tocineta | Papas con Queso Fundido |

### Ajustes de Precios Significativos

| Producto | Precio Actual | Precio Nuevo |
|----------|---------------|--------------|
| Alitas de Pollo | $12.00 | $9.99 |
| Ceviche Mixto | $18.00 | $12.49 |
| Hamburguesas (varias) | $11-16 | $9.49-15.99 |
| Pizzas | $14-18 | $8.49-10.99 |
| Parrillas | $18-35 | $12.49-17.49 |
| Cocteles (todos) | $7-10 | $4.99 |

---

## Implementación

### Paso 1: Actualizar productos de Entradas
Ejecutar UPDATE para cada producto de la categoría "entradas":
- Alitas de Pollo: $9.99
- Aros de Cebolla: $3.99
- Ceviche Mixto: $12.49
- Chili con Papas: $8.49
- Papas con Queso Fundido: $6.49
- Ración de Papas: $3.99
- Rebozados del Mar: $12.99
- Tenders de Pollo: $8.99
- Tequeños: $5.99
- Crispy Bites: $10.99

### Paso 2: Actualizar productos de Hamburguesas
- Chicken Crunch: $10.99
- Clásica Americana: $10.99
- Shrimp Crunch: $10.99
- Texmex: $10.99
- BBQ Champions: $10.99
- Chicken Spicy: $10.99
- Smash: $15.99
- Onion Queen: $10.99
- Honeyholic Burger: $10.99
- Double Cheesy: $9.49
- Chicken Slow: $9.49

### Paso 3: Actualizar productos de Emparedados
- Chicken Crunch Americano: $10.99
- Fondue de Lomito: $11.99
- Perla Negra: $10.99

### Paso 4: Actualizar productos de Pizzas
- Margarita: $8.49
- Paradise: $9.99
- Pepperoni: $9.99
- Tasty: $10.99
- Veggie: $9.99

### Paso 5: Actualizar productos de Parrillas
- Parrilla Mar y Tierra: $17.49
- Parrilla Mixta: $12.49
- Parrilla de Pollo: $12.49
- Parrilla de Lomito: $13.49
- Parrilla de Mariscos: $17.49

### Paso 6: Actualizar productos de Ensaladas
- César con Langostino: $11.99
- César de Pollo: $9.99
- César Clásica: $7.49

### Paso 7: Actualizar productos de Cocteles
Todos los cocteles a $4.99:
- Catarsis Punch
- Whipped
- Le Fraisier
- Naranjo (NUEVO - agregar)
- Flowers
- Rum Old Fashioned Tonic
- Sangría
- Long Island Tea
- Margarita On the Rocks
- Green Gin
- Southside Berry

### Paso 8: Actualizar productos de Postres
- Brownie con Helado: $6.99
- Sweet Bites: $5.99

---

## Producto Nuevo Detectado

Se detectó un coctel que no existe en la base de datos:
- **Naranjo**: Ginebra clásica con notas cítricas de limón y gajos de mandarina, finalizada con agua tónica. - $4.99

Este producto será agregado a la categoría "cocteleria".

---

## Archivos a Modificar

| Tipo | Cambio |
|------|--------|
| Base de datos | ~47 UPDATEs + 1 INSERT |
| Código | Ninguno (datos dinámicos desde Supabase) |

---

## Método de Ejecución

Usaré migraciones SQL para actualizar todos los productos de forma atómica. Cada UPDATE incluirá:
- `nombre`: Nombre actualizado
- `descripcion_corta`: Nueva descripción
- `precio_usd`: Nuevo precio

---

## Verificación Post-Implementación

1. Revisar la página `/local` para confirmar precios actualizados
2. Verificar que los productos aparecen correctamente en cada categoría
3. Confirmar que el nuevo coctel "Naranjo" aparece en Coctelería

