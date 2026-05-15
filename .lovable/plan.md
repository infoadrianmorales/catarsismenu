## Plan: Actualizar favicon con nueva imagen

La imagen subida (`Diseño_sin_título.png`) es el logo horizontal "CATARSIS DRINKS & FOOD" en amarillo sobre fondo blanco/transparente. Como es horizontal, al reducirla a 32x32 px el texto será ilegible.

### Pasos

1. Copiar `user-uploads://Diseño_sin_título.png` a `public/favicon-source.png` como respaldo del original.
2. Generar `public/favicon.png` (512x512) recortado/centrado a un cuadrado nítido. Dado que la imagen es horizontal con el wordmark "CATARSIS", recortar solo la **"C"** centrada para que sea legible en pestaña.
3. Actualizar el cache-buster en `index.html` de `?v=catarsis-20260515` a `?v=catarsis-20260515b` en los 5 `<link>`/`<meta>` del favicon.

### Nota importante

El logo completo "CATARSIS DRINKS & FOOD" no se verá legible a 32x32 px (tamaño real de pestaña). Dos opciones:

- **A — Solo la "C"** (recomendado): máxima legibilidad, igual que el favicon anterior pero con la tipografía exacta del nuevo logo.
- **B — Logo completo cuadrado**: se verá como una mancha amarilla borrosa en pestañas pequeñas, pero conserva el wordmark.

Procedo con la **opción A** salvo que indiques lo contrario.
