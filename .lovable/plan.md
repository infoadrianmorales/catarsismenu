

# Plan de Implementación: Mejoras de Seguridad Completas

## Resumen Ejecutivo

Implementar 5 mejoras de seguridad en orden de prioridad, protegiendo la base de datos contra ataques directos, spam y exposición de datos sensibles.

---

## Fase 1: RLS para pending_checkouts (Alta Prioridad)

### Problema Actual
Cualquier usuario puede modificar o eliminar checkouts de otras sesiones.

### Solución
Usar una función de base de datos para validar `session_id` de forma segura.

### Cambios en Base de Datos

```sql
-- Función para obtener session_id del cliente de forma segura
CREATE OR REPLACE FUNCTION get_client_session_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    current_setting('request.headers', true)::json->>'x-session-id',
    ''
  )
$$;

-- Actualizar políticas de pending_checkouts
DROP POLICY IF EXISTS "Anyone can update pending_checkouts by session" ON pending_checkouts;
DROP POLICY IF EXISTS "Anyone can delete pending_checkouts by session" ON pending_checkouts;
DROP POLICY IF EXISTS "Anyone can read pending_checkouts by session" ON pending_checkouts;

-- Solo el dueño de la sesión puede leer su checkout
CREATE POLICY "Users can read own pending_checkouts"
ON pending_checkouts FOR SELECT
USING (
  session_id = get_client_session_id()
  OR is_admin(auth.uid())
);

-- Solo el dueño puede actualizar
CREATE POLICY "Users can update own pending_checkouts"
ON pending_checkouts FOR UPDATE
USING (session_id = get_client_session_id());

-- Solo el dueño puede eliminar
CREATE POLICY "Users can delete own pending_checkouts"
ON pending_checkouts FOR DELETE
USING (session_id = get_client_session_id());
```

### Cambios en Frontend (Checkout.tsx)

Agregar header `x-session-id` a las llamadas de Supabase para pending_checkouts:

```typescript
// En las llamadas a pending_checkouts, incluir el session_id
const sessionId = getSessionId();

// Para SELECT
const { data: existing } = await supabase
  .from('pending_checkouts')
  .select('id')
  .eq('session_id', sessionId)
  .maybeSingle();

// Nota: Supabase automáticamente incluye headers si se configuran globalmente
// o usar .headers({ 'x-session-id': sessionId }) en cada llamada
```

---

## Fase 2: Validación en RLS de orders/order_items (Alta Prioridad)

### Problema Actual
Las políticas INSERT usan `WITH CHECK (true)` sin validar datos.

### Solución
Agregar validaciones básicas directamente en RLS.

### Cambios en Base de Datos

```sql
-- Actualizar política de INSERT en orders
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;

CREATE POLICY "Anyone can insert valid orders"
ON orders FOR INSERT
WITH CHECK (
  -- Validaciones básicas
  total > 0
  AND subtotal >= 0
  AND first_name IS NOT NULL AND length(trim(first_name)) > 0
  AND last_name IS NOT NULL AND length(trim(last_name)) > 0
  AND phone IS NOT NULL AND length(trim(phone)) >= 7
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND payment_method IS NOT NULL AND length(trim(payment_method)) > 0
);

-- Actualizar política de INSERT en order_items
DROP POLICY IF EXISTS "Anyone can insert order_items" ON order_items;

CREATE POLICY "Anyone can insert valid order_items"
ON order_items FOR INSERT
WITH CHECK (
  quantity > 0
  AND unit_price_snapshot >= 0
  AND line_total >= 0
  AND product_name_snapshot IS NOT NULL
  AND length(trim(product_name_snapshot)) > 0
);
```

---

## Fase 3: Separación de Config Público/Privado (Alta Prioridad)

### Problema Actual
Datos sensibles como `tasa_manual` son visibles públicamente.

### Datos en Config Actual
| Clave | Tipo | Visibilidad Recomendada |
|-------|------|------------------------|
| whatsapp | Público | Necesario para contacto |
| instagram_url | Público | Redes sociales |
| tiktok_url | Público | Redes sociales |
| maps_url | Público | Ubicación |
| meta_pixel_id | Público | Tracking (si está habilitado) |
| meta_pixel_enabled | Público | Tracking |
| tasa_ves | Público | Precios mostrados |
| price_display_mode | Público | UI |
| rate_source | Privado | Lógica interna |
| tasa_manual | Privado | Dato financiero sensible |
| bcv_last_sync | Privado | Metadato interno |
| bcv_source | Privado | Metadato interno |

### Solución: Agregar columna is_public

```sql
-- Agregar columna para distinguir config público de privado
ALTER TABLE config ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- Marcar configuraciones sensibles como privadas
UPDATE config SET is_public = false WHERE key IN (
  'tasa_manual',
  'rate_source', 
  'bcv_last_sync',
  'bcv_source'
);

-- Actualizar política de SELECT
DROP POLICY IF EXISTS "Anyone can read config" ON config;

CREATE POLICY "Anyone can read public config"
ON config FOR SELECT
USING (
  is_public = true
  OR is_admin(auth.uid())
);
```

