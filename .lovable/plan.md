

## Plan: Agregar Schema Menu JSON-LD en /menu

### Archivo a modificar
`src/pages/Menu.tsx` — único cambio

### Qué se hace
Insertar un `<Helmet>` adicional con el `<script type="application/ld+json">` del Schema Menu justo después del componente `<SEO />` existente (línea 186). El schema contiene las 8 secciones y 55 MenuItems con precios verificados exactos del prompt.

### Detalle técnico
- Se agrega un bloque `<Helmet>` independiente (react-helmet-async permite múltiples instancias) con el JSON-LD completo
- Se inserta entre la línea 186 (`/>` del SEO) y la línea 188 (`{/* Navegación superior */}`)
- Incluye comentario explicativo antes del Helmet
- No se modifica ningún otro archivo ni componente
- El JSON-LD usa exactamente los 55 items, descripciones y precios proporcionados en el prompt

### Verificación
| # | Check | |
|---|-------|--|
| 1 | Script dentro de Helmet en Menu.tsx | ✅ |
| 2 | 8 secciones: Entradas, Hamburguesas, Emparedados, Pizzas, Parrilla, Ensaladas, Coctelería, Postres | ✅ |
| 3 | 55 MenuItems (10+13+4+6+5+3+12+2) | ✅ |
| 4 | Precios idénticos a carta marzo 2026 | ✅ |
| 5 | JSON válido | ✅ |
| 6 | Página /menu sigue cargando | ✅ |

