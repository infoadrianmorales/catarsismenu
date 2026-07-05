// [2026-07-05] CATARSIS — Wrapper de la librería oficial de Meta
// (meta-capi-param-builder-clientjs) para fbc/fbp. Reemplaza lectura manual
// de cookies: esta librería respeta el formato exacto de Meta y NUNCA
// sobrescribe una cookie _fbc/_fbp ya existente, evitando corromper datos
// de atribución. NO usamos su captura de IP (getIpFn): nuestra Edge
// Function meta-capi ya obtiene client_ip_address de forma más confiable
// desde los headers del request en el servidor.
// [2026-07-05] CATARSIS — interop UMD/ESM: el paquete expone default vía
// bundle UMD; tomar .default con fallback al namespace para evitar undefined.
import * as ClientParamBuilderNS from 'meta-capi-param-builder-clientjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ns: any = ClientParamBuilderNS as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clientParamBuilder: any = ns?.default ?? ns;

let paramsReady: Promise<void> | null = null;

export const initClickIdParams = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!paramsReady) {
    try {
      if (typeof clientParamBuilder?.processAndCollectAllParams !== 'function') {
        paramsReady = Promise.resolve();
      } else {
        paramsReady = Promise.resolve(clientParamBuilder.processAndCollectAllParams())
          .then(() => undefined)
          .catch(() => undefined);
      }
    } catch {
      paramsReady = Promise.resolve();
    }
  }
  return paramsReady;
};

export const getFbc = (): string | undefined => {
  try {
    if (typeof clientParamBuilder?.getFbc !== 'function') return undefined;
    return clientParamBuilder.getFbc() || undefined;
  } catch {
    return undefined;
  }
};

export const getFbp = (): string | undefined => {
  try {
    if (typeof clientParamBuilder?.getFbp !== 'function') return undefined;
    return clientParamBuilder.getFbp() || undefined;
  } catch {
    return undefined;
  }
};

export const getOrCreateExternalId = (): string => {
  const KEY = '__catarsis_ext_id';
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    if (typeof clientParamBuilder?.getNormalizedAndHashedPII !== 'function') return '';
    return clientParamBuilder.getNormalizedAndHashedPII(id, 'external_id') || '';
  } catch {
    return '';
  }
};
