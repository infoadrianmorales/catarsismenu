-- =============================================
-- FASE 1: RLS para pending_checkouts con session_id
-- =============================================

-- Función para obtener session_id del cliente de forma segura
CREATE OR REPLACE FUNCTION public.get_client_session_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    current_setting('request.headers', true)::json->>'x-session-id',
    ''
  )
$$;

-- Eliminar políticas antiguas de pending_checkouts
DROP POLICY IF EXISTS "Anyone can update pending_checkouts by session" ON pending_checkouts;
DROP POLICY IF EXISTS "Anyone can delete pending_checkouts by session" ON pending_checkouts;
DROP POLICY IF EXISTS "Anyone can read pending_checkouts by session" ON pending_checkouts;

-- Solo el dueño de la sesión puede leer su checkout (o admins)
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

-- =============================================
-- FASE 2: Validación en RLS de orders/order_items
-- =============================================

-- Actualizar política de INSERT en orders con validaciones
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;

CREATE POLICY "Anyone can insert valid orders"
ON orders FOR INSERT
WITH CHECK (
  total > 0
  AND subtotal >= 0
  AND first_name IS NOT NULL AND length(trim(first_name)) > 0
  AND last_name IS NOT NULL AND length(trim(last_name)) > 0
  AND phone IS NOT NULL AND length(trim(phone)) >= 7
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND payment_method IS NOT NULL AND length(trim(payment_method)) > 0
);

-- Actualizar política de INSERT en order_items con validaciones
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

-- =============================================
-- FASE 3: Separación de Config Público/Privado
-- =============================================

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

-- =============================================
-- FASE 4: Rate Limiting en Checkout
-- =============================================

-- Tabla para tracking de rate limits
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
ON rate_limits(identifier, action_type, created_at);

-- Habilitar RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Solo funciones internas pueden acceder (nadie directamente)
CREATE POLICY "No direct access to rate_limits"
ON rate_limits FOR ALL
USING (false);

-- Función para verificar rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
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
    RETURN false;
  END IF;
  
  -- Registrar este intento
  INSERT INTO rate_limits (identifier, action_type)
  VALUES (p_identifier, p_action);
  
  RETURN true;
END;
$$;

-- Función de limpieza (ejecutar periódicamente vía cron o manual)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM rate_limits WHERE created_at < now() - interval '1 day';
$$;

-- Actualizar función de creación de orden para incluir rate limiting
CREATE OR REPLACE FUNCTION public.create_order_and_return_number(
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
  p_total numeric,
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
  IF p_session_id IS NOT NULL AND length(p_session_id) > 0 THEN
    SELECT check_rate_limit(p_session_id, 'order_create', 5, 60) INTO v_rate_ok;
    IF NOT v_rate_ok THEN
      RAISE EXCEPTION 'Rate limit exceeded: Too many orders. Please try again later.';
    END IF;
  END IF;

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