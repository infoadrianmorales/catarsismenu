-- ================================================
-- [2026-04-08] RPCs for detailed sales analytics dashboard
-- ================================================

-- 1. Product sales history
CREATE OR REPLACE FUNCTION public.get_product_sales_history(
  date_from timestamptz DEFAULT now() - interval '30 days',
  date_to timestamptz DEFAULT now(),
  category_filter text DEFAULT null
)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  category text,
  total_quantity bigint,
  total_revenue numeric,
  last_sold_at timestamptz,
  order_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    oi.product_id,
    oi.product_name_snapshot AS product_name,
    p.categoria::text AS category,
    SUM(oi.quantity)::bigint AS total_quantity,
    SUM(oi.line_total) AS total_revenue,
    MAX(o.created_at) AS last_sold_at,
    COUNT(DISTINCT o.id)::bigint AS order_count
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  LEFT JOIN public.products p ON p.id = oi.product_id
  WHERE o.created_at >= date_from
    AND o.created_at <= date_to
    AND o.status != 'CANCELED'
    AND (category_filter IS NULL OR p.categoria::text = category_filter)
  GROUP BY oi.product_id, oi.product_name_snapshot, p.categoria
  ORDER BY total_quantity DESC;
$$;

-- 2. Sales by category
CREATE OR REPLACE FUNCTION public.get_sales_by_category(
  date_from timestamptz DEFAULT now() - interval '30 days',
  date_to timestamptz DEFAULT now()
)
RETURNS TABLE (
  category text,
  total_quantity bigint,
  total_revenue numeric,
  product_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    COALESCE(p.categoria::text, 'sin categoría') AS category,
    SUM(oi.quantity)::bigint AS total_quantity,
    SUM(oi.line_total) AS total_revenue,
    COUNT(DISTINCT oi.product_id)::bigint AS product_count
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  LEFT JOIN public.products p ON p.id = oi.product_id
  WHERE o.created_at >= date_from
    AND o.created_at <= date_to
    AND o.status != 'CANCELED'
  GROUP BY p.categoria
  ORDER BY total_revenue DESC;
$$;

-- 3. Sales by source (purchase origin)
CREATE OR REPLACE FUNCTION public.get_sales_by_source(
  date_from timestamptz DEFAULT now() - interval '30 days',
  date_to timestamptz DEFAULT now()
)
RETURNS TABLE (
  source text,
  total_quantity bigint,
  total_revenue numeric,
  order_count bigint,
  percentage numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH source_data AS (
    SELECT
      COALESCE(oi.source, 'menu') AS source,
      SUM(oi.quantity)::bigint AS total_quantity,
      SUM(oi.line_total) AS total_revenue,
      COUNT(DISTINCT o.id)::bigint AS order_count
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE o.created_at >= date_from
      AND o.created_at <= date_to
      AND o.status != 'CANCELED'
    GROUP BY COALESCE(oi.source, 'menu')
  ),
  total AS (
    SELECT SUM(total_revenue) AS grand_total FROM source_data
  )
  SELECT
    sd.source,
    sd.total_quantity,
    sd.total_revenue,
    sd.order_count,
    CASE WHEN t.grand_total > 0
      THEN ROUND((sd.total_revenue / t.grand_total) * 100, 1)
      ELSE 0
    END AS percentage
  FROM source_data sd, total t
  ORDER BY sd.total_revenue DESC;
$$;

-- 4. Extras analytics from extras_snapshot JSONB
CREATE OR REPLACE FUNCTION public.get_extras_analytics(
  date_from timestamptz DEFAULT now() - interval '30 days',
  date_to timestamptz DEFAULT now()
)
RETURNS TABLE (
  extra_name text,
  total_quantity bigint,
  total_revenue numeric,
  times_added bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    extra->>'name' AS extra_name,
    SUM((extra->>'quantity')::int)::bigint AS total_quantity,
    SUM((extra->>'quantity')::int * (extra->>'price')::numeric) AS total_revenue,
    COUNT(*)::bigint AS times_added
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id,
  jsonb_array_elements(oi.extras_snapshot) AS extra
  WHERE o.created_at >= date_from
    AND o.created_at <= date_to
    AND o.status != 'CANCELED'
    AND oi.extras_snapshot IS NOT NULL
  GROUP BY extra->>'name'
  ORDER BY total_quantity DESC;
$$;