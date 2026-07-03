## Contexto
El sitio vive indefinidamente en Lovable. Los dominios `catarsisve.com` y `catarsiszone.com` ya apuntan al hosting de Lovable, así que sitemap, canonical, OG, robots y `facebook-domain-verification` **no cambian**. En vez de borrar la configuración de Vercel, la dejaremos **inactiva pero preservada como referencia comentada**, por si en el futuro se decide migrar de vuelta.

## Cambios propuestos

### 1. `vercel.json` — neutralizar sin borrar
JSON no admite comentarios, así que no se puede "comentar el contenido" dentro del mismo archivo. Dos opciones válidas:

- **Opción A (recomendada):** renombrar `vercel.json` → `vercel.json.disabled`. Vercel deja de leerlo, pero el contenido queda intacto en el repo como referencia histórica. Para reactivarlo en el futuro basta con renombrarlo de vuelta.
- **Opción B:** mover el contenido a `docs/vercel.reference.json` con una nota al inicio explicando que está desactivado.

En ambos casos añadimos una nota corta en `README.md` explicando dónde vive la configuración de Vercel archivada.

### 2. `README.md` — nota informativa
Agregar una sección breve tipo:
> **Hosting actual:** Lovable (Publish). La configuración histórica de Vercel se conserva en `vercel.json.disabled` por si en el futuro se migra el despliegue.

Sin tocar el resto del contenido.

### 3. Memoria del proyecto (`mem://`) — actualizar, no eliminar
- **Mantener** `mem://hosting/configuracion-dominios-vercel` y `mem://hosting/vercel-routing-and-caching`, pero editar la descripción/cuerpo para marcarlas como **"Referencia archivada — hosting actual es Lovable"**.
- Añadir una nueva entrada `mem://hosting/lovable-hosting-actual` que declare que el despliegue vivo es Lovable Publish y que los dominios custom están conectados ahí.
- Actualizar `mem://index.md` para reflejar el hosting actual y renombrar los ítems archivados.

### 4. URLs cortas (`/hamburguesas`, `/pizzas`, `/best-seller`, etc.)
Estas rewrites vivían en `vercel.json`. Al desactivarlo dejarán de resolver como entrada directa (tecleada o enlace externo). La navegación interna vía React Router **no se ve afectada** porque ya usa `/categoria/<slug>`.

Recomiendo **replicarlas dentro de React Router** con `<Route path="/hamburguesas" element={<Navigate to="/categoria/hamburguesas" replace />}/>` para las 8 rutas del `vercel.json`. Así:
- Enlaces externos ya compartidos siguen funcionando.
- No dependemos de configuración del host.
- Si mañana se vuelve a Vercel, las rewrites del JSON siguen ahí y también funcionan (doble red).

### 5. Lo que **NO** se toca
- `sitemap.xml`, `robots.txt`, canonical, OG, Twitter Card, `facebook-domain-verification`, geo tags.
- `supabase/config.toml`, edge functions, `metaCapi.ts`, `metaPixel.ts`.
- `.env`, integraciones Supabase.

## Preguntas antes de ejecutar
1. Para preservar Vercel, ¿vamos con **Opción A** (`vercel.json.disabled`) o **Opción B** (`docs/vercel.reference.json`)?
2. ¿Replico las URLs cortas dentro de React Router (recomendado) o las dejamos rotas hasta una futura migración?

## Resumen técnico
| Acción | Archivo/recurso |
|---|---|
| Renombrar (A) o mover (B) | `vercel.json` |
| Editar leve | `README.md` |
| Editar (marcar archivadas) | `mem://hosting/configuracion-dominios-vercel`, `mem://hosting/vercel-routing-and-caching` |
| Crear | `mem://hosting/lovable-hosting-actual` + actualizar `mem://index.md` |
| Opcional recomendado | Rutas espejo en `src/App.tsx` para short URLs |
