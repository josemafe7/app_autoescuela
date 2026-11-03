"use server";

import { z } from "zod";
import { mutar, nuevoId } from "@/lib/db";
import { perfilActual } from "@/lib/perfil";
import { campo, ejecutar, ErrorUsuario, leerFormulario, rutaSegura } from "@/lib/acciones-util";
import * as R from "@/lib/reglas";
import { BaseDatos, BLOQUES, HORAS_CANCELACION, Practica } from "@/lib/tipos";
import { diasEntre, fechaLarga, hoy, horasHasta, inicioPractica } from "@/lib/fechas";
import { plural } from "@/lib/formato";

function crearPractica(
  db: BaseDatos,
  datos: Pick<Practica, "alumnoId" | "profesorId" | "fecha" | "inicio" | "origen"> & { sinSaldo?: boolean },
): Practica {
  const p: Practica = {
    id: nuevoId("pr"),
    ...datos,
    cocheId: R.cocheDelDia(db, datos.profesorId, datos.fecha).cocheId,
    estado: "reservada",
    confirmada: false,
    sinSaldo: !!datos.sinSaldo,
    creadaEl: new Date().toISOString(),
  };
  db.practicas.push(p);
  return p;
}

/** Al quedar libre una hora con tiempo, se ofrece a la lista de espera de ese profesor. */
function lanzarCazaHuecos(db: BaseDatos, p: Practica): number {
  if (inicioPractica(p.fecha, p.inicio) <= new Date()) return 0;
  const candidatos = R.candidatosHueco(db, p.profesorId, p.fecha, p.inicio, p.alumnoId);
  db.ofertas.push({
    id: nuevoId("of"),
    practicaOrigenId: p.id,
    profesorId: p.profesorId,
    fecha: p.fecha,
    inicio: p.inicio,
    creadaEl: new Date().toISOString(),
    ofrecidaA: candidatos,
    estado: "abierta",
  });
  return candidatos.length;
}

function avisoSaldo(db: BaseDatos, alumnoId: string) {
  const s = R.saldo(db, alumnoId);
  if (s === 1) return " Te queda 1 práctica: pide una recarga para no quedarte sin hueco.";
  if (s === 0) return " Ya no te quedan prácticas en el monedero.";
  return ` Te quedan ${s} prácticas.`;
}

const fecha = campo.fecha("Elige un día válido.");
const hora = campo.opcion(BLOQUES as [string, ...string[]], "Elige una hora válida.");
const practicaId = campo.id("No se encuentra esa práctica.");

// ── Alumno ─────────────────────────────────────────────────────────────

export async function reservarComoAlumno(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/alumno/reservar");
  await ejecutar(volver, async () => {
    const perfil = await perfilActual();
    if (perfil?.rol !== "alumno") throw new ErrorUsuario("Entra como alumno para reservar.");
    const { fecha: dia, inicio } = leerFormulario(f, z.object({ fecha, inicio: hora }));
    return mutar((db) => {
      const fecha = dia;
      const alumno = R.alumnoPorId(db, perfil.id)!;
      const puede = R.puedeReservar(db, alumno);
      if (!puede.puede) throw new ErrorUsuario(puede.motivo!);
      if (!R.diasReservables().includes(fecha)) throw new ErrorUsuario("Solo puedes reservar en los próximos 14 días.");
      const permitidos = R.bloquesPermitidos(db, alumno.profesorId!, fecha);
      if (!permitidos.includes(inicio))
        throw new ErrorUsuario("Esa hora ya no está disponible. Elige otra de las que aparecen.");
      crearPractica(db, { alumnoId: alumno.id, profesorId: alumno.profesorId!, fecha, inicio, origen: "alumno" });
      return {
        mensaje: `Reservada: ${fechaLarga(fecha)} a las ${inicio}.${avisoSaldo(db, alumno.id)}`,
        destino: `/alumno/reservar?fecha=${fecha}`,
      };
    });
  });
}

export async function confirmarPractica(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/alumno");
  await ejecutar(volver, async () => {
    const perfil = await perfilActual();
    if (perfil?.rol !== "alumno" && perfil?.rol !== "secretaria") throw new ErrorUsuario("No puedes confirmar esta práctica.");
    const { practicaId: id } = leerFormulario(f, z.object({ practicaId }));
    return mutar((db) => {
      const p = db.practicas.find((x) => x.id === id);
      if (!p || (perfil.rol === "alumno" && p.alumnoId !== perfil.id)) throw new ErrorUsuario("No se encuentra esa práctica.");
      if (p.estado !== "reservada") throw new ErrorUsuario("Esa práctica ya no está reservada.");
      p.confirmada = true;
      return `Confirmada. Te esperamos el ${fechaLarga(p.fecha)} a las ${p.inicio} en la autoescuela.`;
    });
  });
}

