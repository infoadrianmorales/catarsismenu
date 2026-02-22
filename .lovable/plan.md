

## Reorganizar controles del banner movil

### Resumen

Dos cambios:
1. **Mover botones CTA (WhatsApp, Instagram, Ubicacion) al header** junto al carrito, solo en movil
2. **Mover los dots (indicadores de slide) dentro del banner**, entre las flechas de navegacion, reemplazando los iconos CTA que estaban ahi

### Resultado visual

**Header movil:**
```text
[Logo]                    [wa] [ig] [map] [carrito]
```

**Banner movil (parte inferior):**
```text
+-------------------------------+
|                               |
|      IMAGEN DEL BANNER        |
|                               |
|  [<]      * * * * *      [>]  |
+-------------------------------+
| TAPE DIVIDER                  |
+-------------------------------+
```

### Archivos a modificar

**1. `src/components/MenuHeader.tsx`**
- Importar `MessageCircle`, `Instagram`, `MapPin` de lucide-react y `trackContact` de `@/lib/metaPixel`
- Agregar un bloque `flex md:hidden items-center gap-1` antes del CartDrawer con los 3 botones icono (`h-8 w-8`, variante `ghost`)
- WhatsApp usa `text-accent`, Instagram y MapPin usan variante ghost normal
- WhatsApp y MapPin se ocultan en modo local; Instagram siempre visible

**2. `src/components/HeroSection.tsx`**
- En el bloque "Mobile Navigation Arrows + CTA Icons" (lineas 211-265): reemplazar los iconos CTA del centro por los dot indicators
- Layout: `[<] ... dots ... [>]`
- Eliminar la seccion "Mobile Controls Zone" de dots (lineas 278-295) ya que los dots se mueven dentro del banner
- La Mobile Controls Zone solo conserva el tape divider
- Limpiar imports no usados si aplica (MessageCircle, Instagram, MapPin se mantienen para desktop)

### Detalle tecnico

En el bloque movil del banner, el centro pasara de los 3 iconos CTA a los dots:

```text
<div className="flex items-center gap-2">
  {slides.map((_, index) => (
    <button
      className={`w-2 h-2 rounded-full ... ${
        index === currentIndex ? 'bg-white w-5' : 'bg-white/40'
      }`}
    />
  ))}
</div>
```

Los dots usaran colores claros (`bg-white`, `bg-white/40`) ya que estaran superpuestos sobre la imagen, a diferencia de los dots anteriores que usaban colores de tema sobre fondo solido.
