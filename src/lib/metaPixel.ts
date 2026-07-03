/**
 * Meta Pixel (Facebook Pixel) Service
 *
 * [2026-06-10] REFACTOR EVENTOS:
 * - Solo eventos estándar de Meta + 1 custom (ViewCart) y Lead (estándar).
 * - Cada track lleva `eventID` único → preparado para Conversions API sin doble conteo.
 * - Cola de eventos previos a init: nada se pierde durante los primeros ms de la sesión.
 * - PageView inicial NO se envía aquí: lo dispara MetaPixelProvider en cada ruta.
 * - trackLead se dispara 1 vez por sesión (sessionStorage flag).
 *
 * El script base se carga en index.html. La inicialización con el Pixel ID
 * la hace React vía initMetaPixel().
 */

import { sendCapiEvent } from '@/lib/metaCapi';

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

let isInitialized = false;
type QueuedCall = unknown[];
const queue: QueuedCall[] = [];

/** UUID v4 corto para deduplicación CAPI ↔ Pixel */
export const generateEventId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * Telemetría local: registra cada evento que la app intenta disparar.
 * Lo lee el validador del admin para confirmar en vivo qué eventos
 * realmente salen del cliente vs. los que el usuario configuró en Meta.
 */
const logEventLocally = (args: unknown[]): void => {
  try {
    // args = ['track'|'trackCustom', 'EventName', params?, options?]
    if (!Array.isArray(args) || args.length < 2) return;
    const eventName = String(args[1] || '');
    if (!eventName) return;
    const raw = localStorage.getItem('__fb_event_log');
    const log: Record<string, { lastFiredAt: number; count: number }> = raw ? JSON.parse(raw) : {};
    const prev = log[eventName] || { lastFiredAt: 0, count: 0 };
    log[eventName] = { lastFiredAt: Date.now(), count: prev.count + 1 };
    localStorage.setItem('__fb_event_log', JSON.stringify(log));
  } catch {
    /* storage no disponible o JSON corrupto: ignorar */
  }
};

/** Envío seguro: si no está listo, encola para reproducir tras init */
const safeFbq = (...args: unknown[]): void => {
  if (typeof window === 'undefined') return;
  // Loguea SIEMPRE (incluso si está encolado): el log refleja intención de disparo.
  logEventLocally(args);
  if (!isInitialized || typeof window.fbq !== 'function') {
    queue.push(args);
    return;
  }
  try {
    (window.fbq as (...a: unknown[]) => void)(...args);
  } catch (err) {
    console.warn('[MetaPixel] track failed', err);
  }
};

/** Cache del pixel ID para fallback vía sendBeacon */
let activePixelId: string | null = null;
export const getActivePixelId = (): string | null => activePixelId;

/**
 * Initialize Meta Pixel with a given ID. Safe to call multiple times — only runs once.
 * NO dispara PageView (lo hace MetaPixelProvider en cada cambio de ruta, incluida la primera).
 */
export const initMetaPixel = (pixelId: string): void => {
  if (isInitialized) return;
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  if (!pixelId || !pixelId.trim()) return;

  // Desactivar Auto-Config ANTES del init. Sin esto, fbevents.js escanea el DOM
  // y dispara eventos "automáticos" (AddToCart, InitiateCheckout, Search...) al
  // detectar textos tipo "Agregar al carrito"/"Pagar"/inputs de búsqueda. Esos
  // clones llegan con `cs_est: true`, SIN `value` y SIN `event_id`, generando
  // warnings en Events Manager y rompiendo la deduplicación con CAPI. Solo
  // queremos los eventos explícitos que enviamos desde código.
  // NOTA: no afecta "Coincidencias avanzadas automáticas" — es otra función.
  window.fbq('set', 'autoConfig', false, pixelId);
  window.fbq('init', pixelId);
  isInitialized = true;
  activePixelId = pixelId.trim();

  // Drena la cola de eventos previos a init
  const drained = queue.length;
  while (queue.length) {
    const args = queue.shift();
    if (args) {
      try {
        (window.fbq as (...a: unknown[]) => void)(...args);
      } catch (err) {
        console.warn('[MetaPixel] queued track failed', err);
      }
    }
  }
  if (drained > 0) {
    console.debug('[MetaPixel] flushed queued events:', drained);
  }
};

/** True solo si el pixel está listo. Útil para gates externos. */
const canTrack = (): boolean => isInitialized;

// ============================================================
// EVENTOS ESTÁNDAR
// ============================================================

/** PageView con modo opcional (delivery/local) — DUPLICADO en CAPI */
export const trackPageView = (mode?: 'delivery' | 'local'): void => {
  const eventID = generateEventId();
  const params = mode ? { content_category: mode } : {};
  safeFbq('track', 'PageView', params, { eventID });
  sendCapiEvent({ event_name: 'PageView', event_id: eventID, custom_data: params });
};

/** ViewContent — vista de producto — DUPLICADO en CAPI */
export const trackViewContent = (product: {
  id: string;
  nombre: string;
  categoria: string;
  precio_usd: number;
}): void => {
  if (!product?.id || typeof product.precio_usd !== 'number') return;
  const eventID = generateEventId();
  const params = {
    content_ids: [product.id],
    content_name: product.nombre,
    content_category: product.categoria,
    content_type: 'product',
    value: product.precio_usd,
    currency: 'USD',
  };
  safeFbq('track', 'ViewContent', params, { eventID });
  sendCapiEvent({ event_name: 'ViewContent', event_id: eventID, custom_data: params });
};

