
CREATE OR REPLACE FUNCTION public.get_page_views_summary(
  p_start timestamptz,
  p_end timestamptz,
  p_granularity text DEFAULT 'daily'
)
RETURNS TABLE(
  period text,
  views bigint,
  unique_visitors bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    CASE
      WHEN p_granularity = 'hourly'
        THEN to_char(date_trunc('hour', created_at), 'YYYY-MM-DD"T"HH24')
      ELSE to_char(date_trunc('day', created_at), 'YYYY-MM-DD')
    END AS period,
    count(*)::bigint AS views,
    count(DISTINCT session_id)::bigint AS unique_visitors
  FROM page_views
  WHERE created_at >= p_start AND created_at <= p_end
  GROUP BY period
  ORDER BY period
$$;

CREATE OR REPLACE FUNCTION public.get_popular_pages(
  p_start timestamptz,
  p_end timestamptz,
  p_limit int DEFAULT 5
)
RETURNS TABLE(path text, views bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT path, count(*)::bigint AS views
  FROM page_views
  WHERE created_at >= p_start AND created_at <= p_end
  GROUP BY path
  ORDER BY views DESC
  LIMIT p_limit
$$;

CREATE OR REPLACE FUNCTION public.get_page_views_totals(
  p_start timestamptz,
  p_end timestamptz
)
RETURNS TABLE(total_views bigint, unique_visitors bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    count(*)::bigint AS total_views,
    count(DISTINCT session_id)::bigint AS unique_visitors
  FROM page_views
  WHERE created_at >= p_start AND created_at <= p_end
$$;
