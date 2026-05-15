## Plan: Favicon con el wordmark CATARSIS completo

Cambio de enfoque: en lugar de recortar solo la "C", usar el logo completo "CATARSIS" centrado en un cuadrado, como pediste.

### Pasos

1. Copiar `user-uploads://Diseño_sin_título-2.png` a `public/favicon-source.png` (sobrescribir respaldo).
2. Generar `public/favicon.png` (512x512) tomando la imagen subida y centrándola en un canvas cuadrado con padding mínimo, fondo transparente, manteniendo el wordmark "CATARSIS" + "DRINKS & FOOD" visible y nítido.
3. Actualizar el cache-buster en `index.html` de `?v=catarsis-20260515b` a `?v=catarsis-20260515c` en los 5 tags del favicon.

### Nota sobre legibilidad

A 32x32 px (tamaño real de pestaña) el texto "DRINKS & FOOD" se verá como una línea fina debajo de "CATARSIS", y "CATARSIS" se leerá como una mancha amarilla con forma de palabra. Es lo esperado al usar el wordmark completo — confirmas que prefieres esto sobre solo la "C".
