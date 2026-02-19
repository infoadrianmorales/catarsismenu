

## Corregir Errores de Indexacion en Google Search Console

### Problemas Identificados

Google reporta dos tipos de errores:

#### 1. "Pagina con redireccion"
La ruta `/menu` tiene un `<Navigate to="/" replace />` en el codigo. Si Google tenia indexada esa URL, ahora detecta una redireccion del lado del cliente (JavaScript). Google prefiere redirecciones del servidor (301), no redirecciones SPA.

#### 2. "Soft 404"
Cuando un producto o categoria no existe, la app muestra un mensaje como "Producto no encontrado" pero responde con HTTP 200 (exito). Google detecta que el contenido parece una pagina de error pero el codigo de estado dice que todo esta bien. Esto aplica a:
- `/producto/slug-que-no-existe` - muestra "Producto no encontrado" con status 200
- `/categoria/slug-invalido` - muestra "No hay productos en esta categoria" con status 200
- Cualquier ruta inexistente llega a `NotFound` pero tambien con status 200

Ademas, ninguna de estas paginas tiene la meta etiqueta `noindex`, por lo que Google intenta indexarlas.

---

### Solucion

#### 1. Agregar `noindex` a paginas de error

Modificar las siguientes paginas para incluir `<meta name="robots" content="noindex">` cuando no se encuentra el contenido:

**`src/pages/NotFound.tsx`**
- Agregar react-helmet-async con meta robots noindex
- Esto le dice a Google: "no indexes esta pagina"

**`src/pages/ProductPage.tsx`**
- Cuando el producto no se encuentra (estado `!product` despues de cargar), agregar meta noindex
- Esto cubre URLs de productos eliminados o con slugs incorrectos

**`src/pages/CategoryPage.tsx`**
- Detectar cuando una categoria no existe en la base de datos (slug invalido)
- Mostrar pagina de error con meta noindex en lugar de "No hay productos"

#### 2. Manejar la redireccion `/menu` para Vercel

Como el sitio esta desplegado en Vercel, agregar un archivo `vercel.json` con una redireccion 301 del servidor para `/menu` a `/`. Esto reemplaza la redireccion JavaScript con una redireccion HTTP real que Google entiende correctamente.

**Crear `public/_redirects`** o **`vercel.json`** (segun plataforma):

```text
/menu  →  /  (301 permanente)
```

#### 3. Mantener la redireccion SPA como respaldo

Conservar el `<Navigate to="/" replace />` en App.tsx como respaldo para usuarios que lleguen directamente, pero la redireccion del servidor sera la que Google vea primero.

---

### Detalles Tecnicos

**Archivos a modificar:**

| Archivo | Cambio |
|---------|--------|
| `src/pages/NotFound.tsx` | Agregar Helmet con meta robots noindex |
| `src/pages/ProductPage.tsx` | Agregar noindex cuando producto no existe |
| `src/pages/CategoryPage.tsx` | Detectar categoria invalida, mostrar error con noindex |
| `vercel.json` | Crear con redireccion 301 de /menu a / |

**Dependencias:** react-helmet-async ya esta instalada en el proyecto.

### Despues de Publicar

1. Hacer deploy en Vercel para que `vercel.json` tome efecto
2. En Google Search Console, ir a las URLs con error
3. Solicitar re-inspeccion de cada URL afectada
4. Google deberia dejar de reportar estos errores en los siguientes dias
