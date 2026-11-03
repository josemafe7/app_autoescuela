import { beforeEach, describe, expect, it } from "vitest";
import { DatabaseSync } from "node:sqlite";
import {
  abrirBD,
  aFila,
  tieneContactoLaConversacion,
  columna,
  desdeFila,
  guardarDiferencias,
  guardarInteresado,
  leerTabla,
  TABLA_INTERESADOS,
  TABLAS,
  transaccion,
  type Interesado,
} from "./index";
import { usarBDTemporal } from "./pruebas/bd-temporal";

let ruta: string;
beforeEach(() => {
  ruta = usarBDTemporal();
});

const tabla = (nombre: string) => TABLAS.find((t) => t.nombre === nombre)!;

describe("Esquema", () => {
  it("convierte los nombres del código en columnas", () => {
    expect(columna("fechaMatricula")).toBe("fecha_matricula");
    expect(columna("conIA")).toBe("con_ia");
    expect(columna("abiertaATodos")).toBe("abierta_a_todos");
  });

  it("guarda y recupera booleanos, JSON, nulos y campos que faltan tal cual", () => {
    const alumnos = tabla("alumnos");
    const alumno = {
      id: "a1", nombre: "Ana", apellidos: "Ruiz", dni: "", telefono: "600000000", email: "", fechaMatricula: "2026-01-01",
      fase: "teorico", profesorId: null, teorico: { ultimoTest: null, numTests: 0, mediaFallos: null, aprobadoEl: null },
      verdeDesde: null, avisoRetroceso: true, listaEspera: null, aprobadoEl: null, notas: "",
    };
    const fila = Object.fromEntries(alumnos.campos.map((c, i) => [columna(c.nombre), aFila(alumnos, alumno)[i]]));
    const vuelta = desdeFila<typeof alumno>(alumnos, fila as never);
    expect(vuelta).toEqual(alumno);
    expect("interesadoId" in vuelta).toBe(false);
  });
});

describe("Base de datos compartida", () => {
  it("crea todas las tablas en un archivo nuevo", () => {
    const bd = abrirBD();
    const tablas = (bd.prepare("SELECT name FROM sqlite_schema WHERE type = 'table'").all() as { name: string }[]).map((t) => t.name);
    for (const t of TABLAS) expect(tablas).toContain(t.nombre);
    expect(tablas).toEqual(expect.arrayContaining(["ajustes", "usuarios", "sesiones"]));
  });

  it("solo escribe lo que ha cambiado y borra lo que ya no está", () => {
    const bd = abrirBD();
    const coches = tabla("coches");
    const antes = [
      { id: "c1", matricula: "1111 AAA", modelo: "Ibiza", esReserva: false },
      { id: "c2", matricula: "2222 BBB", modelo: "Clio", esReserva: false },
    ];
    transaccion(bd, () => guardarDiferencias(bd, coches, [], antes));
    const despues = [{ ...antes[0], esReserva: true }, { id: "c3", matricula: "3333 CCC", modelo: "Polo", esReserva: false }];
    const cambios = transaccion(bd, () => guardarDiferencias(bd, coches, antes, despues));
    expect(cambios).toBe(3);
    expect(leerTabla(bd, coches)).toEqual(despues);
  });

  it("si algo falla a mitad de una transacción, no se guarda nada", () => {
    const bd = abrirBD();
    const coches = tabla("coches");
    expect(() =>
      transaccion(bd, () => {
        guardarDiferencias(bd, coches, [], [{ id: "c1", matricula: "1", modelo: "Ibiza", esReserva: false }]);
        throw new Error("fallo a mitad");
      }),
    ).toThrow("fallo a mitad");
    expect(leerTabla(bd, coches)).toEqual([]);
  });

  it("rechaza una práctica de un alumno que no existe (claves ajenas)", () => {
    const bd = abrirBD();
    expect(() =>
      transaccion(bd, () =>
        guardarDiferencias(bd, tabla("practicas"), [], [
          { id: "p1", alumnoId: "nadie", profesorId: "nadie", cocheId: "nadie", fecha: "2026-01-01", inicio: "08:00", estado: "reservada", confirmada: false, sinSaldo: false, origen: "alumno", creadaEl: "x" },
        ] as never),
      ),
    ).toThrow(/FOREIGN KEY/);
  });
});

describe("Interesados de la web", () => {
  const datosChat = { origen: "asistente_ia" as const, nombre: "Interesado en chat", telefono: "611222333", sessionId: "s1" };

  it("lo que guarda la web lo lee cualquier otra conexión al mismo archivo (la gestión)", () => {
    guardarInteresado({ origen: "clase_prueba", nombre: "Laura Gómez", telefono: "611 222 333" });
    const otraApp = new DatabaseSync(ruta);
    const filas = otraApp.prepare("SELECT nombre, estado FROM interesados").all();
    otraApp.close();
    expect(filas).toEqual([{ nombre: "Laura Gómez", estado: "nuevo" }]);
  });

  it("una misma conversación del asistente actualiza su contacto en vez de duplicarlo", () => {
    guardarInteresado(datosChat);
    guardarInteresado({ ...datosChat, nombre: "Carlos" });
    const lista = leerTabla<Interesado>(abrirBD(), TABLA_INTERESADOS);
    expect(lista).toHaveLength(1);
    expect(lista[0].nombre).toBe("Carlos");
  });

  it("al actualizar el contacto respeta el estado que le ha puesto Secretaría", () => {
    const bd = abrirBD();
    const primero = guardarInteresado(datosChat);
    bd.prepare("UPDATE interesados SET estado = 'contactado' WHERE id = ?").run(primero.id);
    guardarInteresado({ ...datosChat, notas: "Otra pregunta" });
    expect(leerTabla<Interesado>(bd, TABLA_INTERESADOS)[0].estado).toBe("contactado");
  });

  it("al actualizar el contacto no pisa las notas de Secretaría", () => {
    const bd = abrirBD();
    const primero = guardarInteresado({ ...datosChat, notas: "Captado por el asistente" });
    bd.prepare("UPDATE interesados SET notas = 'Llamar el lunes' WHERE id = ?").run(primero.id);
    guardarInteresado({ ...datosChat, notas: "Captado por el asistente" });
    expect(leerTabla<Interesado>(bd, TABLA_INTERESADOS)[0].notas).toBe("Llamar el lunes");
  });

  it("sabe si una conversación ya dejó su contacto", () => {
    expect(tieneContactoLaConversacion("s1")).toBe(false);
    guardarInteresado(datosChat);
    expect(tieneContactoLaConversacion("s1")).toBe(true);
    expect(tieneContactoLaConversacion(undefined)).toBe(false);
  });

  it("el nombre provisional no pisa un nombre real", () => {
    guardarInteresado({ ...datosChat, nombre: "Carlos" });
    guardarInteresado(datosChat);
    expect(leerTabla<Interesado>(abrirBD(), TABLA_INTERESADOS)[0].nombre).toBe("Carlos");
  });
});
