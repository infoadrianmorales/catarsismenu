
## Swipe en el banner + mover botones CTA al banner (movil)

### Dos cambios en un solo archivo

**Archivo:** `src/components/HeroSection.tsx`

### 1. Soporte de swipe/deslizar con el dedo

Se agregara deteccion de gestos tactiles usando `onTouchStart` y `onTouchEnd` nativos de React (sin dependencias externas). Si el usuario desliza mas de 50px horizontalmente, se cambia al slide anterior o siguiente.

- Se agregan dos estados con `useRef`: `touchStartX` y `touchEndX`
- `onTouchStart` guarda la posicion inicial del dedo
- `onTouchEnd` calcula la diferencia y ejecuta `goToNext()` o `goToPrev()` segun la direccion
- Se pausa el auto-play al hacer swipe (igual que con las flechas)
- Esto se aplica al contenedor de la zona de imagen (linea 84)

### 2. Mover botones CTA dentro del banner (movil)

Los 3 botones de contacto (WhatsApp, Instagram, Ubicacion) que actualmente estan en el `MenuHeader.tsx` se moveran a la parte inferior del banner, junto a las flechas de navegacion.

**Layout resultante en movil:**

```text
+-------------------------------+
|                               |
|      IMAGEN DEL BANNER        |
|                               |
|  [<]   (wa) (ig) (map)   [>] |
+-------------------------------+
|          * * * * *            |
+-------------------------------+
| TAPE DIVIDER                  |
+-------------------------------+
```

- Se modifica el bloque de "Mobile Navigation Arrows" (lineas 187-205) para incluir los 3 iconos CTA entre las flechas izquierda y derecha
- Los iconos seran circulares (`rounded-full`, `bg-black/30`, `text-white`) con el mismo estilo que las flechas para mantener coherencia visual
- WhatsApp conserva su color accent (`text-green-400`)
- Se eliminan los botones CTA del `MenuHeader.tsx` (lineas 37-76, el bloque "Mobile CTA Icons")

### Detalle tecnico

**`src/components/HeroSection.tsx`:**
- Agregar `useRef` para touch tracking
- Agregar handlers `handleTouchStart` y `handleTouchEnd`
- Aplicar `onTouchStart`/`onTouchEnd` al div de la zona de imagen
- Expandir el bloque de flechas moviles para incluir los 3 iconos CTA en el centro

**`src/components/MenuHeader.tsx`:**
- Eliminar el bloque `div` con clase `flex md:hidden items-center gap-1` (lineas 38-76)
- Mantener las importaciones que se usen en otras partes (si no se usan, se limpian)
