// Lo que hace Secretaría (docs/spec.md, «Secretaría»).

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Perfil } from "@/lib/auth";
import { usarDemoTemporal } from "@/pruebas/demo";
import { enviar } from "@/pruebas/acciones";
import { baseDatos, leer } from "@/lib/db";
import { autenticar } from "@/lib/auth";
import { CONTRASENA_DEMO } from "@/lib/usuarios";
import * as R from "@/lib/reglas";
import { esDomingo, hoy, sumarDias, yaTerminada } from "@/lib/fechas";
import { asignarProfesor, decidirRetroceso, registrarExamenTeorico } from "./alumnos";
import { registrarPago } from "./pagos";
import { confirmarConvocatoria, crearConvocatoria, registrarResultados } from "./examenes";
import { convertirEnAlumno, crearIncidencia, guardarTarifas } from "./gestion";

vi.mock("@/lib/perfil", async () => (await import("@/pruebas/acciones")).perfilSimulado);
vi.mock("next/navigation", async () => (await import("@/pruebas/acciones")).navegacionSimulada);
vi.mock("next/headers", async () => (await import("@/pruebas/acciones")).cabecerasSimuladas);

const SECRETARIA: Perfil = { rol: "secretaria" };

beforeEach(() => usarDemoTemporal());

describe("Examen teórico y cola de prácticas", () => {
  it("sin la tasa de la DGT no se registra el examen; con ella, el apto pasa a la cola de prácticas", async () => {
    // Carmen (a04) es la única del teórico que aún no ha pagado la tasa
    const sinTasa = await enviar(SECRETARIA, registrarExamenTeorico, { alumnoId: "a04", resultado: "apto" });
    expect(sinTasa.error).toBe("Antes registra el pago de la tasa de la DGT.");
    await enviar(SECRETARIA, registrarPago, { alumnoId: "a04", tarifaId: "t_tasa", forma: "tarjeta", plazos: "1" });
    expect((await enviar(SECRETARIA, registrarExamenTeorico, { alumnoId: "a04", resultado: "apto" })).ok).toMatch(/aprueba el teórico/);
    const db = await leer();
    expect(db.alumnos.find((a) => a.id === "a04")?.fase).toBe("espera_practicas");
    expect(R.colaPracticas(db).map((a) => a.id)).toContain("a04");
  });

  it("al asignarle profesor, el alumno de la cola empieza las prácticas", async () => {
    expect((await enviar(SECRETARIA, asignarProfesor, { alumnoId: "a07", profesorId: "p2" })).ok).toMatch(/empieza las prácticas/);
    expect((await leer()).alumnos.find((a) => a.id === "a07")).toMatchObject({ fase: "practicas", profesorId: "p2" });
  });

  it("al cambiar de profesor, las prácticas ya dadas y sin cerrar se quedan con quien las dio", async () => {
    const antes = await leer();
    const dadaSinCerrar = R.practicasSinCerrar(antes, "p1").find((p) => p.alumnoId === "a11")!;
    await enviar(SECRETARIA, asignarProfesor, { alumnoId: "a11", profesorId: "p2" });
    const db = await leer();
    expect(db.practicas.find((p) => p.id === dadaSinCerrar.id)).toMatchObject({ profesorId: "p1", estado: "reservada" });
    const futuras = db.practicas.filter((p) => p.alumnoId === "a11" && p.estado === "reservada" && !yaTerminada(p.fecha, p.inicio));
    expect(futuras.every((p) => p.profesorId === "p2")).toBe(true);
  });
});

