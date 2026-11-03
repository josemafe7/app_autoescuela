// Reglas de la autoescuela (docs/spec.md, «Qué hace»), sobre los datos de demostración.

import { beforeEach, describe, expect, it } from "vitest";
import { crearDatosDemo } from "./seed";
import * as R from "./reglas";
import { BaseDatos, Evaluacion, MANIOBRAS, Niveles } from "./tipos";
import { esDomingo, hoy, inicioPractica, sumarDias } from "./fechas";

let db: BaseDatos;
let dia: string;

beforeEach(() => {
  db = crearDatosDemo();
  // Un día laborable libre, dentro de 10 días, en la agenda de Ana
  dia = sumarDias(hoy(), 10);
  while (esDomingo(dia)) dia = sumarDias(dia, 1);
  db.practicas = db.practicas.filter((p) => !(p.profesorId === "p1" && p.fecha === dia));
});

const reservar = (inicio: string, estado: "reservada" | "cancelada" = "reservada") =>
  db.practicas.push({
    id: `t_${inicio}`, alumnoId: "a11", profesorId: "p1", cocheId: "c1", fecha: dia, inicio, estado,
    confirmada: false, sinSaldo: false, origen: "alumno", creadaEl: new Date().toISOString(),
  });

describe("Horas que puede reservar un alumno (sin huecos muertos)", () => {
  it("con el día vacío, solo la primera hora de cada turno", () => {
    expect(R.bloquesPermitidos(db, "p1", dia)).toEqual(["08:00", "16:00"]);
  });

  it("con una clase, las horas pegadas a ella y el principio y el final del turno", () => {
    reservar("10:15");
    expect(R.bloquesPermitidos(db, "p1", dia)).toEqual(["08:00", "09:30", "11:00", "13:15", "16:00"]);
  });

  it("una práctica cancelada deja la hora libre", () => {
    reservar("10:15", "cancelada");
    expect(R.bloquesPermitidos(db, "p1", dia)).toEqual(["08:00", "16:00"]);
  });

  it("los domingos no hay horas", () => {
    let domingo = hoy();
    while (!esDomingo(domingo)) domingo = sumarDias(domingo, 1);
    expect(R.bloquesPermitidos(db, "p1", domingo)).toEqual([]);
  });
});

describe("Caza-huecos", () => {
  const oferta = () => ({
    id: "o1", practicaOrigenId: "t1", profesorId: "p1", fecha: dia, inicio: "10:15",
    creadaEl: new Date().toISOString(), ofrecidaA: [], estado: "abierta" as const,
  });

  it("hasta 2 horas antes, el hueco solo se ofrece a la lista de espera; después, a todos", () => {
    const inicio = inicioPractica(dia, "10:15").getTime();
    expect(R.estadoOferta(db, oferta(), new Date(inicio - 3 * 3_600_000))).toBe("abierta");
    expect(R.estadoOferta(db, oferta(), new Date(inicio - 90 * 60_000))).toBe("abierta_todos");
  });

  it("cuando la práctica ya ha empezado, el hueco caduca", () => {
    const inicio = inicioPractica(dia, "10:15").getTime();
    expect(R.estadoOferta(db, oferta(), new Date(inicio + 60_000))).toBe("caducada");
  });

  it("solo se avisa a la lista de espera de ese profesor, con saldo y en su franja", () => {
    const manana = R.candidatosHueco(db, "p3", dia, "08:45");
    expect(manana).toContain("a26");
    expect(manana).not.toContain("a17");
    expect(R.candidatosHueco(db, "p3", dia, "16:00")).not.toContain("a26");
  });
});

