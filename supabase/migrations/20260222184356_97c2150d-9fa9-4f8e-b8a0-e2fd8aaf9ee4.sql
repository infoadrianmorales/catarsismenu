
-- Function to auto-cancel stale NEW orders (older than 48 hours)
CREATE OR REPLACE FUNCTION public.auto_cancel_stale_orders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
BEGIN
  WITH updated AS (
    UPDATE orders 
    SET status = 'CANCELED', updated_at = now()
    WHERE status = 'NEW' 
    AND created_at < now() - interval '48 hours'
    RETURNING id
  )
  SELECT count(*)::integer INTO v_count FROM updated;
  
  RETURN v_count;
END;
$$;
