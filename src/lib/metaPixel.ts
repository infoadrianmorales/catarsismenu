/**
 * Meta Pixel (Facebook Pixel) Service
 * Centralized service for tracking Meta Pixel events
 */

// Extend Window interface for fbq
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

let isInitialized = false;
let pixelId: string | null = null;

/**
 * Initialize Meta Pixel with the given ID
 */
export const initMetaPixel = (id: string): void => {
  if (!id || isInitialized) return;
  
  pixelId = id;
  
  // Create fbq function if it doesn't exist
  if (!window.fbq) {
    const n = (window.fbq = function (...args: unknown[]) {
      if ((n as unknown as { callMethod?: (...args: unknown[]) => void }).callMethod) {
        (n as unknown as { callMethod: (...args: unknown[]) => void }).callMethod(...args);
      } else {
        (n as unknown as { queue: unknown[] }).queue.push(args);
      }
    });
    
    if (!window._fbq) window._fbq = n;
    (n as unknown as { push: typeof n }).push = n;
    (n as unknown as { loaded: boolean }).loaded = true;
    (n as unknown as { version: string }).version = '2.0';
    (n as unknown as { queue: unknown[] }).queue = [];
  }
  
  // Load the Facebook Pixel script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);
  
  // Initialize the pixel
  window.fbq('init', id);
  
  isInitialized = true;
  console.log('[Meta Pixel] Initialized with ID:', id);
};

/**
 * Check if Pixel is ready to track
 */
const canTrack = (): boolean => {
  return isInitialized && !!window.fbq && !!pixelId;
};

/**
 * Track PageView event
 */
export const trackPageView = (): void => {
  if (!canTrack()) return;
  window.fbq('track', 'PageView');
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
 * Track custom event
 */
export const trackCustomEvent = (eventName: string, params?: Record<string, unknown>): void => {
  if (!canTrack()) return;
  
  window.fbq('trackCustom', eventName, params);
};

/**
 * Check if pixel is initialized
 */
export const isPixelInitialized = (): boolean => isInitialized;
