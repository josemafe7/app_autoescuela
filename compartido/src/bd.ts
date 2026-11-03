// Conexión con la base de datos compartida: un archivo SQLite (datos/faro.db)
// que leen y escriben la web y la gestión. Usa el SQLite que trae Node.js,
// sin servicios externos ni cuentas.

import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { DatabaseSync, type StatementSync } from "node:sqlite";
import {
  aFila,
  desdeFila,
  ESQUEMA_VERSION,
  SQL_TABLAS_FIJAS,
  sqlCrearTabla,
  sqlGuardar,
  TABLAS,
  type Tabla,
} from "./esquema";

type Global = typeof globalThis & { __faroBD?: { ruta: string; bd: DatabaseSync } };
const g = globalThis as Global;

/** Carpeta raíz del proyecto: la que contiene pnpm-workspace.yaml. */
function raizProyecto(desde = process.cwd()): string {
  let dir = desde;
  while (!fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
    const padre = path.dirname(dir);
    if (padre === dir) return desde;
    dir = padre;
  }
  return dir;
}

/** Dónde está el archivo. FARO_DB permite usar otro (lo hacen las pruebas). */
export function rutaBD(): string {
  const propia = process.env.FARO_DB?.trim();
  return propia ? path.resolve(propia) : path.join(raizProyecto(), "datos", "faro.db");
}

/** Abre la base de datos (una sola conexión por proceso) y crea las tablas si faltan. */
export function abrirBD(): DatabaseSync {
  const ruta = rutaBD();
  if (g.__faroBD?.ruta === ruta) return g.__faroBD.bd;
  const nueva = !fs.existsSync(ruta);
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  const bd = new DatabaseSync(ruta);
  // Si la web y la gestión escriben a la vez, la segunda espera su turno.
  bd.exec("PRAGMA busy_timeout = 5000");
  bd.exec("PRAGMA journal_mode = WAL");
  bd.exec("PRAGMA synchronous = NORMAL");
  bd.exec("PRAGMA foreign_keys = ON");
  // Datos personales: solo los puede leer el usuario del ordenador.
  if (nueva) fs.chmodSync(ruta, 0o600);
  prepararEsquema(bd);
  g.__faroBD = { ruta, bd };
  return bd;
}

export function cerrarBD(): void {
  g.__faroBD?.bd.close();
  g.__faroBD = undefined;
}

function versionEsquema(bd: DatabaseSync): number {
  return Number((bd.prepare("PRAGMA user_version").get() as { user_version: number }).user_version);
}

function prepararEsquema(bd: DatabaseSync) {
  if (versionEsquema(bd) === ESQUEMA_VERSION) return;
  transaccion(bd, () => {
    // Otro proceso puede haberlo preparado mientras esperábamos el turno.
    const version = versionEsquema(bd);
    if (version === ESQUEMA_VERSION) return;
    if (version !== 0) {
      // Esquema antiguo: la demo solo tiene datos inventados, así que se rehace.
      const tablas = bd
        .prepare("SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
        .all() as { name: string }[];
      for (const { name } of tablas) bd.exec(`DROP TABLE IF EXISTS "${name.replace(/"/g, '""')}"`);
    }
    for (const tabla of TABLAS) bd.exec(sqlCrearTabla(tabla));
    for (const sql of SQL_TABLAS_FIJAS) bd.exec(sql);
    bd.exec(`PRAGMA user_version = ${ESQUEMA_VERSION}`);
  });
}

/**
 * Ejecuta la función dentro de una transacción. Con «IMMEDIATE» reserva la
 * escritura desde el principio, así nadie cambia los datos entre lo que se lee
 * y lo que se guarda. Si algo falla, no se guarda nada.
 */
export function transaccion<T>(bd: DatabaseSync, fn: () => T, tipo: "IMMEDIATE" | "DEFERRED" = "IMMEDIATE"): T {
  bd.exec(`BEGIN ${tipo}`);
  try {
    const resultado = fn();
    bd.exec("COMMIT");
    return resultado;
  } catch (e) {
    if (bd.isTransaction) bd.exec("ROLLBACK");
    throw e;
  }
}

const sentencias = new WeakMap<DatabaseSync, Map<string, StatementSync>>();

/** Prepara una sentencia SQL una sola vez por conexión. */
export function preparar(bd: DatabaseSync, sql: string): StatementSync {
  let mapa = sentencias.get(bd);
  if (!mapa) sentencias.set(bd, (mapa = new Map()));
  let s = mapa.get(sql);
  if (!s) mapa.set(sql, (s = bd.prepare(sql)));
  return s;
}

export function leerTabla<T>(bd: DatabaseSync, tabla: Tabla): T[] {
  const filas = preparar(bd, `SELECT * FROM ${tabla.nombre} ORDER BY rowid`).all();
  return filas.map((f) => desdeFila<T>(tabla, f));
}

export function guardarRegistro(bd: DatabaseSync, tabla: Tabla, registro: object): void {
  preparar(bd, sqlGuardar(tabla)).run(...aFila(tabla, registro));
}

export function borrarRegistro(bd: DatabaseSync, tabla: Tabla, id: string): void {
  preparar(bd, `DELETE FROM ${tabla.nombre} WHERE id = ?`).run(id);
}

/** Escribe solo lo que ha cambiado entre dos versiones de una colección. */
export function guardarDiferencias<T extends { id: string }>(
  bd: DatabaseSync,
  tabla: Tabla,
  antes: readonly T[],
  despues: readonly T[],
): number {
  const previos = new Map(antes.map((r) => [r.id, JSON.stringify(aFila(tabla, r))]));
  const siguen = new Set(despues.map((r) => r.id));
  let cambios = 0;
  for (const r of antes) {
    if (!siguen.has(r.id)) {
      borrarRegistro(bd, tabla, r.id);
      cambios++;
    }
  }
  for (const r of despues) {
    if (previos.get(r.id) !== JSON.stringify(aFila(tabla, r))) {
      guardarRegistro(bd, tabla, r);
      cambios++;
    }
  }
  return cambios;
}

export function leerAjustes(bd: DatabaseSync): Record<string, unknown> {
  const filas = preparar(bd, "SELECT clave, valor FROM ajustes").all() as { clave: string; valor: string }[];
  return Object.fromEntries(filas.map((f) => [f.clave, JSON.parse(f.valor)]));
}

export function guardarAjuste(bd: DatabaseSync, clave: string, valor: unknown): void {
  preparar(bd, "INSERT INTO ajustes (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor").run(
    clave,
    JSON.stringify(valor),
  );
}

export function nuevoId(prefijo: string): string {
  return `${prefijo}_${Date.now().toString(36)}${randomBytes(3).toString("hex")}`;
}
