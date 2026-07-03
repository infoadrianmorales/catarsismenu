# Meta Conversions API (CAPI) — Server-Side Tracking

## Step 0 — Orders table (found)

Existing table `public.orders` already stores confirmed purchases. Relevant columns for CAPI:

- `id` (uuid) — internal PK
- `order_number` (text) — human "CAT-0001", used as `order_id` in the pixel today (`trackPurchase(orderNum, ...)`)
- `total` (numeric), `subtotal` (numeric)
- `currency_mode` / `payment_currency` (text)
- `first_name`, `last_name`, `phone`, `email` — PII for `user_data` (hashed server-side)
- `created_at`, `session_id`, `status`

No schema change needed. We already have a unique order identifier (`order_number`) and the value/currency/customer PII required by CAPI. `event_id` is generated client-side per event (not persisted) — Meta only needs it to match browser + server events within its own 7-day dedup window.

Line items for `content_ids` will be read from `order_items` via the existing `cartItemsForTracking` snapshot already used by `trackPurchase`. No DB changes.

## Step 1 — Edge Function `meta-capi`

New file: `supabase/functions/meta-capi/index.ts`

- Public function (no JWT), CORS enabled.
- Zod validation of body:
  - `event_name` ∈ {PageView, ViewContent, Lead, AddToCart, Search, Purchase}
  - `event_id` (uuid), `event_source_url`, `event_time` (optional, defaults to now)
  - `user_data`: `{ email?, phone?, fn?, ln?, ct?, st?, country?, external_id?, fbc?, fbp?, client_ip_address?, client_user_agent? }`
  - `custom_data`: free object (server whitelists per event)
  - `test_event_code?` (only forwarded when present)
- Server extracts `client_ip_address` from `x-forwarded-for` and `client_user_agent` from `user-agent` headers (overrides client-supplied values).
- SHA-256 hashes any PII field that is not already 64-hex; lower-cases emails, normalizes phones to digits, before hashing. Never logs raw or hashed PII.
- Reads `META_CAPI_ACCESS_TOKEN` from env (already stored as a Cloud secret).
- POSTs to `https://graph.facebook.com/v20.0/1428549534945171/events` with:
  ```json
  {
    "data": [{
      "event_name": "...",
      "event_time": 1751579200,
      "event_id": "...",
      "event_source_url": "...",
      "action_source": "website",
      "user_data": { "em":["<sha256>"], "ph":[...], "fn":[...], "ln":[...], "ct":[...], "st":[...], "country":[...], "fbc":"...", "fbp":"...", "client_ip_address":"...", "client_user_agent":"..." },
      "custom_data": { ... }
    }],
    "access_token": "...",
    "test_event_code": "TEST71445"   // only if provided
  }
  ```
- Returns Graph API JSON response (status forwarded) so client can log outcome.

## Step 2 — Secret

`META_CAPI_ACCESS_TOKEN` is already configured in Lovable Cloud secrets (confirmed earlier this session). Edge Function reads via `Deno.env.get("META_CAPI_ACCESS_TOKEN")`. Not referenced anywhere on the client.

## Step 3 — Parameters per event (server whitelist)

| Event | content_ids/type | value/currency | order_id | search_string |
|---|---|---|---|---|
| PageView | — | — | — | — |
| ViewContent | ✓ / `product` | ✓ | — | — |
| Lead | — | optional | — | — |
| AddToCart | ✓ / `product` | ✓ | — | — |
| Search | — | — | — | ✓ |
| Purchase | ✓ / `product` | ✓ | ✓ (`order_number`) | — |

All events include `fbc`/`fbp` (read from `_fbc`/`_fbp` cookies) and Advanced Matching fields when available (email/phone/fn/ln/ct/st/country from `sessionStorage` — the checkout already persists `pendingCheckoutData`).

## Step 4 — Client helper

New file: `src/lib/metaCapi.ts`
- `getFbCookies()` — reads `_fbc`, `_fbp`.
- `getUserDataFromSession()` — pulls stored checkout PII if present.
- `sendCapiEvent({ event_name, event_id, custom_data, user_data? })` — fire-and-forget `fetch` to the edge function; swallows errors, never blocks UI.

Edit `src/lib/metaPixel.ts`:
- Export `generateEventId` (already local).
- Each of the 6 tracked events (`trackPageView`, `trackViewContent`, `trackAddToCart`, `trackLead`, `trackSearch`, `trackPurchase`) generates one `eventID`, passes it to `fbq()` **and** calls `sendCapiEvent` with the same `event_id` and matching `custom_data`.
- `trackPurchase` also accepts + forwards the `orderNumber` as `custom_data.order_id`.
- Non-scoped events (`Contact`, `InitiateCheckout`, `AddPaymentInfo`, `ViewCart`, custom) remain browser-only — CAPI layer is added strictly for the 6 events listed.

No other call sites change: existing `trackXxx()` callers automatically get CAPI parity because the helper handles both layers.

## Step 5 — Test mode

Add an admin-only toggle later if needed. For initial verification, `test_event_code=TEST71445` is passed as a build constant in `src/lib/metaCapi.ts` (`const CAPI_TEST_EVENT_CODE = 'TEST71445'`) that we remove before final publish. Documented at the top of the file so it's easy to strip.

## Files created / modified

**Created**
- `supabase/functions/meta-capi/index.ts`
- `src/lib/metaCapi.ts`

**Modified**
- `src/lib/metaPixel.ts` — wire CAPI calls into the 6 target events, expose `generateEventId`, thread `order_number` into `trackPurchase`.
- `src/pages/Checkout.tsx` — `trackPurchase` call already passes `orderNum`; verify signature still matches (no logic change beyond that).

**Not touched**
- `index.html` pixel base code, `MetaPixelProvider`, Google Ads/GTM/GA4 code, catalog feed, `supabase/config.toml` (function deploys with default `verify_jwt = false`).

## Verification checklist (post-build)

1. `META_CAPI_ACCESS_TOKEN` referenced only in `supabase/functions/meta-capi/index.ts` via `Deno.env.get`.
2. `meta-capi` deploys and returns Graph API JSON for a dummy `PageView` payload via `curl_edge_functions`.
3. `rg "fbq\('track'"` shows no direct call sites bypassing `metaPixel.ts` helpers.
4. Each of the 6 helpers shares one `event_id` between `fbq` and `sendCapiEvent`.
5. `Purchase` sends `custom_data.order_id = order_number`.
6. PII is hashed server-side only; client sends plain values over HTTPS to our own function.
7. Browser devtools: no `graph.facebook.com` request from client, no token or PII in console.
8. Meta Events Manager → Test Events with `TEST71445` shows Browser + Server rows deduplicated per event.
9. Remove `CAPI_TEST_EVENT_CODE` before final publish.
