
Objetivo: eliminar de forma definitiva cualquier aparición del ícono de Lovable y forzar que en todas las variantes del sitio se use únicamente el favicon de Catarsis, incluso cuando haya caché persistente en navegadores.

1) Diagnóstico de causa raíz (antes de tocar código)
- Confirmar en producción qué favicon está declarando realmente el HTML servido por el dominio principal (`https://www.catarsiszone.com/`) y por `www` (si aplica).
- Verificar si el navegador está pidiendo rutas de fallback no declaradas (especialmente `/favicon.ico`), porque muchos navegadores lo hacen automáticamente aunque exista `<link rel="icon">`.
- Revisar headers de caché en los íconos (`favicon.png`, `apple-touch-icon`, etc.) para identificar si hay un cache largo o un asset viejo en CDN.

2) Endurecer la configuración de favicon (cobertura completa)
- Mantener el favicon de Catarsis como fuente principal.
- Ampliar las referencias en `index.html` para cubrir todos los casos comunes de navegador:
  - `rel="icon"` (PNG)
  - `rel="shortcut icon"` (compatibilidad legacy)
  - `rel="apple-touch-icon"`
  - tamaños explícitos (`16x16`, `32x32`, `180x180`) cuando corresponda
- Definir rutas con versionado (ejemplo `?v=catarsis-20260224`) para invalidar caché agresivo de favicon en clientes.
- Si falta fallback `.ico`, agregar uno con marca Catarsis para evitar que algunos navegadores usen íconos previos cacheados al buscar `/favicon.ico`.

3) Ajuste de caché en hosting para íconos (si aplica)
- Configurar headers de caché más controlados para archivos de favicon (por ejemplo, no `immutable` en favicon).
- Mantener caché largo para assets hashados del build, pero no para favicon crítico de identidad de marca.
- Con esto evitamos que el navegador conserve una versión vieja durante semanas.

4) Validación técnica y visual en todas las “versiones” de acceso
- Verificar en:
  - dominio principal
  - subdominio `www` (si existe)
  - entorno publicado de Lovable
- Comprobaciones:
  - inspección de `<head>` en el documento servido
  - requests reales de red a favicon (incluyendo `/favicon.ico`)
  - confirmación visual en pestaña del navegador
- Importante: al abrir una URL de imagen directa (ej. `/assets/...png`) no se carga el `index.html`, por lo tanto ese contexto no sirve para validar favicon del sitio.

5) Criterios de éxito
- No aparecen íconos de Lovable en navegación normal del sitio.
- Todos los accesos principales muestran el favicon de Catarsis tras recarga dura.
- Los requests de favicon responden con archivos de Catarsis y rutas consistentes.
- Queda una configuración robusta ante caché y fallback de navegadores.

Sección técnica (implementación prevista)
- Archivos a tocar:
  - `index.html` (declaraciones completas de favicon con versionado)
  - `public/` (fallbacks necesarios como `favicon.ico`/variantes si faltan)
  - `vercel.json` (solo si necesitamos ajustar cache headers de favicon)
- Riesgo principal:
  - que el dominio en producción esté sirviendo un deployment distinto al esperado.
- Mitigación:
  - validar source y red desde el dominio final antes y después del cambio.
