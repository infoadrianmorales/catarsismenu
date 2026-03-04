

## Diagnóstico: Tasa BCV desactualizada

### Situacion actual

La tasa almacenada es **421.8772 Bs/$**, obtenida de `ve.dolarapi.com` con fecha de actualización **2026-03-03T21:01:05Z** (ayer). Esto indica que la fuente primaria no ha publicado la tasa del día 4 de marzo aún o está retrasada.

### Estado de las fuentes

| Fuente | URL | Estado |
|--------|-----|--------|
| ve.dolarapi.com (primaria) | `/v1/dolares/oficial` | Funciona, pero devuelve tasa del **3 de marzo** (desactualizada) |
| exchangemonitor.net (fallback 1) | `/api/v1/dolar` | **Caída** - retorna 404 |
| bcv.org.ve (fallback 2) | scraping directo | Funciona intermitentemente, depende de HTML parsing |

### Problema

1. **ve.dolarapi.com** es la fuente que responde exitosamente, pero su dato tiene `fechaActualizacion` del 3 de marzo. El BCV publica la tasa nueva típicamente entre las 3-5 PM hora Venezuela; si aún no la publican hoy, esta API no la tendrá.
2. **exchangemonitor.net** ya no funciona (404), por lo que el fallback 1 es inútil.
3. El scraping de **bcv.org.ve** es frágil y puede fallar si cambian el HTML.

### Plan de corrección

**Archivo:** `supabase/functions/sync-bcv-rate/index.ts`

1. **Reemplazar exchangemonitor.net** por una nueva API funcional. Opciones viables:
   - `https://pydolarve.org/api/v2/dollar?monitor=bcv` (API popular de Venezuela)
   - `https://api.cambio.today/v1/quotes/USD/VES/json` (si aplica)

2. **Agregar validación de frescura**: si la `fechaActualizacion` de ve.dolarapi.com es de más de 24 horas atrás, intentar la siguiente fuente en vez de aceptar el dato viejo.

3. **Mejorar el scraping de BCV** como fallback final, actualizando los patrones regex para que sean más robustos ante cambios de HTML.

4. **Logging mejorado**: registrar la fecha de la tasa obtenida para facilitar debugging futuro.

### Nota importante

Si la tasa del BCV del 4 de marzo aún no ha sido publicada por el Banco Central, ninguna API podrá proveerla. En ese caso, la tasa del 3 de marzo es la más reciente disponible. La corrección principal es eliminar `exchangemonitor.net` (caído) y agregar un fallback funcional para cuando `ve.dolarapi.com` esté retrasada.

