"use server";

import { z } from "zod";
import { mutar, nuevoId } from "@/lib/db";
import { perfilActual } from "@/lib/perfil";
import { campo, ejecutar, ErrorUsuario, leerCampo, leerFormulario, rutaSegura } from "@/lib/acciones-util";
import * as R from "@/lib/reglas";
import { BaseDatos, EstadoInteresado, ESTADOS_INTERESADO } from "@/lib/tipos";
import { fechaCorta, hoy } from "@/lib/fechas";
import { comprobarDuplicados, nuevoAlumno, validarDatosAlumno } from "@/lib/altas";
import { plural } from "@/lib/formato";

async function soloSecretaria() {
  const p = await perfilActual();
  if (p?.rol !== "secretaria") throw new ErrorUsuario("Solo secretaría.");
}

const interesadoId = campo.id("No se encuentra el interesado.");

// ── Coches ─────────────────────────────────────────────────────────────

/** Reasigna el coche de las prácticas futuras según las incidencias. */
function recalcularCoches(db: BaseDatos): number {
  let cambiadas = 0;
  for (const p of db.practicas) {
    if (p.estado !== "reservada" || p.fecha < hoy()) continue;
    const coche = R.cocheDelDia(db, p.profesorId, p.fecha).cocheId;
    if (coche !== p.cocheId) {
      p.cocheId = coche;
      cambiadas++;
    }
  }
  return cambiadas;
}

export async function crearIncidencia(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/coches");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const datos = leerFormulario(
      f,
      z.object({
        cocheId: campo.id("Elige el coche."),
        tipo: campo.texto(10).transform((t) => (t === "itv" ? ("itv" as const) : ("taller" as const))),
        desde: campo.fecha("Elige desde qué día."),
        hasta: campo.fechaOpcional("La fecha final no es válida."),
        nota: campo.texto(200),
      }),
    );
    const { cocheId, tipo, desde, nota } = datos;
    const hasta = datos.hasta ?? desde;
    if (hasta < desde) throw new ErrorUsuario("La fecha final no puede ser anterior a la inicial.");
    return mutar((db) => {
      const coche = db.coches.find((c) => c.id === cocheId);
      if (!coche) throw new ErrorUsuario("Elige el coche.");
      db.incidencias.push({ id: nuevoId("inc"), cocheId, tipo, desde, hasta, nota });
      const cambiadas = recalcularCoches(db);
      const solapeReserva =
        !coche.esReserva &&
        db.incidencias.some((i) => i.id !== undefined && i.cocheId !== cocheId && !db.coches.find((c) => c.id === i.cocheId)?.esReserva && i.desde <= hasta && desde <= i.hasta);
      return `${coche.modelo} (${coche.matricula}) parado del ${fechaCorta(desde)} al ${fechaCorta(hasta)}.${cambiadas ? ` ${plural(cambiadas, "práctica")} pasa${cambiadas === 1 ? "" : "n"} al coche de reserva.` : ""}${solapeReserva ? " Atención: otro coche también está parado esos días y solo hay uno de reserva." : ""}`;
    });
  });
}

export async function borrarIncidencia(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/coches");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const { incidenciaId: id } = leerFormulario(f, z.object({ incidenciaId: campo.id("No se encuentra.") }));
    return mutar((db) => {
      const i = db.incidencias.findIndex((x) => x.id === id);
      if (i === -1) throw new ErrorUsuario("No se encuentra.");
      db.incidencias.splice(i, 1);
      const cambiadas = recalcularCoches(db);
      return `Incidencia borrada.${cambiadas ? ` ${plural(cambiadas, "práctica")} vuelve${cambiadas === 1 ? "" : "n"} a su coche habitual.` : ""}`;
    });
  });
}

// ── Tarifas ────────────────────────────────────────────────────────────

export async function guardarTarifas(f: FormData) {
  await ejecutar("/secretaria/tarifas", async () => {
    await soloSecretaria();
    return mutar((db) => {
      for (const t of db.tarifas) {
        const precio = leerCampo(f, `precio_${t.id}`, campo.decimal(`El precio de «${t.concepto}» no es válido.`, 0.01, 5000));
        const concepto = leerCampo(
          f,
          `concepto_${t.id}`,
          campo.texto(80).refine((v) => v.length > 0, "Ningún concepto puede quedar vacío."),
        );
        t.precio = Math.round(precio * 100) / 100;
        t.concepto = concepto;
      }
      return "Tarifas guardadas. Se aplican a los pagos nuevos; los ya registrados no cambian.";
    });
  });
}

// ── Interesados ────────────────────────────────────────────────────────

export async function cambiarEstadoInteresado(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/interesados");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const { interesadoId: id, estado } = leerFormulario(
      f,
      z.object({
        interesadoId,
        estado: campo.opcion(Object.keys(ESTADOS_INTERESADO) as [EstadoInteresado, ...EstadoInteresado[]], "Estado no válido."),
      }),
    );
    return mutar((db) => {
      const i = db.interesados.find((x) => x.id === id);
      if (!i) throw new ErrorUsuario("No se encuentra.");
      if (estado === "matriculado" && !i.alumnoId) throw new ErrorUsuario("Para marcarlo como matriculado, conviértelo en alumno.");
      i.estado = estado;
      return `${i.nombre}: ${ESTADOS_INTERESADO[estado].toLowerCase()}.`;
    });
  });
}

export async function guardarNotasInteresado(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/interesados");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const { interesadoId: id, notas } = leerFormulario(f, z.object({ interesadoId, notas: campo.texto(2000) }));
    return mutar((db) => {
      const i = db.interesados.find((x) => x.id === id);
      if (!i) throw new ErrorUsuario("No se encuentra.");
      i.notas = notas;
      return "Notas guardadas.";
    });
  });
}

export async function convertirEnAlumno(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/interesados");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const { interesadoId: id } = leerFormulario(f, z.object({ interesadoId }));
    const datos = validarDatosAlumno(f);
    return mutar((db) => {
      const i = db.interesados.find((x) => x.id === id);
      if (!i) throw new ErrorUsuario("No se encuentra el interesado.");
      if (i.alumnoId) throw new ErrorUsuario("Ya se convirtió en alumno.");
      comprobarDuplicados(db, datos);
      const resumen = [i.packElegido && `Pack elegido: ${i.packElegido}`, i.modalidadPago && `Pago: ${i.modalidadPago}`, i.notas]
        .filter(Boolean)
        .join(". ");
      const a = nuevoAlumno(db, datos, { interesadoId: i.id, notas: `Vino por la web (${fechaCorta(i.fecha)}). ${resumen}`.trim() });
      i.alumnoId = a.id;
      i.estado = "matriculado";
      return { mensaje: `${a.nombre} ya es alumno. Registra el pago de la matrícula para completar el alta.`, destino: `/secretaria/alumnos/${a.id}` };
    });
  });
}

// ── Ajustes de IA ──────────────────────────────────────────────────────

export async function guardarModeloIA(f: FormData) {
  await ejecutar("/secretaria/ajustes", async () => {
    await soloSecretaria();
    const { modelo } = leerFormulario(
      f,
      z.object({ modelo: campo.texto(120).pipe(z.string().regex(/^~?[\w.-]+\/[\w.:~-]+$/, "Elige un modelo de la lista.")) }),
    );
    await mutar((db) => {
      db.ajustes.modeloIA = modelo;
    });
    return `Modelo elegido: ${modelo}.`;
  });
}
