-- Create hero_slides table for managing banner images
CREATE TABLE public.hero_slides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url text NOT NULL,
  orden integer NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read active hero slides"
ON public.hero_slides
FOR SELECT
USING (activo = true);

CREATE POLICY "Admins can read all hero slides"
ON public.hero_slides
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert hero slides"
ON public.hero_slides
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update hero slides"
ON public.hero_slides
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete hero slides"
ON public.hero_slides
FOR DELETE
USING (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_hero_slides_updated_at
BEFORE UPDATE ON public.hero_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for hero slides
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('hero-slides', 'hero-slides', true, 524288)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for hero-slides bucket
CREATE POLICY "Anyone can view hero slides images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hero-slides');

CREATE POLICY "Admins can upload hero slides images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'hero-slides' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update hero slides images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'hero-slides' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete hero slides images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'hero-slides' AND is_admin(auth.uid()));