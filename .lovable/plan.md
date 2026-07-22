## Diagnóstico

El banner "Reintentar" aparece por la condición añadida en la revisión móvil anterior:

```ts
hasBackendIssue = !loading && (productsError || categoriesError || usingFallback)
```

Donde `usingFallback` se activa apenas la consulta a `categories` devuelve un array vacío — incluso sin error real (ej. respuesta cacheada vacía, latencia, o un solo fallo transitorio antes de que arranquen los reintentos). Cuando eso pasa:

- Se pinta el banner amarillo.
- Se renderiza el fallback estático de 8 categorías.
- Pero los productos vienen del fallback `menuItems.ts`, que puede no coincidir con la BD real y da la sensación de página "vacía / sólo banner".

El cambio del mensaje de WhatsApp está aislado en `Checkout.tsx` y no puede afectar la home (verificado: typecheck OK, sin imports cruzados).

## Cambios propuestos (mínimos y sólo en frontend)

### 1. `src/pages/Index.tsx`
- Cambiar `hasBackendIssue` para que **sólo** dispare con error real (`productsError || categoriesError`), no con `usingFallback`.
- Dejar `usingFallback` como señal silenciosa (sólo log en consola), sin banner.

### 2. `src/hooks/usePublicCategories.ts`
- No cachear resultados vacíos: si `data.length === 0`, tratarlo como error para que React Query reintente en vez de guardarlo 5 min.
- Reducir `staleTime` de 5 min a 60 s para que un estado degradado se auto-corrija rápido en la próxima visita.

### 3. `src/hooks/useProducts.ts`
- Misma protección: si `productsData` viene vacío, lanzar error para forzar reintento en lugar de cachear vacío.

### 4. Botón "Reintentar" (si por error real se muestra)
- Además de `invalidateQueries`, llamar `refetchQueries` para forzar red inmediata (hoy `invalidate` sólo marca stale y no siempre refetchea si la vista no lo pide).

## Fuera de alcance
- No se modifica `Checkout.tsx` ni la lógica del mensaje de WhatsApp.
- No se toca UI ni estilos; sólo condiciones de carga.
- No se toca backend, RLS ni Edge Functions.

## Verificación post-cambio
1. Recargar la home — no debe aparecer el banner en operación normal.
2. Simular fallo (DevTools → Network → Offline + reload) → banner sí aparece y "Reintentar" recupera al volver online.
3. Confirmar en consola que ya no salen `[HOME_DEGRADED]` cuando la BD responde bien.
