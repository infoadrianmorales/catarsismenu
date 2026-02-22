

## Rediseno de la pagina del Carrito

### Situacion actual

La pagina `/carrito` funciona correctamente pero tiene un diseno basico: cards simples con bordes, un layout de 2 columnas en desktop, y una seccion de resumen estandar. No tiene animaciones ni efectos visuales que refuercen la identidad de marca Catarsis (tema oscuro con colores vibrantes: rojo raspberry, amarillo xanthous, verde teal).

### Mejoras propuestas

**1. Estado vacio mas atractivo**
- Ilustracion animada del carrito vacio (icono mas grande con animacion sutil de rebote)
- Texto motivacional mas llamativo con la tipografia de marca (Phudu)
- Boton prominente con gradiente de marca para ir al menu

**2. Tarjetas de producto rediseñadas**
- Imagen mas grande (de 96px a 80px en movil, 96px en desktop) con bordes redondeados y sombra
- Efecto hover sutil con elevacion
- Controles de cantidad mas visibles con estilo pill/rounded (similar al CartDrawer que ya usa bordes redondeados)
- Precio unitario tachado cuando hay descuento futuro
- Deslizar para eliminar en movil (swipe gesture) - se reemplaza el boton de basura por gesto tactil
- Seccion de notas con icono animado y transicion mas suave

**3. Resumen de compra mejorado**
- Fondo con gradiente sutil usando los colores de marca
- Indicador de progreso para envio gratis (si aplica en el futuro)
- Boton de checkout mas grande y prominente con efecto pulsante
- Badge de "pedido seguro" o icono de confianza
- En movil: resumen fijo en la parte inferior (sticky bottom bar) para acceso rapido al checkout

**4. Barra inferior fija en movil**
- Mostrar total + boton "Finalizar Compra" siempre visible en la parte inferior en pantallas moviles
- Evita que el usuario tenga que hacer scroll hasta abajo para ver el resumen

**5. Animaciones y transiciones**
- Animacion de entrada para cada tarjeta de producto (stagger effect)
- Transicion suave al eliminar un producto (fade out + colapso)
- Feedback visual al cambiar cantidades (numero que pulsa brevemente)

### Archivos a modificar

**`src/pages/Cart.tsx`** (cambio principal)
- Redisenar estado vacio con animacion e ilustracion mejorada
- Redisenar tarjetas de producto con mejor jerarquia visual
- Agregar barra inferior fija en movil con total + boton checkout
- Controles de cantidad rediseñados (estilo pill como en CartDrawer)
- Animaciones de entrada escalonadas para las tarjetas
- Resumen lateral con gradiente y mejor tipografia

**`src/index.css`** (agregar animaciones)
- Keyframes para animacion de entrada escalonada (stagger)
- Keyframe para efecto de pulso en numeros de cantidad
- Keyframe para animacion del carrito vacio

### Detalle tecnico

**Barra inferior fija en movil:**
- `fixed bottom-0 left-0 right-0` con padding seguro para dispositivos con notch
- Muestra subtotal y boton de checkout
- Solo visible en pantallas `md:hidden`
- Se agrega `pb-24` al contenido principal en movil para evitar que la barra tape los productos

**Animaciones escalonadas:**
- Cada tarjeta de producto tiene un delay incremental (0ms, 50ms, 100ms...)
- Usa `animate-in fade-in slide-in-from-bottom-4` de tailwindcss-animate
- Se aplica con `style={{ animationDelay }}` en cada item

**Controles de cantidad:**
- Se reemplazan los controles actuales (AddToCartButton compact) por controles inline tipo pill
- Estilo consistente con el CartDrawer: `rounded-full border border-border bg-background`
- Botones de +/- de 32x32px con area tactil adecuada

**Resumen mejorado:**
- Background con gradiente sutil: `bg-gradient-to-br from-card to-muted/30`
- Borde con glow sutil usando `shadow-[0_0_20px_hsl(var(--primary)/0.1)]`
- Boton checkout con `bg-secondary` y efecto hover con scale

