

# Plan: Unificar Tamaño de Tarjetas entre Categorías

## Problema Identificado

Las categorías muestran tarjetas de diferentes tamaños dependiendo de si usan grid o carrusel:

| Modo | Ancho de Tarjeta | Condición |
|------|------------------|-----------|
| Grid | ~50% pantalla (móvil) | ≤4 productos |
| Carrusel | 150px (móvil) / 185px (desktop) | >4 productos |

Esto crea un aspecto visual inconsistente entre secciones.

```text
ANTES (inconsistente):
┌─────────────────────────────────────┐
│ ENTRADAS (>4, carrusel)             │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ →          │  ← Tarjetas pequeñas
│ └───┘ └───┘ └───┘ └───┘             │
├─────────────────────────────────────┤
│ ENSALADAS (≤4, grid)                │
│ ┌───────────┐ ┌───────────┐         │  ← Tarjetas grandes
│ │           │ │           │         │
│ └───────────┘ └───────────┘         │
│ ┌───────────┐ ┌───────────┐         │
│ │           │ │           │         │
│ └───────────┘ └───────────┘         │
└─────────────────────────────────────┘

DESPUÉS (uniforme):
┌─────────────────────────────────────┐
│ ENTRADAS (>4, carrusel)             │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ →          │  ← Mismo tamaño
│ └───┘ └───┘ └───┘ └───┘             │
├─────────────────────────────────────┤
│ ENSALADAS (≤4, scroll horizontal)   │
│ ┌───┐ ┌───┐ ┌───┐                   │  ← Mismo tamaño
│ └───┘ └───┘ └───┘                   │
└─────────────────────────────────────┘
```

## Solución Propuesta

**Usar carrusel para TODAS las categorías**, independientemente del número de productos. Esto garantiza que todas las tarjetas tengan el mismo tamaño y el mismo comportamiento de scroll horizontal.

---

## Cambios Técnicos

### Archivo: `src/components/CategorySection.tsx`

| Antes | Después |
|-------|---------|
| Grid si items ≤ 4, Carrusel si > 4 | Siempre Carrusel |

**Cambio específico:**

Eliminar la lógica condicional y usar siempre `ProductCarousel`:

```text
Antes (líneas 27 y 59-76):
const useCarousel = items.length > 4;

{useCarousel ? (
  <ProductCarousel ... />
) : (
  <div className="grid ...">
    {items.map(...)}
  </div>
)}

Después:
// Eliminar la variable useCarousel
// Siempre usar ProductCarousel

<ProductCarousel 
  items={items} 
  currency={currency} 
  displayMode={displayMode} 
/>
```

---

## Beneficios

1. **Consistencia visual**: Todas las tarjetas tienen el mismo tamaño (150px/185px)
2. **Experiencia unificada**: Siempre scroll horizontal, mismo patrón de interacción
3. **Código más simple**: Elimina la lógica condicional grid/carrusel
4. **Mobile-first**: El carrusel es más natural en dispositivos móviles

---

## Alternativa Considerada

Otra opción sería forzar el grid a usar el mismo ancho fijo que el carrusel. Sin embargo, esto resultaría en mucho espacio vacío en categorías con pocos productos. El carrusel mantiene las tarjetas compactas y alineadas a la izquierda, lo cual es más natural.

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/CategorySection.tsx` | Eliminar condicional grid/carrusel, siempre usar `ProductCarousel` |

