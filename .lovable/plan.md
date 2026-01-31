

# Plan: Agregar Campo de Notas al CartDrawer

## Diagnóstico del Problema

El campo de notas para productos **solo está disponible en la página `/carrito`**, pero no en el `CartDrawer` (drawer lateral que aparece al hacer clic en el icono del carrito en escritorio).

| Componente | Ubicación | ¿Tiene campo de notas? |
|------------|-----------|----------------------|
| `Cart.tsx` | Página `/carrito` | ✅ Sí (textarea completo) |
| `CartDrawer.tsx` | Drawer lateral | ❌ Solo muestra notas existentes |

Esto significa que los usuarios de escritorio que usan el drawer no pueden agregar notas a sus productos.

---

## Solución

Agregar un campo de notas compacto al `CartDrawer` similar al de la página del carrito.

### Cambios en `CartDrawer.tsx`

1. Importar componentes necesarios (`Textarea`, iconos)
2. Agregar estado para controlar qué notas están expandidas
3. Importar `updateItemNotes` del contexto
4. Agregar UI colapsable para editar notas en cada producto

### Diseño Propuesto

```text
┌──────────────────────────────────────┐
│ [IMG]  Chicken Crunch          [X]   │
│        $8.00 c/u                     │
│        📝 sin vegetales (si existe)  │
│  [−] 2 [+]               $16.00      │
│  ─────────────────────────────────   │
│  💬 Agregar nota                  ▼  │
│  ┌────────────────────────────────┐  │
│  │ Ej: sin vegetales...          │  │  ← Textarea colapsable
│  └────────────────────────────────┘  │
│                              45/200  │
└──────────────────────────────────────┘
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/cart/CartDrawer.tsx` | Agregar campo de notas editable con UI colapsable |

---

## Implementación Detallada

### 1. Importaciones adicionales
```typescript
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
```

### 2. Estado y función del contexto
```typescript
const { items, totalItems, subtotal, removeFromCart, updateQuantity, updateItemNotes } = useCart();
const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

const toggleNotesExpanded = (itemId: string) => {
  setExpandedNotes(prev => ({ ...prev, [itemId]: !prev[itemId] }));
};
```

### 3. UI de notas dentro de cada item (después del precio total)
```typescript
{/* Notes Section */}
<div className="mt-2 pt-2 border-t border-border/50">
  <button
    onClick={() => toggleNotesExpanded(item.id)}
    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
  >
    <MessageSquare className="h-3 w-3" />
    <span>{item.notes ? 'Editar nota' : 'Agregar nota'}</span>
    {isNotesExpanded ? (
      <ChevronUp className="h-3 w-3 ml-auto" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-auto" />
    )}
  </button>
  
  {isNotesExpanded && (
    <div className="mt-1.5 animate-in slide-in-from-top-2 duration-200">
      <Textarea
        value={item.notes || ''}
        onChange={(e) => updateItemNotes(item.id, e.target.value)}
        placeholder="Ej: sin vegetales, extra salsa..."
        className="min-h-[50px] text-xs resize-none"
        maxLength={200}
      />
      <p className="text-[10px] text-muted-foreground mt-0.5 text-right">
        {(item.notes?.length || 0)}/200
      </p>
    </div>
  )}
</div>
```

---

## Resultado Esperado

Después de esta modificación:

| Dispositivo | Comportamiento |
|-------------|----------------|
| **Móvil** | FloatingCartButton → `/carrito` → Notas disponibles ✅ |
| **Escritorio** | CartDrawer → Notas disponibles ✅ |

Los usuarios podrán agregar notas como "sin vegetales" o "extra salsa" desde cualquier dispositivo.

