

## Agregar flechas de deslizamiento en la parte inferior del banner (movil)

### Cambio propuesto

Mover las flechas de navegacion del slider desde la zona de controles (debajo de la imagen) hacia la parte inferior de la imagen del banner, superpuestas con un fondo semitransparente. Los dots se mantienen en la zona de controles debajo.

### Resultado visual en movil

```text
+---------------------------+
|                           |
|    IMAGEN DEL BANNER      |
|                           |
|                           |
|   [<]               [>]   |  <- flechas en la parte baja de la imagen
+===========================+
|      * * * * *            |  <- dots en zona de controles
+---------------------------+
| TAPE DIVIDER              |
+---------------------------+
```

### Detalle tecnico

**Archivo:** `src/components/HeroSection.tsx`

1. Dentro de la "Image Zone" (div linea 84), agregar un bloque visible solo en movil (`md:hidden`) con las flechas posicionadas en `absolute bottom-4 left-4 right-4` con `justify-between`
   - Botones circulares con fondo `bg-black/30 hover:bg-black/50 text-white` (mismo estilo que desktop)
   - Solo se muestra si `showCarousel` es true

2. En la "Mobile Controls Zone" (linea 198), eliminar las flechas del bloque de navegacion y dejar solo los dots como indicadores de posicion
   - El contenedor de dots se simplifica sin los botones de flecha

