

## Recordar datos del cliente en el checkout

### Problema

Cada vez que un usuario regresa al checkout, debe llenar todos sus datos desde cero (nombre, apellido, telefono, email). Esto genera friccion, especialmente para clientes recurrentes.

### Solucion

Guardar los datos de contacto del cliente en `localStorage` despues de completar un pedido exitoso, y pre-llenar el formulario automaticamente en visitas futuras.

### Que se guarda y que no

| Campo | Se guarda | Razon |
|-------|-----------|-------|
| Nombre | Si | Dato estable del cliente |
| Apellido | Si | Dato estable del cliente |
| Telefono | Si | Dato estable del cliente |
| Email | Si | Dato estable del cliente |
| Direccion de entrega | Si | Generalmente es la misma |
| Notas | No | Cambian por pedido |
| Metodo de pago | No | Puede variar |
| URL de Maps | Si | Generalmente es la misma |

### Cambios

**Archivo: `src/pages/Checkout.tsx`**

1. Al montar el componente, leer `localStorage` key `checkout_customer_data` y pre-llenar `formData` con los valores guardados (si existen)
2. Al completar el pedido exitosamente (despues de `clearCart()`), guardar los datos de contacto en `localStorage`
3. Agregar un pequeno indicador visual (texto sutil) cuando se detectan datos guardados, con un boton para limpiarlos si el usuario quiere ingresar datos nuevos

### Flujo del usuario

```text
Primera compra:
1. Usuario llena el formulario manualmente
2. Completa el pedido
3. Sus datos se guardan en localStorage

Segunda compra en adelante:
1. Usuario llega al checkout
2. Ve sus datos ya completados (nombre, apellido, telefono, email, direccion)
3. Solo necesita elegir metodo de pago y agregar notas
4. Si quiere cambiar datos, edita directamente o presiona "Limpiar datos guardados"
```

### Detalle tecnico

- Key en localStorage: `checkout_customer_data`
- Formato: JSON con campos `firstName`, `lastName`, `phone`, `email`, `deliveryAddress`, `deliveryMapsUrl`
- Se usa `useEffect` al montar para leer y un callback en `handleSubmit` para escribir
- Se agrega un enlace discreto "No soy yo / Limpiar datos" que borra localStorage y resetea el form
- No se requieren cambios en la base de datos

