/**
 * [2026-11-07] lazyWithRetry — envuelve React.lazy con reintentos.
 * Reintenta la descarga del chunk 2 veces; si sigue fallando por error de chunk,
 * recarga la página UNA sola vez (marca en sessionStorage para evitar bucles).
 */
import { lazy, type ComponentType } from 'react';

const RELOAD_KEY = 'catarsis_chunk_reload';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const isChunkError = (err: unknown) => {
  const msg = String((err as Error)?.message || err || '');
  return (
    (err as Error)?.name === 'ChunkLoadError' ||
    /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk/i.test(msg)
  );
};

export function lazyWithRetry<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(async () => {
    let lastErr: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const mod = await factory();
        try { sessionStorage.removeItem(RELOAD_KEY); } catch { /* noop */ }
        return mod;
      } catch (err) {
        lastErr = err;
        if (attempt < 2) await wait(500 * (attempt + 1));
      }
    }
    if (isChunkError(lastErr)) {
      let reloaded = false;
      try { reloaded = sessionStorage.getItem(RELOAD_KEY) === '1'; } catch { /* noop */ }
      if (!reloaded) {
        try { sessionStorage.setItem(RELOAD_KEY, '1'); } catch { /* noop */ }
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
    }
    throw lastErr;
  });
}
