**Archivo:** `src/lib/metaPixel.ts` — en `initMetaPixel`, antes de `fbq('init', pixelId)`:

```ts
window.fbq('set', 'autoConfig', false, pixelId);
```

Con comentario explicando por qué (elimina eventos `cs_est: true` sin value/event_id que Meta genera por Auto-Config al detectar botones automáticamente). NO se toca "Coincidencias avanzadas automáticas" — es otra cosa y queda activa como está.

Nada más cambia.