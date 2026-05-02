-- Allow anonymous visitors to patch ONLY country/city on their own recent page_view.
-- A trigger guarantees no other column can change.

CREATE OR REPLACE FUNCTION public.guard_page_views_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.session_id IS DISTINCT FROM OLD.session_id
     OR NEW.path IS DISTINCT FROM OLD.path
     OR NEW.source IS DISTINCT FROM OLD.source
     OR NEW.referrer IS DISTINCT FROM OLD.referrer
     OR NEW.user_agent IS DISTINCT FROM OLD.user_agent
     OR NEW.utm_source IS DISTINCT FROM OLD.utm_source
     OR NEW.utm_medium IS DISTINCT FROM OLD.utm_medium
     OR NEW.utm_campaign IS DISTINCT FROM OLD.utm_campaign
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Only country/city columns can be updated';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_page_views_update ON public.page_views;
CREATE TRIGGER trg_guard_page_views_update
BEFORE UPDATE ON public.page_views
FOR EACH ROW EXECUTE FUNCTION public.guard_page_views_update();

CREATE POLICY "Owner can patch geo within 5 minutes"
ON public.page_views
FOR UPDATE
TO public
USING (
  session_id = get_client_session_id()
  AND session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND created_at > now() - interval '5 minutes'
)
WITH CHECK (
  session_id = get_client_session_id()
  AND session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  AND created_at > now() - interval '5 minutes'
);