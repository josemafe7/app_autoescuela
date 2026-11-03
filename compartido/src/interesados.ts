// Contactos que llegan desde la web (formularios y asistente). La web los guarda
// aquí y Secretaría los ve en la gestión, porque las dos usan la misma base de datos.

import type { DatabaseSync } from "node:sqlite";
import { abrirBD, guardarRegistro, nuevoId, preparar, transaccion } from "./bd";
import { desdeFila, TABLA_INTERESADOS } from "./esquema";

export type OrigenInteresado = "clase_prueba" | "matricula" | "asistente_ia";
export type EstadoInteresado = "nuevo" | "contactado" | "clase_prueba" | "matriculado";

export interface MensajeChat {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface Interesado {
  id: string;
  fecha: string;
  origen: OrigenInteresado;
  nombre: string;
  telefono: string;
  email?: string;
  dni?: string;
  edad?: number;
  zona?: string;
  experienciaPrevia?: string;
  diaPreferido?: string;
  franjaHoraria?: string;
  packElegido?: string;
  modalidadPago?: string;
  notas?: string;
  conversacion?: MensajeChat[];
  sessionId?: string;
  estado: EstadoInteresado;
  alumnoId?: string;
}

/** Lo que manda la web: el resto (id, fecha y estado) lo pone el servidor. */
export type DatosInteresado = Omit<Interesado, "id" | "fecha" | "estado" | "alumnoId">;

/** Nombre provisional cuando el asistente capta un teléfono sin nombre. */
export const NOMBRE_SIN_IDENTIFICAR = "Interesado en chat";

const sinVacios = <T extends object>(o: T): Partial<T> =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== "")) as Partial<T>;

const SQL_CONTACTO_DE_CONVERSACION =
  "SELECT * FROM interesados WHERE origen = 'asistente_ia' AND session_id = ? ORDER BY rowid DESC LIMIT 1";

/** true si esa conversación del asistente ya dejó un contacto (actualizarlo no cuenta como uno nuevo). */
export function tieneContactoLaConversacion(sessionId: string | undefined, bd: DatabaseSync = abrirBD()): boolean {
  return !!sessionId && !!preparar(bd, SQL_CONTACTO_DE_CONVERSACION).get(sessionId);
}

/**
 * Guarda un contacto nuevo. Si viene del asistente y esa conversación ya dejó
 * un contacto, lo actualiza en vez de duplicarlo, sin tocar lo que ha puesto
 * Secretaría (el estado y sus notas).
 */
export function guardarInteresado(datos: DatosInteresado, bd: DatabaseSync = abrirBD()): Interesado {
  return transaccion(bd, () => {
    const ahora = new Date().toISOString();
    if (datos.origen === "asistente_ia" && datos.sessionId) {
      const fila = preparar(bd, SQL_CONTACTO_DE_CONVERSACION).get(datos.sessionId);
      if (fila) {
        const actual = desdeFila<Interesado>(TABLA_INTERESADOS, fila);
        const actualizado: Interesado = {
          ...actual,
          ...sinVacios(datos),
          nombre: datos.nombre && datos.nombre !== NOMBRE_SIN_IDENTIFICAR ? datos.nombre : actual.nombre,
          telefono: datos.telefono || actual.telefono,
          notas: actual.notas,
          fecha: ahora,
        };
        guardarRegistro(bd, TABLA_INTERESADOS, actualizado);
        return actualizado;
      }
    }
    const nuevo: Interesado = { ...(sinVacios(datos) as DatosInteresado), id: nuevoId("faro"), fecha: ahora, estado: "nuevo" };
    guardarRegistro(bd, TABLA_INTERESADOS, nuevo);
    return nuevo;
  });
}