describe("Convocatorias de examen práctico", () => {
  it("se confirma la propuesta y, con los resultados, el apto termina y el no apto vuelve al final de la cola", async () => {
    const creada = await enviar(SECRETARIA, crearConvocatoria, { fecha: hoy(), cupo: "2" });
    const id = creada.destino.split("?")[0].split("/").at(-1)!;
    const db = await leer();
    const propuestos = R.proponerPlazas(db, db.convocatorias.find((c) => c.id === id)!).propuestos;
    expect(propuestos).toHaveLength(2);
    expect((await enviar(SECRETARIA, confirmarConvocatoria, { convocatoriaId: id, alumnos: propuestos })).ok).toMatch(/Convocatoria confirmada/);

    const [apto, noApto] = propuestos;
    const r = await enviar(SECRETARIA, registrarResultados, { convocatoriaId: id, [`r_${apto}`]: "apto", [`r_${noApto}`]: "no_apto" });
    expect(r.ok).toMatch(/1 apto y 1 no apto/);
    const tras = await leer();
    expect(tras.alumnos.find((a) => a.id === apto)?.fase).toBe("aprobado");
    const cola = R.colaExamen(tras).enCola.map((a) => a.id);
    expect(cola.at(-1)).toBe(noApto);
  });

  it("no se pueden confirmar más alumnos que el cupo", async () => {
    let fecha = sumarDias(hoy(), 30);
    if (esDomingo(fecha)) fecha = sumarDias(fecha, 1);
    const creada = await enviar(SECRETARIA, crearConvocatoria, { fecha, cupo: "1" });
    const id = creada.destino.split("?")[0].split("/").at(-1)!;
    const r = await enviar(SECRETARIA, confirmarConvocatoria, { convocatoriaId: id, alumnos: ["a18", "a14"] });
    expect(r.error).toBe("Has marcado 2 alumnos y el cupo es de 1.");
  });

  it("si un alumno en verde baja de nivel, Secretaría decide si sale de la cola", async () => {
    // Cristina (a25) estaba en verde y su última práctica tuvo un fallo grave
    expect((await leer()).alumnos.find((a) => a.id === "a25")?.avisoRetroceso).toBe(true);
    await enviar(SECRETARIA, decidirRetroceso, { alumnoId: "a25", decision: "sacar" });
    const a = (await leer()).alumnos.find((x) => x.id === "a25")!;
    expect(a).toMatchObject({ verdeDesde: null, avisoRetroceso: false });
  });
});

describe("Coches, tarifas e interesados", () => {
  it("si el coche de un profesor va al taller, sus prácticas de esos días pasan al coche de reserva", async () => {
    const db = await leer();
    const p = db.practicas.find((x) => x.profesorId === "p1" && x.estado === "reservada" && x.fecha > hoy())!;
    await enviar(SECRETARIA, crearIncidencia, { cocheId: "c1", tipo: "taller", desde: p.fecha, hasta: p.fecha, nota: "Revisión" });
    expect((await leer()).practicas.find((x) => x.id === p.id)?.cocheId).toBe("c4");
  });

  it("cambia el precio de una tarifa y no admite precios fuera de 0,01–5.000 €", async () => {
    const campos = Object.fromEntries((await leer()).tarifas.flatMap((t) => [[`precio_${t.id}`, String(t.precio)], [`concepto_${t.id}`, t.concepto]]));
    expect((await enviar(SECRETARIA, guardarTarifas, { ...campos, precio_t_suelta: "32,5" })).ok).toMatch(/Tarifas guardadas/);
    expect((await leer()).tarifas.find((t) => t.id === "t_suelta")?.precio).toBe(32.5);
    expect((await enviar(SECRETARIA, guardarTarifas, { ...campos, precio_t_suelta: "0" })).error).toMatch(/no es válido/);
  });

  it("convierte un interesado de la web en alumno, que ya puede entrar en su portal", async () => {
    const r = await enviar(SECRETARIA, convertirEnAlumno, {
      interesadoId: "faro_demo_08",
      nombre: "Samuel",
      apellidos: "Herrero Prieto",
      telefono: "616 559 203",
      dni: "79215634T",
      email: "samuel.herrero@correo.es",
    });
    expect(r.ok).toMatch(/ya es alumno/);
    const db = await leer();
    const interesado = db.interesados.find((i) => i.id === "faro_demo_08")!;
    expect(interesado.estado).toBe("matriculado");
    expect(autenticar(baseDatos(), "samuel.herrero@correo.es", CONTRASENA_DEMO)?.perfil).toEqual({ rol: "alumno", id: interesado.alumnoId });
  });

  it("no admite un DNI con la letra equivocada", async () => {
    const r = await enviar(SECRETARIA, convertirEnAlumno, {
      interesadoId: "faro_demo_08", nombre: "Samuel", apellidos: "Herrero", telefono: "616 559 203", dni: "79215634B", email: "",
    });
    expect(r.error).toBe("El DNI o NIE no es válido: revisa los números y la letra.");
  });
});

describe("Sin permiso", () => {
  it("un alumno no puede hacer nada de esto", async () => {
    const LUCIA: Perfil = { rol: "alumno", id: "a11" };
    expect((await enviar(LUCIA, asignarProfesor, { alumnoId: "a07", profesorId: "p1" })).error).toBe("Solo secretaría.");
    expect((await enviar(LUCIA, crearConvocatoria, { fecha: hoy(), cupo: "2" })).error).toBe("Solo secretaría.");
    expect((await leer()).alumnos.find((a) => a.id === "a07")?.profesorId).toBeNull();
  });
});
