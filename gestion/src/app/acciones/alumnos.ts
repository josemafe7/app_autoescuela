"use server";

import { z } from "zod";
import { mutar, nuevoId } from "@/lib/db";
import { perfilActual } from "@/lib/perfil";
import { campo, ejecutar, ErrorUsuario, leerFormulario, rutaSegura } from "@/lib/acciones-util";
import * as R from "@/lib/reglas";
import { hoy, inicioPractica } from "@/lib/fechas";
import { comprobarDuplicados, nuevoAlumno, validarDatosAlumno as validarDatos } from "@/lib/altas";
import { plural } from "@/lib/formato";

async function soloSecretaria() {
  const p = await perfilActual();
  if (p?.rol !== "secretaria") throw new ErrorUsuario("Solo secretaría.");
}

const alumnoId = campo.id("No se encuentra el alumno.");

export async function crearAlumno(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/alumnos");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const datos = validarDatos(f);
    return mutar((db) => {
      comprobarDuplicados(db, datos);
      const a = nuevoAlumno(db, datos);
      return { mensaje: `${a.nombre} dado de alta. Registra ahora el pago de la matrícula.`, destino: `/secretaria/alumnos/${a.id}` };
    });
  });
}

export async function editarAlumno(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/alumnos");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const { alumnoId: id, notas } = leerFormulario(f, z.object({ alumnoId, notas: campo.texto(2000) }));
    const datos = validarDatos(f);
    return mutar((db) => {
      const a = R.alumnoPorId(db, id);
      if (!a) throw new ErrorUsuario("No se encuentra el alumno.");
      comprobarDuplicados(db, datos, a.id);
      Object.assign(a, datos, { notas });
      return "Datos guardados.";
    });
  });
}

const esquemaTeorico = z.object({
  alumnoId,
  ultimoTest: campo.fechaOpcional("La fecha del último test no es válida."),
  numTests: campo.entero("El número de test no es válido.", 0, 100_000),
  mediaFallos: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    campo.decimal("La media de fallos tiene que estar entre 0 y 30.", 0, 30).nullable(),
  ),
});

export async function actualizarTeorico(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/alumnos");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const { alumnoId: id, ultimoTest, numTests, mediaFallos } = leerFormulario(f, esquemaTeorico);
    if (ultimoTest && ultimoTest > hoy()) throw new ErrorUsuario("La fecha del último test no puede ser futura.");
    return mutar((db) => {
      const a = R.alumnoPorId(db, id);
      if (!a) throw new ErrorUsuario("No se encuentra el alumno.");
      a.teorico = { ...a.teorico, ultimoTest, numTests, mediaFallos: mediaFallos === null ? null : Math.round(mediaFallos * 10) / 10 };
      return R.teoricoParado(a) ? "Guardado. Sigue apareciendo como parado en el panel." : "Progreso del teórico guardado.";
    });
  });
}

const esquemaExamenTeorico = z.object({
  alumnoId,
  fecha: campo.fechaOpcional("La fecha del examen no es válida."),
  resultado: campo.texto(10).transform((r) => (r === "apto" ? "apto" : "no_apto")),
});

export async function registrarExamenTeorico(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/alumnos");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const datos = leerFormulario(f, esquemaExamenTeorico);
    const fecha = datos.fecha ?? hoy();
    const { resultado } = datos;
    if (fecha > hoy()) throw new ErrorUsuario("La fecha del examen no puede ser futura.");
    return mutar((db) => {
      const a = R.alumnoPorId(db, datos.alumnoId);
      if (!a) throw new ErrorUsuario("No se encuentra el alumno.");
      if (a.fase !== "teorico") throw new ErrorUsuario("Este alumno ya tiene el teórico aprobado.");
      const conv = R.convocatoriasDe(db, a.id);
      if (!conv.tasa) throw new ErrorUsuario("Antes registra el pago de la tasa de la DGT.");
      if (conv.agotadas) throw new ErrorUsuario("Tiene las convocatorias agotadas: necesita pagar una tasa nueva.");
      db.examenes.push({ id: nuevoId("ex"), alumnoId: a.id, tipo: "teorico", fecha, resultado, tasaId: conv.tasa.id });
      if (resultado === "apto") {
        a.teorico.aprobadoEl = fecha;
        a.fase = "espera_practicas";
        const puesto = R.colaPracticas(db).findIndex((x) => x.id === a.id) + 1;
        return `¡${a.nombre} aprueba el teórico! Entra en la cola para empezar prácticas (puesto ${puesto}).`;
      }
      const tras = R.convocatoriasDe(db, a.id);
      return tras.agotadas
        ? `Suspenso registrado. ${a.nombre} ha agotado las 2 convocatorias: tiene que pagar una tasa nueva de 94,05 €.`
        : `Suspenso registrado. Le queda ${plural(tras.disponibles, "convocatoria")}.`;
    });
  });
}

