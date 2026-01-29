
# Plan: Mejorar UX del Carrito

## Problemas Identificados

| Problema | Ubicación | Impacto |
|----------|-----------|---------|
| Botón "Ver carrito completo" redundante | `CartDrawer.tsx` | Confusión - el drawer ya muestra el carrito |
| Falta botón visible "Volver al inicio" | `Cart.tsx` | Usuario atrapado sin CTA claro |
| Botón carrito poco visible en móvil | `MenuHeader.tsx` | Usuarios no ven sus items agregados |
| No hay botón flotante con subtotal | N/A | Poca urgencia de compra |

---

## Solución Propuesta

### 1. Simplificar CartDrawer

Eliminar el botón "Ver carrito completo" ya que el drawer **es** el carrito completo con toda la funcionalidad necesaria (modificar cantidades, ver subtotal, ir a checkout).

**Antes:**
```
┌─────────────────────────────────┐
│ [Finalizar Compra]              │
│ [Ver carrito completo]  ← quitar│
└─────────────────────────────────┘
```

**Después:**
```
┌─────────────────────────────────┐
│ [Finalizar Compra]              │
│ [Seguir comprando]  ← nuevo     │
└─────────────────────────────────┘
```

El segundo botón cambia a "Seguir comprando" que cierra el drawer y permite continuar navegando.

### 2. Mejorar página Cart.tsx

Agregar un botón más prominente para volver al menú en la parte inferior del resumen:

```
┌─────────────────────────────────┐
│ Resumen                         │
│ ─────────────────────────────── │
│ Subtotal             $XX.XX     │
│ Total                $XX.XX     │
│ ─────────────────────────────── │
│ [Finalizar Compra]              │
│ [← Volver al Menú]   ← más claro│
└─────────────────────────────────┘
```

El botón existente ya dice "Seguir Comprando" pero agregaremos un icono de flecha para mayor claridad visual.

### 3. Crear Botón Flotante de Carrito (Móvil)

Nuevo componente `FloatingCartButton.tsx` que aparece cuando hay items en el carrito:

```
┌────────────────────────────────────────────┐
│                  Contenido                 │
│                                            │
│                                            │
│                                            │
├────────────────────────────────────────────┤
│  ┌────────────────────────────────────┐    │
│  │ 🛒 3 items • $45.00   [Ver Carrito]│    │  ← Nuevo botón flotante
│  └────────────────────────────────────┘    │
├────────────────────────────────────────────┤
│ [USD/VES] [Share] [Carrito] [Pedir]        │  ← StickyActionBar existente
└────────────────────────────────────────────┘
```

**Características:**
- Solo visible en móvil (`md:hidden`)
- Solo aparece cuando `totalItems > 0`
- Muestra cantidad de items y subtotal
- Click navega directo a `/carrito` (sin drawer)
- Posicionado arriba del StickyActionBar
- Animación de entrada/salida

---

## Cambios Técnicos

### Archivo 1: `src/components/cart/CartDrawer.tsx`

**Líneas 239-246** - Reemplazar botón redundante:

```tsx
// ANTES
<Button 
  variant="outline" 
  className="w-full"
  onClick={handleViewCart}
>
  Ver carrito completo
</Button>

// DESPUÉS
<SheetClose asChild>
  <Button 
    variant="outline" 
    className="w-full"
  >
    Seguir comprando
  </Button>
</SheetClose>
```

Eliminar también la función `handleViewCart` ya que no se usa.

### Archivo 2: `src/pages/Cart.tsx`

**Línea 199-205** - Mejorar botón de navegación:

```tsx
// ANTES
<Button 
  variant="outline" 
  className="w-full"
  onClick={() => navigate('/')}
>
  Seguir Comprando
</Button>

// DESPUÉS
<Button 
  variant="outline" 
  className="w-full gap-2"
  onClick={() => navigate('/')}
>
  <ArrowLeft className="h-4 w-4" />
  Volver al Menú
</Button>
```

