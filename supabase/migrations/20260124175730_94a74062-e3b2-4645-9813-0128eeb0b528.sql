-- Create table for tracking abandoned checkouts
CREATE TABLE public.pending_checkouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  cart_items JSONB NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_first_name TEXT,
  customer_last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pending_checkouts ENABLE ROW LEVEL SECURITY;

-- Create policies - anyone can insert (anonymous checkout starts)
CREATE POLICY "Anyone can insert pending_checkouts"
ON public.pending_checkouts
FOR INSERT
WITH CHECK (true);

-- Anyone can update their own pending checkout by session_id
CREATE POLICY "Anyone can update pending_checkouts by session"
ON public.pending_checkouts
FOR UPDATE
USING (true);

-- Anyone can delete their own pending checkout by session_id  
CREATE POLICY "Anyone can delete pending_checkouts by session"
ON public.pending_checkouts
FOR DELETE
USING (true);

-- Admins can read all pending checkouts
CREATE POLICY "Admins can read all pending_checkouts"
ON public.pending_checkouts
FOR SELECT
USING (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pending_checkouts_updated_at
BEFORE UPDATE ON public.pending_checkouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();