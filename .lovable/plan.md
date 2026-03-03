

## Agregar sección de Enlaces Profundos (Deep Links) al panel Meta

Se añadirá una tercera tarjeta (Card) al componente `MetaCatalogPanel.tsx` con información sobre enlaces profundos y ejemplos copiables de URLs, usando las categorías reales del sitio.

### Cambios

**`src/components/admin/MetaCatalogPanel.tsx`** — Agregar una nueva Card al final del componente (después del bloque de Catálogo Feed, antes del cierre de `</div>`):

La nueva sección incluirá:

1. **Encabezado**: "Enlaces Profundos (Deep Links)" con descripción explicativa de qué son y para qué sirven en Meta Ads.

2. **Tabla de URLs disponibles** con botón de copiar para cada una:
   - Página principal: `https://www.catarsiszone.com/`
   - Categorías dinámicas: `/hamburguesas`, `/pizzas`, `/cocteleria`, `/best-seller`, etc.
   - Productos individuales: `/producto/{slug}`
   - Explicación de que el catálogo XML ya incluye los deep links automáticamente para anuncios dinámicos.

3. **Sección de parámetros UTM** con ejemplo copiable:
   ```
   ?utm_source=facebook&utm_medium=cpc&utm_campaign=nombre_campaña
   ```

4. **Instrucciones paso a paso** de cómo usar los deep links en Meta Ads Manager:
   - Al crear anuncio → pegar URL en "Website URL"
   - Para anuncios dinámicos, el feed ya los incluye
   - Recomendación de agregar UTM para rastreo

5. **Estado de verificación de dominio**: badge indicando que la metaetiqueta de verificación de Facebook ya está configurada.

Se importará `Link2` de lucide-react para el icono del encabezado. Se reutilizará la lógica de copiar existente (`navigator.clipboard`) con toast de confirmación.

Un solo archivo modificado: `MetaCatalogPanel.tsx`.

