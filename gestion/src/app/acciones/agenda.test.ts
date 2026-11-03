// Agenda de prácticas (docs/spec.md, «Alumnos» y «Secretaría»): reservas, cancelaciones,
// plantones, lista de espera y caza-huecos.

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Perfil } from "@/lib/auth";
import { usarDemoTemporal } from "@/pruebas/demo";
import { enviar } from "@/pruebas/acciones";
import { leer, mutar } from "@/lib/db";
import * as R from "@/lib/reglas";
import { BLOQUES, Practica } from "@/lib/tipos";
import { aISO, esDomingo, hoy, inicioPractica, sumarDias } from "@/lib/fechas";
import {
  aceptarHueco,
  cancelarPractica,
  guardarListaEspera,
  marcarNoPresentado,
  reservarComoAlumno,
  reservarComoSecretaria,
} from "./agenda";
import { solicitarRecarga } from "./pagos";

vi.mock("@/lib/perfil", async () => (await import("@/pruebas/acciones")).perfilSimulado);
vi.mock("next/navigation", async () => (await import("@/pruebas/acciones")).navegacionSimulada);
vi.mock("next/headers", async () => (await import("@/pruebas/acciones")).cabecerasSimuladas);

const SECRETARIA: Perfil = { rol: "secretaria" };
const ANA: Perfil = { rol: "profesor", id: "p1" };
const alumno = (id: string): Perfil => ({ rol: "alumno", id });
const LUCIA = alumno("a11"); // con Ana y 7 prácticas en el monedero
const NOELIA = alumno("a23"); // con Luis y sin prácticas
const MARIO = alumno("a07"); // aprobó el teórico y espera profesor
const RUBEN = alumno("a26"); // con Marta y en la lista de espera de mañanas

beforeEach(() => usarDemoTemporal());

const pad = (n: number) => String(n).padStart(2, "0");

/** Mete a mano una práctica reservada que empieza dentro de `horas` horas. */
async function practicaDentroDe(horas: number, alumnoId: string, profesorId: string): Promise<Practica> {
  const t = new Date(Date.now() + horas * 3_600_000);
  const p: Practica = {
    id: `prueba_${horas}`, alumnoId, profesorId, cocheId: "c1", fecha: aISO(t), inicio: `${pad(t.getHours())}:${pad(t.getMinutes())}`,
    estado: "reservada", confirmada: false, sinSaldo: false, origen: "secretaria", creadaEl: new Date().toISOString(),
  };
  await mutar((db) => void db.practicas.push(p));
  return p;
}

/** Primera hora libre de ese profesor desde dentro de `dias` días, por la mañana. */
async function horaLibreDe(profesorId: string, dias: number) {
  const db = await leer();
  for (let d = dias; d < dias + 10; d++) {
    const fecha = sumarDias(hoy(), d);
    if (esDomingo(fecha)) continue;
    const inicio = BLOQUES.find((b) => b < "14:00" && !R.ocupanteDe(db, profesorId, fecha, b));
    if (inicio) return { fecha, inicio };
  }
  throw new Error("Sin horas libres");
}

describe("El alumno reserva", () => {
  it("no puede reservar a más de 14 días vista", async () => {
    let fecha = sumarDias(hoy(), 20);
    if (esDomingo(fecha)) fecha = sumarDias(fecha, 1);
    const r = await enviar(LUCIA, reservarComoAlumno, { fecha, inicio: "08:00" });
    expect(r.error).toBe("Solo puedes reservar en los próximos 14 días.");
  });

  it("sin prácticas en el monedero no puede reservar", async () => {
    const r = await enviar(NOELIA, reservarComoAlumno, { fecha: sumarDias(hoy(), 2), inicio: "08:00" });
    expect(r.error).toBe("No te quedan prácticas pagadas. Solicita una recarga.");
  });

  it("sin profesor asignado no puede reservar", async () => {
    const r = await enviar(MARIO, reservarComoAlumno, { fecha: sumarDias(hoy(), 2), inicio: "08:00" });
    expect(r.error).toMatch(/Aún no tienes profesor asignado/);
  });
});

describe("Cancelaciones", () => {
  it("con más de 24 horas, la práctica vuelve al monedero y el hueco se ofrece a la lista de espera", async () => {
    const p = await practicaDentroDe(30, "a11", "p1");
    const saldo = R.saldo(await leer(), "a11");
    const r = await enviar(LUCIA, cancelarPractica, { practicaId: p.id });
    expect(r.ok).toMatch(/vuelve a tu monedero/);
    const db = await leer();
    expect(db.practicas.find((x) => x.id === p.id)?.estado).toBe("cancelada");
    expect(R.saldo(db, "a11")).toBe(saldo + 1);
    expect(db.ofertas.some((o) => o.practicaOrigenId === p.id)).toBe(true);
  });

  it("con menos de 24 horas, la práctica se descuenta", async () => {
    const p = await practicaDentroDe(5, "a11", "p1");
    const saldo = R.saldo(await leer(), "a11");
    const r = await enviar(LUCIA, cancelarPractica, { practicaId: p.id });
    expect(r.ok).toMatch(/se descuenta de tu monedero/);
    const db = await leer();
    expect(db.practicas.find((x) => x.id === p.id)?.estado).toBe("cancelada_tarde");
    expect(R.saldo(db, "a11")).toBe(saldo);
  });
});