describe("Semáforo", () => {
  const ev = (niveles: Partial<Niveles>, grave = false): Evaluacion => ({
    id: "e", practicaId: "x", alumnoId: "z", profesorId: "p1", fecha: hoy(), notasDictadas: "", resumen: "",
    mensajeAlumno: "", conIA: false, creadaEl: new Date().toISOString(), falloGrave: grave,
    niveles: Object.fromEntries(MANIOBRAS.map((m) => [m.id, niveles[m.id] ?? "dominada"])) as Niveles,
  });

  it("verde: todo dominado y las 2 últimas prácticas sin fallos graves", () => {
    expect(R.calcularSemaforo([ev({}), ev({})])).toBe("verde");
  });
  it("ámbar: todo dominado pero con un fallo grave en la anterior", () => {
    expect(R.calcularSemaforo([ev({}, true), ev({})])).toBe("ambar");
  });
  it("ámbar: faltan 1 o 2 maniobras", () => {
    expect(R.calcularSemaforo([ev({}), ev({ autovia: "en_progreso", zonas_examen: "por_trabajar" })])).toBe("ambar");
  });
  it("rojo: faltan 3 o más, o no hay evaluaciones", () => {
    expect(R.calcularSemaforo([ev({ autovia: "en_progreso", zonas_examen: "por_trabajar", rotondas: "en_progreso" })])).toBe("rojo");
    expect(R.calcularSemaforo([])).toBe("rojo");
  });
});

describe("Convocatorias y tasa de la DGT", () => {
  it("cada tasa da 2 convocatorias y cada suspenso gasta una", () => {
    expect(R.convocatoriasDe(db, "a16").agotadas).toBe(true);
    expect(R.convocatoriasDe(db, "a19").disponibles).toBe(1);
    expect(R.convocatoriasDe(db, "a04").tasa).toBeNull();
  });

  it("la propuesta de examen coge a los primeros de la cola que cumplen los requisitos", () => {
    const futura = db.convocatorias.find((c) => !c.confirmada)!;
    // Sergio no tiene el derecho de examen pagado y Álvaro tiene el teórico caducado
    expect(R.proponerPlazas(db, futura).propuestos).toEqual(["a18", "a14", "a25"]);
  });
});

describe("Monedero y deudas", () => {
  it("una práctica dada sin saldo queda como deuda de 30 €", () => {
    expect(R.totalDeuda(db, "a15")).toBe(30);
  });
  it("el segundo plazo pendiente es deuda", () => {
    expect(R.totalDeuda(db, "a17")).toBe(130);
  });
  it("las prácticas de una compra entran en el monedero con el primer pago", () => {
    const cargo = db.cargos.find((c) => c.alumnoId === "a17")!;
    expect(R.cargoAcredita(db, cargo)).toBe(true);
    expect(R.saldo(db, "a17")).toBe(6);
  });
});

describe("Entrar en la cola de examen", () => {
  const limpias = (alumnoId: string): Evaluacion[] =>
    [1, 2].map((n) => ({
      id: `e${n}`, practicaId: `x${n}`, alumnoId, profesorId: "p1", fecha: hoy(), notasDictadas: "", resumen: "",
      mensajeAlumno: "", conIA: false, creadaEl: new Date(Date.now() + n).toISOString(), falloGrave: false,
      niveles: Object.fromEntries(MANIOBRAS.map((m) => [m.id, "dominada"])) as Niveles,
    }));

  it("al pasar a verde con el teórico aprobado, entra en la cola de examen", () => {
    const lucia = db.alumnos.find((a) => a.id === "a11")!;
    db.evaluaciones.push(...limpias("a11"));
    expect(R.aplicarSemaforo(db, lucia)).toBe("verde");
    expect(lucia.verdeDesde).toBe(hoy());
    expect(R.colaExamen(db).enCola.map((a) => a.id)).toContain("a11");
  });

  it("en verde pero sin el teórico aprobado, no entra", () => {
    const lucia = db.alumnos.find((a) => a.id === "a11")!;
    lucia.teorico.aprobadoEl = null;
    db.evaluaciones.push(...limpias("a11"));
    R.aplicarSemaforo(db, lucia);
    expect(lucia.verdeDesde).toBeNull();
  });
});

describe("Teórico parado", () => {
  it("con 7 días o más sin hacer un test, el alumno aparece como parado", () => {
    const pablo = db.alumnos.find((a) => a.id === "a01")!;
    pablo.teorico.ultimoTest = sumarDias(hoy(), -6);
    expect(R.teoricoParado(pablo)).toBe(false);
    pablo.teorico.ultimoTest = sumarDias(hoy(), -7);
    expect(R.teoricoParado(pablo)).toBe(true);
  });
});
