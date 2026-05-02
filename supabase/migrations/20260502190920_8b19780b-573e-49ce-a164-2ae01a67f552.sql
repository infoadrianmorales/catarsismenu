CREATE OR REPLACE FUNCTION public.get_visits_by_city(
  p_start timestamp with time zone DEFAULT (now() - '30 days'::interval),
  p_end timestamp with time zone DEFAULT now()
)
RETURNS TABLE(city text, country text, total bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
    SELECT
      COALESCE(pv.city, 'Desconocida') AS city,
      COALESCE(pv.country, 'Desconocido') AS country,
      COUNT(*)::bigint AS total
    FROM public.page_views pv
    WHERE pv.created_at BETWEEN p_start AND p_end
    GROUP BY COALESCE(pv.city, 'Desconocida'), COALESCE(pv.country, 'Desconocido')
    ORDER BY total DESC
    LIMIT 10;
END;
$function$;