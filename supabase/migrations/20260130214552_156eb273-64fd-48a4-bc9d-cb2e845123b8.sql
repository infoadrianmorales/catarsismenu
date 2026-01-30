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

-- 4. Agregar política para permitir UPDATE del whatsapp_message en orders recientes
CREATE POLICY "Anyone can update whatsapp_message on recent orders"
  ON orders FOR UPDATE
  USING (created_at > now() - interval '5 minutes')
  WITH CHECK (created_at > now() - interval '5 minutes');