describe("Plantones", () => {
  it("si el alumno no se presenta, la práctica se descuenta", async () => {
    const p = R.practicasSinCerrar(await leer(), "p1")[0];
    const perdidas = R.monedero(await leer(), p.alumnoId).perdidas;
    const r = await enviar(ANA, marcarNoPresentado, { practicaId: p.id });
    expect(r.ok).toMatch(/no se presentó/);
    expect(R.monedero(await leer(), p.alumnoId).perdidas).toBe(perdidas + 1);
  });
});

describe("Lista de espera y caza-huecos", () => {
  it("el alumno se apunta con sus días y franjas; un profesor no puede hacerlo por él", async () => {
    expect((await enviar(LUCIA, guardarListaEspera, { dias: ["1", "3"], franjas: ["tarde"] })).ok).toMatch(/Apuntado/);
    expect((await leer()).alumnos.find((a) => a.id === "a11")?.listaEspera).toMatchObject({ dias: [1, 3], franjas: ["tarde"] });
    expect((await enviar(ANA, guardarListaEspera, { dias: ["1"], franjas: ["tarde"] })).error).toBe("Entra como alumno.");
  });

  it("el hueco que deja una cancelación lo coge quien está en la lista de espera de ese profesor, y nadie más", async () => {
    const { fecha, inicio } = await horaLibreDe("p3", 3);
    const p: Practica = {
      id: "de_sofia", alumnoId: "a27", profesorId: "p3", cocheId: "c3", fecha, inicio, estado: "reservada",
      confirmada: false, sinSaldo: false, origen: "alumno", creadaEl: new Date().toISOString(),
    };
    await mutar((db) => void db.practicas.push(p));
    await enviar(SECRETARIA, cancelarPractica, { practicaId: p.id, devolver: "si" });
    const oferta = (await leer()).ofertas.find((o) => o.practicaOrigenId === p.id)!;
    expect(oferta.ofrecidaA).toContain("a26");

    expect((await enviar(LUCIA, aceptarHueco, { ofertaId: oferta.id })).error).toBe("Este hueco no está disponible para ti ahora mismo.");
    expect((await enviar(RUBEN, aceptarHueco, { ofertaId: oferta.id })).ok).toMatch(/Es tuya/);
    expect(R.ocupanteDe(await leer(), "p3", fecha, inicio)?.alumnoId).toBe("a26");
    expect((await enviar(RUBEN, aceptarHueco, { ofertaId: oferta.id })).error).toMatch(/otro alumno ha cogido ese hueco|ya no está disponible/);
  });
});

describe("Secretaría reserva", () => {
  it("a un alumno sin saldo, solo si marca «Asignar sin saldo», y le queda una deuda de una práctica suelta", async () => {
    const { fecha, inicio } = await horaLibreDe("p2", 2);
    expect(inicioPractica(fecha, inicio) > new Date()).toBe(true);
    const sinMarcar = await enviar(SECRETARIA, reservarComoSecretaria, { alumnoId: "a23", profesorId: "p2", fecha, inicio });
    expect(sinMarcar.error).toMatch(/no tiene prácticas pagadas/);
    const deuda = R.totalDeuda(await leer(), "a23");
    const marcado = await enviar(SECRETARIA, reservarComoSecretaria, { alumnoId: "a23", profesorId: "p2", fecha, inicio, sinSaldo: "1" });
    expect(marcado.ok).toMatch(/Queda como deuda/);
    expect(R.totalDeuda(await leer(), "a23")).toBe(deuda + 30);
  });
});

describe("Recargas", () => {
  it("el alumno pide una recarga a Secretaría; un profesor no puede", async () => {
    expect((await enviar(LUCIA, solicitarRecarga, { tarifaId: "t_bono10", mensaje: "¿Bizum?" })).ok).toMatch(/Solicitud enviada/);
    expect(R.solicitudesPendientes(await leer()).some((s) => s.alumnoId === "a11")).toBe(true);
    expect((await enviar(ANA, solicitarRecarga, { tarifaId: "t_bono10" })).error).toBe("Entra como alumno para pedir una recarga.");
  });
});
