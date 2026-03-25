

## Plan: Crear página /menu independiente con SEO propio

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/pages/Menu.tsx` | **CREAR** — Página completa con meta tags SEO, 8 secciones de categoría, precios verificados, diseño brandbook |
| `src/App.tsx` | Reemplazar redirect por lazy import de Menu.tsx |
| `vercel.json` | Eliminar redirect `/menu` → `/` (línea 3-6) para que Vercel no intercepte la ruta |

### Detalle técnico

**1. `src/pages/Menu.tsx` (nuevo)**
- Usa el componente `<SEO>` existente con props: `title="Menú Completo"`, `description` con precios reales, `url="/menu"`
- Contenido estático HTML semántico (no depende de la DB — es para SEO/IA)
- H1 único: "Menú de Catarsis Drinks & Food — CC Aventura Plaza, Lechería"
- 8 secciones con H2 por categoría, cada plato con H3 + descripción + precio
- Sección final de contacto/métodos de pago
- Botón "Volver al inicio" con Link to="/"
- Colores: fondo `#010C23`, títulos categoría `#DB1F51`, precios `#F2B60F`, texto blanco/gris
- Font Phudu para headings, DM Sans para body (ya configurados en el proyecto)
- Layout responsive: 1 columna móvil, 2 columnas tablet+
- Exportado como default para lazy loading

**2. `src/App.tsx`**
- Línea 27: agregar `const Menu = lazy(() => import("./pages/Menu"));`
- Línea 63: reemplazar `<Navigate to="/" replace />` por `<Menu />`
- Agregar comentario explicando que /menu no debe redirigir

**3. `vercel.json`**
- Eliminar el redirect `{ "source": "/menu", "destination": "/", "statusCode": 301 }` para que la SPA sirva la página real en producción

### Precios en la página
Exactamente los del prompt — no se inventa ningún dato:
- Entradas: 10 platos desde $3.99
- Hamburguesas: 13 platos desde $7.99
- Emparedados: 4 platos desde $8.99
- Pizzas: 6 platos desde $7.99
- Parrilla: 5 platos desde $10.99
- Ensaladas: 3 platos desde $7.49
- Coctelería: 12 cócteles todos a $4.99
- Postres: 2 platos desde $5.99

### Sin cambios
- `src/pages/MenuLocal.tsx` y ruta `/local` intactos
- Home `/` sin cambios
- Schemas y llms.txt sin cambios (ya actualizados previamente)

