// Esquema de la base de datos compartida (SQLite, un solo archivo).
// Cada tabla guarda una colección de la gestión: los campos sencillos van en su
// columna y las listas u objetos (niveles, plazas, conversación…) como JSON.
// La tabla y la conversión salen de la misma descripción, así no se desajustan.

import type { SQLInputValue, SQLOutputValue } from "node:sqlite";

export type TipoCampo = "texto" | "entero" | "decimal" | "booleano" | "json";

export interface Campo {
  /** Nombre en el código (camelCase). La columna es el mismo nombre en snake_case. */
  nombre: string;
  tipo: TipoCampo;
  /** "nulo": puede valer null. "opcional": puede no estar. Sin indicar: obligatorio. */
  vacio?: "nulo" | "opcional";
  /** Tabla a la que apunta (clave ajena). */
  ref?: string;
}

export interface Tabla {
  nombre: string;
  /** Clave de la colección en la base de datos de la gestión. */
  coleccion: string;
  campos: Campo[];
}

/** Sube cuando cambia el esquema: la base de datos de la demo se vuelve a crear. */
export const ESQUEMA_VERSION = 2;

type Extra = Pick<Campo, "vacio" | "ref">;
const NULO: Extra = { vacio: "nulo" };
const OPCIONAL: Extra = { vacio: "opcional" };
const texto = (nombre: string, extra: Extra = {}): Campo => ({ nombre, tipo: "texto", ...extra });
const entero = (nombre: string, extra: Extra = {}): Campo => ({ nombre, tipo: "entero", ...extra });
const decimal = (nombre: string): Campo => ({ nombre, tipo: "decimal" });
const booleano = (nombre: string, extra: Extra = {}): Campo => ({ nombre, tipo: "booleano", ...extra });
const json = (nombre: string, extra: Extra = {}): Campo => ({ nombre, tipo: "json", ...extra });
const ref = (nombre: string, tabla: string, extra: Extra = {}): Campo => texto(nombre, { ...extra, ref: tabla });

