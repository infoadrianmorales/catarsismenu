-- Add order_number column for sequential display numbers
ALTER TABLE public.orders 
ADD COLUMN order_number text UNIQUE;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

-- Create function to generate order number with prefix
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.order_number := 'CAT-' || LPAD(nextval('public.order_number_seq')::text, 4, '0');
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate order number on insert
CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_number();

-- Backfill existing orders with sequential numbers based on created_at
WITH numbered_orders AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.orders
  WHERE order_number IS NULL
)
UPDATE public.orders o
SET order_number = 'CAT-' || LPAD(no.rn::text, 4, '0')
FROM numbered_orders no
WHERE o.id = no.id;

-- Update sequence to continue after existing orders
SELECT setval('public.order_number_seq', COALESCE((SELECT MAX(SUBSTRING(order_number FROM 5)::int) FROM public.orders WHERE order_number IS NOT NULL), 0));