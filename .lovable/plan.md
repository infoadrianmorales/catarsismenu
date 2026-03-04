

## Fix: Error "data.rate.toFixed is not a function" en botón Sincronizar

### Problema
La edge function `sync-bcv-rate` devuelve `rate` como string (`"425.674100000"`), pero `ConfigPanel.tsx` línea 102 llama `data.rate.toFixed(2)` que solo funciona en números.

### Solución
**Archivo:** `src/components/admin/ConfigPanel.tsx` (línea 102 y 108)

Convertir `data.rate` a número con `parseFloat()` antes de usar `.toFixed()`:

```typescript
const rateNum = parseFloat(data.rate);
toast({
  title: 'Tasa sincronizada',
  description: `Tasa BCV actualizada: Bs ${rateNum.toFixed(2)}`,
});
refetch();
setLastSync(data.syncedAt);
setFormValues(prev => ({ ...prev, tasa_ves: rateNum.toString() }));
```

Cambio mínimo de 2 líneas. Esto corrige tanto el toast como la actualización del formulario.

