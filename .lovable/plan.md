

## Plan: Banner de sugerencias con indicador explícito de "ver más"

### Problema actual
Desde la captura del usuario: las cards de sugerencias se ven ~3 completas pero no hay un indicador claro de que hay más. El usuario quiere un "banner" contenido que muestre exactamente 3 cards completas y en la posición de la 4ta card un botón/overlay que diga "desplazar para ver más".

### Cambios en `src/components/cart/UpsellSuggestions.tsx`

**1. Contenedor tipo banner**
- Envolver el carrusel en un contenedor con fondo diferenciado (`bg-[#0a1628]` con borde `border-gray-700/50` y `rounded-xl`) para que se sienta como un bloque/banner independiente
- Padding interno para que las cards no toquen los bordes
- Título "COMPLEMENTA TU PEDIDO" dentro del banner

**2. Cards: ancho exacto para 3 visibles**
- Cambiar `w-[30vw]` a `calc((100% - 2*12px) / 3)` usando style inline, o bien `w-[calc(33.33%-8px)]` para que exactamente 3 cards llenen el ancho visible del banner
- `flex-shrink-0` se mantiene

**3. Indicador de "ver más" en el borde derecho**
- En lugar del degradado sutil actual, agregar un overlay en la zona derecha del carrusel que muestre un botón circular con `ChevronRight` siempre visible cuando `canScrollRight` es true
- El botón se posiciona absolute en el borde derecho, centrado verticalmente sobre las cards
- Fondo semi-transparente `bg-[#010C23]/90` con borde `border-[#F2B60F]` para destacar
- Al tocarlo: `scrollBy` 3 cards hacia la derecha

**4. Mantener scroll-snap y swipe**
- El swipe nativo se mantiene como alternativa al botón
- `scrollSnapType: 'x mandatory'` sigue activo
- Hide scrollbar se mantiene

### Archivo a modificar

| Accion | Archivo |
|--------|---------|
| Modificar | `src/components/cart/UpsellSuggestions.tsx` |

### Verificacion
1. Se ven exactamente 3 cards completas dentro del banner
2. Un botón de flecha derecha visible indica que hay más
3. Al tocar la flecha se desplazan 3 cards más
4. Swipe sigue funcionando
5. Sin scrollbar visible
6. Desktop sin regresiones

