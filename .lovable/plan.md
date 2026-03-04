

## Diagnóstico: Tasa BCV desactualizada (421.88 vs 425.67)

### Problema raíz

La función `isStale()` usa un umbral de **26 horas**, pero `ve.dolarapi.com` devuelve la tasa del 3 de marzo con timestamp `2026-03-03T21:01:05Z` — que solo tiene ~8 horas de antigüedad. Por lo tanto pasa la validación y se acepta como "fresca", impidiendo que se intente el scraping directo de bcv.org.ve que sí tiene la tasa correcta (425,67).

### Estado actual de las fuentes

| Fuente | Tasa | Estado |
|--------|------|--------|
| ve.dolarapi.com | 421.8772 (3 mar) | Retrasada, pero pasa filtro de 26h |
| pydolarve.org | N/A | No responde (posiblemente caída) |
| bcv.org.ve (scraping) | **425,67410000** (4 mar) | Funciona correctamente |

### Plan de corrección

**Archivo:** `supabase/functions/sync-bcv-rate/index.ts`

1. **Cambiar validación de frescura**: En vez de comparar horas absolutas (26h), comparar la **fecha del rate** contra la **fecha actual en zona horaria Venezuela (UTC-4)**. Si la fecha del rate es anterior a hoy y ya son más de las 4 PM VET (hora habitual de publicación del BCV), considerar el dato como viejo.

2. **Priorizar scraping de BCV**: Mover `fetchFromBcvDirect` más arriba en la cadena de fallbacks — como segunda opción después de la API primaria. El scraping del BCV es la fuente más confiable ya que es el dato oficial directo. Además, comparar el rate obtenido de la API contra el rate almacenado: si la API devuelve exactamente el mismo valor que ya tenemos, intentar la siguiente fuente (puede haber una actualización que la API aún no refleja).

3. **Mejorar regex de scraping**: El HTML del BCV muestra el USD como `**425,67410000**` precedido por `USD`. Los patrones actuales deberían capturarlo, pero ajustaremos para ser más específicos al formato `XXX,XXXXXXXX` (8 decimales).

4. **Agregar fuente adicional**: Intentar `https://api.exchangedyn.com/markets/quotes/usdves/bcv` como fuente alternativa antes del scraping directo.

### Orden final de fuentes

1. `ve.dolarapi.com` — con validación de fecha (mismo día VET)
2. `pydolarve.org` — con validación de fecha
3. `exchangedyn.com` — nueva fuente alternativa
4. `bcv.org.ve` scraping directo — fuente oficial
5. `ve.dolarapi.com` sin validación — último recurso

