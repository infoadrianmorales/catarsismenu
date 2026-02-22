
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  path text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_created ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_session ON public.page_views(session_id);
CREATE INDEX idx_page_views_path ON public.page_views(path);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can read page views"
ON public.page_views
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete page views"
ON public.page_views
FOR DELETE
USING (public.is_admin(auth.uid()));
