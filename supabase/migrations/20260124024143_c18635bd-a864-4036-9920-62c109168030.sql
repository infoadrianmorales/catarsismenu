-- Fix security definer view by dropping and recreating with security_invoker
DROP VIEW IF EXISTS public.best_sellers_food;

CREATE VIEW public.best_sellers_food 
WITH (security_invoker = true) AS
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