/** AddToCart — DUPLICADO en CAPI */
export const trackAddToCart = (
  product: { id: string; nombre: string; precio_usd: number },
  quantity: number = 1
): void => {
  if (!product?.id || typeof product.precio_usd !== 'number') return;
  const eventID = generateEventId();
  const params = {
    content_ids: [product.id],
    content_name: product.nombre,
    content_type: 'product',
    value: product.precio_usd * quantity,
    currency: 'USD',
  };
  safeFbq('track', 'AddToCart', params, { eventID });
  sendCapiEvent({ event_name: 'AddToCart', event_id: eventID, custom_data: params });
};

/** InitiateCheckout — DUPLICADO en CAPI */
export const trackInitiateCheckout = (
  items: { id: string; precio_usd: number; quantity: number }[],
  subtotal: number
): void => {
  if (!items?.length) return;
  const numItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const eventID = generateEventId();
  const params = {
    content_ids: items.map((i) => i.id),
    content_type: 'product',
    num_items: numItems,
    value: subtotal,
    currency: 'USD',
  };
  safeFbq('track', 'InitiateCheckout', params, { eventID });
  sendCapiEvent({ event_name: 'InitiateCheckout', event_id: eventID, custom_data: params });
};

/** Purchase — DUPLICADO en CAPI, orderId = order_number de la tabla orders */
export const trackPurchase = (
  orderId: string,
  value: number,
  items: { id: string; quantity: number }[]
): void => {
  const numItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const eventID = generateEventId();
  const params = {
    value,
    currency: 'USD',
    content_ids: items.map((i) => i.id),
    content_type: 'product',
    order_id: orderId,
    num_items: numItems,
  };
  safeFbq('track', 'Purchase', params, { eventID });
  sendCapiEvent({ event_name: 'Purchase', event_id: eventID, custom_data: params });
};

/** Contact — solo browser (no está en el set CAPI de 6 eventos) */
export const trackContact = (source: string): void => {
  safeFbq('track', 'Contact', { content_category: source }, { eventID: generateEventId() });
};

/** Lead — primer click en WhatsApp de la sesión — DUPLICADO en CAPI */
export const trackLead = (source: string): void => {
  try {
    if (sessionStorage.getItem('__fb_lead_sent') === '1') return;
    sessionStorage.setItem('__fb_lead_sent', '1');
  } catch {
    /* storage no disponible: enviamos igualmente */
  }
  const eventID = generateEventId();
  const params = { content_category: source };
  safeFbq('track', 'Lead', params, { eventID });
  sendCapiEvent({ event_name: 'Lead', event_id: eventID, custom_data: params });
};

/**
 * Search — DUPLICADO en CAPI.
 * - Validación (min 3 chars).
 * - Dedup mismo query dentro de 2s.
 * - Fallback sendBeacon/Image a facebook.com/tr para resistir cancelación.
 */
let lastSearchQuery = '';
let lastSearchAt = 0;
export const trackSearch = (query: string): void => {
  const q = query?.trim();
  if (!q || q.length < 3) return;
  const now = Date.now();
  if (q === lastSearchQuery && now - lastSearchAt < 2000) return;
  lastSearchQuery = q;
  lastSearchAt = now;

  const eventID = generateEventId();
  const params = { search_string: q };
  safeFbq('track', 'Search', params, { eventID });
  sendCapiEvent({ event_name: 'Search', event_id: eventID, custom_data: params });

  // Fallback resistente a cancelación de navegación
  try {
    const pid = getActivePixelId();
    if (!pid || typeof window === 'undefined') return;
    const url =
      `https://www.facebook.com/tr/?id=${encodeURIComponent(pid)}` +
      `&ev=Search&cd[search_string]=${encodeURIComponent(q)}` +
      `&eid=${encodeURIComponent(eventID)}&noscript=0`;
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(url);
    } else {
      const img = new Image(1, 1);
      img.src = url;
    }
  } catch {
    /* fallback opcional: no romper si falla */
  }
};

/** AddPaymentInfo */
export const trackAddPaymentInfo = (
  method: string,
  value: number,
  currency: string = 'USD'
): void => {
  safeFbq(
    'track',
    'AddPaymentInfo',
    { content_category: method, value, currency },
    { eventID: generateEventId() }
  );
};

// ============================================================
// EVENTOS CUSTOM (1 solo, justificado)
// ============================================================

/** ViewCart — apertura del drawer del carrito (custom) */
export const trackViewCart = (
  items: { id: string; quantity: number }[],
  value: number
): void => {
  if (!items?.length) return;
  const numItems = items.reduce((sum, i) => sum + i.quantity, 0);
  safeFbq(
    'trackCustom',
    'ViewCart',
    {
      content_ids: items.map((i) => i.id),
      num_items: numItems,
      value,
      currency: 'USD',
    },
    { eventID: generateEventId() }
  );
};

/** Custom genérico (uso restringido) */
export const trackCustomEvent = (
  eventName: string,
  params?: Record<string, unknown>
): void => {
  safeFbq('trackCustom', eventName, params || {}, { eventID: generateEventId() });
};
