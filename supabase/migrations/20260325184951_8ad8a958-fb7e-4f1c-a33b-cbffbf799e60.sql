-- ============================================================
-- SEGURIDAD [C4]: Función SECURITY DEFINER para actualizar
-- whatsapp_message de forma controlada.
-- Reemplaza el UPDATE directo anónimo que exponía todas
-- las columnas de la orden a modificación.
-- SET search_path = '' previene ataques de schema injection.
-- Doble validación: ventana de 5 minutos + session_id del
-- creador original. Solo modifica whatsapp_message.
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_order_whatsapp_message(
  p_order_id   UUID,
  p_message    TEXT,
  p_session_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order_exists BOOLEAN;
BEGIN
  -- Valida que el pedido sea reciente Y pertenezca al mismo
  -- cliente. session_id IS NULL cubre pedidos legacy.
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = p_order_id
      AND (session_id = p_session_id OR session_id IS NULL)
      AND created_at > NOW() - INTERVAL '5 minutes'
  ) INTO v_order_exists;

  IF NOT v_order_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pedido no encontrado o expirado'
    );
  END IF;

  -- Solo se modifica whatsapp_message
  UPDATE public.orders
  SET whatsapp_message = p_message
  WHERE id = p_order_id;

  RETURN json_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.update_order_whatsapp_message(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_order_whatsapp_message(UUID, TEXT, TEXT) TO anon, authenticated;

-- ============================================================
-- SEGURIDAD [C5]: Se elimina UPDATE anónimo directo en orders.
-- Reemplazado por RPC update_order_whatsapp_message que:
-- 1. Valida session_id del creador original
-- 2. Restringe cambios solo a whatsapp_message
-- 3. Aplica ventana de 5 minutos
-- 4. Usa SECURITY DEFINER con search_path fijo
-- ============================================================
DROP POLICY IF EXISTS "Anyone can update whatsapp_message on recent orders" ON public.orders;