// Reglas de funcionamiento de la autoescuela. Son funciones puras:
// reciben los datos y calculan (saldo, deudas, semáforo, colas, huecos…).

import {
  Alumno,
  BaseDatos,
  BLOQUES,
  Cargo,
  Convocatoria,
  DIAS_INACTIVIDAD_TEORICO,
  DIAS_RESERVA_ADELANTADA,
  EstadoPractica,
  Evaluacion,
  HORAS_APERTURA_HUECO,
  MANIOBRAS,
  Niveles,
  OfertaHueco,
  Practica,
  Semaforo,
  TasaDGT,
  TURNO_MANANA,
  TURNO_TARDE,
} from "./tipos";
import {
  diaSemana,
  diasEntre,
  esDomingo,
  franjaDe,
  hoy,
  horasHasta,
  inicioPractica,
  lunesDe,
  sumarDias,
  yaTerminada,
} from "./fechas";

export const redondear = (n: number) => Math.round(n * 100) / 100;

// ── Personas ───────────────────────────────────────────────────────────

export const nombreCompleto = (p: { nombre: string; apellidos: string }) =>
  `${p.nombre} ${p.apellidos}`;

export function alumnoPorId(db: BaseDatos, id: string): Alumno | undefined {
  return db.alumnos.find((a) => a.id === id);
}

export function profesorPorId(db: BaseDatos, id: string | null) {
  return id ? db.profesores.find((p) => p.id === id) : undefined;
}

export function iniciales(p: { nombre: string; apellidos: string }) {
  return `${p.nombre[0] ?? ""}${p.apellidos[0] ?? ""}`.toUpperCase();
}

export function enlaceWhatsApp(telefono: string, texto: string) {
  const numero = telefono.replace(/\D/g, "");
  const conPrefijo = numero.length === 9 ? `34${numero}` : numero;
  return `https://wa.me/${conPrefijo}?text=${encodeURIComponent(texto)}`;
}

// ── Monedero y deudas ──────────────────────────────────────────────────

/** Estados que gastan una práctica del monedero. */
export const ESTADOS_QUE_GASTAN: EstadoPractica[] = [
  "reservada",
  "realizada",
  "no_presentado",
  "cancelada_tarde",
];

/** Estados que ocupan la hora del profesor. */
export const ESTADOS_QUE_OCUPAN: EstadoPractica[] = ["reservada", "realizada", "no_presentado"];

export function pagadoDe(db: BaseDatos, cargo: Cargo): number {
  return redondear(
    db.pagos.filter((p) => p.cargoId === cargo.id).reduce((s, p) => s + p.importe, 0),
  );
}

export function pendienteDe(db: BaseDatos, cargo: Cargo): number {
  return Math.max(0, redondear(cargo.importe - pagadoDe(db, cargo)));
}

/** Las prácticas de una compra entran en el monedero con el primer pago. */
export function cargoAcredita(db: BaseDatos, cargo: Cargo): boolean {
  if (cargo.tipo === "practica_sin_saldo") return true;
  return pagadoDe(db, cargo) > 0;
}

export interface Monedero {
  compradas: number;
  realizadas: number;
  reservadas: number;
  perdidas: number;
  disponibles: number;
}

export function monedero(db: BaseDatos, alumnoId: string): Monedero {
  const compradas = db.cargos
    .filter((c) => c.alumnoId === alumnoId && cargoAcredita(db, c))
    .reduce((s, c) => s + c.practicas, 0);
  const suyas = db.practicas.filter((p) => p.alumnoId === alumnoId);
  const realizadas = suyas.filter((p) => p.estado === "realizada").length;
  const reservadas = suyas.filter((p) => p.estado === "reservada").length;
  const perdidas = suyas.filter(
    (p) => p.estado === "no_presentado" || p.estado === "cancelada_tarde",
  ).length;
  return {
    compradas,
    realizadas,
    reservadas,
    perdidas,
    disponibles: compradas - realizadas - reservadas - perdidas,
  };
}

