// Utilidades de fechas en hora local (Málaga). Las fechas se guardan como
// «AAAA-MM-DD» y las horas como «HH:MM».

import { DURACION_PRACTICA, TURNO_MANANA, Franja } from "./tipos";

const pad = (n: number) => String(n).padStart(2, "0");

export function aISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function hoy(): string {
  return aISO(new Date());
}

export function desdeISO(fecha: string): Date {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(a, m - 1, d);
}

export function sumarDias(fecha: string, dias: number): string {
  const d = desdeISO(fecha);
  d.setDate(d.getDate() + dias);
  return aISO(d);
}

export function diasEntre(desde: string, hasta: string): number {
  const ms = desdeISO(hasta).getTime() - desdeISO(desde).getTime();
  return Math.round(ms / 86_400_000);
}

/** 1 = lunes … 7 = domingo */
export function diaSemana(fecha: string): number {
  const d = desdeISO(fecha).getDay();
  return d === 0 ? 7 : d;
}

export function esDomingo(fecha: string): boolean {
  return diaSemana(fecha) === 7;
}

export function lunesDe(fecha: string): string {
  return sumarDias(fecha, 1 - diaSemana(fecha));
}

/** Instante en que empieza una práctica. */
export function inicioPractica(fecha: string, hora: string): Date {
  const d = desdeISO(fecha);
  const [h, m] = hora.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

export function horaFin(hora: string, minutos = DURACION_PRACTICA): string {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + minutos;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function horasHasta(fecha: string, hora: string, ahora = new Date()): number {
  return (inicioPractica(fecha, hora).getTime() - ahora.getTime()) / 3_600_000;
}

export function yaTerminada(fecha: string, hora: string, ahora = new Date()): boolean {
  return inicioPractica(fecha, horaFin(hora)).getTime() <= ahora.getTime();
}

export function franjaDe(hora: string): Franja {
  return TURNO_MANANA.includes(hora) || hora < "14:00" ? "manana" : "tarde";
}

const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const DIAS_CORTOS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export const NOMBRES_DIAS = DIAS;

export function nombreDia(fecha: string): string {
  return DIAS[diaSemana(fecha) - 1];
}

export function diaCorto(fecha: string): string {
  return DIAS_CORTOS[diaSemana(fecha) - 1];
}

/** «lunes 26 de octubre» */
export function fechaLarga(fecha: string): string {
  const d = desdeISO(fecha);
  return `${nombreDia(fecha)} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

/** «26 oct» o «26 oct 2025» si no es de este año */
export function fechaCorta(fecha: string): string {
  const d = desdeISO(fecha.slice(0, 10));
  const anio = d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : "";
  return `${d.getDate()} ${MESES_CORTOS[d.getMonth()]}${anio}`;
}

/** «26 de octubre de 2026» */
export function fechaCompleta(fecha: string): string {
  const d = desdeISO(fecha.slice(0, 10));
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/** Texto relativo: «hoy», «mañana», «ayer», «hace 9 días», «dentro de 3 días». */
export function relativo(fecha: string, referencia = hoy()): string {
  const n = diasEntre(referencia, fecha.slice(0, 10));
  if (n === 0) return "hoy";
  if (n === 1) return "mañana";
  if (n === -1) return "ayer";
  if (n < 0) return `hace ${-n} días`;
  return `dentro de ${n} días`;
}

export function fechaHora(iso: string): string {
  const d = new Date(iso);
  return `${fechaCorta(aISO(d))}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function nombreMes(mes: number): string {
  return MESES[mes];
}

/** Primera letra en mayúscula: «Lunes 26 de octubre». */
export function mayus(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
