"use server";

import { z } from "zod";
import { mutar, nuevoId } from "@/lib/db";
import { perfilActual } from "@/lib/perfil";
import { campo, ejecutar, ErrorUsuario, leerFormulario, rutaSegura } from "@/lib/acciones-util";
import * as R from "@/lib/reglas";
import { FormaPago, FORMAS_PAGO } from "@/lib/tipos";
import { eurCorto, plural } from "@/lib/formato";
import { hoy } from "@/lib/fechas";

async function soloSecretaria() {
  const p = await perfilActual();
  if (p?.rol !== "secretaria") throw new ErrorUsuario("Solo secretaría puede registrar pagos.");
}

const forma = campo.opcion(Object.keys(FORMAS_PAGO) as [FormaPago, ...FormaPago[]], "Elige cómo ha pagado: Bizum, tarjeta o efectivo.");

/** Secretaría registra un pago (matrícula, bono, práctica, examen o tasa), en uno o dos plazos. */
export async function registrarPago(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/cobros");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const datos = leerFormulario(
      f,
      z.object({
        alumnoId: campo.id("Elige el alumno."),
        tarifaId: campo.id("Elige qué está pagando."),
        plazos: campo.texto(2).transform((v) => (v === "2" ? 2 : 1)),
        forma,
        solicitudId: campo.texto(64),
        // Vacío: la mitad del total.
        primerPlazo: z.preprocess(
          (v) => (v === "" || v === undefined ? null : v),
          campo.decimal("El primer plazo no es un importe válido.", 0.01, 5000).nullable(),
        ),
      }),
    );
    const { alumnoId, tarifaId, plazos, solicitudId } = datos;

    return mutar((db) => {
      const alumno = R.alumnoPorId(db, alumnoId);
      const tarifa = db.tarifas.find((t) => t.id === tarifaId);
      if (!alumno) throw new ErrorUsuario("Elige el alumno.");
      if (!tarifa) throw new ErrorUsuario("Elige qué está pagando.");
      if (plazos === 2 && !tarifa.admitePlazos)
        throw new ErrorUsuario(`«${tarifa.concepto}» no se puede pagar en dos plazos.`);

      const estabaAgotado = R.convocatoriasDe(db, alumno.id).agotadas;
      let primerPlazo = tarifa.precio;
      if (plazos === 2) {
        primerPlazo = datos.primerPlazo !== null ? R.redondear(datos.primerPlazo) : R.redondear(tarifa.precio / 2);
        if (primerPlazo >= tarifa.precio)
          throw new ErrorUsuario("El primer plazo tiene que ser menor que el total.");
      }
      const ahora = new Date().toISOString();
      const cargo = {
        id: nuevoId("cg"),
        alumnoId,
        tipo: "compra" as const,
        tarifaId: tarifa.id,
        tipoTarifa: tarifa.tipo,
        concepto: tarifa.concepto,
        importe: tarifa.precio,
        practicas: tarifa.practicas,
        plazos: plazos as 1 | 2,
        fecha: ahora,
      };
      db.cargos.push(cargo);
      db.pagos.push({ id: nuevoId("pg"), alumnoId, cargoId: cargo.id, importe: primerPlazo, forma: datos.forma, fecha: ahora, plazo: 1 });

      if (tarifa.tipo === "tasa") {
        db.tasas.push({ id: nuevoId("tx"), alumnoId, cargoId: cargo.id, fechaPago: hoy() });
      }
      if (solicitudId) {
        const s = db.solicitudes.find((x) => x.id === solicitudId);
        if (s) s.atendida = true;
      }

      const partes = [`Pago de ${eurCorto(primerPlazo)} registrado: ${tarifa.concepto}`];
      if (tarifa.practicas) partes.push(`+${plural(tarifa.practicas, "práctica")} en el monedero (ahora tiene ${R.saldo(db, alumnoId)})`);
      if (plazos === 2) partes.push(`quedan ${eurCorto(R.redondear(tarifa.precio - primerPlazo))} del 2.º plazo`);
      if (tarifa.tipo === "tasa" && estabaAgotado) partes.push("convocatorias renovadas: vuelve a la cola de examen");
      return `${partes.join(". ")}.`;
    });
  });
}

