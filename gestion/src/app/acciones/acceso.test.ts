// Inicio de sesión (docs/spec.md, «Acceso a la gestión»).

import { beforeEach, describe, expect, it, vi } from "vitest";
import { reiniciarLimites } from "@faro/compartido";
import { usarDemoTemporal } from "@/pruebas/demo";
import { cookieDeSesion, enviar, sesion } from "@/pruebas/acciones";
import { CONTRASENA_DEMO } from "@/lib/usuarios";
import { iniciarSesion } from "./perfil";

vi.mock("next/navigation", async () => (await import("@/pruebas/acciones")).navegacionSimulada);
vi.mock("next/headers", async () => (await import("@/pruebas/acciones")).cabecerasSimuladas);

beforeEach(() => {
  usarDemoTemporal();
  reiniciarLimites();
  sesion.ip = "10.0.0.7";
});

const entrar = (email: string, password: string) => enviar(null, iniciarSesion, { email, password });

describe("Acceso a la gestión", () => {
  it("con los datos correctos entra en su portal y se lleva una sesión", async () => {
    const r = await entrar("ana.morales@autoescuelafaro.es", CONTRASENA_DEMO);
    expect(r.destino).toBe("/profesor");
    expect(cookieDeSesion()).toMatch(/^[\w-]{40,}$/);
  });

  it("con datos incorrectos no dice cuál de los dos falla", async () => {
    expect((await entrar("ana.morales@autoescuelafaro.es", "otra")).error).toMatch(/^Correo o contraseña incorrectos/);
    expect((await entrar("nadie@autoescuelafaro.es", CONTRASENA_DEMO)).error).toMatch(/^Correo o contraseña incorrectos/);
  });

  it("tras 5 intentos fallidos con un correo, no deja entrar ni con la contraseña buena", async () => {
    for (let i = 0; i < 5; i++) await entrar("secretaria@autoescuelafaro.es", "mal");
    const r = await entrar("secretaria@autoescuelafaro.es", CONTRASENA_DEMO);
    expect(r.error).toMatch(/Demasiados intentos fallidos/);
  });

  it("entrar bien muchas veces seguidas no bloquea a nadie (al enseñar la demo se cambia de perfil a menudo)", async () => {
    for (let i = 0; i < 25; i++) {
      expect((await entrar("secretaria@autoescuelafaro.es", CONTRASENA_DEMO)).destino).toBe("/secretaria");
    }
  });
});