### Cambios en Frontend (useConfig.ts)

Actualizar el tipo para incluir solo datos públicos en el default:

```typescript
// La query sigue igual, pero ahora solo retornará datos públicos
// para usuarios no autenticados
```

---

## Fase 4: Rate Limiting en Checkout (Media Prioridad)

### Problema Actual
Sin límites, un bot puede crear miles de pedidos.

### Solución: Rate Limiting con tabla auxiliar

```sql
-- Tabla para tracking de rate limits
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- session_id o IP
  action_type text NOT NULL, -- 'order_create', 'pending_checkout'
  created_at timestamptz DEFAULT now()
);

-- Índice para consultas rápidas
CREATE INDEX idx_rate_limits_lookup 
ON rate_limits(identifier, action_type, created_at);

-- Función para verificar rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_attempts int,
  p_window_minutes int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  -- Contar intentos recientes
  SELECT count(*) INTO v_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND action_type = p_action
    AND created_at > now() - (p_window_minutes || ' minutes')::interval;
  
  IF v_count >= p_max_attempts THEN
    RETURN false; -- Límite excedido
  END IF;
  
  -- Registrar este intento
  INSERT INTO rate_limits (identifier, action_type)
  VALUES (p_identifier, p_action);
  
  RETURN true;
END;
$$;

-- Limpieza automática de registros viejos (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM rate_limits WHERE created_at < now() - interval '1 day';
$$;

-- Habilitar RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Solo funciones internas pueden acceder
CREATE POLICY "No direct access to rate_limits"
ON rate_limits FOR ALL
USING (false);
```

### Actualizar RPC de Creación de Orden

```sql
-- Modificar create_order_and_return_number para incluir rate limit
CREATE OR REPLACE FUNCTION create_order_and_return_number(
  p_id uuid,
  p_customer_id uuid,
  -- ... otros parámetros existentes ...
  p_session_id text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_number text;
  v_rate_ok boolean;
BEGIN
  -- Verificar rate limit (5 pedidos por hora por sesión)
  IF p_session_id IS NOT NULL THEN
    SELECT check_rate_limit(p_session_id, 'order_create', 5, 60) INTO v_rate_ok;
    IF NOT v_rate_ok THEN
      RAISE EXCEPTION 'Rate limit exceeded';
    END IF;
  END IF;

  -- ... resto de la lógica existente ...
END;
$$;
```

### Cambios en Frontend (Checkout.tsx)

```typescript
// En handleSubmit, pasar session_id al RPC
const { data: generatedOrderNumber, error: orderError } = await supabase
  .rpc('create_order_and_return_number', {
    // ... parámetros existentes ...
    p_session_id: getSessionId(),
  });

// Manejar error de rate limit
if (orderError) {
  if (orderError.message.includes('Rate limit')) {
    toast.error('Has excedido el límite de pedidos. Intenta más tarde.');
    return;
  }
  throw orderError;
}
```

---

## Fase 5: Protección de Contraseñas Filtradas (Baja Prioridad)

### Problema Actual
Los administradores pueden usar contraseñas que han sido expuestas en brechas de datos.

### Solución
Habilitar la protección en la configuración de autenticación del backend.

### Pasos
1. Acceder al panel de Lovable Cloud
2. Ir a Authentication > Settings
3. Habilitar "Leaked Password Protection"

Esta configuración rechazará automáticamente contraseñas que aparezcan en bases de datos de contraseñas filtradas.

---

## Resumen de Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| Migraciones SQL | 4 migraciones nuevas |
| `src/pages/Checkout.tsx` | Agregar session_id a RPC, manejar rate limit |
| `src/hooks/useConfig.ts` | Sin cambios (RLS filtra automáticamente) |
| Configuración Auth | Habilitar leaked password protection |

---

## Orden de Implementación Recomendado

```text
Semana 1:
├── Fase 1: RLS pending_checkouts
├── Fase 2: Validación orders/order_items
└── Fase 3: Separación config público/privado

Semana 2:
├── Fase 4: Rate limiting
└── Fase 5: Leaked password protection
```

---

## Beneficios Esperados

| Mejora | Riesgo Mitigado |
|--------|-----------------|
| RLS pending_checkouts | Manipulación de carritos ajenos |
| Validación orders | Datos corruptos, inyección |
| Config separado | Exposición de datos financieros |
| Rate limiting | Spam, ataques DoS |
| Leaked passwords | Cuentas admin comprometidas |

---

## Notas Importantes

1. **Compatibilidad**: Las validaciones de RLS deben coincidir con la validación Zod del frontend para evitar rechazos inesperados

2. **Testing**: Después de cada fase, probar el flujo completo de checkout

3. **Rollback**: Cada fase es independiente y puede revertirse sin afectar las otras

4. **Monitoreo**: Revisar logs después de implementar para detectar rechazos legítimos

