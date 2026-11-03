// Inicio de sesión y sesiones (docs/spec.md, «Quién puede hacer qué» y «Qué datos maneja»).

import { beforeEach, describe, expect, it } from "vitest";
import type { DatabaseSync } from "node:sqlite";
import { usarDemoTemporal } from "@/pruebas/demo";
import { autenticar, cerrarSesion, crearSesion, DURACION_SESION_MS, perfilDeSesion } from "./auth";
import { baseDatos } from "./db";
import { CONTRASENA_DEMO } from "./usuarios";

let bd: DatabaseSync;
beforeEach(() => {
  usarDemoTemporal();
  bd = baseDatos();
});

describe("Inicio de sesión", () => {
  it("cada perfil entra con su correo y la contraseña de prueba", () => {
    expect(autenticar(bd, "secretaria@autoescuelafaro.es", CONTRASENA_DEMO)?.perfil).toEqual({ rol: "secretaria" });
    expect(autenticar(bd, "Ana.Morales@autoescuelafaro.es ", CONTRASENA_DEMO)?.perfil).toEqual({ rol: "profesor", id: "p1" });
    expect(autenticar(bd, "lucia.fernandez@correo.es", CONTRASENA_DEMO)?.perfil).toEqual({ rol: "alumno", id: "a11" });
  });

  it("con una contraseña equivocada o un correo que no existe, no entra", () => {
    expect(autenticar(bd, "secretaria@autoescuelafaro.es", "faro2026!")).toBeNull();
    expect(autenticar(bd, "nadie@autoescuelafaro.es", CONTRASENA_DEMO)).toBeNull();
  });

  it("las contraseñas se guardan cifradas, nunca tal cual", () => {
    const hashes = (bd.prepare("SELECT hash FROM usuarios").all() as { hash: string }[]).map((f) => f.hash);
    expect(hashes.length).toBe(34);
    for (const h of hashes) {
      expect(h.startsWith("scrypt$")).toBe(true);
      expect(h).not.toContain(CONTRASENA_DEMO);
    }
  });
});

describe("Sesiones", () => {
  const entrarComoSecretaria = () => crearSesion(bd, autenticar(bd, "secretaria@autoescuelafaro.es", CONTRASENA_DEMO)!.usuarioId);

  it("la sesión solo vale con el token que se entregó al entrar", () => {
    const token = entrarComoSecretaria();
    expect(perfilDeSesion(bd, token)).toEqual({ rol: "secretaria" });
    // Escribir el perfil a mano en la cookie (como permitía la versión anterior) ya no sirve
    expect(perfilDeSesion(bd, "secretaria")).toBeNull();
    expect(perfilDeSesion(bd, undefined)).toBeNull();
  });

  it("al cerrar sesión, el token deja de valer", () => {
    const token = entrarComoSecretaria();
    cerrarSesion(bd, token);
    expect(perfilDeSesion(bd, token)).toBeNull();
  });

  it("la sesión caduca a los 7 días", () => {
    const token = entrarComoSecretaria();
    expect(perfilDeSesion(bd, token, new Date(Date.now() + DURACION_SESION_MS + 1000))).toBeNull();
  });

  it("en la base de datos solo queda la huella del token, no el token", () => {
    const token = entrarComoSecretaria();
    const ids = (bd.prepare("SELECT id FROM sesiones").all() as { id: string }[]).map((s) => s.id);
    expect(ids).not.toContain(token);
  });
});
