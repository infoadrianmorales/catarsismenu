-- 1. Ampliar page_views con geo + UTM + source
ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Directo',
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

CREATE INDEX IF NOT EXISTS idx_page_views_country ON public.page_views(country);
CREATE INDEX IF NOT EXISTS idx_page_views_source ON public.page_views(source);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);

-- 2. RPCs SECURITY DEFINER, restringidas a admins
CREATE OR REPLACE FUNCTION public.get_visits_by_source(
  p_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(source TEXT, total BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
    SELECT COALESCE(pv.source, 'Directo') AS source, COUNT(*)::bigint AS total
    FROM public.page_views pv
    WHERE pv.created_at BETWEEN p_start AND p_end
    GROUP BY COALESCE(pv.source, 'Directo')
    ORDER BY total DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_visits_by_country(
  p_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(country TEXT, total BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
    SELECT COALESCE(pv.country, 'Desconocido') AS country, COUNT(*)::bigint AS total
    FROM public.page_views pv
    WHERE pv.created_at BETWEEN p_start AND p_end
    GROUP BY COALESCE(pv.country, 'Desconocido')
    ORDER BY total DESC
    LIMIT 10;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_visits_daily(
  p_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(date DATE, total BIGINT, unique_visitors BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
    SELECT DATE(pv.created_at) AS date,
           COUNT(*)::bigint AS total,
           COUNT(DISTINCT pv.session_id)::bigint AS unique_visitors
    FROM public.page_views pv
    WHERE pv.created_at BETWEEN p_start AND p_end
    GROUP BY DATE(pv.created_at)
    ORDER BY date ASC;
END;
$$;