

## Mover botones CTA al header en movil

### Cambio propuesto

Mover los 3 iconos circulares (WhatsApp, Instagram, Ubicacion) del HeroSection al MenuHeader, colocandolos como iconos pequenos al lado del boton del carrito. Esto libera espacio en el hero y mantiene los accesos directos siempre visibles en la barra superior.

### Resultado visual del header en movil

```text
[Logo]                    [wa] [ig] [map] [carrito]
```

- Los iconos seran botones `ghost` de tamano `icon` (h-8 w-8) sin etiquetas de texto
- Solo visibles en movil (`md:hidden`), ya que en desktop los CTA se mantienen en el hero
- El boton de WhatsApp conserva el color accent
- Instagram y Ubicacion usan variante ghost

### Archivos a modificar

**1. `src/components/MenuHeader.tsx`**
- Importar `MessageCircle`, `Instagram`, `MapPin` de lucide-react
- Importar `appConfig` de `@/data/config`
- Importar `trackContact` de `@/lib/metaPixel`
- Agregar 3 botones icono pequenos (`h-8 w-8`) antes del CartDrawer, envueltos en un `div` con `flex md:hidden items-center gap-1`
- Cada boton abre su respectivo enlace (WhatsApp, Instagram, Maps)

**2. `src/components/HeroSection.tsx`**
- Eliminar el bloque completo de "Mobile CTA Buttons" (lineas 233-278) del Mobile Controls Zone
- La zona movil solo conservara la navegacion del slider (flechas + dots) y el tape divider

### Detalle tecnico

En `MenuHeader.tsx`, los botones se insertaran entre el currency toggle y el CartDrawer:

```text
<div className="flex items-center gap-1 md:hidden">
  <Button size="icon" variant="ghost" className="h-8 w-8" ...> <MessageCircle /> </Button>
  <Button size="icon" variant="ghost" className="h-8 w-8" ...> <Instagram /> </Button>
  <Button size="icon" variant="ghost" className="h-8 w-8" ...> <MapPin /> </Button>
</div>
```

Los botones solo se muestran cuando NO estamos en modo local (`!isLocalMode`), excepto Instagram que siempre se muestra. Se conservan los eventos de analytics y Meta Pixel existentes.

