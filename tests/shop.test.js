import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  total,
  orderMessage,
  whatsappUrl,
  itemKey,
} from "../src/utils/shop.js";
const products = JSON.parse(
  readFileSync(new URL("../src/data/products.json", import.meta.url)),
);
test("catálogo: 24 ejemplos válidos con referencias únicas y promociones coherentes", () => {
  assert.equal(products.length, 24);
  assert.equal(new Set(products.map((p) => p.reference)).size, 24);
  for (const p of products) {
    assert.ok(p.demo);
    assert.ok(p.price > 0);
    assert.ok(p.images.length >= 2);
    assert.ok(p.sizes.length);
    assert.ok(p.colors.length);
    assert.ok(["Hombres", "Mujeres", "Niños"].includes(p.category));
    if (p.promotion)
      assert.equal(
        p.promotion,
        `-${Math.round((1 - p.price / p.originalPrice) * 100)}%`,
      );
  }
});
test("pedido: total, variantes y caracteres especiales se conservan en WhatsApp", () => {
  const items = [
    { ...products[0], size: 40, color: "Arena", quantity: 2 },
    { ...products[1], size: 37, color: "Blanco", quantity: 1 },
  ];
  assert.equal(total(items), items[0].price * 2 + items[1].price);
  assert.notEqual(itemKey(items[0]), itemKey({ ...items[0], size: 41 }));
  const message = orderMessage(items, {
    name: "Cliente de prueba",
    city: "Ciudad de ejemplo",
    neighborhood: "Barrio de ejemplo",
    address: "Calle de prueba # 1 & 2",
    notes: "Consultar envío y talla",
  });
  for (const value of [
    "NUEVO PEDIDO — NOVA KICKS",
    "Cliente de prueba",
    "Barrio de ejemplo",
    "Calle de prueba # 1 & 2",
    "NK-1001",
    "Talla: 40",
    "Color: Arena",
    "Cantidad: 2",
    "TOTAL DEL PEDIDO",
    "Consultar envío y talla",
  ])
    assert.ok(message.includes(value), value);
  const url = new URL(whatsappUrl("570000000000", message));
  assert.equal(url.searchParams.get("text"), message);
  assert.equal(url.hostname, "wa.me");
});
