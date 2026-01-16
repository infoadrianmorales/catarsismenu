-- Add featured/destacado column to products table
ALTER TABLE public.products 
ADD COLUMN destacado boolean DEFAULT false;

-- Create index for faster queries on featured products
CREATE INDEX idx_products_destacado ON public.products (destacado) WHERE destacado = true;