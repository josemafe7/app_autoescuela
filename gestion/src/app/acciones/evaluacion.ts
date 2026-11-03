"use server";

import { z } from "zod";
import { mutar, nuevoId } from "@/lib/db";
import { perfilActual } from "@/lib/perfil";
import { campo, ejecutar, ErrorUsuario, leerFormulario, rutaSegura } from "@/lib/acciones-util";
import * as R from "@/lib/reglas";
import { MANIOBRAS, Nivel, NIVELES, Niveles } from "@/lib/tipos";
import { inicioPractica } from "@/lib/fechas";

const NIVELES_VALIDOS = Object.keys(NIVELES) as [Nivel, ...Nivel[]];

const esquemaEvaluacion = z.object({
  practicaId: campo.id("No se encuentra esa práctica."),
  // Un nivel por maniobra: n_rotondas, n_autovia…
  ...Object.fromEntries(MANIOBRAS.map((m) => [`n_${m.id}`, campo.opcion(NIVELES_VALIDOS, `Falta el nivel de «${m.nombre}».`)])),
  falloGrave: campo.marcado(),
  resumen: campo.texto(300).refine((v) => v.length > 0, "Escribe el resumen de una frase para la ficha."),
  mensajeAlumno: campo.texto(1200),
  notas: campo.texto(4000),
  conIA: campo.marcado(),
});

/** El profesor (o secretaría) cierra la práctica: asistió + evaluación revisada. */
export async function guardarEvaluacion(f: FormData) {
  const perfil = await perfilActual();
  const destinoBase = perfil?.rol === "secretaria" ? "/secretaria/agenda" : "/profesor";
  const volver = rutaSegura(f.get("volver"), destinoBase);
  await ejecutar(volver, async () => {
    if (!perfil || perfil.rol === "alumno") throw new ErrorUsuario("No tienes permiso.");
    const datosForm = leerFormulario(f, esquemaEvaluacion) as z.output<typeof esquemaEvaluacion> & Record<string, Nivel>;
    const { practicaId, falloGrave, resumen, mensajeAlumno, conIA } = datosForm;
    const notasDictadas = datosForm.notas;
    const niveles = Object.fromEntries(MANIOBRAS.map((m) => [m.id, datosForm[`n_${m.id}`]])) as Niveles;

    return mutar((db) => {
      const p = db.practicas.find((x) => x.id === practicaId);
      if (!p || (perfil.rol === "profesor" && p.profesorId !== perfil.id)) throw new ErrorUsuario("No se encuentra esa práctica.");
      if (p.estado !== "reservada" && p.estado !== "realizada") throw new ErrorUsuario("Esta práctica no se puede evaluar.");
      if (inicioPractica(p.fecha, p.inicio) > new Date()) throw new ErrorUsuario("La práctica todavía no ha empezado.");
      const alumno = R.alumnoPorId(db, p.alumnoId)!;
      const antes = R.semaforoDe(db, alumno.id);
      const estabaEnCola = !!alumno.verdeDesde;

      const existente = db.evaluaciones.find((e) => e.practicaId === p.id);
      const datos = { niveles, falloGrave, resumen, mensajeAlumno, notasDictadas, conIA };
      if (existente) Object.assign(existente, datos);
      else
        db.evaluaciones.push({
          id: nuevoId("ev"),
          practicaId: p.id,
          alumnoId: alumno.id,
          profesorId: p.profesorId,
          fecha: p.fecha,
          creadaEl: new Date().toISOString(),
          ...datos,
        });
      p.estado = "realizada";
      p.confirmada = true;

      const despues = R.aplicarSemaforo(db, alumno);
      let mensaje = `Práctica de ${alumno.nombre} guardada.`;
      if (despues === "verde" && !estabaEnCola && alumno.verdeDesde) {
        mensaje += ` ¡${alumno.nombre} pasa a verde y entra en la cola de examen (puesto ${R.puestoEnCola(db, alumno.id) ?? "—"})!`;
      } else if (despues === "verde" && !alumno.teorico.aprobadoEl) {
        mensaje += ` Está en verde, pero no entra en la cola hasta aprobar el teórico.`;
      } else if (estabaEnCola && despues !== "verde") {
        mensaje += ` Ha bajado de verde: sigue en la cola y avisamos a secretaría para que decida.`;
      } else if (antes !== despues) {
        mensaje += ` Semáforo: ${{ rojo: "rojo", ambar: "ámbar", verde: "verde" }[despues]}.`;
      }
      return mensaje;
    });
  });
}
