
# Plan: Corregir 3 Problemas del Sistema de Checkout

## Resumen de Problemas Identificados

| # | Problema | Causa Raíz | Solución |
|---|----------|------------|----------|
| 1 | No hay notas por producto | El carrito no almacena notas individuales | Agregar campo `notes` al `CartItem` |
| 2 | WhatsApp message vacío | El UPDATE falla porque el anon no puede SELECT la orden | Generar el mensaje dentro de la función RPC |
| 3 | Búsqueda no encuentra productos | Solo busca en `nombre` y `descripcion`, no en `categoria` | Incluir `categoria` en la búsqueda |

---

## Problema 1: Notas por Producto

### Estado Actual
El carrito almacena: `id, nombre, precio_usd, imagen, quantity, categoria`

No hay forma de agregar notas como "sin vegetales" o "extra salsa" a cada producto.

### Solución

**Archivos a modificar:**
- `src/contexts/CartContext.tsx` - Agregar campo `notes` a `CartItem`
- `src/pages/Cart.tsx` - Agregar área de texto para notas por producto
- `src/components/cart/CartDrawer.tsx` - Mostrar notas en el drawer
- `src/pages/Checkout.tsx` - Incluir notas de productos en el mensaje de WhatsApp

**Cambios:**

```typescript
// CartContext.tsx
export interface CartItem {
  id: string;
  nombre: string;
  precio_usd: number;
  imagen: string;
  quantity: number;
  categoria: string;
  notes?: string; // NUEVO
}

// Agregar función para actualizar notas
updateItemNotes: (productId: string, notes: string) => void;
```

**Interfaz en Cart.tsx:**
- Debajo de cada producto, mostrar un textarea colapsable
- Placeholder: "Ej: sin vegetales, extra salsa..."
- Límite de 200 caracteres

---

## Problema 2: WhatsApp Message No se Guarda

### Diagnóstico
Las órdenes en la base de datos muestran `whatsapp_message: ""` (vacío).

**Causa:** El código intenta hacer un `UPDATE` después de crear la orden:

```typescript
await supabase
  .from('orders')
  .update({ whatsapp_message: whatsappMessage })
  .eq('id', newOrderId);
```

Este UPDATE falla silenciosamente porque:
1. El usuario anónimo no tiene permiso `SELECT` en la tabla `orders`
2. Sin poder leer la fila, la política de UPDATE no puede verificar la condición `created_at > now() - interval '5 minutes'`
3. El UPDATE retorna éxito pero sin filas afectadas

### Solución

Modificar la función RPC `create_order_and_return_number` para:
1. Aceptar el mensaje de WhatsApp como parámetro
2. Guardarlo directamente durante el INSERT

**Cambios:**

1. **Migración SQL** - Agregar parámetro `p_whatsapp_message`:

```sql
CREATE OR REPLACE FUNCTION create_order_and_return_number(
  -- ... parámetros existentes ...
  p_whatsapp_message text DEFAULT ''
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order_number text;
BEGIN
  -- Rate limit check...
  
  INSERT INTO orders (
    -- ... columnas existentes ...,
    whatsapp_message  -- Agregar columna
  ) VALUES (
    -- ... valores existentes ...,
    p_whatsapp_message  -- Agregar valor
  )
  RETURNING order_number INTO v_order_number;
  
  RETURN v_order_number;
END;
$$;
```

2. **Frontend** - Generar el mensaje ANTES de llamar al RPC:

```typescript
// Checkout.tsx
const previewOrderNum = `CAT-XXXX`; // Placeholder
const whatsappMessage = generateWhatsAppMessage(previewOrderNum);

const { data: generatedOrderNumber } = await supabase.rpc('create_order_and_return_number', {
  // ... otros parámetros ...
  p_whatsapp_message: whatsappMessage.replace('CAT-XXXX', '{{ORDER_NUMBER}}'),
});

// Actualizar el mensaje con el número real
const finalMessage = whatsappMessage.replace('CAT-XXXX', generatedOrderNumber);
```

**Alternativa más simple:** Generar el mensaje en el frontend y luego hacer una segunda llamada RPC solo para guardar el mensaje (nueva función SECURITY DEFINER).

---

## Problema 3: Buscador No Encuentra Productos

### Diagnóstico
Cuando el usuario busca "hamburguesas":
- Los productos tienen `categoria: 'hamburguesas'`
- Pero los nombres son: "Chicken Crunch", "BBQ Champions", "Shrimp Crunch"
- La búsqueda actual solo busca en `nombre` y `descripcion_corta`

### Solución

Incluir el campo `categoria` en la búsqueda:

```typescript
// useSearch.ts - línea 57
filtered = filtered.filter(item =>
  item.nombre.toLowerCase().includes(query) ||
  item.descripcion_corta.toLowerCase().includes(query) ||
  item.categoria.toLowerCase().includes(query) // AGREGAR
);
```

Repetir para la búsqueda en best-sellers (línea 38).

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/contexts/CartContext.tsx` | Agregar `notes` a CartItem, función `updateItemNotes` |
| `src/pages/Cart.tsx` | UI para agregar notas por producto |
| `src/components/cart/CartDrawer.tsx` | Mostrar notas en drawer |
| `src/pages/Checkout.tsx` | Incluir notas en WhatsApp message, pasar mensaje a RPC |
| `src/hooks/useSearch.ts` | Incluir `categoria` en la búsqueda |
| `supabase/migrations/` | Actualizar función `create_order_and_return_number` |

---

## Flujo Corregido

```text
1. Usuario agrega producto al carrito
2. Opcionalmente añade notas al producto (ej: "sin vegetales")
3. En checkout, el mensaje de WhatsApp incluye las notas:
   "- 1x Chicken Crunch — $8.00
      📝 sin vegetales, extra salsa"
4. Al enviar, el mensaje se guarda directamente en la BD via RPC
5. Admin puede copiar el mensaje completo con notas
```

---

## Verificación Post-Implementación

1. Agregar un producto al carrito y añadir notas
2. Completar checkout y verificar que el mensaje de WhatsApp incluye las notas
3. En admin, verificar que el mensaje de WhatsApp se puede copiar
4. Buscar "hamburguesas" y verificar que aparecen los productos de esa categoría