export const saldo = (db: BaseDatos, alumnoId: string) => monedero(db, alumnoId).disponibles;

export type MotivoDeuda = "segundo_plazo" | "sin_saldo" | "pendiente";

export interface Deuda {
  cargo: Cargo;
  pendiente: number;
  motivo: MotivoDeuda;
}

export function deudasDe(db: BaseDatos, alumnoId: string): Deuda[] {
  return db.cargos
    .filter((c) => c.alumnoId === alumnoId)
    .map((cargo) => {
      const pendiente = pendienteDe(db, cargo);
      const pagos = db.pagos.filter((p) => p.cargoId === cargo.id).length;
      const motivo: MotivoDeuda =
        cargo.tipo === "practica_sin_saldo"
          ? "sin_saldo"
          : cargo.plazos === 2 && pagos > 0
            ? "segundo_plazo"
            : "pendiente";
      return { cargo, pendiente, motivo };
    })
    .filter((d) => d.pendiente > 0);
}

export function totalDeuda(db: BaseDatos, alumnoId: string): number {
  return redondear(deudasDe(db, alumnoId).reduce((s, d) => s + d.pendiente, 0));
}

export const MOTIVOS_DEUDA: Record<MotivoDeuda, string> = {
  segundo_plazo: "2.º plazo pendiente",
  sin_saldo: "Práctica dada sin saldo",
  pendiente: "Sin pagar",
};

// ── Tasa de la DGT y convocatorias ─────────────────────────────────────

export function tasaActual(db: BaseDatos, alumnoId: string): TasaDGT | null {
  const tasas = db.tasas
    .filter((t) => t.alumnoId === alumnoId)
    .sort((a, b) => a.fechaPago.localeCompare(b.fechaPago));
  return tasas.at(-1) ?? null;
}

export interface EstadoConvocatorias {
  tasa: TasaDGT | null;
  suspensos: number;
  disponibles: number;
  agotadas: boolean;
}

/** Cada tasa da 2 convocatorias; cada suspenso (teórico o práctico) gasta una. */
export function convocatoriasDe(db: BaseDatos, alumnoId: string): EstadoConvocatorias {
  const tasa = tasaActual(db, alumnoId);
  if (!tasa) return { tasa: null, suspensos: 0, disponibles: 0, agotadas: false };
  const suspensos = db.examenes.filter(
    (e) => e.tasaId === tasa.id && e.resultado === "no_apto",
  ).length;
  return {
    tasa,
    suspensos,
    disponibles: Math.max(0, 2 - suspensos),
    agotadas: suspensos >= 2,
  };
}

export function caducidadTeorico(alumno: Alumno): string | null {
  const f = alumno.teorico.aprobadoEl;
  if (!f) return null;
  const [a, m, d] = f.split("-");
  return `${Number(a) + 2}-${m}-${d}`;
}

export function teoricoEnVigor(alumno: Alumno, enFecha = hoy()): boolean {
  const cad = caducidadTeorico(alumno);
  return !!cad && enFecha < cad;
}

export function derechosExamen(db: BaseDatos, alumnoId: string) {
  const pagados = db.cargos.filter(
    (c) => c.alumnoId === alumnoId && c.tipoTarifa === "examen" && pendienteDe(db, c) === 0,
  ).length;
  const usados = db.convocatorias.filter(
    (c) => c.confirmada && c.plazas.some((p) => p.alumnoId === alumnoId),
  ).length;
  return { pagados, usados, disponibles: Math.max(0, pagados - usados) };
}

// ── Evaluaciones y semáforo ────────────────────────────────────────────

export function nivelesVacios(): Niveles {
  return Object.fromEntries(MANIOBRAS.map((m) => [m.id, "por_trabajar"])) as Niveles;
}

export function evaluacionesDe(db: BaseDatos, alumnoId: string): Evaluacion[] {
  return db.evaluaciones
    .filter((e) => e.alumnoId === alumnoId)
    .sort((a, b) => (a.fecha + a.creadaEl).localeCompare(b.fecha + b.creadaEl));
}

