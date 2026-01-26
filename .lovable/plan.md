
# Plan: Corregir políticas RLS para el checkout

## Problema Detectado

Los logs de la base de datos muestran errores de Row Level Security (RLS):
- `new row violates row-level security policy for table "orders"`  
- `new row violates row-level security policy for table "pending_checkouts"`

### Causa Raíz

El código de checkout usa `.insert().select()` para obtener el `order_number` generado:

```javascript
const { data: insertedOrder } = await supabase
  .from('orders')
  .insert({...})
  .select('order_number')  // ← FALLA: no hay política SELECT pública
  .single();
```

**Políticas actuales:**
| Tabla | INSERT | SELECT |
|-------|--------|--------|
| orders | `true` (permite) | Solo admins |
| pending_checkouts | `true` (permite) | Solo admins |
| order_items | `true` (permite) | Solo admins |

Cuando Supabase ejecuta `.insert().select()`, primero inserta (OK) pero luego intenta leer el registro insertado (FALLA porque no hay política SELECT para usuarios anónimos).

Para `pending_checkouts`, el código primero hace un SELECT para verificar si existe:
```javascript
const { data: existing } = await supabase
  .from('pending_checkouts')
  .select('id')
  .eq('session_id', sessionId)
  .maybeSingle();  // ← FALLA silenciosamente
```

---

## Solución

Agregar políticas SELECT temporales que permitan leer registros recién creados de forma segura.

### Cambios en la Base de Datos

#### 1. Tabla `orders`
Crear política que permita leer la orden por su ID (el cliente conoce el ID porque lo generó con `crypto.randomUUID()`):

```sql
CREATE POLICY "Users can read own order by id"
ON public.orders FOR SELECT
USING (true);  -- Temporal: permite leer cualquier orden
```

**Alternativa más segura (recomendada):**
En lugar de abrir SELECT, modificar el código para no depender del SELECT después del INSERT.

#### 2. Tabla `pending_checkouts`
Crear política que permita leer por `session_id`:

```sql
CREATE POLICY "Anyone can read pending_checkouts by session"
ON public.pending_checkouts FOR SELECT
USING (true);  -- Permite leer para verificar existencia
```

---

## Enfoque Recomendado

### Opción A: Modificar políticas RLS (simple pero menos seguro)
Agregar políticas SELECT públicas para `orders` y `pending_checkouts`.

**Riesgo**: Cualquier persona podría leer órdenes de otros usuarios si conoce el ID.

### Opción B: Modificar código (más seguro)
Cambiar la lógica del checkout para no depender del SELECT después del INSERT:

1. Usar función de base de datos `RETURNING` con `INSERT`
2. Generar el `order_number` en el cliente antes de insertar
3. Usar una función `SECURITY DEFINER` para manejar todo el flujo

**Recomendación**: Opción B (código más seguro)

---

## Cambios Propuestos (Opción B - Código)

### Archivo: `src/pages/Checkout.tsx`

**Problema actual:**
```javascript
const { data: insertedOrder } = await supabase
  .from('orders')
  .insert({...})
  .select('order_number')  // Requiere SELECT permission
  .single();
```

**Solución:**
1. Eliminar `.select('order_number')` del INSERT
2. Obtener el `order_number` usando una función de base de datos `SECURITY DEFINER`

### Función de Base de Datos

Crear una función que inserta la orden y devuelve el número generado:

```sql
CREATE OR REPLACE FUNCTION create_order_and_return_number(
  p_id uuid,
  p_customer_id uuid,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_email text,
  p_currency_mode text,
  p_payment_currency text,
  p_exchange_rate numeric,
  p_payment_method text,
  p_notes text,
  p_delivery_type text,
  p_delivery_address text,
  p_delivery_maps_url text,
  p_subtotal numeric,
  p_total numeric
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_number text;
BEGIN
  INSERT INTO orders (
    id, customer_id, first_name, last_name, phone, email,
    currency_mode, payment_currency, exchange_rate, payment_method,
    notes, delivery_type, delivery_address, delivery_maps_url,
    subtotal, total, status, whatsapp_message
  ) VALUES (
    p_id, p_customer_id, p_first_name, p_last_name, p_phone, p_email,
    p_currency_mode, p_payment_currency, p_exchange_rate, p_payment_method,
    p_notes, p_delivery_type, p_delivery_address, p_delivery_maps_url,
    p_subtotal, p_total, 'NEW', ''
  )
  RETURNING order_number INTO v_order_number;
  
  RETURN v_order_number;
END;
$$;
```

### Cambios en Checkout.tsx

```javascript
// Usar RPC en lugar de insert + select
const { data: orderNumber, error: orderError } = await supabase
  .rpc('create_order_and_return_number', {
    p_id: newOrderId,
    p_customer_id: customerId,
    // ... resto de parámetros
  });

const generatedOrderNumber = orderNumber || `#${newOrderId.slice(0, 8).toUpperCase()}`;
```

### Política para pending_checkouts

```sql
CREATE POLICY "Anyone can read pending_checkouts by session"
ON public.pending_checkouts FOR SELECT
USING (true);
```

Esta es segura porque `pending_checkouts` solo contiene datos de sesión temporales, no información sensible.

---

## Resumen de Archivos a Modificar

| Archivo/Recurso | Cambio |
|----------------|--------|
| Base de datos | Crear función `create_order_and_return_number` |
| Base de datos | Agregar política SELECT para `pending_checkouts` |
| `src/pages/Checkout.tsx` | Usar `.rpc()` en lugar de `.insert().select()` |

---

## Resultado Esperado

- El checkout completará exitosamente sin errores de RLS
- El `order_number` se obtendrá correctamente
- El mensaje de WhatsApp se enviará con el número de orden real
- Los carritos abandonados se trackearán correctamente
