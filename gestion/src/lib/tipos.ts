// Tipos y constantes de la aplicación de gestión de Autoescuela Faro.
// Todo lo que se guarda pasa por estos tipos; cada colección es una tabla de la
// base de datos compartida (compartido/src/esquema.ts).

import type { EstadoInteresado, Interesado, OrigenInteresado } from "@faro/compartido";

export type { EstadoInteresado, Interesado, MensajeChat, OrigenInteresado } from "@faro/compartido";

export type Fase = "teorico" | "espera_practicas" | "practicas" | "aprobado";

export const FASES: Record<Fase, string> = {
  teorico: "Teórico",
  espera_practicas: "Esperando prácticas",
  practicas: "En prácticas",
  aprobado: "Aprobado",
};

export type Nivel = "por_trabajar" | "en_progreso" | "dominada";

export const NIVELES: Record<Nivel, string> = {
  por_trabajar: "Por trabajar",
  en_progreso: "En progreso",
  dominada: "Dominada",
};

export const MANIOBRAS = [
  { id: "incorporaciones", nombre: "Incorporaciones" },
  { id: "rotondas", nombre: "Rotondas" },
  { id: "rotondas_dos_carriles", nombre: "Rotondas de dos carriles" },
  { id: "cambios_carril", nombre: "Cambios de carril" },
  { id: "prioridades_peatones", nombre: "Prioridades y pasos de peatones" },
  { id: "arranque_pendiente", nombre: "Arranque en pendiente" },
  { id: "aparcamiento_linea", nombre: "Aparcamiento en línea" },
  { id: "aparcamiento_bateria", nombre: "Aparcamiento en batería" },
  { id: "circulacion_ciudad", nombre: "Circulación en ciudad" },
  { id: "autovia", nombre: "Autovía" },
  { id: "zonas_examen", nombre: "Zonas de examen" },
] as const;

export type ManiobraId = (typeof MANIOBRAS)[number]["id"];
export type Niveles = Record<ManiobraId, Nivel>;

export type Semaforo = "rojo" | "ambar" | "verde";

export const SEMAFOROS: Record<Semaforo, string> = {
  rojo: "En aprendizaje",
  ambar: "Casi listo",
  verde: "Listo para examen",
};

export interface ProgresoTeorico {
  ultimoTest: string | null; // AAAA-MM-DD
  numTests: number;
  mediaFallos: number | null; // media de fallos de los últimos 5 test
  aprobadoEl: string | null; // fecha de aprobado del examen teórico
}

export type Franja = "manana" | "tarde";

export interface ListaEspera {
  dias: number[]; // 1 = lunes … 6 = sábado
  franjas: Franja[];
  desde: string; // ISO
}

export interface Alumno {
  id: string;
  nombre: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  fechaMatricula: string;
  fase: Fase;
  profesorId: string | null;
  teorico: ProgresoTeorico;
  verdeDesde: string | null; // fecha en que entró en la cola de examen
  avisoRetroceso: boolean; // estaba en verde y ha bajado: secretaría decide
  listaEspera: ListaEspera | null;
  aprobadoEl: string | null; // carnet conseguido
  notas: string;
  interesadoId?: string;
}

export interface Profesor {
  id: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  cocheId: string;
}

export interface Coche {
  id: string;
  matricula: string;
  modelo: string;
  esReserva: boolean;
}

export type TipoIncidencia = "taller" | "itv";

export interface IncidenciaCoche {
  id: string;
  cocheId: string;
  tipo: TipoIncidencia;
  desde: string;
  hasta: string;
  nota: string;
}

export type TipoTarifa = "matricula" | "bono" | "suelta" | "examen" | "tasa";

export interface Tarifa {
  id: string;
  tipo: TipoTarifa;
  concepto: string;
  precio: number; // euros
  practicas: number; // prácticas que suma al monedero
  admitePlazos: boolean;
}

export type TipoCargo = "compra" | "practica_sin_saldo";

/** Lo que el alumno debe pagar (una compra o una práctica dada sin saldo). */
export interface Cargo {
  id: string;
  alumnoId: string;
  tipo: TipoCargo;
  tarifaId: string;
  tipoTarifa: TipoTarifa;
  concepto: string;
  importe: number;
  practicas: number;
  plazos: 1 | 2;
  fecha: string; // ISO
  practicaId?: string;
}

export type FormaPago = "bizum" | "tarjeta" | "efectivo";

export const FORMAS_PAGO: Record<FormaPago, string> = {
  bizum: "Bizum",
  tarjeta: "Tarjeta",
  efectivo: "Efectivo",
};

export interface Pago {
  id: string;
  alumnoId: string;
  cargoId: string;
  importe: number;
  forma: FormaPago;
  fecha: string; // ISO
  plazo: 1 | 2;
}

export interface TasaDGT {
  id: string;
  alumnoId: string;
  cargoId: string;
  fechaPago: string;
}

