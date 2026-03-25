

## Plan: Actualizar sitemap.xml y robots.txt

Ambos archivos ya existen en `public/`. Se sobreescriben con el contenido exacto del prompt.

| Archivo | Cambio |
|---------|--------|
| `public/sitemap.xml` | Reemplazar contenido completo: 2 URLs (home + /menu), lastmod 2026-03-25, comentarios explicativos |
| `public/robots.txt` | Reemplazar contenido completo: User-agent * Allow, Sitemap, 5 user-agents de IA explícitos, comentarios |

### Detalle
- **sitemap.xml**: Home priority 1.0, /menu priority 0.9, ambos changefreq weekly
- **robots.txt**: Simplificado vs el actual (tenía 10+ user-agents individuales) — ahora usa `User-agent: *` como base + 5 bots de IA explícitos (GPTBot, PerplexityBot, Google-Extended, ClaudeBot, CCBot)
- Contenido exacto tal como lo proporcionó el usuario — sin modificaciones

