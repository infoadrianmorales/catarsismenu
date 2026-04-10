

## Plan: Corregir flechas del carrusel de sugerencias

### Problema
Las flechas no aparecen porque `updateScrollState` se ejecuta antes de que el DOM refleje los nuevos items. El `useEffect` se dispara cuando cambia `items`, pero el layout aún no se ha actualizado — `scrollWidth === clientWidth` en ese momento, así que `canScrollRight` queda en `false`.

### Solución

**Archivo: `src/components/cart/UpsellSuggestions.tsx`**

En el `useEffect` que llama a `updateScrollState()`, envolver la llamada inicial en `requestAnimationFrame` para esperar al siguiente frame de pintado cuando el DOM ya tiene las dimensiones correctas:

```typescript
useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;

  // [2026-04-10] RAF para esperar a que el DOM refleje los items
  const raf = requestAnimationFrame(updateScrollState);

  el.addEventListener('scroll', updateScrollState, { passive: true });
  const ro = new ResizeObserver(updateScrollState);
  ro.observe(el);

  return () => {
    cancelAnimationFrame(raf);
    el.removeEventListener('scroll', updateScrollState);
    ro.disconnect();
  };
}, [updateScrollState, items]);
```

Esto es un cambio de ~3 líneas. No afecta el comportamiento del scroll, las flechas, ni los degradados — solo corrige el timing de la detección inicial.

### Archivos
| Acción | Archivo |
|--------|---------|
| Modificar | `src/components/cart/UpsellSuggestions.tsx` (useEffect, ~3 líneas) |

