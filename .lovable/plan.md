

## Plan: Corregir sincronización de tasa BCV

### Problema actual
La función acepta la primera fuente que responde (ve.dolarapi.com) aunque devuelva una tasa vieja (421.88), porque la lógica `isStale` solo marca como viejo si es después de las 4 PM VET y la tasa es de un día anterior. Resultado: nunca intenta las otras fuentes que sí tienen la tasa actualizada (425.67).

### Cambios

#### 1. Edge Function: consultar TODAS las fuentes y elegir la más reciente
**Archivo:** `supabase/functions/sync-bcv-rate/index.ts`

- Cambiar la estrategia de "primera que responda" a **consultar todas las fuentes en paralelo** y elegir la que tenga la fecha más reciente o la tasa más alta (cuando las fechas coinciden).
- Cada fuente devuelve su resultado independientemente. Al final se comparan todas las respuestas válidas y se selecciona la mejor.
- Esto aplica tanto para el botón "Sincronizar" como para las ejecuciones automáticas por cron.

#### 2. Cron: actualizar horario
**Horario actual:** `0 21,22,23,0,1 * * *` (UTC) = 5-9 PM VET

**Nuevo horario (2 jobs):**
- **Job vespertino:** `0 20,21,22,23,0,1 * * *` (UTC) = **4 PM - 9 PM VET**, cada 60 min
- **Job matutino:** `0 15 * * *` (UTC) = **11 AM VET**, confirmación antes de apertura

Se eliminará el cron actual y se crearán los dos nuevos.

#### 3. Prueba de verificación
Después de desplegar, se invocará la función manualmente para confirmar que consulta todas las fuentes y selecciona la tasa correcta (425.67).

### Resumen de fuentes consultadas (en paralelo)
1. `ve.dolarapi.com` — API primaria
2. `pydolarve.org` — API alternativa
3. `exchangedyn.com` — API alternativa
4. `bcv.org.ve` — scraping directo del BCV (fuente oficial)

