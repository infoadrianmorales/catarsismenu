

## Plan: Corregir precios y actualizar carta completa

### 4 correcciones en 3 archivos

| Archivo | Cambio |
|---------|--------|
| `src/components/FAQSchema.tsx` | C1: Actualizar precio hamburguesas de $3.99 → $7.99 en la pregunta "¿Cuánto cuestan..." (línea 64) |
| `src/components/RestaurantSchema.tsx` | C2: Reemplazar array `mentions` (líneas 162-237) con 25 entidades con precios reales. C4: Actualizar descripciones de las 8 MenuSections (líneas 83-132) con platos y precios reales |
| `public/llms.txt` | C3: Reemplazar sección `menu_highlights` (líneas 40-64) con carta completa de 8 categorías, todos los platos y precios |

### Detalle

**C1 — FAQSchema precio hamburguesas**
- Línea 64: texto actual dice "$3.99 USD" → reemplazar con texto completo que lista las 13 hamburguesas con precios reales desde $7.99

**C2 — RestaurantSchema mentions**
- Reemplazar las 13 entidades actuales (sin precios) por 25 entidades con precios USD verificados
- Incluye: 13 hamburguesas, 4 emparedados, 1 pizza (Hot Honey), 5 cócteles, 2 Things (Delivery/Vida nocturna)

**C3 — llms.txt menu_highlights**
- Reemplazar líneas 40-64 con carta completa: 8 categorías, ~55 platos con precios individuales y precios "desde" por categoría

**C4 — RestaurantSchema MenuSections**
- Actualizar descripciones de las 8 secciones (líneas 83-132) con conteo de platos, precios desde y nombres reales

### Sin cambios
- No se eliminan campos existentes fuera de lo indicado
- Estructura JSON-LD se mantiene válida
- FAQSchema AEO questions no se tocan (ya tienen precio correcto de $3.99 referido a entradas)

