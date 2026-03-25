-- ============================================================
-- SEGURIDAD [C1]: Se agrega session_id a orders.
-- Vincula cada pedido al cliente que lo creó.
-- Pedidos anteriores quedan con session_id = NULL.
-- ============================================================
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- ============================================================
-- SEGURIDAD [C2]: Se actualiza create_order_and_return_number
-- para almacenar session_id al crear el pedido.
-- ============================================================

-- Sobrecarga principal: con p_session_id y p_whatsapp_message
CREATE OR REPLACE FUNCTION public.create_order_and_return_number(
  p_id uuid, p_customer_id uuid, p_first_name text, p_last_name text,
  p_phone text, p_email text, p_currency_mode text, p_payment_currency text,
  p_exchange_rate numeric, p_payment_method text, p_notes text,
  p_delivery_type text, p_delivery_address text, p_delivery_maps_url text,
  p_subtotal numeric, p_total numeric,
  p_session_id text DEFAULT NULL, p_whatsapp_message text DEFAULT ''
)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_order_number text; v_rate_ok boolean;
BEGIN
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
    subtotal, total, status, whatsapp_message, session_id
  ) VALUES (
    p_id, p_customer_id, p_first_name, p_last_name, p_phone, p_email,
    p_currency_mode, p_payment_currency, p_exchange_rate, p_payment_method,
    p_notes, p_delivery_type, p_delivery_address, p_delivery_maps_url,
    p_subtotal, p_total, 'NEW', p_whatsapp_message, p_session_id
  ) RETURNING order_number INTO v_order_number;
  RETURN v_order_number;
END;
$$;

-- Sobrecarga 2: solo p_session_id
CREATE OR REPLACE FUNCTION public.create_order_and_return_number(
  p_id uuid, p_customer_id uuid, p_first_name text, p_last_name text,
  p_phone text, p_email text, p_currency_mode text, p_payment_currency text,
  p_exchange_rate numeric, p_payment_method text, p_notes text,
  p_delivery_type text, p_delivery_address text, p_delivery_maps_url text,
  p_subtotal numeric, p_total numeric, p_session_id text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_order_number text; v_rate_ok boolean;
BEGIN
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
    subtotal, total, status, whatsapp_message, session_id
  ) VALUES (
    p_id, p_customer_id, p_first_name, p_last_name, p_phone, p_email,
    p_currency_mode, p_payment_currency, p_exchange_rate, p_payment_method,
    p_notes, p_delivery_type, p_delivery_address, p_delivery_maps_url,
    p_subtotal, p_total, 'NEW', '', p_session_id
  ) RETURNING order_number INTO v_order_number;
  RETURN v_order_number;
END;
$$;

-- Sobrecarga 3: legacy sin session_id
CREATE OR REPLACE FUNCTION public.create_order_and_return_number(
  p_id uuid, p_customer_id uuid, p_first_name text, p_last_name text,
  p_phone text, p_email text, p_currency_mode text, p_payment_currency text,
  p_exchange_rate numeric, p_payment_method text, p_notes text,
  p_delivery_type text, p_delivery_address text, p_delivery_maps_url text,
  p_subtotal numeric, p_total numeric
)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_order_number text;
BEGIN
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
  ) RETURNING order_number INTO v_order_number;
  RETURN v_order_number;
END;
$$;