

## Compactar botones CTA en una sola linea (movil)

### Cambio propuesto

Reemplazar los 3 botones apilados verticalmente (WhatsApp, Instagram, Ubicacion) por una fila horizontal de 3 botones tipo icono circular, mas compactos y visualmente limpios.

### Resultado visual en movil

```text
+---------------------------+
|    IMAGEN DEL BANNER      |
+===========================+
|      < * * * * >          |
|                           |
|   (wa)    (ig)    (map)   |  <- 3 iconos circulares en fila
+---------------------------+
| TAPE DIVIDER              |
+---------------------------+
```

Cada boton sera un circulo con el icono correspondiente (sin texto), con un tooltip o label debajo opcional. Los colores se mantienen: verde WhatsApp, estilo outline para Instagram, y ghost para ubicacion.

### Detalle tecnico

**Archivo:** `src/components/HeroSection.tsx`

- Lineas 233-272: Reemplazar el bloque de "Mobile CTA Buttons" (`flex flex-col w-full gap-2`) por un `flex flex-row items-center justify-center gap-4`
- Cada boton cambia de `size="lg"` con texto completo a `size="icon"` (circulares, 44x44px aprox.) con `rounded-full`
- Se elimina el texto de los botones en movil, dejando solo los iconos (`MessageCircle`, `Instagram`, `MapPin`)
- Debajo de cada icono se agrega un `<span>` pequeno con el nombre (ej: "WhatsApp", "Instagram", "Ubicacion") en `text-xs text-muted-foreground`
- Los botones de desktop (lineas 140-184) no se modifican
- El contenedor pasa de `flex-col` a `flex-row` con `gap-6` para separar bien los iconos

