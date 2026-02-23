

## Modificar Best Sellers: Top 8 de los ultimos 15 dias

### Problema actual

La vista `best_sellers_food` suma **todas** las ventas historicas sin limite de tiempo ni limite de resultados. Esto significa que los "mas vendidos" nunca cambian realmente y no reflejan tendencias recientes.

### Solucion

Recrear la vista para:
1. Filtrar solo ordenes de los **ultimos 15 dias** (`o.created_at >= now() - interval '15 days'`)
2. Limitar el resultado a **8 productos** (`LIMIT 8`)

### Cambio en base de datos

Una migracion SQL que ejecuta `CREATE OR REPLACE VIEW` con las dos condiciones nuevas:

```sql
CREATE OR REPLACE VIEW public.best_sellers_food AS
SELECT 
  p.id, p.nombre, p.slug, p.descripcion_corta, p.imagen_url,
  p.precio_usd, p.categoria, p.activo, p.destacado, p.is_orderable,
  p.orden, p.tags,
  COALESCE(sum(oi.quantity), 0) AS total_sold
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id 
  AND o.status <> 'CANCELED'
  AND o.created_at >= now() - interval '15 days'   -- NUEVO: solo ultimos 15 dias
WHERE p.activo = true 
  AND p.categoria NOT IN ('bebidas','postres','acompanantes','cocktails','cocteleria')
GROUP BY p.id
HAVING COALESCE(sum(oi.quantity), 0) > 0           -- NUEVO: solo productos con ventas
ORDER BY total_sold DESC, p.orden
LIMIT 8;                                            -- NUEVO: maximo 8
```

### Cambio en frontend

**Archivo:** `src/hooks/useProducts.ts`

Eliminar el `.slice(0, 4)` en `featuredProducts` (no aplica aqui) y asegurar que `bestSellers` no aplique un slice adicional, ya que la vista ya limita a 8.

No se requieren otros cambios en el frontend; el hook `useProducts` ya consume `best_sellers_food` y el componente `CategorySection` muestra lo que recibe.

### Comportamiento resultante

- Si hay ventas en los ultimos 15 dias: se muestran los 8 productos con mayor volumen
- Si no hay ventas recientes: la seccion Best Seller aparece vacia o se oculta automaticamente (el componente ya maneja este caso)
- La vista se actualiza en tiempo real con cada consulta (no requiere cron)

