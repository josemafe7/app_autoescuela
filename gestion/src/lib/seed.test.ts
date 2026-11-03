// Los datos de demostración cuadran: saldos esperados y sin dos prácticas a la vez.

import { describe, expect, it } from "vitest";
import { crearDatosDemo } from "./seed";
import * as R from "./reglas";

describe("Datos de demostración", () => {
  const db = crearDatosDemo();

  it("cada alumno tiene en su monedero las prácticas que le tocan", () => {
    const esperados: Record<string, number> = {
      a08: 10, a11: 7, a12: 1, a13: 3, a14: 2, a15: 0, a16: 2, a17: 6, a18: 1, a19: 4, a20: 3,
      a21: 5, a22: 4, a23: 0, a24: 2, a25: 4, a26: 8, a27: 2, a28: 15, a29: 0, a30: 0,
    };
    const saldos = Object.fromEntries(db.alumnos.map((a) => [a.id, R.monedero(db, a.id).disponibles]));
    for (const a of db.alumnos) expect(saldos[a.id], a.id).toBe(esperados[a.id] ?? 0);
  });

  it("ningún profesor tiene dos prácticas a la misma hora", () => {
    const ocupadas = db.practicas
      .filter((p) => R.ESTADOS_QUE_OCUPAN.includes(p.estado))
      .map((p) => `${p.profesorId}|${p.fecha}|${p.inicio}`);
    expect(new Set(ocupadas).size).toBe(ocupadas.length);
  });

  it("siempre hay algo que enseñar: prácticas sin cerrar, una convocatoria por confirmar y alumnos en las colas", () => {
    expect(R.practicasSinCerrar(db).length).toBeGreaterThan(0);
    expect(db.convocatorias.some((c) => !c.confirmada)).toBe(true);
    expect(R.colaExamen(db).enCola.length).toBeGreaterThan(0);
    expect(R.colaPracticas(db).length).toBeGreaterThan(0);
  });

  it("cada alumno tiene un correo distinto (es su usuario para entrar)", () => {
    const correos = db.alumnos.map((a) => a.email);
    expect(new Set(correos).size).toBe(correos.length);
  });
});
