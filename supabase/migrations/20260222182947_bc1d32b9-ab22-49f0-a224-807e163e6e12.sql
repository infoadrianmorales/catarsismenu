
-- Drop and recreate best_sellers_food view with correct column order matching the original
DROP VIEW IF EXISTS public.best_sellers_food;

CREATE VIEW public.best_sellers_food AS
SELECT 
  p.id,
  p.nombre,
  p.slug,
  p.descripcion_corta,
  p.imagen_url,
  p.precio_usd,
  p.categoria,
  p.activo,
  p.destacado,
  p.is_orderable,
  p.orden,
  p.tags,
  COALESCE(SUM(oi.quantity), 0) AS total_sold
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.status != 'CANCELED'
WHERE p.activo = true
  AND p.categoria NOT IN ('bebidas', 'postres', 'acompanantes', 'cocktails', 'cocteleria')
GROUP BY p.id
ORDER BY total_sold DESC, p.orden ASC;
