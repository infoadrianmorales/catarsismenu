
## Eliminar etiqueta "2x1" del producto Double Cheesy

### Problema
El producto **Double Cheesy** tiene asignado el tag `["2x1"]` que no se utiliza en la aplicacion. Es el unico producto con esta etiqueta.

### Solucion
Ejecutar un `UPDATE` en la base de datos para vaciar el array de tags de este producto:

```sql
UPDATE products SET tags = '{}' WHERE id = 'eed9c9f2-79e4-47ea-9a8f-ddfa8173cae8';
```

### Detalle tecnico
- Se usara una migracion SQL para ejecutar el UPDATE
- Solo afecta a 1 producto (Double Cheesy)
- Los demas productos conservan sus tags validos (Popular, Nuevo, Vegetariano)
- No se requieren cambios en el frontend
