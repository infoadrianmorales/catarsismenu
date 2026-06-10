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

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

let isInitialized = false;
type QueuedCall = unknown[];
const queue: QueuedCall[] = [];

/** UUID v4 corto para deduplicación CAPI ↔ Pixel */
const generateEventId = (): string => {
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

/**
 * Initialize Meta Pixel with a given ID. Safe to call multiple times — only runs once.
 * NO dispara PageView (lo hace MetaPixelProvider en cada cambio de ruta, incluida la primera).
 */
export const initMetaPixel = (pixelId: string): void => {
  if (isInitialized) return;
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  if (!pixelId || !pixelId.trim()) return;

  window.fbq('init', pixelId);
  isInitialized = true;

  // Drena la cola de eventos previos a init
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
};

/** True solo si el pixel está listo. Útil para gates externos. */
const canTrack = (): boolean => isInitialized;

// ============================================================
// EVENTOS ESTÁNDAR
// ============================================================

/** PageView con modo opcional (delivery/local) */
export const trackPageView = (mode?: 'delivery' | 'local'): void => {
  const eventID = generateEventId();
  if (mode) {
    safeFbq('track', 'PageView', { content_category: mode }, { eventID });
  } else {
    safeFbq('track', 'PageView', {}, { eventID });
  }
};

/** ViewContent — vista de producto */
export const trackViewContent = (product: {
  id: string;
  nombre: string;
  categoria: string;
  precio_usd: number;
}): void => {
  if (!product?.id || typeof product.precio_usd !== 'number') return;
  safeFbq(
    'track',
    'ViewContent',
    {
      content_ids: [product.id],
      content_name: product.nombre,
      content_category: product.categoria,
      content_type: 'product',
      value: product.precio_usd,
      currency: 'USD',
    },
    { eventID: generateEventId() }
  );
};

/** AddToCart */
export const trackAddToCart = (
  product: { id: string; nombre: string; precio_usd: number },
  quantity: number = 1
): void => {
  if (!product?.id || typeof product.precio_usd !== 'number') return;
  safeFbq(
    'track',
    'AddToCart',
    {
      content_ids: [product.id],
      content_name: product.nombre,
      content_type: 'product',
      value: product.precio_usd * quantity,
      currency: 'USD',
    },
    { eventID: generateEventId() }
  );
};

/** InitiateCheckout */
export const trackInitiateCheckout = (
  items: { id: string; precio_usd: number; quantity: number }[],
  subtotal: number
): void => {
  if (!items?.length) return;
  const numItems = items.reduce((sum, item) => sum + item.quantity, 0);
  safeFbq(
    'track',
    'InitiateCheckout',
    {
      content_ids: items.map((i) => i.id),
      num_items: numItems,
      value: subtotal,
      currency: 'USD',
    },
    { eventID: generateEventId() }
  );
};

/** Purchase */
export const trackPurchase = (
  orderId: string,
  value: number,
  items: { id: string; quantity: number }[]
): void => {
  const numItems = items.reduce((sum, item) => sum + item.quantity, 0);
  safeFbq(
    'track',
    'Purchase',
    {
      value,
      currency: 'USD',
      content_ids: items.map((i) => i.id),
      order_id: orderId,
      num_items: numItems,
    },
    { eventID: generateEventId() }
  );
};

/** Contact — click en WhatsApp desde cualquier surface */
export const trackContact = (source: string): void => {
  safeFbq('track', 'Contact', { content_category: source }, { eventID: generateEventId() });
};

/** Lead — primer click en WhatsApp de la sesión (1 vez por sessionStorage) */
export const trackLead = (source: string): void => {
  try {
    if (sessionStorage.getItem('__fb_lead_sent') === '1') return;
    sessionStorage.setItem('__fb_lead_sent', '1');
  } catch {
    /* storage no disponible: enviamos igualmente */
  }
  safeFbq('track', 'Lead', { content_category: source }, { eventID: generateEventId() });
};

/** Search con validaciones (debounce y min length en el caller) */
export const trackSearch = (query: string): void => {
  const q = query?.trim();
  if (!q || q.length < 3) return;
  safeFbq('track', 'Search', { search_string: q }, { eventID: generateEventId() });
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