/** Cobra lo que queda de un cargo (el 2.º plazo o una práctica dada sin saldo). */
export async function cobrarPendiente(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/cobros");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const { cargoId, forma: formaPago } = leerFormulario(f, z.object({ cargoId: campo.id("No se encuentra ese cargo."), forma }));
    return mutar((db) => {
      const cargo = db.cargos.find((c) => c.id === cargoId);
      if (!cargo) throw new ErrorUsuario("No se encuentra ese cargo.");
      const pendiente = R.pendienteDe(db, cargo);
      if (pendiente <= 0) throw new ErrorUsuario("Ese cargo ya está pagado.");
      const yaPagos = db.pagos.filter((p) => p.cargoId === cargo.id).length;
      db.pagos.push({
        id: nuevoId("pg"),
        alumnoId: cargo.alumnoId,
        cargoId,
        importe: pendiente,
        forma: formaPago,
        fecha: new Date().toISOString(),
        plazo: yaPagos > 0 ? 2 : 1,
      });
      if (cargo.tipoTarifa === "tasa" && !db.tasas.some((t) => t.cargoId === cargo.id)) {
        db.tasas.push({ id: nuevoId("tx"), alumnoId: cargo.alumnoId, cargoId, fechaPago: hoy() });
      }
      const a = R.alumnoPorId(db, cargo.alumnoId)!;
      return `${eurCorto(pendiente)} cobrados a ${a.nombre} (${cargo.concepto}).`;
    });
  });
}

/** Marca una solicitud de recarga como atendida sin registrar pago (por ejemplo, si se resolvió por teléfono). */
export async function descartarSolicitud(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/secretaria/cobros");
  await ejecutar(volver, async () => {
    await soloSecretaria();
    const { solicitudId: id } = leerFormulario(f, z.object({ solicitudId: campo.id("No se encuentra la solicitud.") }));
    await mutar((db) => {
      const s = db.solicitudes.find((x) => x.id === id);
      if (s) s.atendida = true;
    });
    return "Solicitud archivada.";
  });
}

/** El alumno pide una recarga desde su portal: le llega a secretaría. */
export async function solicitarRecarga(f: FormData) {
  const volver = rutaSegura(f.get("volver"), "/alumno/pagos");
  await ejecutar(volver, async () => {
    const p = await perfilActual();
    if (p?.rol !== "alumno") throw new ErrorUsuario("Entra como alumno para pedir una recarga.");
    const { tarifaId, mensaje } = leerFormulario(
      f,
      z.object({ tarifaId: campo.id("Elige qué quieres recargar."), mensaje: campo.texto(400) }),
    );
    return mutar((db) => {
      const tarifa = db.tarifas.find((t) => t.id === tarifaId && t.practicas > 0);
      if (!tarifa) throw new ErrorUsuario("Elige qué quieres recargar.");
      const pendiente = db.solicitudes.find((s) => s.alumnoId === p.id && !s.atendida);
      if (pendiente) {
        pendiente.tarifaId = tarifa.id;
        pendiente.mensaje = mensaje || pendiente.mensaje;
        pendiente.fecha = new Date().toISOString();
        return "Ya tenías una solicitud pendiente: la hemos actualizado.";
      }
      db.solicitudes.push({
        id: nuevoId("sr"),
        alumnoId: p.id,
        tarifaId: tarifa.id,
        fecha: new Date().toISOString(),
        atendida: false,
        mensaje,
      });
      return `Solicitud enviada a secretaría: ${tarifa.concepto} (${eurCorto(tarifa.precio)}). Te dirán cómo pagar.`;
    });
  });
}
