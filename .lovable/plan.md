

## Plan: Actualizar schemas + crear llms.txt

### Archivos modificados

| Archivo | Cambios |
|---------|---------|
| `src/components/RestaurantSchema.tsx` | Coordenadas → `-64.6897`, hasMenu.url → `/menu`, 8 MenuSection URLs → `/menu`, agregar `mentions` (13 entidades) después de `amenityFeature` |
| `src/components/LocalBusinessSchema.tsx` | Coordenadas → `-64.6897`, agregar `speakable` después de `slogan` |
| `src/components/FAQSchema.tsx` | Agregar 2 preguntas AEO al final del array `mainEntity` (total: 9) |
| `public/llms.txt` | Crear archivo nuevo con datos del negocio para LLMs |

### Detalle por corrección

**C1 — Coordenadas**: Línea 31 en RestaurantSchema y línea 23 en LocalBusinessSchema: `-64.6833` → `-64.6897`. Comentario explicativo.

**C2 — URLs menú**: Línea 69 `hasMenu.url` → `https://www.catarsiszone.com/menu`. Líneas 75, 81, 87, 93, 99, 105, 111, 117: todas → `https://www.catarsiszone.com/menu`. Comentarios explicativos.

**C3 — Speakable**: Insertar después de línea 37 (`slogan`) en LocalBusinessSchema. 5 cssSelectors: `h1`, `h2`, `.restaurant-description`, `.opening-hours`, `.location-info`.

**C4 — Mentions**: Insertar después de línea 140 (`amenityFeature` closing bracket) en RestaurantSchema. 13 entidades (11 MenuItem + 2 Thing).

**C5 — FAQ AEO**: Insertar después de línea 61 (última pregunta closing bracket) en FAQSchema. 2 preguntas nuevas sobre recomendaciones y ambiente.

**C6 — llms.txt**: Crear `public/llms.txt` con contenido exacto del prompt (nombre, ubicación, horarios, métodos de pago, menú, redes sociales, keywords, ai_instructions).

### Sin cambios
- No se elimina ningún campo existente
- No se reescriben schemas completos — solo campos indicados

