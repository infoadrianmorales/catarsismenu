
-- 1) utm_links table
CREATE TABLE public.utm_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  base_path text NOT NULL DEFAULT '/',
  utm_source text NOT NULL,
  utm_medium text NOT NULL,
  utm_campaign text NOT NULL,
  utm_term text,
  utm_content text,
  full_url text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.utm_links TO authenticated;
GRANT ALL ON public.utm_links TO service_role;

ALTER TABLE public.utm_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage utm_links"
  ON public.utm_links FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER set_utm_links_updated_at
  BEFORE UPDATE ON public.utm_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) RPC: stats per UTM combo
CREATE OR REPLACE FUNCTION public.get_utm_link_stats(
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text
)
RETURNS TABLE(
  total_visits bigint,
  unique_visitors bigint,
  visits_7d bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
    SELECT
      COUNT(*)::bigint AS total_visits,
      COUNT(DISTINCT pv.session_id)::bigint AS unique_visitors,
      COUNT(*) FILTER (WHERE pv.created_at >= now() - interval '7 days')::bigint AS visits_7d
    FROM public.page_views pv
    WHERE pv.utm_source = p_utm_source
      AND pv.utm_medium = p_utm_medium
      AND pv.utm_campaign = p_utm_campaign;
END;
$$;

-- 3) Seed new marketing config keys (only if missing)
INSERT INTO public.config (key, value)
VALUES
  ('gtm_id', ''),
  ('gtm_enabled', 'false'),
  ('ga4_id', ''),
  ('ga4_enabled', 'false'),
  ('gads_conversion_id', ''),
  ('gads_conversion_label', ''),
  ('gads_enabled', 'false'),
  ('google_site_verification', '')
ON CONFLICT (key) DO NOTHING;
