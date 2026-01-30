

# Plan: Resolver Problemas de Seguridad

## Resumen de Hallazgos

Se identificaron **6 problemas de seguridad** que requieren atención:

| Prioridad | Problema | Severidad |
|-----------|----------|-----------|
| 1 | Política RLS permisiva en `customers` (INSERT con `true`) | 🔴 Error |
| 2 | Política RLS permisiva en `pending_checkouts` (INSERT con `true`) | 🟡 Warning |
| 3 | Protección contra contraseñas filtradas deshabilitada | 🟡 Warning |
| 4 | Extensión `pg_net` en schema `public` | 🟡 Warning |
| 5 | Validación insuficiente en `order_items` INSERT | 🟡 Warning |
| 6 | Sin verificación de sesión en inserciones públicas | 🟡 Warning |

---

## Detalle Técnico por Problema

### 1. Política RLS en `customers` - INSERT sin restricción

**Estado actual:**
```sql
-- Permite a CUALQUIERA insertar clientes sin validación
WITH CHECK (true)
```

**Riesgo:** Cualquier persona puede insertar datos falsos o spam en la tabla de clientes.

**Solución:** Cambiar la política para que solo se puedan insertar clientes a través de la función `find_or_create_customer` (que ya es SECURITY DEFINER) y eliminar el acceso directo público.

---

### 2. Política RLS en `pending_checkouts` - INSERT sin restricción

**Estado actual:**
```sql
-- Permite a CUALQUIERA insertar checkouts pendientes
WITH CHECK (true)
```

**Riesgo:** Spam de checkouts falsos que podrían afectar analíticas.

**Solución:** Agregar validación de session_id para que solo se puedan insertar checkouts con un session_id válido.

---

### 3. Protección contra Contraseñas Filtradas

**Estado actual:** Deshabilitada

**Riesgo:** Los administradores pueden usar contraseñas que ya han sido comprometidas en otras brechas de seguridad.

**Solución:** Habilitar la protección de contraseñas filtradas en la configuración de autenticación.

---

### 4. Extensión `pg_net` en Schema `public`

**Estado actual:** La extensión `pg_net` está instalada en el schema `public`.

**Riesgo bajo:** Esto es principalmente una mejor práctica. Las extensiones deberían estar en un schema dedicado como `extensions`.

**Solución:** Mover la extensión al schema `extensions` (requiere recrear la extensión).

---

### 5. Validación en `order_items`

**Estado actual:**
```sql
-- Valida cantidad, precio y nombre, pero NO el order_id
WITH CHECK (
  quantity > 0 AND 
  unit_price_snapshot >= 0 AND 
  line_total >= 0 AND 
  product_name_snapshot IS NOT NULL
)
```

**Riesgo:** Alguien podría insertar items en órdenes de otros usuarios.

**Solución:** Agregar validación para asegurar que el `order_id` corresponda a una orden válida recién creada.

---

### 6. Sin vinculación de sesión en inserciones públicas

**Problema contextual:** Las tablas `customers` y `pending_checkouts` permiten inserción pública sin vincular la operación a una sesión específica.

**Solución:** Usar el header `x-session-id` para validar y vincular las operaciones.

---

## Implementación

### Paso 1: Migración SQL

```sql
-- 1. Eliminar política permisiva de customers INSERT
DROP POLICY IF EXISTS "Anyone can insert customers" ON customers;

-- 2. Mejorar política de pending_checkouts INSERT
DROP POLICY IF EXISTS "Anyone can insert pending_checkouts" ON pending_checkouts;

CREATE POLICY "Session can insert pending_checkouts"
  ON pending_checkouts FOR INSERT
  WITH CHECK (
    session_id IS NOT NULL 
    AND length(session_id) >= 20
    AND session_id = get_client_session_id()
  );

-- 3. Mejorar política de order_items INSERT
DROP POLICY IF EXISTS "Anyone can insert valid order_items" ON order_items;

CREATE POLICY "Valid order_items insert only"
  ON order_items FOR INSERT
  WITH CHECK (
    quantity > 0 
    AND unit_price_snapshot >= 0 
    AND line_total >= 0 
    AND product_name_snapshot IS NOT NULL 
    AND length(TRIM(product_name_snapshot)) > 0
    -- Validar que el order_id existe y fue creado recientemente (últimos 5 min)
    AND EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_id 
      AND o.created_at > now() - interval '5 minutes'
    )
  );

-- 4. Mover extensión pg_net a schema extensions
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;
```

### Paso 2: Habilitar Protección de Contraseñas Filtradas

Usar la herramienta de configuración de autenticación para habilitar la protección contra contraseñas filtradas.

---

## Impacto en Funcionalidad Existente

| Componente | Impacto | Solución |
|------------|---------|----------|
| Checkout | La inserción de `pending_checkouts` requerirá header `x-session-id` | Ya está implementado con `get_client_session_id()` |
| Creación de clientes | No se podrán insertar directamente | Ya se usa `find_or_create_customer()` (SECURITY DEFINER) |
| Order items | Solo se podrán agregar a órdenes recientes | Compatible con flujo actual |

---

## Flujo Actual vs. Flujo Seguro

```text
ACTUAL:
Cliente → INSERT customers → ✅ (sin validación)
Cliente → INSERT pending_checkouts → ✅ (sin validación)
Cliente → INSERT order_items → ✅ (validación básica)

SEGURO:
Cliente → RPC find_or_create_customer → ✅ (SECURITY DEFINER)
Cliente → INSERT pending_checkouts + x-session-id → ✅ (validado)
Cliente → INSERT order_items + order reciente → ✅ (validado)
```

---

## Verificación Post-Implementación

1. Probar crear una orden completa desde checkout
2. Verificar que el panel de admin sigue funcionando
3. Confirmar que los pending_checkouts se registran correctamente
4. Validar login de administradores

