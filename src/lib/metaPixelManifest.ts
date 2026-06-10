/**
 * [2026-06-10] METAPIXEL MANIFEST
 *
 * Fuente única de verdad de los eventos que la app envía al Meta Pixel.
 * Cualquier `safeFbq('track'|'trackCustom', 'EventName', ...)` en metaPixel.ts
 * DEBE existir aquí. El validador del admin compara este manifest contra
 * la lista declarada por el usuario en Meta Events Manager para detectar
 * eventos configurados pero no usados ("no usados → borrar").
 */
export interface AppPixelEvent {
  /** Nombre exacto como llega a Meta */
  name: string;
  /** true = evento estándar de Meta; false = trackCustom */
  standard: boolean;
  /** Dónde/cuándo lo dispara la app */
  surface: string;
}

export const APP_PIXEL_EVENTS: AppPixelEvent[] = [
  { name: 'PageView', standard: true, surface: 'Carga inicial y cada cambio de ruta' },
  { name: 'ViewContent', standard: true, surface: 'Página de producto y hover/tap sostenido en card (600ms)' },
  { name: 'Search', standard: true, surface: 'Buscador (debounce 800ms, mínimo 3 caracteres)' },
  { name: 'AddToCart', standard: true, surface: 'Botón "Agregar al carrito" en cualquier surface' },
  { name: 'ViewCart', standard: false, surface: 'Apertura del drawer del carrito (custom)' },
  { name: 'InitiateCheckout', standard: true, surface: 'Entrar a /checkout con items' },
  { name: 'AddPaymentInfo', standard: true, surface: 'Seleccionar método de pago' },
  { name: 'Purchase', standard: true, surface: 'Confirmación de orden' },
  { name: 'Contact', standard: true, surface: 'Click en WhatsApp (hero, header, sticky, floating, checkout)' },
  { name: 'Lead', standard: true, surface: 'Primer click en WhatsApp de la sesión' },
];

/** Catálogo completo de eventos estándar de Meta para el selector del admin */
export const META_STANDARD_EVENTS: string[] = [
  'PageView',
  'ViewContent',
  'Search',
  'AddToCart',
  'AddToWishlist',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Purchase',
  'Lead',
  'CompleteRegistration',
  'Contact',
  'CustomizeProduct',
  'Donate',
  'FindLocation',
  'Schedule',
  'StartTrial',
  'SubmitApplication',
  'Subscribe',
];

/** Clave en localStorage donde se guarda el log de eventos disparados en la sesión */
export const PIXEL_EVENT_LOG_KEY = '__fb_event_log';

export type PixelEventLog = Record<string, { lastFiredAt: number; count: number }>;
