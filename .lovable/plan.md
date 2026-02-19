

## Integrar el texto SEO dentro del Footer

### El problema

La seccion de texto SEO se ve como un bloque de contenido "suelto" antes del footer que no encaja visualmente con el diseno del menu.

### Por que NO moverlo a otra pagina

Mover el contenido SEO a una pagina separada (ej: `/sobre-nosotros`) **reduce drasticamente su valor SEO**. Google da mucho mas peso al contenido que esta en la pagina principal (`/`). Si se mueve a otra pagina, pierde la asociacion directa con el dominio principal y las busquedas como "restaurante en Lecheria" dejarian de beneficiarse de ese contenido.

### Solucion: Absorberlo dentro del Footer

La mejor estrategia es **mover el texto SEO dentro del componente Footer**, integrandolo como parte natural del diseno. De esta forma:

- Sigue estando en la pagina principal (Google lo indexa igual)
- Se percibe como informacion del restaurante, no como un bloque de texto extrano
- Visualmente queda integrado con el estilo del footer (letra pequena, color gris, fondo oscuro)

### Cambios

**Archivo: `src/pages/Index.tsx`**
- Eliminar toda la seccion `{/* SEO Content Section */}` (lineas 127-157)
- El componente `<Footer />` ya se encargara de mostrar ese contenido

**Archivo: `src/components/Footer.tsx`**
- Agregar el texto SEO como una seccion dentro del footer, entre el tape divider y la seccion de Brand/Info/Social
- Usar texto pequeno (`text-xs`) y color sutil (`text-muted-foreground`) para que se integre naturalmente
- Mantener los links internos a categorias (son valiosos para SEO)
- Organizarlo en un bloque compacto tipo "Sobre Catarsis" que se sienta como contenido informativo del footer, no como marketing

### Resultado visual esperado

```text
+--------------------------------------------------+
|  CATARSIS * TU SPOT PARA DESCONECTAR * ...        |  <- tape divider
+--------------------------------------------------+
|                                                    |
|  Catarsis Drinks & Food es un restaurante en       |
|  Lecheria... hamburguesas, pizzas, emparedados...  |  <- texto SEO integrado
|  cocteles... CC Costa Mar, Local 7...              |     (letra xs, color gris)
|                                                    |
+--------------------------------------------------+
|  [Logo]     Horario / Direccion    [Redes]         |  <- footer actual
+--------------------------------------------------+
|  (c) 2026 Catarsis | Terminos | Sitemap            |
+--------------------------------------------------+
```

### Detalle tecnico

| Archivo | Cambio |
|---------|--------|
| `src/pages/Index.tsx` | Eliminar seccion SEO (lineas 127-157) |
| `src/components/Footer.tsx` | Agregar texto SEO integrado con links internos |

