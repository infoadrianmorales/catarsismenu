

## Reestructurar HeroSection en movil - Separar imagen de controles

### Problema actual

Los botones CTA, flechas y dots ocupan casi la mitad inferior del banner en movil, tapando la imagen. El enfoque de posicionar todo con `absolute` dentro del mismo contenedor no funciona porque hay demasiados elementos compitiendo por el espacio.

### Solucion propuesta

Cambiar la estructura en movil para que la imagen y los controles esten en zonas claramente separadas:

**En movil:** La seccion usa `flex-col` con dos zonas:
1. **Zona de imagen** - ocupa la mayor parte del alto, sin nada encima excepto un gradiente suave al fondo
2. **Zona de controles** - una franja oscura solida al fondo con los dots/flechas y los botones CTA

**En desktop:** sin cambios, se mantiene el layout actual con posicionamiento absoluto.

### Resultado visual en movil

```text
+---------------------------+
|                           |
|    IMAGEN DEL BANNER      |
|    (limpia, sin nada)     |
|                           |
|                           |
+===========================+
|  bg-background solido     |
|   < * * * * >             |
|                           |
| [Pedir por WhatsApp     ] |
| [Ver en Instagram       ] |
| [Como llegar            ] |
+---------------------------+
| TAPE DIVIDER              |
+---------------------------+
```

### Detalle tecnico

**Archivo:** `src/components/HeroSection.tsx`

1. Cambiar la seccion principal en movil a una estructura de dos bloques:
   - La imagen de fondo se mantiene como `absolute inset-0` pero la seccion usa `min-h-[50vh]` en movil (reducida de 60vh) para dar mas espacio a la zona de controles
   - Los controles CTA pasan de `pb-16 pt-8` a una zona con `bg-background` solido, sin transparencia, para que no se mezclen con la imagen

2. Navegacion movil (flechas + dots):
   - Mover de `absolute bottom-36` a `relative` dentro de la zona de controles, como primer elemento
   - Padding vertical reducido para compactar

3. Botones CTA en movil:
   - Dentro de la zona de controles con fondo solido
   - Padding lateral generoso para legibilidad
   - `gap-2` en vez de `gap-3` para compactar

4. Gradiente del banner:
   - En movil: gradiente mas corto, solo un fade suave al fondo de la imagen (`from-background via-transparent to-transparent` con menor cobertura)
   - En desktop: mantener el gradiente actual

5. La estructura del JSX cambiara a:
   - En movil: `section > [imagen absolute] + [div relative con controles y fondo solido]`
   - En desktop: se mantiene el layout actual con todo posicionado absolutamente sobre la imagen
   - Se usara `md:absolute md:bottom-0` en el contenedor de controles para que en desktop flote sobre la imagen y en movil sea un bloque normal debajo

