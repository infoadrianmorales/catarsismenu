-- [2026-05-02] FIX geo nulls: cerrar INSERT público en page_views.
-- Causa: builds JS cacheadas seguían insertando directo via PostgREST sin pasar
-- por la edge function `track-visit`, generando filas con country=null.
-- Solución: dejar solo SERVICE_ROLE (edge function) como vía de inserción.
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;