export function nivelesActuales(db: BaseDatos, alumnoId: string): Niveles {
  return evaluacionesDe(db, alumnoId).at(-1)?.niveles ?? nivelesVacios();
}

/**
 * Verde: todas las maniobras dominadas y las 2 últimas prácticas sin fallos graves.
 * Ámbar: faltan 1 o 2 maniobras (o están todas, pero aún no hay 2 prácticas seguidas limpias).
 * Rojo: el resto.
 */
export function calcularSemaforo(evals: Evaluacion[]): Semaforo {
  const ultima = evals.at(-1);
  if (!ultima) return "rojo";
  const faltan = MANIOBRAS.filter((m) => ultima.niveles[m.id] !== "dominada").length;
  const dosLimpias = evals.length >= 2 && evals.slice(-2).every((e) => !e.falloGrave);
  if (faltan === 0 && dosLimpias) return "verde";
  if (faltan <= 2) return "ambar";
  return "rojo";
}

export function semaforoDe(db: BaseDatos, alumnoId: string): Semaforo {
  return calcularSemaforo(evaluacionesDe(db, alumnoId));
}

export function maniobrasQueFaltan(niveles: Niveles) {
  return MANIOBRAS.filter((m) => niveles[m.id] !== "dominada");
}

/** Tras guardar una evaluación: entra en la cola o avisa si ha empeorado. */
export function aplicarSemaforo(db: BaseDatos, alumno: Alumno, fecha = hoy()) {
  const s = semaforoDe(db, alumno.id);
  if (s === "verde") {
    alumno.avisoRetroceso = false;
    if (!alumno.verdeDesde && alumno.teorico.aprobadoEl) alumno.verdeDesde = fecha;
  } else if (alumno.verdeDesde) {
    alumno.avisoRetroceso = true;
  }
  return s;
}

// ── Teórico ────────────────────────────────────────────────────────────

export function diasSinTest(alumno: Alumno, ref = hoy()): number {
  return diasEntre(alumno.teorico.ultimoTest ?? alumno.fechaMatricula, ref);
}

export function teoricoParado(alumno: Alumno, ref = hoy()): boolean {
  return alumno.fase === "teorico" && diasSinTest(alumno, ref) >= DIAS_INACTIVIDAD_TEORICO;
}

// ── Colas ──────────────────────────────────────────────────────────────

export function colaPracticas(db: BaseDatos): Alumno[] {
  return db.alumnos
    .filter((a) => a.fase === "espera_practicas")
    .sort((a, b) =>
      (a.teorico.aprobadoEl ?? "9999").localeCompare(b.teorico.aprobadoEl ?? "9999"),
    );
}

export function plazaPendiente(db: BaseDatos, alumnoId: string): Convocatoria | undefined {
  return db.convocatorias.find(
    (c) => c.confirmada && c.plazas.some((p) => p.alumnoId === alumnoId && p.resultado === null),
  );
}

export interface Requisitos {
  convocatorias: boolean;
  teorico: boolean;
  derecho: boolean;
}

export function requisitosExamen(db: BaseDatos, alumno: Alumno, enFecha = hoy()): Requisitos {
  return {
    convocatorias: convocatoriasDe(db, alumno.id).disponibles > 0,
    teorico: teoricoEnVigor(alumno, enFecha),
    derecho: derechosExamen(db, alumno.id).disponibles > 0,
  };
}

export const cumpleRequisitos = (r: Requisitos) => r.convocatorias && r.teorico && r.derecho;

export interface ColaExamen {
  enCola: Alumno[];
  conFecha: { alumno: Alumno; convocatoria: Convocatoria }[];
  tasaPendiente: Alumno[];
}

