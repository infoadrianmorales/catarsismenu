

# Plan: Reestructurar Mensaje de WhatsApp

## Resumen

Mover el número de orden para que aparezca inmediatamente después del saludo inicial, mejorando la visibilidad y facilitando el seguimiento del pedido.

---

## Estructura Actual vs Nueva

| Posición | Estructura Actual | Nueva Estructura |
|----------|-------------------|------------------|
| 1 | Saludo (nombre) | Saludo (nombre) |
| 2 | Pedido (items) | **Número de orden** ✨ |
| 3 | Total | Pedido (items) |
| 4 | Entrega | Total |
| 5 | Método de pago | Entrega |
| 6 | Datos del cliente | Método de pago |
| 7 | Número de orden | Datos del cliente |

---

## Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Checkout.tsx` | Reorganizar función `generateWhatsAppMessage` |

---

## Cambio Específico (líneas 296-315)

### Antes
```text
Hola 👋 Soy Juan Pérez. Quiero realizar el siguiente pedido en Catarsis.

*Pedido:*
- 2x Burger Classic — $12.00
...
*Orden:* CAT-0042
```

### Después
```text
Hola 👋 Soy Juan Pérez. Quiero realizar el siguiente pedido en Catarsis.

*Orden:* CAT-0042

*Pedido:*
- 2x Burger Classic — $12.00
...
```

---

## Código Actualizado

```typescript
const generateWhatsAppMessage = (orderNum: string): string => {
  // ... código existente para itemLines, totalStr, entregaSection ...

  const message = `Hola 👋 Soy ${formData.firstName} ${formData.lastName}. Quiero realizar el siguiente pedido en Catarsis.

*Orden:* ${orderNum}

*Pedido:*
${itemLines}

*Total: ${totalStr}*${entregaSection}

*💳 Método de pago preferido:*
Moneda: ${paymentCurrency === 'USD' ? 'Dólares (USD)' : 'Bolívares (VES)'}
Método: ${paymentMethodLabel}

_Por favor envíame los datos para realizar el pago_ 🙏

*Datos del cliente:*
Teléfono: ${normalizePhone(formData.phone)}
Correo: ${formData.email.toLowerCase()}`;

  return message;
};
```

---

## Resultado Visual

```text
Hola 👋 Soy María García. Quiero realizar el siguiente pedido en Catarsis.

*Orden:* CAT-0123

*Pedido:*
- 2x Burger Classic — $12.00
- 1x Pizza Pepperoni — $15.00

*Total: $27.00*

*Entrega: Pickup (Retiro en local) 🏪*

*💳 Método de pago preferido:*
Moneda: Dólares (USD)
Método: Zelle

_Por favor envíame los datos para realizar el pago_ 🙏

*Datos del cliente:*
Teléfono: 04241234567
Correo: maria@email.com
```

---

## Beneficios

- **Identificación rápida**: El número de orden es visible de inmediato al recibir el mensaje
- **Mejor seguimiento**: Facilita buscar y referenciar pedidos en el historial de WhatsApp
- **Profesionalismo**: Estructura más organizada y orientada al negocio

