export const money = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
export const itemKey = (item) => `${item.id}:${item.size}:${item.color}`;
export const total = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export function readLocal(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
export function orderMessage(items, customer) {
  return `NUEVO PEDIDO — NOVA KICKS\n\nCliente: ${customer.name}\nCiudad: ${customer.city}\nBarrio: ${customer.neighborhood}\nDirección: ${customer.address}\n\nProductos solicitados:\n\n${items.map((item, i) => `${i + 1}. ${item.name}\n   Referencia: ${item.reference}\n   Talla: ${item.size}\n   Color: ${item.color}\n   Cantidad: ${item.quantity}\n   Precio: ${money(item.price)} COP\n   Subtotal: ${money(item.price * item.quantity)} COP`).join("\n\n")}\n\nTOTAL DEL PEDIDO: ${money(total(items))} COP\n\nObservaciones: ${customer.notes || "Sin observaciones"}\n\nEnvío y disponibilidad por confirmar con la tienda.`;
}
export const whatsappUrl = (number, message) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
