-- ============================================================
-- SEGURIDAD [C7]: Se agrega validación de session_id al
-- insertar items en una orden.
-- Evita que alguien que conozca un order_id ajeno pueda
-- inyectar items en ese pedido.
-- La condición OR session_id IS NULL protege pedidos
-- anteriores a la migración.
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_order_exists(p_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM orders
    WHERE id = p_order_id
    AND created_at > now() - interval '5 minutes'
    AND (session_id IS NULL OR session_id = get_client_session_id())
  )
$$;

-- ============================================================
-- SEGURIDAD [C8a]: Expiración automática de checkouts.
-- Limita la ventana en que datos del carrito son accesibles.
-- ============================================================
ALTER TABLE public.pending_checkouts
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ
DEFAULT (NOW() + INTERVAL '30 minutes');

-- SEGURIDAD [C8b]: Fortalecer política INSERT de pending_checkouts
-- con validación UUID v4
DROP POLICY IF EXISTS "Anyone can insert pending_checkouts with valid session" ON public.pending_checkouts;
CREATE POLICY "Anyone can insert pending_checkouts with valid session"
ON public.pending_checkouts FOR INSERT
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) >= 20
  AND session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
);

-- SEGURIDAD [C8c]: Fortalecer política SELECT de pending_checkouts
-- con validación UUID + expires_at
DROP POLICY IF EXISTS "Users can read own pending_checkouts" ON public.pending_checkouts;
CREATE POLICY "Users can read own pending_checkouts"
ON public.pending_checkouts FOR SELECT
USING (
  (
    session_id = get_client_session_id()
    AND session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    AND (expires_at IS NULL OR expires_at > NOW())
  )
  OR is_admin(auth.uid())
);

-- SEGURIDAD [C8d]: Fortalecer política UPDATE de pending_checkouts
DROP POLICY IF EXISTS "Users can update own pending_checkouts" ON public.pending_checkouts;
CREATE POLICY "Users can update own pending_checkouts"
ON public.pending_checkouts FOR UPDATE
USING (
  session_id = get_client_session_id()
  AND session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND (expires_at IS NULL OR expires_at > NOW())
);

-- SEGURIDAD [C8e]: Fortalecer política DELETE de pending_checkouts
DROP POLICY IF EXISTS "Users can delete own pending_checkouts" ON public.pending_checkouts;
CREATE POLICY "Users can delete own pending_checkouts"
ON public.pending_checkouts FOR DELETE
USING (
  session_id = get_client_session_id()
  AND session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
);

-- ============================================================
-- SEGURIDAD [C9]: Validaciones mínimas en page_views.
-- Rechaza registros con path vacío o session_id inválido.
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views"
ON public.page_views FOR INSERT
WITH CHECK (
  path IS NOT NULL
  AND length(path) > 0
  AND length(path) < 500
  AND session_id IS NOT NULL
  AND session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
);