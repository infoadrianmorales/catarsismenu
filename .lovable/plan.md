

## Plan: Alinear badges de contacto en columna centrada

### Cambio
**`src/components/Footer.tsx` línea 55** — Cambiar el contenedor de los badges:

```
// Antes
<div className="flex flex-wrap gap-2">

// Después
<div className="flex flex-col items-center gap-2">
```

Esto apila los 3 badges verticalmente (uno debajo del otro) y los centra. Sin cambios en contenido, hrefs ni estilos individuales.