export function colaExamen(db: BaseDatos): ColaExamen {
  const verdes = db.alumnos.filter((a) => a.fase === "practicas" && a.verdeDesde);
  const enCola: Alumno[] = [];
  const conFecha: ColaExamen["conFecha"] = [];
  const tasaPendiente: Alumno[] = [];
  for (const a of verdes) {
    const plaza = plazaPendiente(db, a.id);
    if (plaza) conFecha.push({ alumno: a, convocatoria: plaza });
    else if (convocatoriasDe(db, a.id).agotadas || !tasaActual(db, a.id)) tasaPendiente.push(a);
    else enCola.push(a);
  }
  enCola.sort((a, b) => (a.verdeDesde! + a.id).localeCompare(b.verdeDesde! + b.id));
  conFecha.sort((a, b) => a.convocatoria.fecha.localeCompare(b.convocatoria.fecha));
  return { enCola, conFecha, tasaPendiente };
}

export function puestoEnCola(db: BaseDatos, alumnoId: string): number | null {
  const i = colaExamen(db).enCola.findIndex((a) => a.id === alumnoId);
  return i === -1 ? null : i + 1;
}

/** Propone a los primeros de la cola que cumplen los requisitos para esa fecha. */
export function proponerPlazas(db: BaseDatos, conv: Convocatoria) {
  const libres = Math.max(0, conv.cupo - conv.plazas.length);
  const filas = colaExamen(db).enCola.map((alumno, i) => ({
    alumno,
    puesto: i + 1,
    requisitos: requisitosExamen(db, alumno, conv.fecha),
  }));
  const propuestos = filas.filter((f) => cumpleRequisitos(f.requisitos)).slice(0, libres);
  return { filas, propuestos: propuestos.map((p) => p.alumno.id), libres };
}

export interface Estimacion {
  fecha: string;
  cupoMedio: number;
  intervalo: number;
  desdeVentana: string;
  hastaVentana: string;
}

/** Fecha aproximada de examen según el puesto y el cupo medio de las últimas convocatorias. */
export function estimarExamen(db: BaseDatos, puesto: number, ref = hoy()): Estimacion {
  const pasadas = db.convocatorias
    .filter((c) => c.fecha < ref)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 4);
  const cupoMedio = pasadas.length
    ? pasadas.reduce((s, c) => s + c.cupo, 0) / pasadas.length
    : 3;
  let intervalo = 14;
  if (pasadas.length >= 2) {
    const difs = pasadas.slice(1).map((c, i) => diasEntre(c.fecha, pasadas[i].fecha));
    intervalo = Math.max(7, Math.round(difs.reduce((s, d) => s + d, 0) / difs.length));
  }
  let restantes = puesto;
  let fecha: string | null = null;
  const futuras = db.convocatorias
    .filter((c) => c.fecha >= ref)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  for (const c of futuras) {
    const libres = c.confirmada ? 0 : Math.max(0, c.cupo - c.plazas.length);
    if (restantes <= libres) {
      fecha = c.fecha;
      break;
    }
    restantes -= libres;
  }
  if (!fecha) {
    let base = futuras.at(-1)?.fecha ?? pasadas[0]?.fecha ?? ref;
    while (base < ref) base = sumarDias(base, intervalo);
    const necesarias = Math.max(1, Math.ceil(restantes / cupoMedio));
    fecha = sumarDias(base, intervalo * necesarias);
  }
  return {
    fecha,
    cupoMedio: Math.round(cupoMedio * 10) / 10,
    intervalo,
    desdeVentana: sumarDias(fecha, -28),
    hastaVentana: sumarDias(fecha, -1),
  };
}

// ── Coches ─────────────────────────────────────────────────────────────

export function incidenciaEn(db: BaseDatos, cocheId: string, fecha: string) {
  return db.incidencias.find((i) => i.cocheId === cocheId && i.desde <= fecha && fecha <= i.hasta);
}

export function cocheReserva(db: BaseDatos) {
  return db.coches.find((c) => c.esReserva);
}

/** Coche con el que sale el profesor ese día: el suyo o el de reserva si el suyo está parado. */
export function cocheDelDia(db: BaseDatos, profesorId: string, fecha: string) {
  const profesor = profesorPorId(db, profesorId)!;
  if (!incidenciaEn(db, profesor.cocheId, fecha)) {
    return { cocheId: profesor.cocheId, sustitucion: false };
  }
  const reserva = cocheReserva(db);
  return { cocheId: reserva?.id ?? profesor.cocheId, sustitucion: true };
}

