"use server";

import { z } from "zod";
import { mutar, nuevoId } from "@/lib/db";
import { perfilActual } from "@/lib/perfil";
import { campo, ejecutar, ErrorUsuario, leerCampo, leerFormulario, rutaSegura } from "@/lib/acciones-util";
import * as R from "@/lib/reglas";
import { fechaLarga, hoy } from "@/lib/fechas";
import { plural } from "@/lib/formato";

async function soloSecretaria() {
  const p = await perfilActual();
  if (p?.rol !== "secretaria") throw new ErrorUsuario("Solo secretaría.");
}

const convocatoriaId = campo.id("No se encuentra la convocatoria.");
const cupo = campo.entero("El cupo tiene que estar entre 1 y 20 alumnos.", 1, 20);
// Sin marcar, el alumno se queda sin resultado.
const RESULTADO = z.enum(["apto", "no_apto"], "Resultado no válido.").optional();

export async function crearConvocatoria(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/examenes");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const datos = leerFormulario(f, z.object({ fecha: campo.fecha("Elige la fecha del examen."), cupo }));
    const { fecha } = datos;
    if (fecha < hoy()) throw new ErrorUsuario("La fecha tiene que ser de hoy en adelante.");
    return mutar((db) => {
      const cupo = datos.cupo;
      if (db.convocatorias.some((c) => c.fecha === fecha)) throw new ErrorUsuario("Ya hay una convocatoria ese día.");
      const c = { id: nuevoId("cv"), fecha, cupo, confirmada: false, plazas: [], creadaEl: new Date().toISOString() };
      db.convocatorias.push(c);
      return { mensaje: `Convocatoria del ${fechaLarga(fecha)} creada con ${plural(cupo, "plaza")}. Revisa la propuesta.`, destino: `/secretaria/examenes/${c.id}` };
    });
  });
}

export async function editarCupo(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/examenes");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const { convocatoriaId: id, cupo: nuevoCupo } = leerFormulario(f, z.object({ convocatoriaId, cupo }));
    return mutar((db) => {
      const cupo = nuevoCupo;
      const c = db.convocatorias.find((x) => x.id === id);
      if (!c) throw new ErrorUsuario("No se encuentra la convocatoria.");
      if (c.confirmada) throw new ErrorUsuario("La convocatoria ya está confirmada.");
      c.cupo = cupo;
      return `Cupo cambiado a ${plural(cupo, "plaza")}.`;
    });
  });
}

export async function eliminarConvocatoria(f: FormData) {
  await ejecutar("/secretaria/examenes", async () => {
    await soloSecretaria();
    const { convocatoriaId: id } = leerFormulario(f, z.object({ convocatoriaId }));
    return mutar((db) => {
      const c = db.convocatorias.find((x) => x.id === id);
      if (!c) throw new ErrorUsuario("No se encuentra la convocatoria.");
      if (c.confirmada) throw new ErrorUsuario("No se puede borrar una convocatoria confirmada.");
      db.convocatorias.splice(db.convocatorias.indexOf(c), 1);
      return "Convocatoria borrada.";
    });
  });
}

/** Secretaría confirma qué alumnos van a la convocatoria (normalmente, la propuesta de la app). */
export async function confirmarConvocatoria(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/examenes");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const { convocatoriaId: id, alumnos } = leerFormulario(
      f,
      z.object({ convocatoriaId, alumnos: campo.lista(campo.id("Uno de los alumnos ya no está en la cola.")) }),
    );
    const elegidos = [...new Set(alumnos)];
    return mutar((db) => {
      const c = db.convocatorias.find((x) => x.id === id);
      if (!c) throw new ErrorUsuario("No se encuentra la convocatoria.");
      if (c.confirmada) throw new ErrorUsuario("Esta convocatoria ya estaba confirmada.");
      if (!elegidos.length) throw new ErrorUsuario("Marca al menos un alumno.");
      if (elegidos.length > c.cupo) throw new ErrorUsuario(`Has marcado ${elegidos.length} alumnos y el cupo es de ${c.cupo}.`);
      const enCola = R.colaExamen(db).enCola.map((a) => a.id);
      for (const aid of elegidos) {
        const a = R.alumnoPorId(db, aid);
        if (!a || !enCola.includes(aid)) throw new ErrorUsuario("Uno de los alumnos ya no está en la cola.");
        const req = R.requisitosExamen(db, a, c.fecha);
        if (!R.cumpleRequisitos(req)) {
          const falta = [!req.convocatorias && "convocatorias", !req.teorico && "teórico en vigor", !req.derecho && "derecho de examen pagado"].filter(Boolean).join(", ");
          throw new ErrorUsuario(`${a.nombre} no cumple los requisitos (falta: ${falta}).`);
        }
      }
      c.plazas = elegidos.map((alumnoId) => ({ alumnoId, resultado: null }));
      c.confirmada = true;
      const reserva = R.cocheReserva(db);
      return `Convocatoria confirmada: ${plural(elegidos.length, "alumno")} el ${fechaLarga(c.fecha)}.${reserva ? ` El coche de reserva (${reserva.matricula}) queda para el examen.` : ""}`;
    });
  });
}

/** Resultado del examen práctico: apto termina; no apto gasta una convocatoria y vuelve al final de la cola. */
export async function registrarResultados(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/examenes");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const { convocatoriaId: id } = leerFormulario(f, z.object({ convocatoriaId }));
    return mutar((db) => {
      const c = db.convocatorias.find((x) => x.id === id);
      if (!c || !c.confirmada) throw new ErrorUsuario("No se encuentra la convocatoria.");
      if (c.fecha > hoy()) throw new ErrorUsuario("Los resultados se registran el día del examen o después.");
      let aptos = 0;
      let suspensos = 0;
      const agotados: string[] = [];
      for (const plaza of c.plazas) {
        const r = leerCampo(f, `r_${plaza.alumnoId}`, RESULTADO);
        if (!r) continue;
        if (plaza.resultado) continue;
        const a = R.alumnoPorId(db, plaza.alumnoId)!;
        const conv = R.convocatoriasDe(db, a.id);
        plaza.resultado = r;
        db.examenes.push({ id: nuevoId("ex"), alumnoId: a.id, tipo: "practico", fecha: c.fecha, resultado: r, tasaId: conv.tasa?.id ?? null, convocatoriaId: c.id });
        if (r === "apto") {
          aptos++;
          a.fase = "aprobado";
          a.aprobadoEl = c.fecha;
          a.verdeDesde = null;
          a.avisoRetroceso = false;
          a.listaEspera = null;
          // Las prácticas que tenía reservadas ya no le hacen falta: se anulan y vuelven al monedero.
          for (const p of db.practicas.filter((x) => x.alumnoId === a.id && x.estado === "reservada" && x.fecha > c.fecha)) {
            p.estado = "cancelada";
            p.canceladaEl = new Date().toISOString();
          }
        } else {
          suspensos++;
          a.verdeDesde = hoy(); // vuelve al final de la cola, detrás de quien entró antes de registrar el resultado
          if (R.convocatoriasDe(db, a.id).agotadas) agotados.push(a.nombre);
        }
      }
      if (!aptos && !suspensos) throw new ErrorUsuario("Marca el resultado de al menos un alumno.");
      let mensaje = `Resultados guardados: ${plural(aptos, "apto")} y ${plural(suspensos, "no apto", "no aptos")}.`;
      if (agotados.length) mensaje += ` ${agotados.join(", ")} ha${agotados.length > 1 ? "n" : ""} agotado las convocatorias: tasa nueva de 94,05 €.`;
      return mensaje;
    });
  });
}
