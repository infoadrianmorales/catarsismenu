

## Plan: Generar PDF del menú completo de Catarsis

### Datos disponibles (ya consultados)

He obtenido todos los productos activos de la base de datos:
- **Entradas**: 10 productos (Alitas, Animal Fries, Papas con Queso, Rebozados del Mar, Tequeños, Aros de Cebolla, Chili con Papas, Ración de Papas, Tenders de Pollo, Crispy Bites)
- **Hamburguesas**: 13 productos (Chicken Crunch, Thousand Smash, Shrimp Crunch, BBQ Champions, Smash, Honeyholic, Clásica Americana, Texmex, Chicken Spicy, Thousand Cheesy, Onion Queen, Double Cheesy, Chicken Mayo)
- **Emparedados**: 4 productos (Chicken Crunch Americano, Perla Negra, Fondue de Lomito, Chicken Cesar)
- **Pizzas**: 6 productos (Margarita, Paradise, Pepperoni, Tasty, Hot Honey, Veggie)
- **Parrilla**: 5 productos (Mar y Tierra, Lomito, Mariscos, Pollo, Mixta)
- **Ensaladas**: 3 productos (César con Langostino, César Clásica, César de Pollo)
- **Coctelería**: 10+ productos (Spicy Tamarindo, Passion Fruit Mule, Catarsis Punch, Whipped, Le Fraisier, etc.)
- **Postres**: 2 productos (Brownie con Helado, Sweet Bites)

**Total: ~53 productos activos**

### Generación del PDF

Ejecutaré un script Python con `reportlab` que genera un PDF A4 con:

1. **Portada**: Fondo oscuro (#010C23), título "CATARSIS DRINKS & FOOD" en dorado, subtítulo "Menú Completo", ubicación y fecha
2. **Páginas de contenido**: Productos agrupados por categoría con:
   - Encabezado de categoría (barra oscura con nombre y conteo)
   - Cada producto: nombre + línea punteada + precio USD en verde
   - Descripción en gris debajo del nombre
3. **Pie**: Marca y ubicación

El archivo se guardará en `/mnt/documents/menu-catarsis.pdf` listo para descargar.

### Archivos involucrados
| Archivo | Acción |
|---------|--------|
| `/tmp/gen_menu.py` | Script temporal para generar el PDF |
| `/mnt/documents/menu-catarsis.pdf` | PDF final descargable |

No se modifica ningún archivo del proyecto.

