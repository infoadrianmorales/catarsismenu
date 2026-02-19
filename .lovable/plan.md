

## Hacer el Meta Pixel configurable desde el panel admin

### Situacion actual

El Pixel ID (`1428549534945171`) esta hardcodeado en `index.html`. El panel admin tiene la UI para cambiar el ID y habilitar/deshabilitar, pero esos valores no se usan en ningun lado.

### Estrategia hibrida

Mantener la carga del script de Facebook en `index.html` (para que cargue rapido), pero **sin** hacer `fbq('init')` ni `fbq('track', 'PageView')` ahi. La inicializacion se hara desde React una vez que se lea el Pixel ID de la base de datos.

Esto combina lo mejor de ambos enfoques:
- El script `fbevents.js` se carga temprano desde el HTML estatico (confiable, dificil de bloquear)
- El Pixel ID se lee de la config, permitiendo cambiarlo desde el admin
- El toggle de habilitar/deshabilitar funciona correctamente

### Cambios

**Archivo: `index.html`**
- Mantener solo la carga del script `fbevents.js` y la creacion del stub `fbq`
- Eliminar las lineas `fbq('init', '...')` y `fbq('track', 'PageView')`
- Actualizar el `noscript` para que no tenga el ID hardcodeado (o eliminarlo, ya que sin init no tiene sentido)

**Archivo: `src/lib/metaPixel.ts`**
- Agregar una funcion `initMetaPixel(pixelId: string)` que llame a `fbq('init', pixelId)` y `fbq('track', 'PageView')`
- Agregar una variable interna `isInitialized` para evitar doble inicializacion
- `canTrack()` ahora verifica `isInitialized` ademas de que `fbq` exista

**Archivo: `src/components/MetaPixelProvider.tsx`**
- Leer `meta_pixel_id` y `meta_pixel_enabled` desde `useConfig()`
- Cuando ambos estan disponibles y habilitados, llamar a `initMetaPixel(pixelId)`
- Si esta deshabilitado, no inicializar (ningun evento se dispara)
- Mantener el tracking de PageView en cambios de ruta

### Detalle tecnico

| Archivo | Cambio |
|---------|--------|
| `index.html` | Mantener carga de fbevents.js, eliminar init y PageView hardcodeados |
| `src/lib/metaPixel.ts` | Agregar `initMetaPixel(pixelId)` con control de inicializacion |
| `src/components/MetaPixelProvider.tsx` | Leer config de DB e inicializar pixel dinamicamente |

### Flujo

```text
1. HTML carga fbevents.js (crea window.fbq como stub)
2. React monta MetaPixelProvider
3. MetaPixelProvider lee config de la DB (meta_pixel_id, meta_pixel_enabled)
4. Si enabled y hay ID valido -> fbq('init', id) + fbq('track', 'PageView')
5. En cada cambio de ruta -> fbq('track', 'PageView')
6. Todos los demas eventos (AddToCart, etc.) funcionan normalmente
```

