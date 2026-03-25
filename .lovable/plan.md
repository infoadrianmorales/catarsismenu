

## Auditoría (Fase 1)

| # | Pregunta | Estado |
|---|----------|--------|
| 1 | ¿Existe vercel.json? | ✅ Sí — tiene rewrites de categorías + headers de seguridad y caché |
| 2 | ¿Existe vite.config.ts? | ✅ Sí — configuración estándar sin comentarios |
| 3 | Scripts en package.json | ✅ Ya tiene `build`, `preview`, `dev`, `build:dev`, `lint` |
| 4 | ¿Lockfiles duplicados? | ✅ Ambos `bun.lock` y `bun.lockb` existen en la raíz |

---

## Plan de cambios (Fase 2)

### CAMBIO 1 — vercel.json
El archivo ya existe con rewrites de categorías y headers. Se debe:
- Agregar los campos `_comentario_1/2/3` al inicio
- **Agregar el catch-all rewrite** `{"source": "/(.*)", "destination": "/index.html"}` **al final** del array de rewrites (después de las categorías, para que no las sobreescriba)
- Mantener los headers de seguridad existentes (X-Content-Type-Options, X-Frame-Options, etc.)
- Mantener el header de caché de `/assets/` que ya existe
- Agregar el header de caché `must-revalidate` para `/(.*).html`
- Mantener los headers de `/images/` y `/favicon` existentes

### CAMBIO 2 — vite.config.ts
- Agregar el bloque de comentarios exacto del prompt **antes** de la línea 1 (antes de los imports)
- No modificar la configuración existente

### CAMBIO 3 — package.json
- `build` y `preview` **ya existen** — no se tocan
- Agregar `_info_scripts` al bloque scripts

### CAMBIO 4 — Lockfiles + .gitignore
- Eliminar `bun.lockb`
- Agregar a `.gitignore`:
  ```
  # Lockfile binario duplicado eliminado — se usa bun.lock
  bun.lockb
  ```

### Archivos modificados: 4
| Archivo | Tipo de cambio |
|---------|---------------|
| `vercel.json` | Agregar comentarios, catch-all rewrite, header HTML cache |
| `vite.config.ts` | Agregar bloque de comentarios (sin cambiar config) |
| `package.json` | Agregar `_info_scripts` |
| `.gitignore` | Agregar exclusión de `bun.lockb` + eliminar el archivo |