/** Asigna profesor: si estaba en la cola 1, empieza las prácticas. Si cambia de profesor, sus reservas pasan al nuevo si está libre. */
export async function asignarProfesor(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/cola-practicas");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const datos = leerFormulario(f, z.object({ alumnoId, profesorId: campo.id("Elige un profesor.") }));
    return mutar((db) => {
      const a = R.alumnoPorId(db, datos.alumnoId);
      const prof = R.profesorPorId(db, datos.profesorId);
      if (!a) throw new ErrorUsuario("No se encuentra el alumno.");
      if (!prof) throw new ErrorUsuario("Elige un profesor.");
      if (a.fase === "teorico") throw new ErrorUsuario("Primero tiene que aprobar el teórico.");
      if (a.fase === "aprobado") throw new ErrorUsuario("Este alumno ya tiene el carnet.");
      if (a.profesorId === prof.id) return `${a.nombre} ya está con ${prof.nombre}.`;
      const empieza = a.fase === "espera_practicas";
      const anterior = a.profesorId;
      a.profesorId = prof.id;
      a.fase = "practicas";
      if (empieza) return `${a.nombre} empieza las prácticas con ${prof.nombre}. Ya puede reservar desde su portal si tiene saldo.`;

      let movidas = 0;
      let anuladas = 0;
      // Solo las que aún no han empezado: las ya dadas y sin cerrar se quedan con quien las dio.
      const ahora = new Date();
      const futuras = db.practicas.filter(
        (p) => p.alumnoId === a.id && p.estado === "reservada" && p.profesorId === anterior && inicioPractica(p.fecha, p.inicio) > ahora,
      );
      for (const p of futuras) {
        if (R.ocupanteDe(db, prof.id, p.fecha, p.inicio)) {
          p.estado = "cancelada";
          p.canceladaEl = new Date().toISOString();
          anuladas++;
        } else {
          p.profesorId = prof.id;
          p.cocheId = R.cocheDelDia(db, prof.id, p.fecha).cocheId;
          movidas++;
        }
      }
      const extra = [movidas && `${plural(movidas, "reserva")} pasa${movidas === 1 ? "" : "n"} a ${prof.nombre}`, anuladas && `${plural(anuladas, "reserva")} anulada${anuladas === 1 ? "" : "s"} y devuelta${anuladas === 1 ? "" : "s"} al monedero (${prof.nombre} tenía esa hora ocupada)`]
        .filter(Boolean)
        .join("; ");
      return `${a.nombre} cambia a ${prof.nombre}.${extra ? ` ${extra}.` : ""}`;
    });
  });
}

/** Alumno que estaba en verde y ha bajado: secretaría decide si sigue en la cola. */
export async function decidirRetroceso(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const datos = leerFormulario(f, z.object({ alumnoId, decision: campo.texto(20) }));
    return mutar((db) => {
      const a = R.alumnoPorId(db, datos.alumnoId);
      if (!a) throw new ErrorUsuario("No se encuentra el alumno.");
      a.avisoRetroceso = false;
      if (datos.decision === "sacar") {
        a.verdeDesde = null;
        return `${a.nombre} sale de la cola de examen. Volverá a entrar (al final) cuando su profesor le ponga en verde.`;
      }
      return `${a.nombre} sigue en la cola con su puesto.`;
    });
  });
}