/** Cancelar: con más de 24 h vuelve al monedero y el hueco se ofrece; con menos, se descuenta. */
export async function cancelarPractica(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/alumno/practicas");
  await ejecutar(volver, async () => {
    const perfil = await perfilActual();
    if (!perfil || perfil.rol === "profesor") throw new ErrorUsuario("No puedes cancelar esta práctica.");
    const datos = leerFormulario(f, z.object({ practicaId, devolver: campo.texto(10) }));
    const id = datos.practicaId;
    const devolver = datos.devolver !== "no";
    return mutar((db) => {
      const p = db.practicas.find((x) => x.id === id);
      if (!p || (perfil.rol === "alumno" && p.alumnoId !== perfil.id)) throw new ErrorUsuario("No se encuentra esa práctica.");
      if (p.estado !== "reservada") throw new ErrorUsuario("Esa práctica ya no se puede cancelar.");
      if (inicioPractica(p.fecha, p.inicio) <= new Date()) throw new ErrorUsuario("La práctica ya ha empezado.");
      const horas = horasHasta(p.fecha, p.inicio);
      const aTiempo = perfil.rol === "secretaria" ? devolver : horas > HORAS_CANCELACION;
      p.estado = aTiempo ? "cancelada" : "cancelada_tarde";
      p.canceladaEl = new Date().toISOString();
      if (p.sinSaldo && aTiempo) {
        // Si se anula una práctica dada sin saldo y aún no se ha pagado, se anula también la deuda.
        const cargo = db.cargos.find((c) => c.practicaId === p.id);
        if (cargo && R.pagadoDe(db, cargo) === 0) db.cargos.splice(db.cargos.indexOf(cargo), 1);
      }
      if (!aTiempo) {
        return perfil.rol === "alumno"
          ? `Cancelada con menos de ${HORAS_CANCELACION} horas: la práctica se descuenta de tu monedero.`
          : "Cancelada sin devolver la práctica al monedero.";
      }
      const avisados = lanzarCazaHuecos(db, p);
      const base = perfil.rol === "alumno" ? "Cancelada a tiempo: la práctica vuelve a tu monedero." : "Cancelada y devuelta al monedero.";
      return `${base} El hueco se ofrece ${avisados ? `a ${plural(avisados, "alumno")} de la lista de espera` : "a la lista de espera"}.`;
    });
  });
}

export async function guardarListaEspera(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/alumno/espera");
  await ejecutar(volver, async () => {
    const perfil = await perfilActual();
    if (perfil?.rol !== "alumno") throw new ErrorUsuario("Entra como alumno.");
    const { salir, dias, franjas } = leerFormulario(
      f,
      z.object({
        salir: campo.marcado(),
        dias: campo.lista(campo.entero("Elige días de lunes a sábado.", 1, 6)),
        franjas: campo.lista(campo.opcion(["manana", "tarde"], "Elige mañana o tarde.")),
      }),
    );
    return mutar((db) => {
      const a = R.alumnoPorId(db, perfil.id)!;
      if (salir) {
        a.listaEspera = null;
        return "Has salido de la lista de espera.";
      }
      if (!a.profesorId) throw new ErrorUsuario("Cuando tengas profesor asignado podrás apuntarte.");
      if (!dias.length || !franjas.length) throw new ErrorUsuario("Marca al menos un día y una franja.");
      const nuevo = !a.listaEspera;
      a.listaEspera = { dias, franjas, desde: a.listaEspera?.desde ?? new Date().toISOString() };
      return nuevo
        ? "¡Apuntado! Si alguien cancela en tus días y franjas, te avisaremos aquí al momento."
        : "Disponibilidad actualizada.";
    });
  });
}

export async function aceptarHueco(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/alumno");
  await ejecutar(volver, async () => {
    const perfil = await perfilActual();
    if (perfil?.rol !== "alumno") throw new ErrorUsuario("Entra como alumno.");
    const { ofertaId } = leerFormulario(f, z.object({ ofertaId: campo.id("Ese hueco ya no existe.") }));
    return mutar((db) => {
      const o = db.ofertas.find((x) => x.id === ofertaId);
      const a = R.alumnoPorId(db, perfil.id)!;
      if (!o) throw new ErrorUsuario("Ese hueco ya no existe.");
      const estado = R.estadoOferta(db, o);
      if (estado === "cogida") throw new ErrorUsuario("Vaya, otro alumno ha cogido ese hueco antes. ¡A la próxima!");
      if (estado === "caducada") throw new ErrorUsuario("Ese hueco ya no está disponible.");
      const visible = R.ofertasParaAlumno(db, a).disponibles.some((x) => x.id === o.id);
      if (!visible) throw new ErrorUsuario("Este hueco no está disponible para ti ahora mismo.");
      const p = crearPractica(db, { alumnoId: a.id, profesorId: o.profesorId, fecha: o.fecha, inicio: o.inicio, origen: "caza_huecos" });
      o.estado = "cogida";
      o.cogidaPor = a.id;
      o.cogidaEl = new Date().toISOString();
      o.practicaNuevaId = p.id;
      o.abiertaATodos = estado === "abierta_todos";
      return `¡Es tuya! ${fechaLarga(o.fecha)} a las ${o.inicio}.${avisoSaldo(db, a.id)}`;
    });
  });
}

