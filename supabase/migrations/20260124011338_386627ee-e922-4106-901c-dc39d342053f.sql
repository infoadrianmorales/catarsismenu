-- Create customers table
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create unique indexes for matching (email lowercase, phone normalized)
CREATE UNIQUE INDEX idx_customers_email ON public.customers (lower(email));
CREATE INDEX idx_customers_phone ON public.customers (phone);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers (admin only)
CREATE POLICY "Admins can read all customers" 
ON public.customers 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update customers" 
ON public.customers 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete customers" 
ON public.customers 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Allow system to insert customers (for checkout flow)
CREATE POLICY "Anyone can insert customers" 
ON public.customers 
FOR INSERT 
WITH CHECK (true);

-- Add customer_id to orders table
ALTER TABLE public.orders 
ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;

-- Create index for faster joins
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);

-- Add trigger for updated_at on customers
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a function to find or create customer
CREATE OR REPLACE FUNCTION public.find_or_create_customer(
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_email text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id uuid;
  v_normalized_phone text;
  v_normalized_email text;
BEGIN
  -- Normalize inputs
  v_normalized_email := lower(trim(p_email));
  v_normalized_phone := regexp_replace(trim(p_phone), '[\s\-\(\)\+]', '', 'g');
  
  -- Try to find by email first
  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE lower(email) = v_normalized_email
  LIMIT 1;
  
  IF v_customer_id IS NOT NULL THEN
    -- Update name if changed
    UPDATE public.customers
    SET first_name = p_first_name, last_name = p_last_name
    WHERE id = v_customer_id;
    RETURN v_customer_id;
  END IF;
  
  -- Try to find by phone
  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE phone = v_normalized_phone
  LIMIT 1;
  
  IF v_customer_id IS NOT NULL THEN
    -- Update info
    UPDATE public.customers
    SET first_name = p_first_name, last_name = p_last_name, email = v_normalized_email
    WHERE id = v_customer_id;
    RETURN v_customer_id;
  END IF;
  
  -- Create new customer
  INSERT INTO public.customers (first_name, last_name, phone, email)
  VALUES (p_first_name, p_last_name, v_normalized_phone, v_normalized_email)
  RETURNING id INTO v_customer_id;
  
  RETURN v_customer_id;
END;
$$;