// Optional functional check against a server started with a fictional WhatsApp number.
// The outgoing link is intercepted; no WhatsApp request or message is sent.
import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
    : {}),
});
try {
  const page = await browser.newPage();
  await page.goto(
    process.env.NOVA_TEST_URL || "http://127.0.0.1:5174/?producto=nk-001",
    { waitUntil: "networkidle" },
  );
  await page.evaluate(() => {
    window.open = (url) => {
      window.testOrderUrl = url;
      return null;
    };
  });
  await page.getByRole("button", { name: "40", exact: true }).click();
  await page.getByRole("button", { name: "Arena", exact: true }).click();
  await page
    .getByRole("button", { name: "Comprar por WhatsApp", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Enviar pedido por WhatsApp" })
    .click();
  assert.equal(await page.evaluate(() => window.testOrderUrl), undefined);
  for (const [label, value] of [
    ["Nombre completo", "Cliente de prueba"],
    ["Ciudad", "Ciudad de prueba"],
    ["Barrio", "Barrio de prueba"],
    ["Dirección de entrega", "Calle de ejemplo # 1 & 2"],
    ["Observaciones", "Consultar envío"],
  ])
    await page
      .getByLabel(label, { exact: label !== "Observaciones" })
      .fill(value);
  await page
    .getByRole("button", { name: "Enviar pedido por WhatsApp" })
    .click();
  const url = new URL(await page.evaluate(() => window.testOrderUrl));
  assert.equal(url.hostname, "wa.me");
  assert.equal(url.pathname, "/570000000000");
  for (const value of [
    "Cliente de prueba",
    "Ciudad de prueba",
    "Barrio de prueba",
    "Calle de ejemplo # 1 & 2",
    "NK-1001",
    "Talla: 40",
    "Color: Arena",
    "TOTAL DEL PEDIDO",
    "Consultar envío",
  ])
    assert.ok(url.searchParams.get("text").includes(value), value);
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("nova-cart")).length,
    ),
    1,
  );
  console.log(
    "PASS: form validation, complete encoded order, correct destination, cart retained. No message sent.",
  );
} finally {
  await browser.close();
}
