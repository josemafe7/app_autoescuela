// Alta de alumnos (desde secretaría o al convertir un interesado).

import "server-only";
import { z } from "zod";
import { dniValido, normalizarDni } from "@faro/compartido";
import { nuevoId } from "./db";
import { campo, ErrorUsuario, leerFormulario } from "./acciones-util";
import { Alumno, BaseDatos } from "./tipos";
import { hoy } from "./fechas";
import { correoOcupado } from "./usuarios";

const nombreOApellidos = (max: number) =>
  campo.texto(max).refine((v) => v.length > 0, "Escribe el nombre y los apellidos.");

const esquemaDatosAlumno = z.object({
  nombre: nombreOApellidos(60),
  apellidos: nombreOApellidos(80),
  dni: campo
    .texto(12)
    .transform(normalizarDni)
    .refine((d) => !d || dniValido(d), "El DNI o NIE no es válido: revisa los números y la letra."),
  telefono: campo.texto(20).refine((t) => t.replace(/\D/g, "").length >= 9, "El teléfono necesita al menos 9 cifras."),
  email: campo
    .texto(120)
    .transform((e) => e.toLowerCase())
    .refine((e) => !e || z.email().safeParse(e).success, "El correo electrónico no es válido."),
});

export type DatosAlumno = z.output<typeof esquemaDatosAlumno>;

export function validarDatosAlumno(f: FormData): DatosAlumno {
  return leerFormulario(f, esquemaDatosAlumno);
}

/** Comprueba que el DNI y el correo no son ya de otra persona. */
export function comprobarDuplicados(db: BaseDatos, datos: DatosAlumno, alumnoId?: string) {
  if (datos.dni && db.alumnos.some((a) => a.id !== alumnoId && a.dni === datos.dni)) {
    throw new ErrorUsuario("Ya hay un alumno con ese DNI.");
  }
  if (correoOcupado(db.alumnos, datos.email, alumnoId)) {
    throw new ErrorUsuario("Ese correo electrónico ya es de otra cuenta.");
  }
}

export function nuevoAlumno(db: BaseDatos, datos: DatosAlumno, extra: Partial<Alumno> = {}): Alumno {
  const a: Alumno = {
    id: nuevoId("a"),
    ...datos,
    fechaMatricula: hoy(),
    fase: "teorico",
    profesorId: null,
    teorico: { ultimoTest: null, numTests: 0, mediaFallos: null, aprobadoEl: null },
    verdeDesde: null,
    avisoRetroceso: false,
    listaEspera: null,
    aprobadoEl: null,
    notas: "",
    ...extra,
  };
  db.alumnos.push(a);
  return a;
}
