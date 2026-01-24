-- Add delivery_type column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'pickup';