-- Add delivery fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_maps_url TEXT;