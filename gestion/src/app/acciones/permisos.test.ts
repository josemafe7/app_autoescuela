// Permisos (docs/spec.md, «Quién puede hacer qué»): cada acción comprueba en el
// servidor quién la hace y si puede tocar ese dato concreto.

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Perfil } from "@/lib/auth";
import { usarDemoTemporal } from "@/pruebas/demo";
import { enviar } from "@/pruebas/acciones";
import { leer } from "@/lib/db";
import * as R from "@/lib/reglas";
import { MANIOBRAS } from "@/lib/tipos";
import { yaTerminada } from "@/lib/fechas";
import { cancelarPractica, confirmarPractica, marcarNoPresentado, reservarComoAlumno } from "./agenda";
import { registrarPago, solicitarRecarga } from "./pagos";
import { guardarEvaluacion } from "./evaluacion";
import { crearAlumno } from "./alumnos";
import { cambiarEstadoInteresado } from "./gestion";

// La sesión, las cookies y redirect() se simulan (ver src/pruebas/acciones.ts).
vi.mock("@/lib/perfil", async () => (await import("@/pruebas/acciones")).perfilSimulado);
vi.mock("next/navigation", async () => (await import("@/pruebas/acciones")).navegacionSimulada);
vi.mock("next/headers", async () => (await import("@/pruebas/acciones")).cabecerasSimuladas);

const SECRETARIA: Perfil = { rol: "secretaria" };
const ANA: Perfil = { rol: "profesor", id: "p1" };
const LUCIA: Perfil = { rol: "alumno", id: "a11" };

beforeEach(() => usarDemoTemporal());

/** Una práctica reservada y futura de otro alumno (no de Lucía). */
async function practicaFuturaDeOtro() {
  const db = await leer();
  return db.practicas.find((p) => p.alumnoId !== "a11" && p.estado === "reservada" && !yaTerminada(p.fecha, p.inicio))!;
}

/** Una práctica ya terminada y sin cerrar del profesor indicado. */
async function practicaSinCerrarDe(profesorId: string) {
  return R.practicasSinCerrar(await leer(), profesorId)[0];
}

function camposEvaluacion(practicaId: string) {
  return {
    practicaId,
    resumen: "Buena práctica.",
    ...Object.fromEntries(MANIOBRAS.map((m) => [`n_${m.id}`, "en_progreso"])),
  };
}

describe("Sin sesión", () => {
  it("no se puede hacer nada", async () => {
    const otra = await practicaFuturaDeOtro();
    expect((await enviar(null, registrarPago, { alumnoId: "a11", tarifaId: "t_suelta", forma: "bizum" })).error).toBeTruthy();
    expect((await enviar(null, confirmarPractica, { practicaId: otra.id })).error).toBeTruthy();
    expect((await enviar(null, cancelarPractica, { practicaId: otra.id })).error).toBeTruthy();
    expect((await enviar(null, solicitarRecarga, { tarifaId: "t_bono10" })).error).toBeTruthy();
    const db = await leer();
    expect(db.practicas.find((p) => p.id === otra.id)).toMatchObject({ estado: "reservada", confirmada: otra.confirmada });
  });
});

describe("Alumno", () => {
  it("reserva una de sus horas permitidas", async () => {
    const db = await leer();
    const dia = R.diasReservables().slice(1).find((d) => R.bloquesPermitidos(db, "p1", d).length > 0)!;
    const hora = R.bloquesPermitidos(db, "p1", dia)[0];
    const r = await enviar(LUCIA, reservarComoAlumno, { fecha: dia, inicio: hora });
    expect(r.ok).toMatch(/^Reservada/);
    expect(R.ocupanteDe(await leer(), "p1", dia, hora)?.alumnoId).toBe("a11");
  });

  it("no puede confirmar ni cancelar la práctica de otro alumno", async () => {
    const otra = await practicaFuturaDeOtro();
    expect((await enviar(LUCIA, confirmarPractica, { practicaId: otra.id })).error).toBe("No se encuentra esa práctica.");
    expect((await enviar(LUCIA, cancelarPractica, { practicaId: otra.id })).error).toBe("No se encuentra esa práctica.");
  });

  it("no puede registrar pagos, evaluar ni tocar lo de Secretaría", async () => {
    const practica = await practicaSinCerrarDe("p1");
    expect((await enviar(LUCIA, registrarPago, { alumnoId: "a11", tarifaId: "t_bono20", forma: "bizum" })).error).toBeTruthy();
    expect((await enviar(LUCIA, guardarEvaluacion, camposEvaluacion(practica.id))).error).toBe("No tienes permiso.");
    expect((await enviar(LUCIA, cambiarEstadoInteresado, { interesadoId: "faro_demo_01", estado: "contactado" })).error).toBe("Solo secretaría.");
    expect(R.saldo(await leer(), "a11")).toBe(7);
  });
});

