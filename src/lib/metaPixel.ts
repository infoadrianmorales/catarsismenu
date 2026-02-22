/**
 * Meta Pixel (Facebook Pixel) Service
 * The pixel script is loaded in index.html.
 * Initialization (with the Pixel ID) is done dynamically from React via initMetaPixel().
 */

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

let isInitialized = false;

/**
 * Initialize Meta Pixel with a given ID. Safe to call multiple times — only runs once.
 */
export const initMetaPixel = (pixelId: string): void => {
  if (isInitialized) return;
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  if (!pixelId || !pixelId.trim()) return;

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
  isInitialized = true;
};

/**
 * Check if Pixel is ready to track
 */
const canTrack = (): boolean => {
  return isInitialized && typeof window !== 'undefined' && typeof window.fbq === 'function';
};

/**
 * Track PageView event with optional mode parameter
 */
export const trackPageView = (mode?: 'delivery' | 'local'): void => {
  if (!canTrack()) return;
  if (mode) {
    window.fbq('track', 'PageView', { content_category: mode });
  } else {
    window.fbq('track', 'PageView');
  }
};

/**
 * Track ViewContent event (product page view)
 */
export const trackViewContent = (product: {
  id: string;
  nombre: string;
  categoria: string;
  precio_usd: number;
}): void => {
  if (!canTrack()) return;
  window.fbq('track', 'ViewContent', {
    content_ids: [product.id],
    content_name: product.nombre,
    content_category: product.categoria,
    content_type: 'product',
    value: product.precio_usd,
    currency: 'USD',
  });
};

/**
 * Track AddToCart event
 */
export const trackAddToCart = (product: {
  id: string;
  nombre: string;
  precio_usd: number;
}, quantity: number = 1): void => {
  if (!canTrack()) return;
  window.fbq('track', 'AddToCart', {
    content_ids: [product.id],
    content_name: product.nombre,
    content_type: 'product',
    value: product.precio_usd * quantity,
    currency: 'USD',
  });
};

/**
 * Track InitiateCheckout event
 */
export const trackInitiateCheckout = (items: {
  id: string;
  precio_usd: number;
  quantity: number;
}[], subtotal: number): void => {
  if (!canTrack()) return;
  const numItems = items.reduce((sum, item) => sum + item.quantity, 0);
  window.fbq('track', 'InitiateCheckout', {
    content_ids: items.map(item => item.id),
    num_items: numItems,
    value: subtotal,
    currency: 'USD',
  });
};

/**
 * Track Purchase event
 */
export const trackPurchase = (
  orderId: string,
  value: number,
  items: { id: string; quantity: number }[]
): void => {
  if (!canTrack()) return;
  const numItems = items.reduce((sum, item) => sum + item.quantity, 0);
  window.fbq('track', 'Purchase', {
    value,
    currency: 'USD',
    content_ids: items.map(item => item.id),
    order_id: orderId,
    num_items: numItems,
  });
};

/**
 * Track Contact event (WhatsApp clicks)
 */
export const trackContact = (source: string): void => {
  if (!canTrack()) return;
  window.fbq('track', 'Contact', {
    content_category: source,
  });
};

/**
 * Track Search event
 */
export const trackSearch = (query: string): void => {
  if (!canTrack() || !query.trim()) return;
  window.fbq('track', 'Search', {
    search_string: query,
  });
};

/**
 * Track AddPaymentInfo event
 */
export const trackAddPaymentInfo = (method: string, value: number, currency: string = 'USD'): void => {
  if (!canTrack()) return;
  window.fbq('track', 'AddPaymentInfo', {
    content_category: method,
    value,
    currency,
  });
};

/**
 * Track RemoveFromCart custom event
 */
export const trackRemoveFromCart = (product: {
  id: string;
  nombre: string;
  precio_usd: number;
}): void => {
  if (!canTrack()) return;
  window.fbq('trackCustom', 'RemoveFromCart', {
    content_ids: [product.id],
    content_name: product.nombre,
    content_type: 'product',
    value: product.precio_usd,
    currency: 'USD',
  });
};

/**
 * Track custom event
 */
export const trackCustomEvent = (eventName: string, params?: Record<string, unknown>): void => {
  if (!canTrack()) return;
  window.fbq('trackCustom', eventName, params);
};
