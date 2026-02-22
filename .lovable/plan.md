

## Reestructurar HeroSection en movil

### Problema actual

En movil, las flechas de navegacion del slider estan centradas verticalmente (`top-1/2`) sobre la imagen del banner, y los puntos indicadores estan a `bottom-32` (128px del fondo). Ambos elementos obstruyen la imagen. Ademas, los 3 botones CTA (WhatsApp, Instagram, Como llegar) se apilan de forma desordenada.

### Cambios propuestos

**Archivo:** `src/components/HeroSection.tsx`

#### 1. Flechas de navegacion: mover abajo en movil
- En movil: posicionar las flechas en la zona inferior del banner (sobre el gradiente oscuro), junto a los dots, en vez de centradas verticalmente sobre la imagen.
- En desktop: mantener la posicion actual (`top-1/2`).
- Implementacion: en movil, las flechas y los dots se agrupan en un solo contenedor horizontal (flecha izq + dots + flecha der) posicionado justo encima de los botones CTA.

#### 2. Puntos indicadores: integrar con flechas
- Mover los dots de su posicion actual (`bottom-32`) a dentro del contenedor unificado de navegacion en movil.
- En desktop, mantener dots y flechas en sus posiciones actuales.

#### 3. Botones CTA: apilar verticalmente en movil
- En movil: los botones se muestran en columna (uno debajo del otro) a ancho completo para mejor accesibilidad tactil.
- En desktop: mantener el layout horizontal actual (`flex-wrap`).

### Resultado visual en movil

```text
+---------------------------+
|                           |
|    IMAGEN DEL BANNER      |
|    (sin obstrucciones)    |
|                           |
|                           |
+--- gradiente oscuro ------+
|   < * * * * >             |  <- flechas + dots juntos
|                           |
| [Pedir por WhatsApp     ] |  <- botones en columna
| [Ver en Instagram       ] |
| [Como llegar            ] |
+---------------------------+
| TAPE DIVIDER              |
+---------------------------+
```

### Detalle tecnico

- Crear dos bloques de navegacion: uno para movil (`md:hidden`) y otro para desktop (`hidden md:block`).
- El bloque movil es un `div` con `flex items-center justify-center gap-3` que contiene flecha izq, dots, flecha der, posicionado con `absolute bottom-36 z-20`.
- Los botones CTA cambian de `flex flex-wrap` a `flex flex-col w-full` en movil (`flex-col md:flex-row md:flex-wrap`).
- Los botones en movil usan `w-full` para ocupar todo el ancho.