export const TABLAS: Tabla[] = [
  {
    nombre: "coches",
    coleccion: "coches",
    campos: [texto("id"), texto("matricula"), texto("modelo"), booleano("esReserva")],
  },
  {
    nombre: "profesores",
    coleccion: "profesores",
    campos: [texto("id"), texto("nombre"), texto("apellidos"), texto("telefono"), ref("cocheId", "coches")],
  },
  {
    nombre: "incidencias_coche",
    coleccion: "incidencias",
    campos: [texto("id"), ref("cocheId", "coches"), texto("tipo"), texto("desde"), texto("hasta"), texto("nota")],
  },
  {
    nombre: "tarifas",
    coleccion: "tarifas",
    campos: [texto("id"), texto("tipo"), texto("concepto"), decimal("precio"), entero("practicas"), booleano("admitePlazos")],
  },
  {
    nombre: "interesados",
    coleccion: "interesados",
    campos: [
      texto("id"),
      texto("fecha"),
      texto("origen"),
      texto("nombre"),
      texto("telefono"),
      texto("email", OPCIONAL),
      texto("dni", OPCIONAL),
      entero("edad", OPCIONAL),
      texto("zona", OPCIONAL),
      texto("experienciaPrevia", OPCIONAL),
      texto("diaPreferido", OPCIONAL),
      texto("franjaHoraria", OPCIONAL),
      texto("packElegido", OPCIONAL),
      texto("modalidadPago", OPCIONAL),
      texto("notas", OPCIONAL),
      json("conversacion", OPCIONAL),
      texto("sessionId", OPCIONAL),
      texto("estado"),
      ref("alumnoId", "alumnos", OPCIONAL),
    ],
  },
  {
    nombre: "alumnos",
    coleccion: "alumnos",
    campos: [
      texto("id"),
      texto("nombre"),
      texto("apellidos"),
      texto("dni"),
      texto("telefono"),
      texto("email"),
      texto("fechaMatricula"),
      texto("fase"),
      ref("profesorId", "profesores", NULO),
      json("teorico"),
      texto("verdeDesde", NULO),
      booleano("avisoRetroceso"),
      json("listaEspera", NULO),
      texto("aprobadoEl", NULO),
      texto("notas"),
      ref("interesadoId", "interesados", OPCIONAL),
    ],
  },
  {
    nombre: "practicas",
    coleccion: "practicas",
    campos: [
      texto("id"),
      ref("alumnoId", "alumnos"),
      ref("profesorId", "profesores"),
      ref("cocheId", "coches"),
      texto("fecha"),
      texto("inicio"),
      texto("estado"),
      booleano("confirmada"),
      booleano("sinSaldo"),
      texto("origen"),
      texto("creadaEl"),
      texto("canceladaEl", OPCIONAL),
    ],
  },
  {
    nombre: "cargos",
    coleccion: "cargos",
    campos: [
      texto("id"),
      ref("alumnoId", "alumnos"),
      texto("tipo"),
      ref("tarifaId", "tarifas"),
      texto("tipoTarifa"),
      texto("concepto"),
      decimal("importe"),
      entero("practicas"),
      entero("plazos"),
      texto("fecha"),
      ref("practicaId", "practicas", OPCIONAL),
    ],
  },
  {
    nombre: "pagos",
    coleccion: "pagos",
    campos: [
      texto("id"),
      ref("alumnoId", "alumnos"),
      ref("cargoId", "cargos"),
      decimal("importe"),
      texto("forma"),
      texto("fecha"),
      entero("plazo"),
    ],
  },
  {
    nombre: "tasas_dgt",
    coleccion: "tasas",
    campos: [texto("id"), ref("alumnoId", "alumnos"), ref("cargoId", "cargos"), texto("fechaPago")],
  },
  {
    nombre: "convocatorias",
    coleccion: "convocatorias",
    campos: [texto("id"), texto("fecha"), entero("cupo"), booleano("confirmada"), json("plazas"), texto("creadaEl")],
  },
  {
    nombre: "examenes",
    coleccion: "examenes",
    campos: [
      texto("id"),
      ref("alumnoId", "alumnos"),
      texto("tipo"),
      texto("fecha"),
      texto("resultado"),
      ref("tasaId", "tasas_dgt", NULO),
      ref("convocatoriaId", "convocatorias", OPCIONAL),
    ],
  },
  {
    nombre: "evaluaciones",
    coleccion: "evaluaciones",
    campos: [
      texto("id"),
      ref("practicaId", "practicas"),
      ref("alumnoId", "alumnos"),
      ref("profesorId", "profesores"),
      texto("fecha"),
      json("niveles"),
      booleano("falloGrave"),
      texto("notasDictadas"),
      texto("resumen"),
      texto("mensajeAlumno"),
      booleano("conIA"),
      texto("creadaEl"),
    ],
  },
  {
    nombre: "ofertas_hueco",
    coleccion: "ofertas",
    campos: [
      texto("id"),
      ref("practicaOrigenId", "practicas"),
      ref("profesorId", "profesores"),
      texto("fecha"),
      texto("inicio"),
      texto("creadaEl"),
      json("ofrecidaA"),
      texto("estado"),
      ref("cogidaPor", "alumnos", OPCIONAL),
      texto("cogidaEl", OPCIONAL),
      ref("practicaNuevaId", "practicas", OPCIONAL),
      booleano("abiertaATodos", OPCIONAL),
      texto("avisadaEl", OPCIONAL),
      json("rechazadaPor", OPCIONAL),
    ],
  },
  {
    nombre: "solicitudes_recarga",
    coleccion: "solicitudes",
    campos: [
      texto("id"),
      ref("alumnoId", "alumnos"),
      ref("tarifaId", "tarifas"),
      texto("fecha"),
      booleano("atendida"),
      texto("mensaje"),
    ],
  },
];

