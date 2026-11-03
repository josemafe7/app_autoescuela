import { beforeEach, describe, expect, it } from "vitest";
import { apuntar, estaBloqueado, ipDe, reiniciarLimites, superaLimite, vieneDeOtraWeb } from "./peticiones";

beforeEach(() => reiniciarLimites());

describe("Límite de peticiones", () => {
  it("deja pasar hasta el máximo y bloquea la siguiente", () => {
    const t = 1_000_000;
    expect([1, 2, 3].map(() => superaLimite("chat:1.2.3.4", 3, 60_000, t))).toEqual([false, false, false]);
    expect(superaLimite("chat:1.2.3.4", 3, 60_000, t)).toBe(true);
  });

  it("vuelve a dejar pasar cuando termina la ventana de tiempo", () => {
    const t = 1_000_000;
    for (let i = 0; i < 3; i++) superaLimite("chat:ip", 3, 60_000, t);
    expect(superaLimite("chat:ip", 3, 60_000, t + 60_001)).toBe(false);
  });

  it("cada IP tiene su propio contador", () => {
    for (let i = 0; i < 3; i++) superaLimite("chat:a", 3, 60_000);
    expect(superaLimite("chat:b", 3, 60_000)).toBe(false);
  });
});

describe("Intentos fallidos", () => {
  it("solo cuenta lo que se apunta: mirar si está bloqueado no gasta intentos", () => {
    for (let i = 0; i < 10; i++) expect(estaBloqueado("acceso:x", 5, 60_000)).toBe(false);
    for (let i = 0; i < 5; i++) apuntar("acceso:x", 60_000);
    expect(estaBloqueado("acceso:x", 5, 60_000)).toBe(true);
  });
});

describe("IP de quien llama", () => {
  it("detrás de un proxy es la última de la lista, la que añade el proxy", () => {
    expect(ipDe(new Headers({ "x-forwarded-for": "1.1.1.1, 203.0.113.9" }))).toBe("203.0.113.9");
    expect(ipDe(new Headers())).toBe("local");
  });
});

describe("Origen de la petición", () => {
  const cabeceras = (h: Record<string, string>) => new Headers(h);

  it("acepta las peticiones de la propia web y las que no dicen de dónde vienen", () => {
    expect(vieneDeOtraWeb(cabeceras({ host: "localhost:3000", origin: "http://localhost:3000" }))).toBe(false);
    expect(vieneDeOtraWeb(cabeceras({ host: "localhost:3000" }))).toBe(false);
  });

  it("rechaza las que salen de otra web", () => {
    expect(vieneDeOtraWeb(cabeceras({ host: "localhost:3000", origin: "https://otra-web.example" }))).toBe(true);
  });
});
