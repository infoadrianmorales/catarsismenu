-- Create categories enum
CREATE TYPE public.product_category AS ENUM (
  'hamburguesas', 
  'pizzas', 
  'alitas', 
  'bebidas', 
  'postres', 
  'acompanantes',
  'cocktails'
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  categoria product_category NOT NULL,
  descripcion_corta TEXT CHECK (char_length(descripcion_corta) <= 120),
  precio_usd DECIMAL(10,2) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  imagen_url TEXT,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products RLS policies
CREATE POLICY "Anyone can read active products"
  ON public.products FOR SELECT
  USING (activo = true);

CREATE POLICY "Admins can read all products"
  ON public.products FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Create promotions table
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  descripcion TEXT,
  imagen_url TEXT,
  vigencia_inicio TIMESTAMP WITH TIME ZONE,
  vigencia_fin TIMESTAMP WITH TIME ZONE,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Promotions RLS policies
CREATE POLICY "Anyone can read active promotions"
  ON public.promotions FOR SELECT
  USING (activo = true AND (vigencia_fin IS NULL OR vigencia_fin > NOW()));

CREATE POLICY "Admins can read all promotions"
  ON public.promotions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert promotions"
  ON public.promotions FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update promotions"
  ON public.promotions FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete promotions"
  ON public.promotions FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies for product images
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_config_updated_at
  BEFORE UPDATE ON public.config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();