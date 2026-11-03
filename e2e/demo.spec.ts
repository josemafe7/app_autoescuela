// Recorre la demo como lo haría una persona (docs/spec.md, «Cómo se comprueba que todo funciona»).

import { expect, type Page, test } from "@playwright/test";
import { GESTION, WEB } from "./direcciones";

const CONTRASENA = "Faro2026!";

async function entrar(page: Page, email: string, contrasena = CONTRASENA) {
  await page.goto(GESTION);
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(contrasena);
  await page.getByRole("button", { name: "Entrar" }).click();
  // Espera a que el servidor responda: o entra en su portal o vuelve con un aviso de error.
  await page.waitForURL(/\/(secretaria|profesor|alumno)|aviso=/);
}

test("una solicitud de clase de prueba de la web llega a Secretaría", async ({ page }) => {
  const nombre = `Prueba Web ${Date.now()}`;
  await page.goto(`${WEB}/contacto-y-matricula?tab=prueba`);
  await page.locator("#trial-name").fill(nombre);
  await page.locator("#trial-phone").fill("611 222 333");
  await page.locator("#trial-age").fill("19");
  await page.locator("#free-trial-form").getByRole("button").last().click();
  await expect(page.getByText("¡Solicitud de clase de prueba guardada!")).toBeVisible();

  await entrar(page, "secretaria@autoescuelafaro.es");
  await expect(page).toHaveURL(`${GESTION}/secretaria`);
  await page.goto(`${GESTION}/secretaria/interesados`);
  await expect(page.getByText(nombre)).toBeVisible();
});

test("cada persona entra en su portal y no en el de los demás", async ({ page }) => {
  await entrar(page, "ana.morales@autoescuelafaro.es");
  await expect(page).toHaveURL(`${GESTION}/profesor`);
  await page.goto(`${GESTION}/secretaria/cobros`);
  await expect(page).toHaveURL(`${GESTION}/profesor`);

  await page.context().clearCookies();
  await entrar(page, "lucia.fernandez@correo.es");
  await expect(page).toHaveURL(`${GESTION}/alumno`);
  await page.goto(`${GESTION}/profesor`);
  await expect(page).toHaveURL(`${GESTION}/alumno`);
});

test("con una contraseña equivocada no entra y lo dice", async ({ page }) => {
  await entrar(page, "secretaria@autoescuelafaro.es", "no-es-esta");
  await expect(page.locator('[data-toast="error"]')).toContainText("Correo o contraseña incorrectos");
  // Sigue en la pantalla de acceso (el aviso limpia su marca de la dirección)
  await expect(page).toHaveURL(new RegExp(`^${GESTION}/(\\?.*)?$`));
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
});

test("una cookie inventada no da acceso a Secretaría", async ({ page, context }) => {
  await context.addCookies([
    { name: "faro_perfil", value: "secretaria", url: GESTION },
    { name: "faro_sesion", value: "secretaria", url: GESTION },
  ]);
  await page.goto(`${GESTION}/secretaria`);
  await expect(page).toHaveURL(`${GESTION}/`);
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
});

test("un enlace preparado no puede enseñar un aviso falso", async ({ page }) => {
  await page.goto(`${GESTION}/?error=Tu+cuenta+está+bloqueada&ok=Llama+al+600&aviso=1`);
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  await expect(page.locator("[data-toast]")).toHaveCount(0);
});

test("la lista de interesados no se puede descargar desde la web", async ({ request }) => {
  const r = await request.get(`${WEB}/api/interesados`);
  expect(r.status()).toBe(405);
});

test("el alumno reserva una práctica en una de las horas que le ofrece la app", async ({ page }) => {
  page.on("dialog", (d) => d.accept());
  await entrar(page, "lucia.fernandez@correo.es");
  await page.goto(`${GESTION}/alumno/reservar`);
  const dias = page.getByRole("navigation", { name: "Elige día" }).getByRole("link");
  // El primer día de la lista que tenga horas libres
  const conHueco = dias.filter({ hasText: /libre/ }).first();
  await conHueco.click();
  const hora = page.locator("form button").filter({ hasText: /hasta las/ }).first();
  const texto = (await hora.locator("span").first().textContent())?.trim();
  await hora.click();
  const aviso = page.locator('[data-toast="ok"]');
  await expect(aviso).toContainText("Reservada");
  await expect(aviso).toContainText(`a las ${texto}`);
});
