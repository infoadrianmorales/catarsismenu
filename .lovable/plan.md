

## Mejorar Posicionamiento SEO en Buscadores

### Estado Actual del SEO

Tu proyecto ya tiene una base sólida de SEO:
- Componente `SEO.tsx` con meta tags dinámicos
- Schema JSON-LD de tipo Restaurant
- Sitemap.xml y robots.txt configurados
- Meta tags Open Graph para redes sociales
- URL canónica definida

Sin embargo, hay varias mejoras importantes que pueden hacerse para posicionar mejor en Google.

---

### Mejoras Propuestas

#### 1. Agregar SEO a la Página Principal (Index)

**Problema:** La página principal no usa el componente `<SEO />`, solo tiene el schema.

**Solución:** Agregar el componente SEO con datos optimizados:
- Título: "Menú Digital | Hamburguesas, Pizzas, Cócteles en Lechería"
- Descripción con palabras clave locales
- URL canónica

---

#### 2. Mejorar Palabras Clave en Meta Descripción

**Problema:** La descripción actual es muy genérica.

**Antes:**
```
"Sabores que liberan, momentos que conectan. Comida deliciosa y tragos..."
```

**Después:**
```
"Restaurante en Lechería, Anzoátegui. Hamburguesas gourmet, pizzas artesanales, parrilla y coctelería. Menú digital con delivery. ¡Ordena ahora!"
```

---

#### 3. Agregar Meta Keywords (Opcional pero Útil)

Añadir palabras clave relevantes:
```
restaurante lechería, hamburguesas lechería, pizzas anzoátegui, 
delivery lechería, menú digital, catarsis drinks food
```

---

#### 4. Mejorar Schema Restaurant con Datos Adicionales

Enriquecer el schema con:
- **Imagen del restaurante** para aparecer en resultados
- **Rango de precios** más detallado
- **Reseñas agregadas** (si las tienes)
- **Métodos de pago aceptados**
- **Opciones de servicio** (delivery, dineIn)

```text
┌─────────────────────────────────────────┐
│  Schema Restaurant Mejorado             │
├─────────────────────────────────────────┤
│  + image (logo/foto del local)          │
│  + paymentAccepted                      │
│  + currenciesAccepted                   │
│  + aggregateRating (si hay reseñas)     │
│  + hasOfferCatalog (menú con precios)   │
│  + potentialAction (OrderAction)        │
└─────────────────────────────────────────┘
```

---

#### 5. Agregar Schema de Productos Individuales

En `ProductPage.tsx`, agregar schema JSON-LD de tipo `Product`:
- Nombre del producto
- Precio (USD y VES)
- Imagen
- Disponibilidad
- Categoría

Esto permite que Google muestre productos con precios en los resultados.

---

#### 6. Crear Schema de BreadcrumbList

Agregar migas de pan estructuradas para mejorar la navegación en resultados:
```
Inicio > Hamburguesas > Catarsis Burger
```

---

#### 7. Agregar Atributos Alt en Imágenes

Verificar que todas las imágenes tengan atributos `alt` descriptivos con palabras clave.

---

#### 8. Mejorar Sitemap con LastMod

Agregar fecha de última modificación al sitemap para que Google sepa cuándo revisar:
```xml
<lastmod>2025-02-05</lastmod>
```

---

### Resumen de Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Index.tsx` | Agregar componente `<SEO />` |
| `src/components/SEO.tsx` | Mejorar descripción por defecto |
| `src/components/RestaurantSchema.tsx` | Enriquecer con más datos |
| `src/pages/ProductPage.tsx` | Agregar ProductSchema |
| `index.html` | Mejorar meta description |
| `public/sitemap.xml` | Agregar lastmod |

---

### Impacto Esperado

| Mejora | Beneficio SEO |
|--------|---------------|
| Meta description local | +Relevancia para búsquedas locales |
| Schema enriquecido | +Rich snippets en Google |
| Product schema | +Productos en búsqueda |
| BreadcrumbList | +Navegación en resultados |
| Sitemap lastmod | +Crawl más frecuente |

---

### Acciones Fuera del Código (Recomendaciones)

1. **Google Search Console:** Registrar el sitio y enviar el sitemap
2. **Google Business Profile:** Crear/optimizar la ficha del negocio
3. **Backlinks locales:** Conseguir enlaces desde directorios de Lechería/Anzoátegui
4. **Velocidad:** Mantener el Lighthouse Performance ≥90

