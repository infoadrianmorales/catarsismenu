CREATE OR REPLACE FUNCTION public.create_order_with_items(
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
  p_session_id text,
  p_whatsapp_message text,
  p_items jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order_number text;
  v_rate_ok boolean;
  v_item jsonb;
  v_quantity integer;
  v_unit_price numeric;
  v_line_total numeric;
  v_product_name text;
BEGIN
  IF p_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'order_id_required');
  END IF;

  IF p_session_id IS NULL OR length(trim(p_session_id)) = 0 THEN
    RETURN json_build_object('success', false, 'error', 'session_id_required');
  END IF;

  IF p_total <= 0 OR p_subtotal < 0 THEN
    RETURN json_build_object('success', false, 'error', 'invalid_total');
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RETURN json_build_object('success', false, 'error', 'items_required');
  END IF;

  SELECT public.check_rate_limit(p_session_id, 'order_create', 5, 60) INTO v_rate_ok;
  IF NOT v_rate_ok THEN
    RETURN json_build_object('success', false, 'error', 'rate_limit_exceeded');
  END IF;

  INSERT INTO public.orders (
    id, customer_id, first_name, last_name, phone, email,
    currency_mode, payment_currency, exchange_rate, payment_method,
    notes, delivery_type, delivery_address, delivery_maps_url,
    subtotal, total, status, whatsapp_message, session_id
  ) VALUES (
    p_id, p_customer_id, trim(p_first_name), trim(p_last_name), trim(p_phone), lower(trim(p_email)),
    p_currency_mode, p_payment_currency, p_exchange_rate, p_payment_method,
    nullif(trim(coalesce(p_notes, '')), ''), p_delivery_type, nullif(trim(coalesce(p_delivery_address, '')), ''), nullif(trim(coalesce(p_delivery_maps_url, '')), ''),
    p_subtotal, p_total, 'NEW', coalesce(p_whatsapp_message, ''), p_session_id
  ) RETURNING order_number INTO v_order_number;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_name := trim(coalesce(v_item->>'product_name_snapshot', ''));
    v_quantity := coalesce((v_item->>'quantity')::integer, 0);
    v_unit_price := coalesce((v_item->>'unit_price_snapshot')::numeric, -1);
    v_line_total := coalesce((v_item->>'line_total')::numeric, -1);

    IF v_product_name = '' OR v_quantity <= 0 OR v_unit_price < 0 OR v_line_total < 0 THEN
      RAISE EXCEPTION 'Invalid order item payload';
    END IF;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name_snapshot,
      unit_price_snapshot,
      quantity,
      line_total,
      extras_snapshot,
      source
    ) VALUES (
      p_id,
      (v_item->>'product_id')::uuid,
      v_product_name,
      v_unit_price,
      v_quantity,
      v_line_total,
      CASE
        WHEN v_item ? 'extras_snapshot' AND v_item->'extras_snapshot' <> 'null'::jsonb THEN v_item->'extras_snapshot'
        ELSE NULL
      END,
      nullif(trim(coalesce(v_item->>'source', 'menu')), '')
    );
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'order_id', p_id,
    'order_number', v_order_number
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object('success', false, 'error', 'duplicate_order');
  WHEN others THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order_with_items(uuid, uuid, text, text, text, text, text, text, numeric, text, text, text, text, text, numeric, numeric, text, text, jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.create_order_with_items(uuid, uuid, text, text, text, text, text, text, numeric, text, text, text, text, text, numeric, numeric, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_with_items(uuid, uuid, text, text, text, text, text, text, numeric, text, text, text, text, text, numeric, numeric, text, text, jsonb) TO service_role;