export function examenEnFecha(db: BaseDatos, fecha: string) {
  return db.convocatorias.find((c) => c.fecha === fecha);
}

// ── Agenda ─────────────────────────────────────────────────────────────

export function practicasDelDia(db: BaseDatos, profesorId: string, fecha: string): Practica[] {
  return db.practicas
    .filter((p) => p.profesorId === profesorId && p.fecha === fecha)
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
}

export function ocupanteDe(db: BaseDatos, profesorId: string, fecha: string, inicio: string) {
  return db.practicas.find(
    (p) =>
      p.profesorId === profesorId &&
      p.fecha === fecha &&
      p.inicio === inicio &&
      ESTADOS_QUE_OCUPAN.includes(p.estado),
  );
}

/**
 * Horas que puede elegir un alumno (regla contra huecos muertos):
 * solo horas pegadas a otra clase del profesor, o al principio o al final del turno.
 * Si el turno está vacío, solo la primera hora del turno.
 */
export function bloquesPermitidos(
  db: BaseDatos,
  profesorId: string,
  fecha: string,
  ahora = new Date(),
): string[] {
  if (esDomingo(fecha) || fecha < hoy()) return [];
  const permitidos: string[] = [];
  for (const turno of [TURNO_MANANA, TURNO_TARDE]) {
    const ocupado = turno.map((b) => !!ocupanteDe(db, profesorId, fecha, b));
    const libre = (i: number) => !ocupado[i] && inicioPractica(fecha, turno[i]) > ahora;
    if (!ocupado.some(Boolean)) {
      if (libre(0)) permitidos.push(turno[0]);
      continue;
    }
    turno.forEach((b, i) => {
      if (!libre(i)) return;
      const pegado = ocupado[i - 1] || ocupado[i + 1];
      if (pegado || i === 0 || i === turno.length - 1) permitidos.push(b);
    });
  }
  return permitidos;
}

export function diasReservables(ref = hoy()): string[] {
  const dias: string[] = [];
  for (let i = 0; i <= DIAS_RESERVA_ADELANTADA; i++) {
    const f = sumarDias(ref, i);
    if (!esDomingo(f)) dias.push(f);
  }
  return dias;
}

export interface MotivoNoReserva {
  puede: boolean;
  motivo?: string;
}

export function puedeReservar(db: BaseDatos, alumno: Alumno): MotivoNoReserva {
  if (alumno.fase === "teorico") return { puede: false, motivo: "Primero tienes que aprobar el teórico." };
  if (alumno.fase === "aprobado") return { puede: false, motivo: "Ya tienes el carnet. ¡Enhorabuena!" };
  if (!alumno.profesorId)
    return {
      puede: false,
      motivo: "Aún no tienes profesor asignado. Te avisaremos en cuanto te toque empezar.",
    };
  if (saldo(db, alumno.id) < 1)
    return { puede: false, motivo: "No te quedan prácticas pagadas. Solicita una recarga." };
  return { puede: true };
}

export function practicasSinCerrar(db: BaseDatos, profesorId?: string, ahora = new Date()) {
  return db.practicas
    .filter(
      (p) =>
        p.estado === "reservada" &&
        (!profesorId || p.profesorId === profesorId) &&
        yaTerminada(p.fecha, p.inicio, ahora),
    )
    .sort((a, b) => (a.fecha + a.inicio).localeCompare(b.fecha + b.inicio));
}

/** Recordatorio con botón de confirmar: prácticas de hoy o mañana aún sin confirmar. */
export function practicasPorConfirmar(db: BaseDatos, alumnoId: string, ahora = new Date()) {
  const h = hoy();
  const m = sumarDias(h, 1);
  return db.practicas
    .filter(
      (p) =>
        p.alumnoId === alumnoId &&
        p.estado === "reservada" &&
        !p.confirmada &&
        (p.fecha === h || p.fecha === m) &&
        inicioPractica(p.fecha, p.inicio) > ahora,
    )
    .sort((a, b) => (a.fecha + a.inicio).localeCompare(b.fecha + b.inicio));
}

