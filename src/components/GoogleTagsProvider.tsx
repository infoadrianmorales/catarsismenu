/**
 * [MARKETING-PANEL] Google Tags Provider
 * Inyecta dinámicamente GTM, GA4, Google Ads y meta de Search Console
 * según la configuración guardada en `config`. Idempotente.
 * Excluido en modo /local.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useConfig } from '@/hooks/useConfig';
import { useViewMode } from '@/contexts/ViewModeContext';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    trackAdsConversion?: (value?: number, currency?: string, orderId?: string) => void;
  }
}

const GTM_SCRIPT_ID = 'gtm-script';
const GTM_NOSCRIPT_ID = 'gtm-noscript';
const GA4_SCRIPT_ID = 'ga4-script';
const GADS_SCRIPT_ID = 'gads-script';
const GSC_META_ID = 'google-site-verification-meta';
const CUSTOM_HEAD_ATTR = 'data-custom-injected-head';
const CUSTOM_BODY_ATTR = 'data-custom-injected-body';

// Inyecta HTML arbitrario en un nodo padre, ejecutando los <script> que contenga.
// El parser HTML5 marca como inertes los <script> insertados vía innerHTML; por eso
// recreamos cada <script> para forzar su ejecución.
const injectHtmlInto = (parent: HTMLElement, html: string, marker: string) => {
  if (!html.trim()) return;
  const template = document.createElement('template');
  template.innerHTML = html;
  const frag = template.content;
  frag.querySelectorAll('script').forEach((oldScript) => {
    const newScript = document.createElement('script');
    for (const attr of Array.from(oldScript.attributes)) {
      newScript.setAttribute(attr.name, attr.value);
    }
    newScript.text = oldScript.textContent || '';
    oldScript.replaceWith(newScript);
  });
  Array.from(frag.childNodes).forEach((node) => {
    if (node instanceof HTMLElement) node.setAttribute(marker, 'true');
  });
  if (parent === document.body) {
    parent.insertBefore(frag, parent.firstChild);
  } else {
    parent.appendChild(frag);
  }
};

const removeInjected = (marker: string) => {
  document.querySelectorAll(`[${marker}]`).forEach((n) => n.remove());
};

const ensureGtag = () => {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
  }
};

export const GoogleTagsProvider = () => {
  const { config, loading } = useConfig();
  const { mode } = useViewMode();
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (mode === 'local') return;

    // --- Search Console verification meta ---
    if (config.google_site_verification && !document.getElementById(GSC_META_ID)) {
      const meta = document.createElement('meta');
      meta.id = GSC_META_ID;
      meta.name = 'google-site-verification';
      meta.content = config.google_site_verification;
      document.head.appendChild(meta);
    }

    // --- GTM ---
    // Detecta si el mismo container ya fue cargado por index.html (hardcoded)
    // para evitar doble inyección. En ese caso solo aseguramos dataLayer.
    if (config.gtm_enabled && /^GTM-[A-Z0-9]+$/i.test(config.gtm_id)) {
      const id = config.gtm_id;
      const alreadyLoaded =
        !!document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${id}"]`) ||
        // @ts-expect-error global injected by GTM runtime
        !!(window.google_tag_manager && window.google_tag_manager[id]);

      if (!alreadyLoaded && !document.getElementById(GTM_SCRIPT_ID)) {
        const s = document.createElement('script');
        s.id = GTM_SCRIPT_ID;
        s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`;
        document.head.appendChild(s);

        const ns = document.createElement('noscript');
        ns.id = GTM_NOSCRIPT_ID;
        ns.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.insertBefore(ns, document.body.firstChild);
      } else {
        // Aseguramos dataLayer existe para los pushes de pageview
        window.dataLayer = window.dataLayer || [];
      }
    }

    // --- GA4 directo (solo si GTM NO está activo, para evitar doble carga) ---
    const ga4Active =
      config.ga4_enabled && /^G-[A-Z0-9]+$/i.test(config.ga4_id) && !(config.gtm_enabled && config.gtm_id);
    if (ga4Active && !document.getElementById(GA4_SCRIPT_ID)) {
      const s = document.createElement('script');
      s.id = GA4_SCRIPT_ID;
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4_id}`;
      document.head.appendChild(s);
      ensureGtag();
      window.gtag!('config', config.ga4_id, { send_page_view: true });
    }

    // --- Google Ads ---
    const gadsActive = config.gads_enabled && /^AW-[A-Z0-9]+$/i.test(config.gads_conversion_id);
    if (gadsActive && !document.getElementById(GADS_SCRIPT_ID)) {
      const s = document.createElement('script');
      s.id = GADS_SCRIPT_ID;
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${config.gads_conversion_id}`;
      document.head.appendChild(s);
      ensureGtag();
      window.gtag!('config', config.gads_conversion_id);
    }

    // Helper global de conversión (siempre disponible si Ads está activo)
    if (gadsActive) {
      const sendTo = config.gads_conversion_label
        ? `${config.gads_conversion_id}/${config.gads_conversion_label}`
        : config.gads_conversion_id;
      window.trackAdsConversion = (value, currency = 'USD', orderId) => {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', 'conversion', {
          send_to: sendTo,
          value,
          currency,
          transaction_id: orderId,
        });
      };
    }
  }, [loading, mode, config]);

  // --- Custom user-provided scripts (head + body) ---
  // Se ejecutan solo si el switch maestro está activo. Idempotente: limpia
  // inyecciones previas antes de re-inyectar cuando cambia el contenido.
  useEffect(() => {
    if (loading) return;
    if (mode === 'local') return;

    removeInjected(CUSTOM_HEAD_ATTR);
    removeInjected(CUSTOM_BODY_ATTR);

    if (!config.custom_scripts_enabled) return;

    if (config.custom_head_scripts) {
      injectHtmlInto(document.head, config.custom_head_scripts, CUSTOM_HEAD_ATTR);
    }
    if (config.custom_body_scripts) {
      injectHtmlInto(document.body, config.custom_body_scripts, CUSTOM_BODY_ATTR);
    }

    return () => {
      removeInjected(CUSTOM_HEAD_ATTR);
      removeInjected(CUSTOM_BODY_ATTR);
    };
  }, [
    loading,
    mode,
    config.custom_scripts_enabled,
    config.custom_head_scripts,
    config.custom_body_scripts,
  ]);

  // Trackeo de pageview en cambios de ruta
  useEffect(() => {
    if (loading || mode === 'local') return;
    if (lastPath.current === location.pathname) return;
    const path = location.pathname + location.search;

    if (config.gtm_enabled && config.gtm_id && window.dataLayer) {
      window.dataLayer.push({ event: 'pageview', page_path: path });
    } else if (config.ga4_enabled && config.ga4_id && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', { page_path: path });
    }

    lastPath.current = location.pathname;
  }, [location.pathname, location.search, loading, mode, config]);

  return null;
};
