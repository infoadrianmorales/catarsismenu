
# Plan: Corregir Errores de RLS en Checkout

## Diagnóstico

Los logs de la base de datos muestran estos errores:

```text
ERROR: new row violates row-level security policy for table "order_items"
ERROR: new row violates row-level security policy for table "pending_checkouts"
```

### Causa Raíz

Los cambios de seguridad implementados anteriormente crearon políticas RLS demasiado restrictivas que rompen el flujo normal del checkout:

| Tabla | Problema |
|-------|----------|
| `pending_checkouts` | Requiere que `session_id = get_client_session_id()`, pero el header `x-session-id` **nunca se envía** desde el cliente |
| `order_items` | La validación `EXISTS (SELECT 1 FROM orders WHERE id = order_id)` falla porque el usuario anónimo **no tiene permiso SELECT** en `orders` |

---

## Solución

### Opción A: Simplificar las políticas (Recomendada)

Revertir a políticas más permisivas pero seguras, sin depender del header `x-session-id`:

**1. `pending_checkouts`**: Permitir INSERT si tiene un `session_id` válido (sin validar contra header)

```sql
DROP POLICY IF EXISTS "Session can insert pending_checkouts" ON pending_checkouts;

CREATE POLICY "Anyone can insert pending_checkouts with valid session"
  ON pending_checkouts FOR INSERT
  WITH CHECK (
    session_id IS NOT NULL 
    AND length(session_id) >= 20
  );
```

**2. `order_items`**: Usar una función SECURITY DEFINER para validar el order_id

```sql
-- Crear función helper SECURITY DEFINER
CREATE OR REPLACE FUNCTION validate_order_exists(p_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM orders 
    WHERE id = p_order_id 
    AND created_at > now() - interval '5 minutes'
  )
$$;

-- Actualizar política
DROP POLICY IF EXISTS "Valid order_items insert only" ON order_items;

CREATE POLICY "Valid order_items insert only"
  ON order_items FOR INSERT
  WITH CHECK (
    quantity > 0 
    AND unit_price_snapshot >= 0 
    AND line_total >= 0 
    AND product_name_snapshot IS NOT NULL 
    AND length(TRIM(product_name_snapshot)) > 0
    AND validate_order_exists(order_id)
  );
```

---

### Opción B: Implementar el header x-session-id (Más compleja)

Modificar el cliente Supabase para enviar el header en cada request. Esto es más invasivo y requiere cambiar el archivo auto-generado o crear un wrapper.

**No recomendada** porque:
- El archivo `client.ts` es auto-generado y no debe modificarse
- Requiere cambios adicionales en toda la aplicación

---

## Resumen de Cambios

### Migración SQL

```sql
-- 1. Simplificar política de pending_checkouts
DROP POLICY IF EXISTS "Session can insert pending_checkouts" ON pending_checkouts;

CREATE POLICY "Anyone can insert pending_checkouts with valid session"
  ON pending_checkouts FOR INSERT
  WITH CHECK (
    session_id IS NOT NULL 
    AND length(session_id) >= 20
  );

-- 2. Crear función helper para validar orders
CREATE OR REPLACE FUNCTION validate_order_exists(p_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM orders 
    WHERE id = p_order_id 
    AND created_at > now() - interval '5 minutes'
  )
$$;

-- 3. Actualizar política de order_items
DROP POLICY IF EXISTS "Valid order_items insert only" ON order_items;

CREATE POLICY "Valid order_items insert only"
  ON order_items FOR INSERT
  WITH CHECK (
    quantity > 0 
    AND unit_price_snapshot >= 0 
    AND line_total >= 0 
    AND product_name_snapshot IS NOT NULL 
    AND length(TRIM(product_name_snapshot)) > 0
    AND validate_order_exists(order_id)
  );
```

---

## Seguridad Mantenida

Las nuevas políticas siguen siendo seguras:

| Control | Descripción |
|---------|-------------|
| `pending_checkouts` | Solo permite insertar con session_id de al menos 20 caracteres (UUID tiene 36) |
| `order_items` | Solo permite insertar si el order_id existe y fue creado hace menos de 5 minutos |
| `orders` | Sigue usando `create_order_and_return_number` (SECURITY DEFINER) con rate limiting |

---

## Flujo Corregido

```text
Cliente (checkout):
  1. Inserta pending_checkout → ✅ (session_id válido)
  2. Llama RPC create_order_and_return_number → ✅ (SECURITY DEFINER)
  3. Inserta order_items → ✅ (validate_order_exists usa SECURITY DEFINER)
  4. Actualiza order con whatsapp_message → ❌ (requiere parche adicional)
```

### Nota: También hay un problema con UPDATE de orders

El código actual intenta actualizar la orden para agregar el `whatsapp_message`:

```typescript
await supabase
  .from('orders')
  .update({ whatsapp_message: whatsappMessage })
  .eq('id', newOrderId);
```

No hay política que permita esto para usuarios anónimos. **Opciones**:

1. **Mover la generación del mensaje a la función RPC** (recomendado)
2. **Agregar política UPDATE limitada** (menos seguro)

---

## Verificación Post-Implementación

1. Realizar una compra de prueba completa
2. Verificar que se crea la orden en la base de datos
3. Confirmar redirección a WhatsApp
4. Revisar panel de administración para ver la orden
