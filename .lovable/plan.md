

# Plan: Mostrar Descripciones Completas de Productos

## Problema Identificado

Las tarjetas de productos (`CompactProductCard` y `MenuCard`) usan `line-clamp-2` que limita el texto a solo 2 líneas. Con las nuevas descripciones más detalladas (hasta 200 caracteres), mucho contenido importante se pierde.

---

## Opciones Evaluadas

| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| **A: Descripción expandible con "Ver más"** | No altera el diseño, usuario controla | Requiere clic adicional, más complejo |
| **B: Tooltip al pasar el cursor** | No altera el diseño | No funciona en móvil (táctil) |
| **C: Aumentar líneas visibles a 3-4** | Simple, sin interacción extra | Tarjetas más altas, menos productos visibles |
| **D: Modal/Popup al tocar la tarjeta** | Descripción completa visible | Interrumpe la navegación |

---

## Solución Recomendada: Opción A - Texto Expandible

Implementar un botón "Ver más" que expande la descripción dentro de la tarjeta cuando el texto excede 2 líneas. Es la solución más elegante porque:

- Mantiene el diseño compacto por defecto
- Funciona en móvil y escritorio
- El usuario decide cuándo ver más
- No requiere navegación adicional

---

## Implementación Técnica

### Paso 1: Crear componente ExpandableText reutilizable

Nuevo archivo `src/components/ExpandableText.tsx`:
- Detecta si el texto excede las líneas permitidas
- Muestra botón "Ver más" / "Ver menos" condicionalmente
- Animación suave al expandir/contraer

### Paso 2: Actualizar CompactProductCard

Reemplazar el párrafo estático por el nuevo componente:
- Límite de 2 líneas por defecto
- Botón "Ver más" cuando el texto es largo
- Mantener altura mínima consistente

### Paso 3: Actualizar MenuCard

Aplicar el mismo patrón para mantener consistencia visual.

---

## Vista Previa del Resultado

```text
┌─────────────────────────┐
│      [Imagen]           │
├─────────────────────────┤
│ Alitas de Pollo         │
│                         │
│ 8 jugosas alitas de     │
│ pollo, disponibles...   │
│ [Ver más]               │
│                         │
│ $9.99          [+]      │
└─────────────────────────┘

   ↓ Al tocar "Ver más"

┌─────────────────────────┐
│      [Imagen]           │
├─────────────────────────┤
│ Alitas de Pollo         │
│                         │
│ 8 jugosas alitas de     │
│ pollo, disponibles en   │
│ su versión crujiente o  │
│ bañadas en salsa BBQ,   │
│ acompañadas de papas    │
│ fritas doradas.         │
│ [Ver menos]             │
│                         │
│ $9.99          [+]      │
└─────────────────────────┘
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/ExpandableText.tsx` | **Nuevo** - Componente reutilizable |
| `src/components/CompactProductCard.tsx` | Integrar ExpandableText |
| `src/components/MenuCard.tsx` | Integrar ExpandableText |

---

## Detalles del Componente ExpandableText

```tsx
// Propiedades del componente
interface ExpandableTextProps {
  text: string;
  maxLines?: number;      // Default: 2
  className?: string;
}

// Funcionalidad:
// - Usa useRef para medir si el texto está truncado
// - Estado isExpanded para toggle
// - Clases Tailwind: line-clamp-2 cuando colapsado
// - Botón con texto "Ver más" / "Ver menos"
// - Transición suave con CSS
```

---

## Notas Adicionales

- El componente detecta automáticamente si el texto necesita truncarse
- Si la descripción cabe en 2 líneas, no muestra el botón
- Compatible con el tema oscuro actual
- No afecta la página de detalle del producto (ya muestra todo)

