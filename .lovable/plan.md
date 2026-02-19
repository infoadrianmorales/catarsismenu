

## Optimizacion SEO Profunda - Catarsis como Referencia en Buscadores e IA

### Objetivo

Posicionar a Catarsis Drinks & Food como **referencia en hamburguesas en Lecheria**, destacando tambien pizzas, emparedados, almuerzos y vida nocturna (cocteleria). La optimizacion abarca buscadores tradicionales (Google, Bing) y motores de IA (ChatGPT, Gemini, Perplexity).

---

### 1. Reescribir Contenido SEO Principal

**Archivo: `index.html`** - Metadatos estaticos que Google lee antes de ejecutar JavaScript

| Campo | Actual | Nuevo |
|-------|--------|-------|
| title | "Catarsis Drinks & Food - Menu Digital \| Restaurante en Lecheria" | "Catarsis Drinks & Food \| Las Mejores Hamburguesas de Lecheria - Pizzas, Emparedados y Cocteleria" |
| description | Descripcion generica | Descripcion centrada en hamburguesas como protagonista, mencionando pizzas, emparedados, almuerzos y ambiente nocturno |
| keywords | Lista basica | Keywords long-tail orientados a busquedas reales: "mejores hamburguesas lecheria", "donde comer en lecheria", "restaurante nocturno lecheria", etc. |

Nuevos metadatos a agregar:
- `og:locale` ya existe, agregar `og:site_name`
- `twitter:card` = `summary_large_image` (ya existe)
- `twitter:site` con handle de Instagram como referencia
- Metatag `theme-color` para branding en moviles

**Archivo: `src/components/SEO.tsx`** - Metadatos dinamicos por pagina

- Actualizar `DEFAULT_DESCRIPTION` con enfoque en hamburguesas
- Agregar soporte para `og:locale`, `og:site_name`, `twitter:card`
- Agregar meta `robots` con `index, follow` por defecto

**Archivo: `src/pages/Index.tsx`** - SEO de la pagina principal

- Actualizar titulo y descripcion del componente `<SEO>` con keywords estrategicos

---

### 2. Enriquecer Schema.org (JSON-LD) para Buscadores e IA

**Archivo: `src/components/RestaurantSchema.tsx`** - Schema del restaurante

Mejoras:
- Agregar `"@type": ["Restaurant", "BarOrPub"]` para cubrir la dimension nocturna
- Agregar `aggregateRating` (si hay resenas en Google)
- Agregar `sameAs` con links a Instagram, Facebook, TikTok, YouTube (estas URLs ya estan en el Footer)
- Agregar `"keywords"` no-estandar pero util para IA
- Enriquecer `servesCuisine` con terminos mas especificos
- Agregar `"founder"` o `"description"` mas narrativa para motores de IA
- Incluir **todas** las secciones del menu (faltan Entradas, Emparedados, Ensaladas, Postres)

**Nuevo componente: `src/components/FAQSchema.tsx`**

Crear schema FAQ con preguntas frecuentes reales que los motores de IA utilizan para generar respuestas:
- "Cual es el mejor restaurante de hamburguesas en Lecheria?"
- "Donde comer en Lecheria de noche?"
- "Catarsis tiene delivery?"
- "Cuales son los precios de Catarsis?"
- "Que tipo de comida sirven en Catarsis Lecheria?"
- "Catarsis acepta pago movil?"

Esto posiciona a Catarsis directamente en respuestas de ChatGPT, Gemini, etc.

**Nuevo componente: `src/components/LocalBusinessSchema.tsx`**

Schema adicional con `@type: LocalBusiness` y `FoodEstablishment` para reforzar la presencia local y dar mas senales a Google Maps y buscadores locales.

---

### 3. Agregar Contenido Semantico Visible (SEO On-Page)

**Archivo: `src/pages/Index.tsx`** - Agregar seccion de texto SEO

Agregar un bloque de texto semantico visible antes del Footer con:
- Encabezado h2 con keywords principales
- Parrafo descriptivo sobre Catarsis (hamburguesas como protagonista, ambiente nocturno, variedad)
- Links internos a categorias principales
- Esto da "contenido real" a Google, no solo imagenes y listas de productos

**Archivo: `src/components/Footer.tsx`** - Enriquecer footer

- Agregar texto descriptivo breve con keywords
- Agregar `address` semantico con microdata
- Agregar link a sitemap

---

### 4. Optimizar robots.txt y sitemap.xml

**Archivo: `public/robots.txt`**

Agregar bots de IA para asegurar que indexen el contenido:
- GPTBot (OpenAI)
- Google-Extended (Gemini)
- ClaudeBot (Anthropic)
- PerplexityBot

**Archivo: `public/sitemap.xml`**

- Actualizar `lastmod` a fecha actual (2026-02-19)
- Agregar URLs de productos individuales (las paginas `/producto/[slug]` no estan en el sitemap)
- Esto requiere un sitemap dinamico o al menos incluir los productos mas importantes

---

### 5. Vercel Headers para SEO Tecnico

**Archivo: `vercel.json`**

Agregar headers de seguridad y rendimiento que mejoran el ranking:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Cache headers para assets estaticos

---

### Resumen de Archivos

| Archivo | Cambio |
|---------|--------|
| `index.html` | Reescribir title, description, keywords; agregar theme-color |
| `src/components/SEO.tsx` | Mejorar defaults, agregar metas faltantes |
| `src/pages/Index.tsx` | Actualizar SEO props, agregar seccion de texto semantico |
| `src/components/RestaurantSchema.tsx` | Enriquecer con sameAs, tipos multiples, menu completo |
| `src/components/FAQSchema.tsx` | NUEVO - Schema FAQ para IA y Google |
| `src/components/LocalBusinessSchema.tsx` | NUEVO - Schema LocalBusiness complementario |
| `src/components/Footer.tsx` | Agregar texto SEO y links |
| `public/robots.txt` | Agregar bots de IA |
| `public/sitemap.xml` | Actualizar fechas, agregar productos |
| `vercel.json` | Agregar headers de seguridad/cache |

### Resultado Esperado

- Google mostrara a Catarsis para busquedas como "mejores hamburguesas Lecheria", "donde comer en Lecheria", "restaurante nocturno Lecheria"
- ChatGPT, Gemini y Perplexity podran responder preguntas sobre restaurantes en Lecheria mencionando a Catarsis
- El FAQ Schema puede generar rich snippets (preguntas expandibles) en Google
- El contenido semantico visible refuerza la relevancia tematica

