## Objetivo
Mejorar la simetría entre columnas y aumentar el tamaño del texto en `SemanticSEOSection`, tomando como referencia la imagen adjunta (H2 grande en amarillo Phudu uppercase, párrafos más grandes y aireados, columna derecha alineada verticalmente con la izquierda).

## Cambios (solo `src/components/SemanticSEOSection.tsx`)

1. **H2** — pasar de `text-sm md:text-base` a `text-2xl md:text-4xl font-display font-bold uppercase tracking-tight` para replicar el peso visual del mock.
2. **Párrafos SEO (columna izquierda)** — de `text-xs md:text-sm` a `text-base md:text-lg leading-relaxed`, con `space-y-4` entre párrafos. Texto se mantiene idéntico (crítico SEO).
3. **Columna derecha**:
   - Subtítulo "Encuéntranos en Lechería" a `text-xl md:text-2xl font-display font-bold` blanco.
   - Mapa más alto (`h-64 md:h-72`) y con esquinas más suaves para equilibrio visual.
   - Bloques MapPin/Clock con texto `text-sm md:text-base`, separadores sutiles (`border-t border-white/10`) entre filas para replicar las líneas divisorias del mock.
   - CTA "Cómo llegar" un poco más grande (`px-6 py-3 text-base`), ancho auto.
4. **Grid** — `gap-10 md:gap-12`, `items-start` mantenido; contenedor `max-w-6xl` para más aire; padding vertical `py-14 md:py-20`.
5. Mantener colores del brand (#F2B60F amarillo, #DB1F51 raspberry, fondo #010C23) y contraste WCAG AA. Sin cambios en `config.ts` ni en el texto SEO.