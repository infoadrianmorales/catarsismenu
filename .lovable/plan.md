

## Plan: Cambiar enlace de teléfono a WhatsApp nativo

### Problema
El enlace `https://wa.me/584249056438` en el Footer puede abrir WhatsApp Web en escritorio en lugar de la app nativa.

### Cambio
**`src/components/Footer.tsx`** — Cambiar el `href` del número de teléfono:

```
// Antes
href="https://wa.me/584249056438"

// Después  
href="https://api.whatsapp.com/send?phone=584249056438"
```

El dominio `api.whatsapp.com` prioriza abrir la app nativa de WhatsApp en móvil y escritorio. Un solo cambio de línea.

