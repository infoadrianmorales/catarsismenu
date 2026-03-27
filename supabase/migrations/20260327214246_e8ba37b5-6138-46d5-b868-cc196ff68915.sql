
-- FEATURE [EXTRAS]: Tabla de extras/add-ons configurables por categoría o producto
CREATE TABLE public.product_extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  precio_usd numeric NOT NULL DEFAULT 0,
  categoria public.product_category NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE DEFAULT NULL,
  activo boolean NOT NULL DEFAULT true,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: lectura pública de extras activos, CRUD para admins
ALTER TABLE public.product_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active extras"
  ON public.product_extras FOR SELECT
  USING (activo = true);

CREATE POLICY "Admins can read all extras"
  ON public.product_extras FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert extras"
  ON public.product_extras FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update extras"
  ON public.product_extras FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete extras"
  ON public.product_extras FOR DELETE
  USING (is_admin(auth.uid()));

-- FEATURE [EXTRAS]: Campo extras_snapshot en order_items para preservar extras al momento de compra
ALTER TABLE public.order_items
  ADD COLUMN extras_snapshot jsonb DEFAULT NULL;

-- Trigger para updated_at en product_extras
CREATE TRIGGER update_product_extras_updated_at
  BEFORE UPDATE ON public.product_extras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
