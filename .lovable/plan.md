# Plan

## Qué está pasando
El problema no parece ser la geolocalización de Venezuela en sí. La evidencia apunta a que el navegador **sí intenta llamar** a `track-visit`, pero solo completa el preflight `OPTIONS` y **nunca envía el `POST` real**.

### Evidencia encontrada
- En los logs del backend aparecen llamadas `OPTIONS` a `track-visit`, pero no `POST`.
- Después de que se cerró el insert público en `page_views`, **no han entrado filas nuevas**.
- La función `track-visit` sí funciona cuando se prueba de forma controlada (`/__test_geo` devolvió `Groningen, Netherlands`), o sea que el problema no es que la función esté caída.
- `useVisitorTracker` llama a `setSupabaseSessionHeader()`, que agrega el header personalizado `x-session-id` al cliente global.
- La función responde CORS con una lista fija de headers permitidos, pero **no incluye `x-session-id`**.

## Causa más probable
El navegador hace preflight porque la llamada incluye headers personalizados. Como `track-visit` no devuelve `x-session-id` dentro de `Access-Control-Allow-Headers`, el navegador bloquea la petición real.

En otras palabras:
```text
Browser -> OPTIONS /track-visit   OK
Browser ve que x-session-id no está permitido
Browser bloquea POST /track-visit
No se inserta visita
No hay país ni ciudad
```

## Qué corregiría
1. Ajustar `supabase/functions/track-visit/index.ts` para permitir `x-session-id` en CORS.
2. Hacer el manejo de CORS más robusto devolviendo dinámicamente los headers pedidos por el preflight cuando existan.
3. Desplegar la función actualizada.
4. Validar con logs que ya aparecen `POST` reales a `track-visit`.
5. Confirmar en base de datos que las nuevas filas ya guardan `country` y `city`.

## Detalle técnico
- Archivo a tocar: `supabase/functions/track-visit/index.ts`
- Cambio principal: corregir `Access-Control-Allow-Headers`
- Validación posterior:
  - logs de función con `POST`
  - nuevas filas en `public.page_views`
  - verificación de `country/city` en registros recientes

## Resultado esperado
Una vez aplicado, tus pruebas desde Venezuela deberían empezar a generar registros nuevos en `page_views`; si la IP pública del visitante llega bien al edge runtime, ya deberían resolverse país y ciudad.