export function proximasPracticas(db: BaseDatos, alumnoId: string, ahora = new Date()) {
  return db.practicas
    .filter(
      (p) =>
        p.alumnoId === alumnoId &&
        p.estado === "reservada" &&
        !yaTerminada(p.fecha, p.inicio, ahora),
    )
    .sort((a, b) => (a.fecha + a.inicio).localeCompare(b.fecha + b.inicio));
}

export function ocupacionSemana(db: BaseDatos, profesorId: string, ref = hoy()) {
  const lunes = lunesDe(ref);
  const dias = Array.from({ length: 6 }, (_, i) => sumarDias(lunes, i));
  const total = dias.length * BLOQUES.length;
  const ocupadas = db.practicas.filter(
    (p) => p.profesorId === profesorId && dias.includes(p.fecha) && ESTADOS_QUE_OCUPAN.includes(p.estado),
  ).length;
  return { ocupadas, total, porcentaje: Math.round((ocupadas / total) * 100), dias };
}

// ── Caza-huecos ────────────────────────────────────────────────────────

/** Alumnos de la lista de espera de ese profesor, con saldo y que pueden en esa franja. */
export function candidatosHueco(
  db: BaseDatos,
  profesorId: string,
  fecha: string,
  inicio: string,
  excluir?: string,
): string[] {
  const dia = diaSemana(fecha);
  const franja = franjaDe(inicio);
  return db.alumnos
    .filter(
      (a) =>
        a.id !== excluir &&
        a.fase === "practicas" &&
        a.profesorId === profesorId &&
        a.listaEspera &&
        a.listaEspera.dias.includes(dia) &&
        a.listaEspera.franjas.includes(franja) &&
        saldo(db, a.id) >= 1,
    )
    .map((a) => a.id);
}

export type EstadoOfertaReal = "abierta" | "abierta_todos" | "cogida" | "caducada";

export function estadoOferta(db: BaseDatos, o: OfertaHueco, ahora = new Date()): EstadoOfertaReal {
  if (o.estado === "cogida") return "cogida";
  if (o.estado === "caducada") return "caducada";
  if (inicioPractica(o.fecha, o.inicio) <= ahora) return "caducada";
  if (ocupanteDe(db, o.profesorId, o.fecha, o.inicio)) return "caducada";
  return horasHasta(o.fecha, o.inicio, ahora) <= HORAS_APERTURA_HUECO ? "abierta_todos" : "abierta";
}

export function ofertasParaAlumno(db: BaseDatos, alumno: Alumno, ahora = new Date()) {
  const origenDe = (o: OfertaHueco) =>
    db.practicas.find((p) => p.id === o.practicaOrigenId)?.alumnoId;
  const disponibles = db.ofertas
    .filter((o) => {
      if (o.profesorId !== alumno.profesorId || origenDe(o) === alumno.id) return false;
      const e = estadoOferta(db, o, ahora);
      if (e === "abierta") return o.ofrecidaA.includes(alumno.id);
      if (e === "abierta_todos") return true;
      return false;
    })
    .filter(() => saldo(db, alumno.id) >= 1 && alumno.fase === "practicas")
    .sort((a, b) => (a.fecha + a.inicio).localeCompare(b.fecha + b.inicio));
  const cogidas = db.ofertas.filter(
    (o) =>
      o.estado === "cogida" &&
      o.cogidaPor !== alumno.id &&
      o.ofrecidaA.includes(alumno.id) &&
      inicioPractica(o.fecha, o.inicio) > ahora,
  );
  return { disponibles, cogidas };
}

// ── Avisos para secretaría ─────────────────────────────────────────────

export function solicitudesPendientes(db: BaseDatos) {
  return db.solicitudes
    .filter((s) => !s.atendida)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function interesadosNuevos(db: BaseDatos) {
  return db.interesados.filter((i) => i.estado === "nuevo");
}