describe("Profesor", () => {
  it("evalúa sus prácticas", async () => {
    const practica = await practicaSinCerrarDe("p1");
    const r = await enviar(ANA, guardarEvaluacion, camposEvaluacion(practica.id));
    expect(r.ok).toMatch(/guardada/);
    expect((await leer()).practicas.find((p) => p.id === practica.id)?.estado).toBe("realizada");
  });

  it("no puede evaluar ni marcar plantón en la práctica de otro profesor", async () => {
    const deLuis = await practicaSinCerrarDe("p2");
    expect((await enviar(ANA, guardarEvaluacion, camposEvaluacion(deLuis.id))).error).toBe("No se encuentra esa práctica.");
    expect((await enviar(ANA, marcarNoPresentado, { practicaId: deLuis.id })).error).toBe("No se encuentra esa práctica.");
    expect((await leer()).practicas.find((p) => p.id === deLuis.id)?.estado).toBe("reservada");
  });

  it("no puede cancelar prácticas ni registrar pagos", async () => {
    const otra = await practicaFuturaDeOtro();
    expect((await enviar(ANA, cancelarPractica, { practicaId: otra.id })).error).toBeTruthy();
    expect((await enviar(ANA, registrarPago, { alumnoId: "a11", tarifaId: "t_suelta", forma: "bizum" })).error).toBeTruthy();
  });
});

describe("Secretaría", () => {
  it("registra un pago y las prácticas entran en el monedero", async () => {
    const r = await enviar(SECRETARIA, registrarPago, { alumnoId: "a11", tarifaId: "t_bono10", forma: "tarjeta", plazos: "1" });
    expect(r.ok).toMatch(/registrado/);
    expect(R.saldo(await leer(), "a11")).toBe(17);
  });

  it("da de alta a un alumno, pero no con un correo que ya es de otra cuenta", async () => {
    const alta = { nombre: "Nuevo", apellidos: "Alumno Prueba", telefono: "600 111 222", dni: "" };
    expect((await enviar(SECRETARIA, crearAlumno, { ...alta, email: "nuevo.alumno@correo.es" })).ok).toMatch(/dado de alta/);
    expect((await enviar(SECRETARIA, crearAlumno, { ...alta, email: "lucia.fernandez@correo.es" })).error).toBe("Ese correo electrónico ya es de otra cuenta.");
    expect((await enviar(SECRETARIA, crearAlumno, { ...alta, email: "secretaria@autoescuelafaro.es" })).error).toBe("Ese correo electrónico ya es de otra cuenta.");
  });

  it("lo que llega del formulario se valida: un estado inventado no se guarda", async () => {
    const r = await enviar(SECRETARIA, cambiarEstadoInteresado, { interesadoId: "faro_demo_01", estado: "inventado" });
    expect(r.error).toBe("Estado no válido.");
  });
});

describe("Redirecciones", () => {
  it("después de una acción solo se vuelve a pantallas de la propia app", async () => {
    const r = await enviar(SECRETARIA, cambiarEstadoInteresado, {
      volver: "/\\otra-web.example",
      interesadoId: "faro_demo_01",
      estado: "contactado",
    });
    expect(r.destino).toMatch(/^\/secretaria\/interesados\?/);
  });

  it("el aviso no viaja en la dirección: solo una marca para enseñarlo", async () => {
    const r = await enviar(SECRETARIA, cambiarEstadoInteresado, { interesadoId: "faro_demo_01", estado: "contactado" });
    expect(r.ok).toBe("Marta Lozano: contactado.");
    expect(r.destino).not.toContain("Marta");
    expect(r.destino).toMatch(/\?aviso=\w+$/);
  });
});
