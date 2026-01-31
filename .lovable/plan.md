
## Eliminar Código Duplicado del Meta Pixel

### Resumen
Eliminaré el código estático del Meta Pixel que se agregó manualmente en `index.html` para mantener únicamente la implementación dinámica que ya existe en el proyecto. Esta implementación dinámica ofrece mejor tracking con contexto del modo (delivery/local).

---

### Problema Actual
El archivo `index.html` contiene código del Meta Pixel que se duplica con la implementación dinámica en `MetaPixelProvider.tsx`:

- **Líneas 35-48** (en `<head>`): Script de inicialización del Pixel
- **Líneas 52-55** (en `<body>`): Fallback `<noscript>` para usuarios sin JavaScript

### Cambios a Realizar

#### Archivo: `index.html`

**Eliminar líneas 35-48** (bloque del script en `<head>`):
```html
<!-- Meta Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  ...
  fbq('init', '1428549534945171');
  fbq('track', 'PageView');
</script>
<!-- End Meta Pixel Code -->
```

**Eliminar líneas 52-55** (fallback `<noscript>` en `<body>`):
```html
<!-- Meta Pixel noscript fallback -->
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=1428549534945171&ev=PageView&noscript=1"
/></noscript>
```

---

### Beneficios de la Implementación Dinámica

| Característica | Código Estático | Implementación Dinámica |
|----------------|-----------------|-------------------------|
| Control desde Admin | ❌ No | ✅ Sí |
| Tracking de modo (delivery/local) | ❌ No | ✅ Sí |
| Navegación SPA | ❌ Solo carga inicial | ✅ Todas las rutas |
| Eventos de conversión | ❌ Solo PageView | ✅ Todos (AddToCart, Purchase, etc.) |
| Evita duplicados | ❌ Dispara 2 veces | ✅ Control único |

---

### Resultado Esperado
Después del cambio, el Meta Pixel se cargará únicamente a través de `MetaPixelProvider.tsx`, que:
1. Lee la configuración desde la base de datos (`meta_pixel_id` y `meta_pixel_enabled`)
2. Inicializa el Pixel dinámicamente cuando está habilitado
3. Incluye el parámetro `content_category: mode` en cada `PageView`
4. Maneja correctamente la navegación SPA sin duplicar eventos
