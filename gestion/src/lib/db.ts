// Capa de datos de la gestión sobre la base de datos SQLite que comparte con la web.
// Las pantallas y acciones solo usan leer(), mutar() y restablecer().

import "server-only";
import type { DatabaseSync } from "node:sqlite";
import {
  abrirBD,
  guardarAjuste,
  guardarDiferencias,
  leerAjustes,
  leerTabla,
  TABLA_INTERESADOS,
  TABLAS,
  transaccion,
} from "@faro/compartido";
import { BaseDatos, Interesado, MODELO_IA_POR_DEFECTO } from "./tipos";
import { crearDatosDemo } from "./seed";
import { crearCuentasPersonal, sincronizarCuentasAlumnos } from "./usuarios";

export { nuevoId } from "@faro/compartido";

export const VERSION_DATOS = 1;

type Colecciones = Record<string, { id: string }[]>;
const colecciones = (db: BaseDatos) => db as unknown as Colecciones;

function cargar(bd: DatabaseSync): BaseDatos {
  const ajustes = leerAjustes(bd);
  const db: Record<string, unknown> = {
    version: ajustes.version,
    creadaEl: ajustes.creadaEl,
    ajustes: { modeloIA: typeof ajustes.modeloIA === "string" ? ajustes.modeloIA : MODELO_IA_POR_DEFECTO },
  };
  for (const t of TABLAS) db[t.coleccion] = leerTabla(bd, t);
  return db as unknown as BaseDatos;
}

function guardar(bd: DatabaseSync, antes: BaseDatos | null, despues: BaseDatos) {
  for (const t of TABLAS) {
    guardarDiferencias(bd, t, antes ? colecciones(antes)[t.coleccion] : [], colecciones(despues)[t.coleccion]);
  }
  if (antes?.ajustes.modeloIA !== despues.ajustes.modeloIA) guardarAjuste(bd, "modeloIA", despues.ajustes.modeloIA);
  sincronizarCuentasAlumnos(bd, despues.alumnos);
}

/** Vacía todo y carga los datos de demostración y las cuentas de prueba. */
function sembrar(bd: DatabaseSync, conservar: Interesado[] = []) {
  bd.exec("DELETE FROM sesiones; DELETE FROM usuarios; DELETE FROM ajustes;");
  for (const t of TABLAS) bd.exec(`DELETE FROM ${t.nombre}`);
  const demo = crearDatosDemo();
  const idsDemo = new Set(demo.interesados.map((i) => i.id));
  demo.interesados.push(...conservar.filter((i) => !idsDemo.has(i.id)));
  crearCuentasPersonal(bd);
  guardar(bd, null, demo);
  guardarAjuste(bd, "version", VERSION_DATOS);
  guardarAjuste(bd, "creadaEl", demo.creadaEl);
}

/** La primera vez (o si los datos son de otra versión) se carga la demo. */
function asegurarDatos(bd: DatabaseSync) {
  if (leerAjustes(bd).version === VERSION_DATOS) return;
  transaccion(bd, () => {
    if (leerAjustes(bd).version === VERSION_DATOS) return;
    // Los contactos que la web haya guardado antes se conservan.
    const llegados = leerTabla<Interesado>(bd, TABLA_INTERESADOS).filter((i) => !i.alumnoId);
    sembrar(bd, llegados);
  });
}

/** La base de datos abierta y con los datos de la demo cargados. */
export function baseDatos(): DatabaseSync {
  const bd = abrirBD();
  asegurarDatos(bd);
  return bd;
}

export async function leer(): Promise<BaseDatos> {
  const bd = baseDatos();
  return transaccion(bd, () => cargar(bd), "DEFERRED");
}

/**
 * Cambia los datos de forma segura. La función recibe la base de datos, la
 * modifica y puede devolver un resultado. Si lanza un error, no se guarda nada.
 * Todo ocurre en una transacción: la web no puede escribir entre medias.
 */
export async function mutar<T>(cambio: (db: BaseDatos) => T): Promise<T> {
  const bd = baseDatos();
  return transaccion(bd, () => {
    const antes = cargar(bd);
    const despues = structuredClone(antes);
    const resultado = cambio(despues);
    guardar(bd, antes, despues);
    return resultado;
  });
}

/** Deja la demo como recién instalada (pnpm seed). Borra también los contactos de la web y las sesiones. */
export async function restablecer(): Promise<void> {
  const bd = abrirBD();
  transaccion(bd, () => sembrar(bd));
}
