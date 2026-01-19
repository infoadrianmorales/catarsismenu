-- Create categories table for dynamic menu sections
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  slug text NOT NULL UNIQUE,
  descripcion text,
  icono text NOT NULL DEFAULT 'Utensils',
  orden integer NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read active categories"
  ON public.categories FOR SELECT
  USING (activo = true);

CREATE POLICY "Admins can read all categories"
  ON public.categories FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing categories with their icons
INSERT INTO public.categories (nombre, slug, descripcion, icono, orden) VALUES
  ('Entradas', 'entradas', 'Aperitivos y primeros platos para compartir', 'Soup', 1),
  ('Hamburguesas', 'hamburguesas', 'Nuestras hamburguesas artesanales', 'Beef', 2),
  ('Emparedados', 'emparedados', 'Sándwiches y emparedados deliciosos', 'Sandwich', 3),
  ('Pizzas', 'pizzas', 'Pizzas artesanales al horno', 'Pizza', 4),
  ('Parrilla', 'parrilla', 'Cortes de carne a la parrilla', 'Flame', 5),
  ('Ensaladas', 'ensaladas', 'Ensaladas frescas y saludables', 'Salad', 6),
  ('Coctelería', 'cocteleria', 'Cocteles y bebidas preparadas', 'Wine', 7),
  ('Postres', 'postres', 'Dulces tentaciones para finalizar', 'IceCream', 8);