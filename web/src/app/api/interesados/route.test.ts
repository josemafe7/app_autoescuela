// Formularios de «Contacto y matrícula» (docs/spec.md, «Web pública»).

import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { abrirBD, leerTabla, reiniciarLimites, TABLA_INTERESADOS, type Interesado } from "@faro/compartido";
import { usarBDTemporal } from "@faro/compartido/pruebas";
import { POST } from "./route";

beforeEach(() => {
  usarBDTemporal();
  reiniciarLimites();
});

const peticion = (cuerpo: unknown, cabeceras: Record<string, string> = {}) =>
  new NextRequest("http://localhost:3000/api/interesados", {
    method: "POST",
    body: JSON.stringify(cuerpo),
    headers: { "content-type": "application/json", host: "localhost:3000", ...cabeceras },
  });

const clasePrueba = {
  origen: "clase_prueba",
  nombre: "Laura Gómez",
  telefono: "611 222 333",
  edad: 19,
  zona: "teatinos",
  experienciaPrevia: "nunca",
  franjaHoraria: "tarde",
};

const matricula = {
  origen: "matricula",
  nombre: "Alejandro Torres",
  dni: "12345678z",
  email: "alejandro@correo.es",
  telefono: "622 333 444",
  packElegido: "mat_bono20",
  modalidadPago: "dos_plazos",
};

const guardados = () => leerTabla<Interesado>(abrirBD(), TABLA_INTERESADOS);

describe("Formularios de la web", () => {
  it("la clase de prueba se guarda como interesado nuevo, con textos que Secretaría entiende", async () => {
    const r = await POST(peticion(clasePrueba));
    expect(r.status).toBe(200);
    expect(guardados()[0]).toMatchObject({
      origen: "clase_prueba",
      nombre: "Laura Gómez",
      estado: "nuevo",
      zona: "Teatinos / Universidad",
      experienciaPrevia: "Ninguna",
      franjaHoraria: "Tardes (16:30 - 21:00)",
    });
  });

  it("la matrícula se guarda con el DNI en mayúsculas y el pack elegido", async () => {
    expect((await POST(peticion(matricula))).status).toBe(200);
    expect(guardados()[0]).toMatchObject({ dni: "12345678Z", packElegido: "Matrícula + bono de 20", modalidadPago: "Dos plazos" });
  });

  it("rechaza un teléfono que no lo es, con un mensaje en español", async () => {
    const r = await POST(peticion({ ...clasePrueba, telefono: "123" }));
    expect(r.status).toBe(400);
    expect((await r.json()).error).toMatch(/teléfono/);
    expect(guardados()).toHaveLength(0);
  });

  it("rechaza un DNI con formato inválido o con la letra equivocada", async () => {
    expect((await POST(peticion({ ...matricula, dni: "1234" }))).status).toBe(400);
    expect((await POST(peticion({ ...matricula, dni: "12345678A" }))).status).toBe(400);
  });

  it("acepta edades de 17 a 85, las mismas que deja elegir el formulario", async () => {
    expect((await POST(peticion({ ...clasePrueba, edad: 16 }))).status).toBe(400);
    expect((await POST(peticion({ ...clasePrueba, edad: 17 }))).status).toBe(200);
    expect((await POST(peticion({ ...clasePrueba, edad: 86 }))).status).toBe(400);
  });

  it("no deja que el formulario se haga pasar por el asistente ni añada campos", async () => {
    expect((await POST(peticion({ ...clasePrueba, origen: "asistente_ia" }))).status).toBe(400);
    expect((await POST(peticion({ ...clasePrueba, estado: "matriculado" }))).status).toBe(400);
  });

  it("rechaza las peticiones que salen de otra web", async () => {
    expect((await POST(peticion(clasePrueba, { origin: "https://otra-web.example" }))).status).toBe(403);
  });

  it("limita a 10 las solicitudes por hora desde la misma IP", async () => {
    const ip = { "x-forwarded-for": "10.0.0.1" };
    for (let i = 0; i < 10; i++) expect((await POST(peticion(clasePrueba, ip))).status).toBe(200);
    expect((await POST(peticion(clasePrueba, ip))).status).toBe(429);
  });

  it("aunque alguien se invente una IP distinta en cada envío, hay un tope de 100 por hora en total", async () => {
    for (let i = 0; i < 100; i++) {
      expect((await POST(peticion(clasePrueba, { "x-forwarded-for": `10.1.${i}.1` }))).status).toBe(200);
    }
    expect((await POST(peticion(clasePrueba, { "x-forwarded-for": "10.2.0.1" }))).status).toBe(429);
  });
});
