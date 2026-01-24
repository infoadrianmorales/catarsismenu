-- Add is_orderable column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_orderable boolean DEFAULT true;

-- Update cocktails to not be orderable (assuming categoria = 'cocteleria')
UPDATE public.products 
SET is_orderable = false 
WHERE categoria = 'cocteleria';

-- Create orders table
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  currency_mode text NOT NULL DEFAULT 'USD',
  exchange_rate numeric NULL,
  payment_method text NOT NULL,
  subtotal numeric NOT NULL,
  total numeric NOT NULL,
  status text NOT NULL DEFAULT 'NEW',
  whatsapp_message text NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL,
  product_name_snapshot text NOT NULL,
  unit_price_snapshot numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  line_total numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Anyone can insert orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can read all orders" 
ON public.orders 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update orders" 
ON public.orders 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete orders" 
ON public.orders 
FOR DELETE 
USING (is_admin(auth.uid()));

-- RLS Policies for order_items
CREATE POLICY "Anyone can insert order_items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can read all order_items" 
ON public.order_items 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create trigger for updated_at on orders
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);