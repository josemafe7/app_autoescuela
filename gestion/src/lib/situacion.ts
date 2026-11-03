// Descripción corta de la situación de cada alumno para las fichas y listados.

import "server-only";
import { Alumno, BaseDatos, SEMAFOROS } from "./tipos";
import * as R from "./reglas";
import { fechaCorta } from "./fechas";
import { eurCorto } from "./formato";

export function situacionAlumno(db: BaseDatos, a: Alumno): string {
  if (a.fase === "teorico") {
    const d = R.diasSinTest(a);
    return R.teoricoParado(a)
      ? a.teorico.ultimoTest
        ? `Teórico parado: ${d} días sin test`
        : `Sin hacer ningún test (${d} días)`
      : "Teórico al día";
  }
  if (a.fase === "espera_practicas") {
    const puesto = R.colaPracticas(db).findIndex((x) => x.id === a.id) + 1;
    return `Esperando profesor · puesto ${puesto}`;
  }
  if (a.fase === "aprobado") return a.aprobadoEl ? `Aprobado el ${fechaCorta(a.aprobadoEl)}` : "Aprobado";
  const conv = R.convocatoriasDe(db, a.id);
  if (conv.agotadas) return "Convocatorias agotadas: tasa pendiente";
  if (R.ofertasParaAlumno(db, a).disponibles.length) return "Tiene un hueco libre ofrecido";
  const plaza = R.plazaPendiente(db, a.id);
  if (plaza) return `Examen práctico el ${fechaCorta(plaza.fecha)}`;
  if (a.avisoRetroceso) return "Estaba en verde y ha bajado";
  const puesto = R.puestoEnCola(db, a.id);
  if (puesto) return `Puesto ${puesto} en la cola de examen`;
  const s = R.saldo(db, a.id);
  const deuda = R.totalDeuda(db, a.id);
  if (deuda > 0) return `Debe ${eurCorto(deuda)}`;
  if (s <= 0) return "Sin prácticas en el monedero";
  if (s === 1) return "Le queda 1 práctica";
  return SEMAFOROS[R.semaforoDe(db, a.id)];
}
