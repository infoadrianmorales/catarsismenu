

## Corregir Favicon en Buscadores (Reemplazar logo de Lovable)

### Problema Identificado

El archivo `public/favicon.ico` en produccion sigue siendo el logo de Lovable (corazon naranja/morado). Los buscadores como Google usan este archivo por defecto, por eso aparece el logo de Lovable en los resultados de busqueda.

Ademas, `public/favicon.png` parece estar en blanco (probablemente es el logo blanco sobre fondo transparente).

### Solucion

#### 1. Reemplazar `public/favicon.png`
- Copiar el logo oscuro (`src/assets/logo-catarsis.png`) como nuevo `public/favicon.png`
- Este logo tiene letras oscuras sobre fondo transparente, visible en fondos claros

#### 2. Eliminar `public/favicon.ico`
- Borrar el archivo `.ico` que contiene el logo de Lovable
- Esto evita que los navegadores lo usen como respaldo

#### 3. Actualizar `index.html`
- Agregar variantes de favicon para maxima compatibilidad:
  - `rel="icon"` apuntando a `/favicon.png`
  - `rel="apple-touch-icon"` para dispositivos Apple
  - Metatag de Microsoft para tiles
- Esto cubre todos los navegadores y buscadores

### Detalles Tecnicos

**Archivo: `index.html`**

Actualizar la seccion de iconos en el `<head>`:

```html
<link rel="icon" href="/favicon.png" type="image/png" />
<link rel="apple-touch-icon" href="/favicon.png" />
<meta name="msapplication-TileImage" content="/favicon.png" />
```

**Archivos a modificar:**
| Archivo | Cambio |
|---------|--------|
| `public/favicon.png` | Reemplazar con logo oscuro de Catarsis |
| `public/favicon.ico` | Eliminar (contiene logo de Lovable) |
| `index.html` | Agregar apple-touch-icon y msapplication meta |

### Despues de Publicar

Google tarda entre **dias y semanas** en actualizar el favicon en resultados de busqueda. Para acelerar:
1. Ir a Google Search Console
2. Inspeccionar la URL `https://www.catarsiszone.com/`
3. Solicitar indexacion
4. Esperar a que Google vuelva a rastrear el sitio

### Importante sobre Vercel

Como el proyecto esta desplegado en Vercel, despues de publicar aqui necesitas tambien hacer un nuevo deploy en Vercel para que los archivos estaticos se actualicen en produccion.