export const TABLA_INTERESADOS = TABLAS.find((t) => t.nombre === "interesados")!;

/** «fechaMatricula» → «fecha_matricula», «conIA» → «con_ia». */
export function columna(nombre: string): string {
  return nombre
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

const TIPOS_SQL: Record<TipoCampo, string> = {
  texto: "TEXT",
  entero: "INTEGER",
  decimal: "REAL",
  booleano: "INTEGER",
  json: "TEXT",
};

// Los nombres de tablas y columnas salen de este archivo, nunca de lo que escribe
// una persona: los valores siempre van como parámetros (?).
export function definicionColumna(c: Campo): string {
  const col = columna(c.nombre);
  let def = `${col} ${TIPOS_SQL[c.tipo]}`;
  if (c.nombre === "id") def += " NOT NULL PRIMARY KEY";
  else if (!c.vacio) def += " NOT NULL";
  if (c.tipo === "booleano") def += ` CHECK (${col} IN (0, 1))`;
  if (c.tipo === "json") def += ` CHECK (json_valid(${col}))`;
  // Las claves ajenas se comprueban al confirmar cada cambio, no fila a fila.
  if (c.ref) def += ` REFERENCES ${c.ref}(id) DEFERRABLE INITIALLY DEFERRED`;
  return def;
}

export function sqlCrearTabla(tabla: Tabla): string {
  return `CREATE TABLE IF NOT EXISTS ${tabla.nombre} (\n  ${tabla.campos.map(definicionColumna).join(",\n  ")}\n) STRICT`;
}

export const SQL_TABLAS_FIJAS = [
  `CREATE TABLE IF NOT EXISTS ajustes (
  clave TEXT NOT NULL PRIMARY KEY,
  valor TEXT NOT NULL CHECK (json_valid(valor))
) STRICT`,
  `CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT NOT NULL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  hash TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('secretaria', 'profesor', 'alumno')),
  persona_id TEXT
) STRICT`,
  `CREATE TABLE IF NOT EXISTS sesiones (
  id TEXT NOT NULL PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  caduca_el TEXT NOT NULL
) STRICT`,
  "CREATE INDEX IF NOT EXISTS interesados_por_sesion ON interesados (session_id)",
  "CREATE INDEX IF NOT EXISTS sesiones_por_usuario ON sesiones (usuario_id)",
];

/** Convierte un registro del código en los valores de su fila, en el orden de las columnas. */
export function aFila(tabla: Tabla, registro: object): SQLInputValue[] {
  const r = registro as Record<string, unknown>;
  return tabla.campos.map((c) => {
    const v = r[c.nombre];
    if (v === undefined || v === null) return null;
    if (c.tipo === "booleano") return v ? 1 : 0;
    if (c.tipo === "json") return JSON.stringify(v);
    return v as SQLInputValue;
  });
}

/** Convierte una fila de SQLite en el registro que usa el código. */
export function desdeFila<T>(tabla: Tabla, fila: Record<string, SQLOutputValue>): T {
  const r: Record<string, unknown> = {};
  for (const c of tabla.campos) {
    const v = fila[columna(c.nombre)];
    if (v === null || v === undefined) {
      if (c.vacio === "nulo") r[c.nombre] = null;
      continue;
    }
    r[c.nombre] = c.tipo === "booleano" ? v === 1 : c.tipo === "json" ? JSON.parse(String(v)) : v;
  }
  return r as T;
}

export function sqlGuardar(tabla: Tabla): string {
  const cols = tabla.campos.map((c) => columna(c.nombre));
  const cambios = cols.filter((c) => c !== "id").map((c) => `${c} = excluded.${c}`);
  return `INSERT INTO ${tabla.nombre} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")}) ON CONFLICT(id) DO UPDATE SET ${cambios.join(", ")}`;
}
