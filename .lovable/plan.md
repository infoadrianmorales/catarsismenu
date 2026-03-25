

## Plan: Actualizar logos y favicon con nueva identidad visual

### Contexto
El header y footer actualmente usan `src/assets/logo-catarsis.png` (el logo anterior). Existe `logo-catarsis-white.png` pero no se usa en ningún componente. El favicon es `public/favicon.png`.

### Archivos subidos
- **Logo amarillo** (`Mesa_de_trabajo_2.png`) — para header (fondo oscuro) y favicon
- **Logo blanco** (`Mesa_de_trabajo_6.png`) — para footer (fondo oscuro)

### Cambios

| Archivo | Acción |
|---------|--------|
| `src/assets/logo-catarsis.png` | Reemplazar con logo amarillo |
| `src/assets/logo-catarsis-white.png` | Reemplazar con logo blanco |
| `public/favicon.png` | Reemplazar con logo amarillo (favicon) |
| `src/components/Footer.tsx` | Cambiar import a `logo-catarsis-white.png` para usar logo blanco en footer |
| `index.html` | Actualizar versión de caché del favicon (`?v=catarsis-20260325`) |

### Detalle

1. **Copiar logo amarillo** → `src/assets/logo-catarsis.png` (reemplaza el anterior) y `public/favicon.png`
2. **Copiar logo blanco** → `src/assets/logo-catarsis-white.png`
3. **Footer.tsx**: Cambiar `import logoCatarsis from '@/assets/logo-catarsis.png'` por `import logoCatarsis from '@/assets/logo-catarsis-white.png'`
4. **index.html**: Actualizar query string del favicon para forzar refresco en navegadores

### Nota sobre og-image
El usuario indicó que tiene una imagen lista para redes sociales — se actualizará cuando la suba en un siguiente mensaje.

### Sin cambios
- MenuHeader.tsx sigue usando `logo-catarsis.png` (ahora será el amarillo nuevo)
- Tamaños CSS no cambian (`h-10 md:h-14` header, `h-16 md:h-20` footer)

