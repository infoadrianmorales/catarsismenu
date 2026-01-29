

# Plan: Ocultar Carrito en Modo Local (/menu)

## Problema Identificado

La página `/menu` (modo local para QR en el restaurante) muestra elementos de e-commerce que no deberían aparecer:

| Elemento | Estado Actual | Estado Esperado |
|----------|---------------|-----------------|
| CartDrawer en header | ✅ Visible | ❌ Oculto |
| Botones "Agregar" en productos | ✅ Visible | ❌ Ocultos |
| FloatingWhatsApp | ✅ Oculto | ✅ Oculto |

El contexto `ViewModeContext` ya detecta correctamente el modo, pero los componentes no lo utilizan.

---

## Solución

Modificar los componentes para que consulten el `ViewModeContext` y oculten la funcionalidad del carrito cuando `isLocalMode = true`.

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/MenuHeader.tsx` | Ocultar `CartDrawer` en modo local |
| `src/components/MenuCard.tsx` | Ocultar `AddToCartButton` en modo local |
| `src/components/CompactProductCard.tsx` | Ocultar `AddToCartButton` en modo local |

---

## Cambios Detallados

### 1. MenuHeader.tsx

```tsx
// Agregar import
import { useViewMode } from '@/contexts/ViewModeContext';

// Dentro del componente
const { isLocalMode } = useViewMode();

// Condicionar CartDrawer
{!isLocalMode && <CartDrawer />}
```

### 2. MenuCard.tsx

```tsx
// Agregar import
import { useViewMode } from '@/contexts/ViewModeContext';

// Dentro del componente
const { isLocalMode } = useViewMode();

// Condicionar AddToCartButton - en modo local solo muestra precio
<div className="flex items-center justify-between gap-2">
  {renderPrices()}
  {!isLocalMode && <AddToCartButton product={item} variant="compact" />}
</div>
```

### 3. CompactProductCard.tsx

```tsx
// Agregar import
import { useViewMode } from '@/contexts/ViewModeContext';

// Dentro del componente
const { isLocalMode } = useViewMode();

// Condicionar AddToCartButton
<div className="mt-auto flex items-end justify-between gap-1 pt-1">
  {renderPrice()}
  {!isLocalMode && <AddToCartButton product={item} variant="icon" />}
</div>
```

---

## Resultado Visual

### Modo Delivery (/)
```text
┌─────────────────────────────────────┐
│ [Logo]               [USD/VES] [🛒] │  ← CartDrawer visible
├─────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐          │
│  │ 🍔      │  │ 🍕      │          │
│  │ Burger  │  │ Pizza   │          │
│  │ $12     │  │ $15     │          │
│  │  [+]    │  │  [+]    │          │  ← Botones visibles
│  └─────────┘  └─────────┘          │
└─────────────────────────────────────┘
```

### Modo Local (/menu)
```text
┌─────────────────────────────────────┐
│ [Logo]               [USD/VES]      │  ← Sin CartDrawer
├─────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐          │
│  │ 🍔      │  │ 🍕      │          │
│  │ Burger  │  │ Pizza   │          │
│  │ $12     │  │ $15     │          │
│  │         │  │         │          │  ← Sin botones
│  └─────────┘  └─────────┘          │
└─────────────────────────────────────┘
```

---

## Resumen de Cambios

| Archivo | Líneas Modificadas |
|---------|-------------------|
| `MenuHeader.tsx` | +3 líneas (import + hook + condición) |
| `MenuCard.tsx` | +3 líneas |
| `CompactProductCard.tsx` | +3 líneas |

---

## Beneficios

- **Experiencia limpia**: Clientes en el local ven solo el menú, sin distracciones de e-commerce
- **Código reutilizable**: Los mismos componentes funcionan en ambos modos
- **Mantenimiento fácil**: Un solo contexto controla todo el comportamiento

