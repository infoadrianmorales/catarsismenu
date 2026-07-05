# Fix orden de captura fbc/fbp — antes de montar React

El error `Cannot read properties of undefined (reading 'processAndCollectAllParams')` indica que el default import `clientParamBuilder` del bundle UMD viene `undefined` en el contexto ESM/Vite. Aparte de mover la llamada al bootstrap, hay que hacer el import compatible con el bundle CJS/UMD del paquete.

## Cambios

### 1. `src/App.tsx`
- Eliminar el `useEffect` que llama `initClickIdParams()` dentro de `AppContent`.
- Eliminar el import `initClickIdParams` de este archivo.
- Quitar `useEffect` del import de React si ya no se usa.

### 2. `src/main.tsx`
- Importar `initClickIdParams` desde `@/lib/metaClickIds`.
- Invocarlo (fire-and-forget) **antes** de `createRoot(...).render(...)`.
- Añadir comentario `// [2026-07-05] CATARSIS — Captura fbc/fbp ANTES de montar React …` explicando por qué no puede vivir en un `useEffect` hijo.

### 3. `src/lib/metaClickIds.ts` (fix del runtime error)
El paquete expone un bundle UMD (`dist/clientParamBuilder.bundle.js`) cuyo default export bajo interop de Vite/ESM está resolviendo a `undefined`, por eso `clientParamBuilder.processAndCollectAllParams` truena. Ajustes:
- Cambiar a `import * as ClientParamBuilderNS from 'meta-capi-param-builder-clientjs'` y resolver el objeto real con fallback: `const clientParamBuilder = (ClientParamBuilderNS as any).default ?? (ClientParamBuilderNS as any);`
- Envolver `initClickIdParams` en un try/catch adicional que valide la existencia del método antes de llamarlo (evita crash si el bundle no expone lo esperado en algún entorno).
- Mantener los guards existentes en `getFbc/getFbp/getOrCreateExternalId`, agregando check `typeof clientParamBuilder?.getFbc === 'function'` antes de invocar.
- Añadir comentario `// [2026-07-05] CATARSIS — interop UMD/ESM: el paquete expone default vía bundle, tomar .default con fallback al namespace.`

## Archivos afectados
- `src/App.tsx` — quitar useEffect + import
- `src/main.tsx` — invocar `initClickIdParams()` antes de render
- `src/lib/metaClickIds.ts` — fix del import interop para eliminar el runtime error

## Fuera de alcance
- No se toca `metaCapi.ts` ni la Edge Function.
- No se cambia el contrato de `initClickIdParams` (sigue devolviendo `Promise<void>`).
