## Diagnóstico real

Tu mensaje asume que el síntoma es "todas las visitas dicen Netherlands". La realidad en BD es distinta:

- 147 visitas reales en las últimas 6 h con `country = NULL`.
- 1 sola visita con "Netherlands / Groningen" — esa fue mi prueba desde el sandbox (Lovable corre en NL).

El código actual de `track-visit/index.ts` **ya lee `x-forwarded-for`** (líneas 28-36) **y ya pasa la IP al URL** de `ipwho.is` y `ipapi.co` (líneas 54 y 71-73). El cambio que pediste literalmente ya está implementado.

El verdadero problema es otro: **los proveedores de geo están devolviendo respuestas sin datos** (probablemente `success: false` por rate limit de `ipwho.is`, que limita a 10k req/mes por IP de servidor; o timeout de 2.5 s). Por eso terminan con `country = null`.

## Cambios propuestos

### 1. Anotar en cabecera el contexto real
Reemplazar el comentario superior para reflejar el diagnóstico verdadero (no "todas son NL"):

```
// [2026-05-02] FIX: geo resuelta desde IP real del visitante via
// x-forwarded-for + logging de cada paso para diagnosticar nulls.
// Sin este fix, la mayoría de visitantes quedaban como country=null
// porque los proveedores fallaban silenciosamente.
```

### 2. Logging de diagnóstico
Añadir `console.log` mínimos pero precisos en `resolveGeo` y en el handler:
- IP detectada (o "no-ip" si headers vacíos).
- Proveedor que respondió y país devuelto.
- Motivo de fallo: `timeout`, `http <status>`, `success:false`, `empty`.

Esto va a edge logs y nos permite, en una hora, saber exactamente qué está pasando con los visitantes reales.

### 3. Hacer la resolución más resistente
- Subir el timeout de 2.5 s a 4 s (los proveedores gratuitos a veces tardan).
- Añadir `User-Agent` explícito al `fetch` (algunos endpoints rechazan requests sin UA).
- Añadir un **tercer proveedor de fallback**: `https://api.country.is/{ip}` (solo país, sin rate limit conocido) — devuelve país aunque ipwho/ipapi fallen.
- Saltar resolución si la IP detectada es privada/loopback (10.x, 192.168.x, 127.x, ::1) — esos casos garantizan respuestas vacías.

### 4. Mantener tu intención
Tu petición ("leer x-forwarded-for y pasarlo a ipwho.is") queda **explícitamente** documentada en el código aunque ya estuviera, para que sea inequívoco para el siguiente lector.

## Lo que NO se toca
- `useVisitorTracker.ts` ni cualquier otro archivo cliente (como pediste).
- El esquema de BD (no hace falta).

## Archivos afectados
- `supabase/functions/track-visit/index.ts` — única modificación.

## Validación post-deploy
1. Abrir el sitio desde una pestaña incógnita real (no sandbox).
2. Esperar ~30 s y consultar `page_views` de la última hora.
3. Si vuelve a salir `null`, leer los edge logs — ahora dirán exactamente qué proveedor falló y por qué.