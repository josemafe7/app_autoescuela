// La gestión y la web comparten la misma base de datos (docs/spec.md, «Interesados»).

import { beforeEach, describe, expect, it } from "vitest";
import { guardarInteresado } from "@faro/compartido";
import { usarBDTemporal } from "@faro/compartido/pruebas";
import { usarDemoTemporal } from "@/pruebas/demo";
import { ErrorUsuario } from "./acciones-util";
import { autenticar } from "./auth";
import { baseDatos, leer, mutar, restablecer } from "./db";
import { CONTRASENA_DEMO } from "./usuarios";

describe("Base de datos compartida con la web", () => {
  beforeEach(() => usarDemoTemporal());

  it("un contacto que llega de la web aparece en la lista de interesados de Secretaría", async () => {
    guardarInteresado({ origen: "clase_prueba", nombre: "Laura Gómez", telefono: "611 222 333" });
    const db = await leer();
    expect(db.interesados.find((i) => i.nombre === "Laura Gómez")?.estado).toBe("nuevo");
  });

  it("si un cambio falla a medias, no se guarda nada", async () => {
    await expect(
      mutar((db) => {
        db.alumnos[0].notas = "cambio que no debe quedar";
        throw new ErrorUsuario("No se puede.");
      }),
    ).rejects.toThrow("No se puede.");
    expect((await leer()).alumnos[0].notas).not.toBe("cambio que no debe quedar");
  });

  it("un alumno nuevo puede entrar con su correo; si se lo cambian, entra con el nuevo", async () => {
    await mutar((db) => {
      db.alumnos.push({ ...db.alumnos[0], id: "a_nuevo", email: "nuevo@correo.es", dni: "" });
    });
    expect(autenticar(baseDatos(), "nuevo@correo.es", CONTRASENA_DEMO)?.perfil).toEqual({ rol: "alumno", id: "a_nuevo" });
    await mutar((db) => {
      db.alumnos.find((a) => a.id === "a_nuevo")!.email = "otro@correo.es";
    });
    expect(autenticar(baseDatos(), "nuevo@correo.es", CONTRASENA_DEMO)).toBeNull();
    expect(autenticar(baseDatos(), "otro@correo.es", CONTRASENA_DEMO)?.perfil).toEqual({ rol: "alumno", id: "a_nuevo" });
  });

  it("pnpm seed deja la demo como recién instalada, sin los contactos de la web", async () => {
    guardarInteresado({ origen: "matricula", nombre: "Samuel Prueba", telefono: "611 222 333" });
    await restablecer();
    const db = await leer();
    expect(db.interesados.some((i) => i.nombre === "Samuel Prueba")).toBe(false);
    expect(db.alumnos).toHaveLength(30);
  });
});

describe("Primera vez", () => {
  beforeEach(() => usarBDTemporal());

  it("si la web guarda un contacto antes de que exista la demo, se conserva al cargarla", async () => {
    guardarInteresado({ origen: "clase_prueba", nombre: "Primera Persona", telefono: "611 222 333" });
    const db = await leer();
    expect(db.alumnos).toHaveLength(30);
    expect(db.interesados.some((i) => i.nombre === "Primera Persona")).toBe(true);
  });
});
