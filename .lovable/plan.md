

## Plan: Actualizar descripciones de hamburguesas, emparedados y parrilla

### Archivos con descripciones individuales de productos

| Archivo | Productos afectados | Tipo de cambio |
|---------|---------------------|----------------|
| `src/pages/Menu.tsx` | 13 hamburguesas + 4 emparedados + 5 parrilla (líneas 42-104) | Reemplazar campo `description` de cada item |
| `src/components/RestaurantSchema.tsx` | 13 hamburguesas + 4 emparedados en `mentions` (líneas 159-192) | Reemplazar texto de `description` manteniendo precio y "Catarsis Lechería" |

### Archivos SIN descripciones individuales (no requieren cambios)

| Archivo | Razón |
|---------|-------|
| `public/llms.txt` | Solo lista nombres + precios, sin descripciones de platos |
| `src/components/FAQSchema.tsx` | Solo menciona nombres y precios en texto corrido |
| `src/components/LocalBusinessSchema.tsx` | No contiene platos individuales |

### Detalle de cambios

**Menu.tsx — 22 descripciones**
- Líneas 42-54: 13 hamburguesas — reemplazar cada `description` con el texto exacto del prompt
- Líneas 61-64: 4 emparedados — reemplazar cada `description`
- Líneas 99-103: 5 parrilla — reemplazar cada `description`
- Solo cambia el campo `description`, no `name` ni `price`

**RestaurantSchema.tsx — 17 mentions con descripción actualizada**
- Líneas 159-192: Actualizar las descriptions de los 13 mentions de hamburguesas y 4 de emparedados
- Formato: descripción nueva resumida + precio USD + "Catarsis Lechería"
- Parrilla: No tiene entries individuales en `mentions`, por lo que no se actualiza aquí

### Notas
- Ningún precio se modifica
- Ningún nombre de plato se modifica
- Las descripciones en RestaurantSchema se resumen para caber en el formato corto del schema (una línea con precio)