### Archivo 3: `src/components/cart/FloatingCartButton.tsx` (NUEVO)

Crear nuevo componente de botón flotante:

```tsx
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const FloatingCartButton = () => {
  const { totalItems, subtotal } = useCart();
  const { currency, displayMode, getPrices } = useCurrency();
  const navigate = useNavigate();

  // No mostrar si no hay items
  if (totalItems === 0) return null;

  const prices = getPrices(subtotal);
  
  const formattedPrice = displayMode === 'solo_usd' 
    ? prices.formattedUSD 
    : displayMode === 'solo_ves' 
      ? prices.formattedVES 
      : currency === 'USD' 
        ? prices.formattedUSD 
        : prices.formattedVES;

  return (
    <div className="fixed bottom-[72px] left-4 right-4 z-40 md:hidden">
      <Button
        onClick={() => navigate('/carrito')}
        className={cn(
          "w-full h-14 justify-between px-4",
          "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
          "shadow-lg rounded-xl",
          "animate-in slide-in-from-bottom-4 duration-300"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            <Badge className="absolute -top-2 -right-2 h-4 min-w-4 p-0 text-[10px]">
              {totalItems}
            </Badge>
          </div>
          <span className="font-medium">
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-bold">{formattedPrice}</span>
          <span className="text-sm opacity-80">Ver →</span>
        </div>
      </Button>
    </div>
  );
};
```

### Archivo 4: `src/pages/Index.tsx`

Agregar el nuevo componente flotante:

```tsx
import { FloatingCartButton } from '@/components/cart/FloatingCartButton';

// En el JSX, antes de StickyActionBar:
<FloatingCartButton />
<StickyActionBar ... />
```

### Archivo 5: `src/components/StickyActionBar.tsx`

Simplificar el botón de carrito ya que el botón flotante manejará la visibilidad principal. Quitar el CartDrawer del StickyActionBar para evitar duplicidad:

```tsx
// Quitar la línea de CartDrawer del StickyActionBar
// El botón flotante se encarga de mostrar el carrito en móvil
```

---

## Resumen de Archivos

| Archivo | Acción |
|---------|--------|
| `src/components/cart/CartDrawer.tsx` | Modificar - Cambiar botón redundante |
| `src/pages/Cart.tsx` | Modificar - Mejorar botón volver |
| `src/components/cart/FloatingCartButton.tsx` | Crear - Botón flotante con subtotal |
| `src/pages/Index.tsx` | Modificar - Agregar FloatingCartButton |
| `src/components/StickyActionBar.tsx` | Modificar - Quitar CartDrawer duplicado |

---

## Flujo de Usuario Después del Cambio

**En móvil:**
1. Usuario agrega producto → Aparece botón flotante con "2 productos • $25.00 Ver →"
2. Click en botón flotante → Navega a `/carrito`
3. En `/carrito` → Ve productos, puede modificar, botón prominente "Volver al Menú"
4. Click "Finalizar Compra" → Checkout

**En desktop:**
1. Usuario agrega producto → Badge en icono de carrito (header)
2. Click en carrito → Abre drawer con productos
3. "Seguir comprando" → Cierra drawer
4. "Finalizar Compra" → Checkout

---

## Resultado Visual Esperado (Móvil)

```
┌────────────────────────────────────────────┐
│ [Logo]                          [🛒 Badge] │ Header
├────────────────────────────────────────────┤
│                                            │
│           Contenido del menú               │
│                                            │
│                                            │
├────────────────────────────────────────────┤
│ ╔════════════════════════════════════════╗ │
│ ║ 🛒 3   3 productos      $45.00  Ver → ║ │ ← NUEVO: Botón flotante
│ ╚════════════════════════════════════════╝ │
├────────────────────────────────────────────┤
│ [USD│VES]    [📤] [🛒Carrito] [💬 Pedir] │ │ StickyActionBar simplificado
└────────────────────────────────────────────┘
```
