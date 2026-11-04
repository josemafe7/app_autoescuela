// Ficha de una práctica: datos, asistencia y evaluación. La usan el profesor (móvil) y secretaría.

import Link from "next/link";
import { BaseDatos, ESTADOS_PRACTICA, MANIOBRAS, Practica } from "@/lib/tipos";
import * as R from "@/lib/reglas";
import { fechaHora, fechaLarga, horaFin, horasHasta, inicioPractica, mayus } from "@/lib/fechas";
import { estadoClave } from "@/lib/ia";
import { plural } from "@/lib/formato";
import { Alerta, Avatar, Icono, Insignia, NivelChip, SemaforoChip, tonoDe, VolverA } from "./ui";
import { BotonEnviar } from "./BotonEnviar";
import { FormEvaluacion } from "./FormEvaluacion";
import { cancelarPractica, marcarNoPresentado } from "@/app/acciones/agenda";

export async function DetallePractica({
  db,
  practica: p,
  rol,
  ruta,
  volverTrasGuardar,
  editar,
}: {
  db: BaseDatos;
  practica: Practica;
  rol: "profesor" | "secretaria";
  ruta: string;
  volverTrasGuardar: string;
  editar: boolean;
}) {
  const a = R.alumnoPorId(db, p.alumnoId)!;
  const prof = R.profesorPorId(db, p.profesorId)!;
  const coche = db.coches.find((c) => c.id === p.cocheId);
  const empezada = inicioPractica(p.fecha, p.inicio) <= new Date();
  const evaluacion = db.evaluaciones.find((e) => e.practicaId === p.id);
  const previas = R.evaluacionesDe(db, a.id).filter((e) => e.practicaId !== p.id && e.fecha <= p.fecha);
  const previa = previas.at(-1);
  const clave = await estadoClave();
  const semaforo = R.semaforoDe(db, a.id);
  const enlaceAlumno = rol === "secretaria" ? `/secretaria/alumnos/${a.id}` : `/profesor/alumnos/${a.id}`;
  const oferta = db.ofertas.find((o) => o.practicaNuevaId === p.id);

  const tonoEstado = { reservada: "faro", realizada: "oscuro", no_presentado: "rojo", cancelada: "neutro", cancelada_tarde: "ambar" } as const;
  const mostrarFormulario = (p.estado === "reservada" && empezada) || (p.estado === "realizada" && editar);

  return (
    <div className="flex flex-col gap-5">
      <section className="tarjeta p-4">
        <div className="flex items-center gap-3">
          <Avatar texto={R.iniciales(a)} tono={tonoDe(a.id)} tamano="lg" />
          <div className="min-w-0 flex-1">
            <Link href={enlaceAlumno} className="block truncate text-lg font-bold hover:underline">{R.nombreCompleto(a)}</Link>
            <p className="text-sm text-gris">
              {mayus(fechaLarga(p.fecha))} · {p.inicio}–{horaFin(p.inicio)}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Insignia tono={tonoEstado[p.estado]}>{p.estado === "reservada" && empezada ? "Sin cerrar" : ESTADOS_PRACTICA[p.estado]}</Insignia>
          <SemaforoChip valor={semaforo} />
          {p.sinSaldo && <Insignia tono="rojo">Dada sin saldo</Insignia>}
          {p.origen === "caza_huecos" && <Insignia tono="faro">Hueco rellenado</Insignia>}
          {p.estado === "reservada" && !empezada && <Insignia tono={p.confirmada ? "verde" : "neutro"}>{p.confirmada ? "Confirmada por el alumno" : "Sin confirmar"}</Insignia>}
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-gris">Profesor</dt>
            <dd className="font-semibold">{prof.nombre}</dd>
          </div>
          <div>
            <dt className="text-gris">Coche</dt>
            <dd className="font-semibold">{coche ? `${coche.modelo} ${coche.matricula}` : "—"}{coche?.esReserva && " (reserva)"}</dd>
          </div>
          <div>
            <dt className="text-gris">Prácticas hechas</dt>
            <dd className="cifra font-semibold">{R.monedero(db, a.id).realizadas}</dd>
          </div>
          <div>
            <dt className="text-gris">Le quedan</dt>
            <dd className="cifra font-semibold">{plural(R.saldo(db, a.id), "práctica")}</dd>
          </div>
        </dl>
        {oferta && (
          <p className="mt-3 text-sm text-gris">Cogida por el caza-huecos el {fechaHora(oferta.cogidaEl!)}.</p>
        )}
      </section>

      {previa && p.estado === "reservada" && (
        <section className="rounded-xl bg-hundido/70 p-4 text-sm">
          <p className="font-semibold">La práctica anterior ({fechaLarga(previa.fecha)})</p>
          <p className="mt-1 text-gris">{previa.resumen}</p>
          {R.maniobrasQueFaltan(previa.niveles).length > 0 && (
            <p className="mt-2">
              <span className="text-gris">Pendiente: </span>
              {R.maniobrasQueFaltan(previa.niveles).map((m) => m.nombre.toLowerCase()).join(", ")}
            </p>
          )}
        </section>
      )}

      {/* Futura */}
      {p.estado === "reservada" && !empezada && (
        <section className="tarjeta p-4">
          <p className="text-sm text-gris">
            Empieza dentro de {Math.max(1, Math.round(horasHasta(p.fecha, p.inicio)))} horas. La asistencia y la evaluación se rellenan al terminar.
          </p>
          {rol === "secretaria" && (
            <form action={cancelarPractica} className="mt-4 flex flex-wrap gap-2">
              <VolverA ruta={ruta} />
              <input type="hidden" name="practicaId" value={p.id} />
              <BotonEnviar name="devolver" value="si" className="btn-secundario" confirmar="¿Cancelar y devolver la práctica al monedero? Después podrás avisar del hueco a la lista de espera desde «Hoy».">
                Cancelar y devolver
              </BotonEnviar>
              <BotonEnviar name="devolver" value="no" className="btn-peligro" confirmar="¿Cancelar descontando la práctica (como una cancelación tardía)?">
                Cancelar sin devolver
              </BotonEnviar>
            </form>
          )}
        </section>
      )}

      {/* Sin cerrar: asistencia */}
      {p.estado === "reservada" && empezada && (
        <section className="tarjeta p-4">
          <h2 className="text-base font-bold">¿Vino {a.nombre}?</h2>
          <p className="ayuda mt-0.5">Si vino, rellena la evaluación de abajo y guarda. Si no, márcalo: la práctica se descuenta.</p>
          <form action={marcarNoPresentado} className="mt-3">
            <VolverA ruta={volverTrasGuardar} />
            <input type="hidden" name="practicaId" value={p.id} />
            <BotonEnviar className="btn-peligro w-full sm:w-auto" confirmar={`¿Marcar que ${a.nombre} no se presentó? Se le descuenta la práctica.`}>
              <Icono nombre="person_off" /> No se presentó
            </BotonEnviar>
          </form>
        </section>
      )}

      {mostrarFormulario && (
        <FormEvaluacion
          practicaId={p.id}
          alumnoNombre={a.nombre}
          niveles={evaluacion?.niveles ?? previa?.niveles ?? R.nivelesVacios()}
          previaSinGrave={previa ? !previa.falloGrave : null}
          teoricoAprobado={!!a.teorico.aprobadoEl}
          existente={evaluacion ? { falloGrave: evaluacion.falloGrave, resumen: evaluacion.resumen, mensajeAlumno: evaluacion.mensajeAlumno, notasDictadas: evaluacion.notasDictadas, conIA: evaluacion.conIA } : undefined}
          iaConfigurada={clave.configurada}
          modelo={db.ajustes.modeloIA}
          volver={volverTrasGuardar}
        />
      )}

      {p.estado === "realizada" && evaluacion && !editar && (
        <section className="tarjeta p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-bold">Evaluación</h2>
            <Link href={`${ruta}?editar=1`} className="btn-texto">
              <Icono nombre="edit" className="!text-[18px]" /> Editar
            </Link>
          </div>
          <p className="mt-2 font-semibold">{evaluacion.resumen}</p>
          {evaluacion.falloGrave && <div className="mt-3"><Alerta tono="rojo" icono="warning" titulo="Fallo grave en esta práctica" /></div>}
          <ul className="mt-3 divide-y divide-linea">
            {MANIOBRAS.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2 text-[0.9375rem]">
                {m.nombre}
                <NivelChip nivel={evaluacion.niveles[m.id]} />
              </li>
            ))}
          </ul>
          {evaluacion.mensajeAlumno && (
            <div className="mt-3 rounded-lg bg-faro-50 p-3 text-sm text-faro-800">
              <p className="font-semibold">Mensaje para {a.nombre}</p>
              <p className="mt-1">{evaluacion.mensajeAlumno}</p>
            </div>
          )}
          {evaluacion.notasDictadas && (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer font-semibold text-gris">Notas dictadas</summary>
              <p className="mt-1 italic text-gris">«{evaluacion.notasDictadas}»</p>
            </details>
          )}
          {evaluacion.conIA && <p className="mt-3 text-xs text-gris">Evaluación preparada con IA y revisada por el profesor.</p>}
        </section>
      )}

      {p.estado === "no_presentado" && <Alerta tono="rojo" icono="person_off" titulo={`${a.nombre} no se presentó`}>La práctica se descontó de su monedero.</Alerta>}
      {p.estado === "cancelada" && <Alerta tono="neutro" icono="event_busy" titulo="Cancelada a tiempo">{p.canceladaEl && `El ${fechaHora(p.canceladaEl)}. `}La práctica volvió al monedero y el hueco quedó libre para avisar a la lista de espera.</Alerta>}
      {p.estado === "cancelada_tarde" && <Alerta tono="ambar" icono="event_busy" titulo="Cancelada con menos de 24 horas">{p.canceladaEl && `El ${fechaHora(p.canceladaEl)}. `}La práctica se descontó del monedero.</Alerta>}
    </div>
  );
}
