# Panel Marketing unificado

Reemplaza la pestaña actual "Meta" del admin por una nueva pestaña **Marketing** con tres sub-tabs internos: **Meta**, **Google** y **UTM Links**.

## 1. Estructura del admin (`src/pages/Admin.tsx`)

- Quitar el `TabsTrigger` "Meta" y el `TabsContent` `meta-catalog`.
- Agregar un único `TabsTrigger value="marketing"` con icono `Megaphone` (label "Marketing").
- Pasamos de 11 a 11 columnas (mismo número), solo cambia la etiqueta.
- Nuevo componente: `MarketingPanel` que renderiza Tabs internos `meta | google | utm`.

## 2. Sub-tab Meta (`src/components/admin/marketing/MetaTab.tsx`)

- Mueve todo el contenido actual de `MetaCatalogPanel.tsx` aquí sin cambios funcionales (Pixel ID + toggle, Catálogo XML, deep-links, verificación de dominio FB).

## 3. Sub-tab Google (`src/components/admin/marketing/GoogleTab.tsx`)

Tarjetas independientes, cada una con su switch enabled + input ID + botón guardar:

- **Google Tag Manager** — `gtm_id` (`GTM-XXXXXX`) + `gtm_enabled`. Cuando enabled+ID válido, inyecta los dos snippets oficiales: `<script>` en `<head>` y `<noscript><iframe>` en `<body>` (gestionado por nuevo `GoogleTagsProvider`).
- **Google Analytics 4** — `ga4_id` (`G-XXXXXXXXXX`) + `ga4_enabled`. Inyecta `gtag.js` directamente solo si GTM está desactivado (para evitar doble carga, ya que GTM puede manejar GA4).
- **Google Ads Conversion** — `gads_conversion_id` (`AW-XXXXXXXXX`) + `gads_conversion_label` opcional + `gads_enabled`. Carga `gtag.js` con el ID de Ads y expone `window.trackAdsConversion()` que se llamará en `OrderConfirmed.tsx` al confirmar pedido.
- **Search Console verification** — input opcional `google_site_verification` que se inyecta como `<meta>` en el `<head>` desde el provider.

Validaciones de formato por input (regex GTM/G-/AW-) y toast de confirmación.

## 4. Sub-tab UTM Links (`src/components/admin/marketing/UtmLinksTab.tsx`)

Componentes:

- **Builder**: select de URL base (reutiliza `DEEP_LINK_URLS` actual) + inputs source / medium / campaign / term / content + label interno. Preview en vivo del link generado + botón copiar.
- **Guardar**: botón "Guardar link" inserta en nueva tabla `utm_links`.
- **Historial**: tabla con label, URL completa, fecha creación, **clics totales**, **clics únicos**, **últimos 7 días** (mini sparkline opcional con Recharts), botones copiar/editar/borrar/abrir.
- Las métricas se calculan llamando a una nueva RPC `get_utm_link_stats(p_utm_source,p_utm_medium,p_utm_campaign)` que cruza `page_views` por los tres parámetros UTM ya almacenados.

## 5. Backend (`supabase--migration`)

```text
- tabla utm_links: label, base_path, utm_source, utm_medium, utm_campaign,
  utm_term, utm_content, full_url, created_by(uuid), created_at
- GRANTS: authenticated + service_role
- RLS: solo admins (has_role(auth.uid(),'admin')) FOR ALL
- RPC get_utm_link_stats(...) STABLE SECURITY DEFINER
  (admin-only, agrega de page_views por triple UTM)
- Nuevas claves en `config`: gtm_id, gtm_enabled, ga4_id, ga4_enabled,
  gads_conversion_id, gads_conversion_label, gads_enabled,
  google_site_verification
```

## 6. Carga de tags en el sitio público

Nuevo `src/components/GoogleTagsProvider.tsx` (montado en `App.tsx` junto a `MetaPixelProvider`):

- Lee config (extiende `useConfig` con los nuevos campos).
- Inyecta dinámicamente GTM, GA4 directo y/o Google Ads, y la meta de Search Console — solo en producción y solo si están enabled.
- Dispara `pageview` en cambios de ruta (GA4 si está sin GTM; en GTM se hace via dataLayer event).
- Expone helper `trackAdsConversion(value, currency, orderId)` para `OrderConfirmed`.

## 7. Memoria

Guardar `mem://features/admin/marketing-panel` describiendo la consolidación Meta+Google+UTM y dejar nota en core de que GA4 no se carga directo si GTM está activo.

## Detalles técnicos

- `MetaCatalogPanel.tsx` queda solo como wrapper que re-exporta `MetaTab` (o se elimina y se actualizan imports — preferido: eliminar).
- `useConfig.ts`: añadir los 8 nuevos campos con defaults vacíos/false y parsing booleano.
- `GoogleTagsProvider` debe ser **idempotente** (chequear `document.getElementById` antes de añadir cada script, igual que `MetricoolProvider`).
- Ningún tag se carga en `/local` (respetar memoria de Local Mode) — gate vía `useViewMode`.
- UTM Builder: usar `URLSearchParams` para construir, codificar correctamente, normalizar espacios a `_`.
- Sparkline opcional: si añade peso, omitir y mostrar solo número de clics 7d.