export type TipoExamen = "teorico" | "practico";
export type Resultado = "apto" | "no_apto";

export interface Examen {
  id: string;
  alumnoId: string;
  tipo: TipoExamen;
  fecha: string;
  resultado: Resultado;
  tasaId: string | null;
  convocatoriaId?: string;
}

export type EstadoPractica =
  | "reservada"
  | "realizada"
  | "no_presentado"
  | "cancelada"
  | "cancelada_tarde";

export const ESTADOS_PRACTICA: Record<EstadoPractica, string> = {
  reservada: "Reservada",
  realizada: "Realizada",
  no_presentado: "No se presentó",
  cancelada: "Cancelada a tiempo",
  cancelada_tarde: "Cancelada tarde",
};

export type OrigenPractica = "alumno" | "secretaria" | "caza_huecos";

export interface Practica {
  id: string;
  alumnoId: string;
  profesorId: string;
  cocheId: string;
  fecha: string; // AAAA-MM-DD
  inicio: string; // HH:MM (bloques de 45 minutos)
  estado: EstadoPractica;
  confirmada: boolean;
  sinSaldo: boolean;
  origen: OrigenPractica;
  creadaEl: string;
  canceladaEl?: string;
}

export interface Evaluacion {
  id: string;
  practicaId: string;
  alumnoId: string;
  profesorId: string;
  fecha: string;
  niveles: Niveles;
  falloGrave: boolean;
  notasDictadas: string;
  resumen: string;
  mensajeAlumno: string;
  conIA: boolean;
  creadaEl: string;
}

export type EstadoOferta = "abierta" | "cogida" | "caducada";

/** Hueco que deja una cancelación a tiempo y que se ofrece a la lista de espera. */
export interface OfertaHueco {
  id: string;
  practicaOrigenId: string;
  profesorId: string;
  fecha: string;
  inicio: string;
  creadaEl: string;
  ofrecidaA: string[];
  estado: EstadoOferta;
  cogidaPor?: string;
  cogidaEl?: string;
  practicaNuevaId?: string;
  abiertaATodos?: boolean;
  /** Cuándo avisó Secretaría a la lista de espera. Hasta entonces, el hueco no lo ve ningún alumno. */
  avisadaEl?: string;
  /** Alumnos avisados que han dicho que no lo quieren. */
  rechazadaPor?: string[];
}

export interface PlazaExamen {
  alumnoId: string;
  resultado: Resultado | null;
}

export interface Convocatoria {
  id: string;
  fecha: string;
  cupo: number;
  confirmada: boolean;
  plazas: PlazaExamen[];
  creadaEl: string;
}

export interface SolicitudRecarga {
  id: string;
  alumnoId: string;
  tarifaId: string;
  fecha: string;
  atendida: boolean;
  mensaje: string;
}

export const ESTADOS_INTERESADO: Record<EstadoInteresado, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  clase_prueba: "Clase de prueba",
  matriculado: "Matriculado",
};

export const ORIGENES_INTERESADO: Record<OrigenInteresado, string> = {
  clase_prueba: "Formulario «Clase de prueba»",
  matricula: "Formulario «Matricúlate»",
  asistente_ia: "Asistente de la web",
};

export interface Ajustes {
  modeloIA: string;
}

export interface BaseDatos {
  version: number;
  creadaEl: string;
  alumnos: Alumno[];
  profesores: Profesor[];
  coches: Coche[];
  incidencias: IncidenciaCoche[];
  tarifas: Tarifa[];
  cargos: Cargo[];
  pagos: Pago[];
  tasas: TasaDGT[];
  examenes: Examen[];
  practicas: Practica[];
  evaluaciones: Evaluacion[];
  ofertas: OfertaHueco[];
  convocatorias: Convocatoria[];
  solicitudes: SolicitudRecarga[];
  interesados: Interesado[];
  ajustes: Ajustes;
}

export const MODELO_IA_POR_DEFECTO = "anthropic/claude-haiku-5.5";

// ── Horario de prácticas ───────────────────────────────────────────────
// Lunes a sábado. Bloques de 45 minutos seguidos.
// Mañana 8:00–14:00 (8 bloques); comida 14:00–16:00; tarde desde las 16:00
// (6 bloques, el último acaba a las 20:30: no cabe otro antes de las 21:00).
export const DURACION_PRACTICA = 45;
export const TURNO_MANANA = ["08:00", "08:45", "09:30", "10:15", "11:00", "11:45", "12:30", "13:15"];
export const TURNO_TARDE = ["16:00", "16:45", "17:30", "18:15", "19:00", "19:45"];
export const BLOQUES = [...TURNO_MANANA, ...TURNO_TARDE];

export const HORAS_CANCELACION = 24;
export const HORAS_APERTURA_HUECO = 2;
export const DIAS_INACTIVIDAD_TEORICO = 7;
export const DIAS_RESERVA_ADELANTADA = 14;