// ── Secretaría ─────────────────────────────────────────────────────────

/** Secretaría reserva en cualquier hora libre. Sin saldo, solo si lo marca: queda como deuda. */
export async function reservarComoSecretaria(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/agenda");
  await ejecutar(volver, async () => {
    const perfil = await perfilActual();
    if (perfil?.rol !== "secretaria") throw new ErrorUsuario("Solo secretaría.");
    const datos = leerFormulario(
      f,
      z.object({
        alumnoId: campo.id("Elige un alumno."),
        profesorId: campo.id("Elige el profesor."),
        fecha: campo.fecha("Elige una hora válida."),
        inicio: hora,
        sinSaldo: campo.marcado(),
      }),
    );
    const { alumnoId, profesorId, fecha, inicio } = datos;
    const sinSaldoOk = datos.sinSaldo;
    return mutar((db) => {
      const a = R.alumnoPorId(db, alumnoId);
      if (!a) throw new ErrorUsuario("Elige un alumno.");
      if (a.fase !== "practicas") throw new ErrorUsuario(`${a.nombre} no está en la fase de prácticas.`);
      if (!R.profesorPorId(db, profesorId)) throw new ErrorUsuario("Elige el profesor.");
      if (!BLOQUES.includes(inicio) || fecha < hoy()) throw new ErrorUsuario("Elige una hora válida.");
      if (inicioPractica(fecha, inicio) <= new Date()) throw new ErrorUsuario("Esa hora ya ha pasado.");
      if (R.ocupanteDe(db, profesorId, fecha, inicio)) throw new ErrorUsuario("Esa hora ya está ocupada.");
      const solape = db.practicas.find(
        (p) => p.alumnoId === a.id && p.fecha === fecha && p.inicio === inicio && R.ESTADOS_QUE_OCUPAN.includes(p.estado),
      );
      if (solape) throw new ErrorUsuario(`${a.nombre} ya tiene otra práctica a esa hora.`);
      const saldo = R.saldo(db, a.id);
      let sinSaldo = false;
      if (saldo < 1) {
        if (!sinSaldoOk)
          throw new ErrorUsuario(`${a.nombre} no tiene prácticas pagadas. Marca «Asignar sin saldo» si es un caso puntual.`);
        sinSaldo = true;
      }
      const p = crearPractica(db, { alumnoId: a.id, profesorId, fecha, inicio, origen: "secretaria", sinSaldo });
      if (sinSaldo) {
        const t = db.tarifas.find((x) => x.tipo === "suelta")!;
        db.cargos.push({
          id: nuevoId("cg"),
          alumnoId: a.id,
          tipo: "practica_sin_saldo",
          tarifaId: t.id,
          tipoTarifa: "suelta",
          concepto: "Práctica asignada sin saldo",
          importe: t.precio,
          practicas: 1,
          plazos: 1,
          fecha: new Date().toISOString(),
          practicaId: p.id,
        });
      }
      const coche = R.cocheDelDia(db, profesorId, fecha);
      return `Práctica reservada a ${a.nombre}: ${fechaLarga(fecha)}, ${inicio}${sinSaldo ? ". Queda como deuda de 30 €" : ""}${coche.sustitucion ? ". Sale con el coche de reserva" : ""}.`;
    });
  });
}

// ── Profesor o secretaría ──────────────────────────────────────────────

export async function marcarNoPresentado(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/profesor");
  await ejecutar(volver, async () => {
    const perfil = await perfilActual();
    if (!perfil || perfil.rol === "alumno") throw new ErrorUsuario("No tienes permiso.");
    const { practicaId: id } = leerFormulario(f, z.object({ practicaId }));
    return mutar((db) => {
      const p = db.practicas.find((x) => x.id === id);
      if (!p || (perfil.rol === "profesor" && p.profesorId !== perfil.id)) throw new ErrorUsuario("No se encuentra esa práctica.");
      if (p.estado !== "reservada") throw new ErrorUsuario("Esa práctica ya está cerrada.");
      if (inicioPractica(p.fecha, p.inicio) > new Date()) throw new ErrorUsuario("Todavía no ha empezado.");
      p.estado = "no_presentado";
      const a = R.alumnoPorId(db, p.alumnoId)!;
      const dias = diasEntre(p.fecha, hoy());
      return `${a.nombre} no se presentó${dias ? ` (${fechaLarga(p.fecha)})` : ""}: la práctica se descuenta de su monedero.`;
    });
  });
}
