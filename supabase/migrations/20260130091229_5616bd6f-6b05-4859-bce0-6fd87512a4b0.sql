-- =====================================================
-- SECURITY FIXES: RLS Policy Hardening
-- =====================================================

-- 1. Eliminar política permisiva de customers INSERT
-- La función find_or_create_customer (SECURITY DEFINER) ya maneja la creación
DROP POLICY IF EXISTS "Anyone can insert customers" ON customers;

-- 2. Mejorar política de pending_checkouts INSERT
-- Requiere session_id válido que coincida con el header x-session-id
DROP POLICY IF EXISTS "Anyone can insert pending_checkouts" ON pending_checkouts;

CREATE POLICY "Session can insert pending_checkouts"
  ON pending_checkouts FOR INSERT
  WITH CHECK (
    session_id IS NOT NULL 
    AND length(session_id) >= 20
    AND session_id = get_client_session_id()
  );

-- 3. Mejorar política de order_items INSERT
-- Agregar validación de que el order_id existe y fue creado recientemente
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

-- 4. Mover extensión pg_net a schema extensions (mejor práctica)
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;