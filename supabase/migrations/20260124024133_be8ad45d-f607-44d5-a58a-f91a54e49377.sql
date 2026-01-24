-- Add type column to categories for FOOD/DRINK/DESSERT classification
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'FOOD' 
CHECK (type IN ('FOOD', 'DRINK', 'DESSERT'));

-- Create index for faster type filtering
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);

-- Create a view for best selling food products (top 8)
CREATE OR REPLACE VIEW public.best_sellers_food AS
SELECT 
  p.id,
  p.nombre,
  p.slug,
  p.descripcion_corta,
  p.precio_usd,
  p.imagen_url,
  p.categoria,
  p.activo,
  p.destacado,
  p.is_orderable,
  p.orden,
  p.tags,
  COALESCE(SUM(oi.quantity), 0) as total_sold
FROM public.products p
LEFT JOIN public.order_items oi ON p.id = oi.product_id
WHERE p.activo = true
  AND p.categoria NOT IN ('bebidas', 'cocktails', 'cocteleria', 'postres')
GROUP BY p.id
ORDER BY total_sold DESC, p.orden ASC
LIMIT 8;

-- Grant access to the view
GRANT SELECT ON public.best_sellers_food TO anon, authenticated;