

## Corregir Meta Pixel — Usar Implementación Estándar de Meta

### Problema

El Pixel está configurado correctamente en la base de datos (ID: `1428549534945171`, enabled: `true`), pero los eventos no se registran en Meta porque:

1. **Inyección dinámica del script**: El script de Facebook se inyecta desde React después de que la app carga, lo que causa condiciones de carrera donde `fbq` no está listo cuando se llaman los eventos
2. **Falta el tag `noscript`**: Meta requiere un fallback `<noscript><img>` que actualmente no existe
3. **Ad blockers**: Los scripts inyectados dinámicamente son más fáciles de bloquear que los incluidos en el HTML estático

### Solucion

Usar la implementación estándar recomendada por Meta: colocar el snippet base directamente en `index.html` y simplificar el código de React para solo disparar eventos.

### Cambios

**Archivo: `index.html`**
- Agregar el snippet oficial de Meta Pixel en el `<head>`, antes del cierre `</head>`
- Incluir `fbq('init', '1428549534945171')` y `fbq('track', 'PageView')` 
- Agregar el tag `<noscript><img>` en el `<body>`

**Archivo: `src/lib/metaPixel.ts`**
- Eliminar toda la lógica de `initMetaPixel` (ya no se necesita crear el stub ni cargar el script)
- Simplificar `canTrack()` para solo verificar si `window.fbq` existe
- Eliminar la variable `isInitialized` y `pixelId` (el pixel se inicializa en HTML)
- Mantener todas las funciones de tracking (`trackAddToCart`, `trackPurchase`, etc.) sin cambios

**Archivo: `src/components/MetaPixelProvider.tsx`**
- Eliminar la lógica de inicialización (ya no se llama a `initMetaPixel`)
- Mantener solo el tracking de PageView en cambios de ruta
- Simplificar el componente significativamente

### Snippet de Meta Pixel (se agrega en index.html)

```text
<!-- Meta Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1428549534945171');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=1428549534945171&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
```

### Nota sobre configuración dinámica

Al hardcodear el Pixel ID en el HTML, se pierde la capacidad de cambiarlo desde el panel admin. Sin embargo, el ID del Pixel rara vez cambia, y la confiabilidad del tracking es mucho más importante. Si en el futuro se necesita cambiar el ID, solo requiere actualizar una línea en `index.html`.

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `index.html` | Agregar snippet oficial de Meta Pixel |
| `src/lib/metaPixel.ts` | Eliminar inicialización, simplificar canTrack |
| `src/components/MetaPixelProvider.tsx` | Eliminar init, mantener solo tracking de rutas |

