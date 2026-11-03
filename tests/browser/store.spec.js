import { test, expect } from "@playwright/test";
test("catálogo, filtros y favoritos persistentes", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".product-card")).toHaveCount(24);
  await page.getByLabel("Buscar productos").fill("Air District");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Agregar a favoritos: Air District",
      exact: true,
    })
    .click();
  await page.reload();
  await page
    .getByRole("button", { name: "Favoritos (1)", exact: true })
    .first()
    .click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Ver toda la colección" }).click();
  await page
    .locator(".category-pills")
    .getByRole("button", { name: "Niños", exact: true })
    .click();
  await expect(page.locator(".product-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Filtros", exact: true }).click();
  await page.getByLabel("Talla EU").selectOption("40");
  await expect(page.locator(".product-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await expect(page.locator(".product-card")).toHaveCount(24);
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
test("variantes obligatorias, carrito, formulario y borrado confirmado", async ({
  page,
}) => {
  await page.goto("/?producto=nk-001");
  await page
    .getByRole("button", { name: "Agregar al carrito", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Selecciona una talla");
  await page.getByRole("button", { name: "40", exact: true }).click();
  await page.getByRole("button", { name: "Arena", exact: true }).click();
  await page
    .getByRole("button", { name: "Agregar al carrito", exact: true })
    .click();
  await page.getByLabel("Abrir carrito, 1 productos").click();
  await expect(page.getByRole("dialog")).toContainText("Talla 40 · Arena");
  await page
    .getByRole("button", { name: "Aumentar cantidad de Air District" })
    .click();
  await expect(page.locator(".total")).toContainText("379.800");
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await page.reload();
  await page.getByLabel("Abrir carrito, 2 productos").click();
  await page.getByRole("button", { name: "Continuar con mi pedido" }).click();
  await expect(
    page.getByRole("button", { name: "Enviar pedido por WhatsApp" }),
  ).toBeDisabled();
  await page.getByLabel("Nombre completo").fill("Cliente de ejemplo");
  await page.getByLabel("Ciudad", { exact: true }).fill("Ciudad de ejemplo");
  await page
    .getByRole("button", { name: "Vaciar carrito", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(page.locator(".total")).toContainText("379.800");
  await page
    .getByRole("button", { name: "Vaciar carrito", exact: true })
    .click();
  await page.getByRole("button", { name: "Sí, vaciar carrito" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Tu próximo par te espera",
  );
});
