---
name: Marketing Panel unificado
description: Pestaña Marketing del admin agrupa Meta (Pixel+Catálogo), Google (GTM/GA4/Ads/Search Console) y UTM Builder con métricas
type: feature
---
La pestaña "Meta" del admin fue reemplazada por una pestaña única **Marketing** con tres sub-tabs: Meta, Google, UTM Links.

- `src/components/admin/MarketingPanel.tsx` es el contenedor.
- `GoogleTab` configura GTM (`gtm_id`/`gtm_enabled`), GA4 (`ga4_id`/`ga4_enabled`), Google Ads (`gads_conversion_id`/`gads_conversion_label`/`gads_enabled`) y Search Console (`google_site_verification`).
- `GoogleTagsProvider` inyecta scripts dinámicamente, es idempotente y se desactiva en `/local`.
- **GA4 directo NO se carga si GTM está activo** (se asume que GA4 se administra dentro de GTM).
- `window.trackAdsConversion(value, currency, orderId)` se dispara una vez en `OrderConfirmed` cuando Google Ads está activo.
- Tabla `utm_links` (admin-only RLS) guarda links generados. RPC `get_utm_link_stats(source,medium,campaign)` agrega `page_views` (total, únicos, 7d).
- `useConfig` expone los 8 nuevos campos y usa `upsert` para tolerar claves recién seeded.
