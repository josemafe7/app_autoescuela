import Link from "next/link";
import { leer } from "@/lib/db";
import { exigirAlumno } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { DIAS_INACTIVIDAD_TEORICO } from "@/lib/tipos";
import { fechaCorta, fechaLarga, horaFin, mayus, relativo } from "@/lib/fechas";
import { decimal, eurCorto, plural } from "@/lib/formato";
import { Alerta, Icono, SemaforoChip, VolverA } from "@/components/ui";
import { BotonEnviar } from "@/components/BotonEnviar";
import { aceptarHueco, confirmarPractica } from "@/app/acciones/agenda";

export default async function InicioAlumno() {
  const id = await exigirAlumno();
  const db = await leer();
  const a = R.alumnoPorId(db, id)!;
  const prof = R.profesorPorId(db, a.profesorId);
  const m = R.monedero(db, a.id);
  const { disponibles: huecos, cogidas } = R.ofertasParaAlumno(db, a);
  const porConfirmar = R.practicasPorConfirmar(db, a.id);
  const proxima = R.proximasPracticas(db, a.id)[0];
  const deudas = R.deudasDe(db, a.id);
  const conv = R.convocatoriasDe(db, a.id);
  const ultima = R.evaluacionesDe(db, a.id).at(-1);
  const puesto = R.puestoEnCola(db, a.id);
  const plaza = R.plazaPendiente(db, a.id);
  const solicitud = db.solicitudes.find((s) => s.alumnoId === a.id && !s.atendida);
  const ruta = "/alumno";

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Hola, {a.nombre}</h1>

      {/* Huecos ofrecidos: lo más urgente */}
      {huecos.map((o) => {
        const abiertoATodos = R.estadoOferta(db, o) === "abierta_todos";
        return (
          <section key={o.id} className="aparecer rounded-2xl bg-faro-600 p-4 text-white">
            <p className="flex items-center gap-2 text-sm font-semibold text-white/85">
              <Icono nombre="bolt" lleno /> {abiertoATodos ? "Hueco libre de última hora" : "Ha quedado libre una práctica"}
            </p>
            <p className="mt-1 text-xl font-bold">
              {mayus(relativo(o.fecha))}, {o.inicio}–{horaFin(o.inicio)}
            </p>
            <p className="text-sm text-white/85">{mayus(fechaLarga(o.fecha))} con {prof?.nombre}. El primero que la acepta se la queda.</p>
            <form action={aceptarHueco} className="mt-3">
              <VolverA ruta={ruta} />
              <input type="hidden" name="ofertaId" value={o.id} />
              <BotonEnviar className="btn w-full bg-white text-faro-800 hover:bg-faro-50" pendiente="Reservando…">
                Quedármela
              </BotonEnviar>
            </form>
          </section>
        );
      })}
      {cogidas.map((o) => (
        <Alerta key={o.id} tono="neutro" icono="event_busy" titulo={`El hueco del ${fechaLarga(o.fecha)} a las ${o.inicio} ya está cogido`}>
          Otro alumno de la lista de espera fue más rápido. Te avisaremos del siguiente.
        </Alerta>
      ))}

      {/* Recordatorios con confirmar */}
      {porConfirmar.map((p) => (
        <section key={p.id} className="tarjeta border-faro-200 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-faro-800">
            <Icono nombre="notifications_active" /> Recordatorio
          </p>
          <p className="mt-1 text-lg font-bold">
            {mayus(relativo(p.fecha))} tienes práctica a las {p.inicio}
          </p>
          <p className="text-sm text-gris">Con {prof?.nombre}, salida desde la autoescuela. ¿Vienes?</p>
          <div className="mt-3 flex gap-2">
            <form action={confirmarPractica} className="flex-1">
              <VolverA ruta={ruta} />
              <input type="hidden" name="practicaId" value={p.id} />
              <BotonEnviar className="btn-primario w-full">
                <Icono nombre="check" /> Confirmo
              </BotonEnviar>
            </form>
            <Link href="/alumno/practicas" className="btn-secundario">No puedo</Link>
          </div>
        </section>
      ))}

      {conv.agotadas && (
        <Alerta tono="rojo" icono="block" titulo="Has agotado las 2 convocatorias de tu tasa">
          Para volver a la cola de examen hay que pagar una tasa nueva de la DGT ({eurCorto(db.tarifas.find((t) => t.tipo === "tasa")!.precio)}). No cobramos gestión. Pásate por la oficina o paga por Bizum.
        </Alerta>
      )}

      {/* Teórico */}
      {a.fase === "teorico" && (
        <section className="tarjeta p-4">
          <h2 className="text-base font-bold">Tu teórico</h2>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-hundido p-3">
              <dt className="text-xs text-gris">Test hechos</dt>
              <dd className="cifra text-xl font-semibold">{a.teorico.numTests}</dd>
            </div>
            <div className="rounded-lg bg-hundido p-3">
              <dt className="text-xs text-gris">Fallos (últ. 5)</dt>
              <dd className="cifra text-xl font-semibold">{decimal(a.teorico.mediaFallos)}</dd>
            </div>
            <div className="rounded-lg bg-hundido p-3">
              <dt className="text-xs text-gris">Último test</dt>
              <dd className="text-sm font-semibold leading-7">{a.teorico.ultimoTest ? mayus(relativo(a.teorico.ultimoTest)) : "—"}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-gris">
            {R.teoricoParado(a)
              ? `Llevas ${R.diasSinTest(a)} días sin hacer test. Un test al día y lo tendrás antes de lo que crees.`
              : a.teorico.mediaFallos !== null && a.teorico.mediaFallos <= 3
                ? "¡Vas muy bien! Con 3 fallos o menos se aprueba. Habla con secretaría para presentarte."
                : `Sigue así. Si pasas ${DIAS_INACTIVIDAD_TEORICO} días sin hacer test, te escribiremos para echarte una mano.`}
          </p>
          <p className="mt-2 text-sm text-gris">Cuando apruebes, entrarás en la cola para empezar las prácticas con coche.</p>
        </section>
      )}

      {a.fase === "espera_practicas" && (
        <section className="tarjeta p-4">
          <h2 className="text-base font-bold">Esperando para empezar con el coche</h2>
          <p className="mt-2">
            Estás en el <strong>puesto {R.colaPracticas(db).findIndex((x) => x.id === a.id) + 1}</strong> de la cola de prácticas, por fecha de aprobado del teórico ({fechaCorta(a.teorico.aprobadoEl!)}).
          </p>
          <p className="mt-2 text-sm text-gris">
            En cuanto te asignemos profesor podrás reservar desde aquí.{m.disponibles > 0 && ` Ya tienes ${plural(m.disponibles, "práctica")} pagada${m.disponibles === 1 ? "" : "s"} esperándote.`}
          </p>
        </section>
      )}

      {/* Monedero */}
      {(a.fase === "practicas" || a.fase === "espera_practicas") && (
        <section className="tarjeta p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-gris">Prácticas en tu monedero</p>
              <p className={`cifra text-[2.5rem] font-bold leading-none ${m.disponibles <= 1 ? "text-rojo-600" : ""}`}>{m.disponibles}</p>
              <p className="mt-1 text-sm text-gris">
                {m.realizadas} hechas{m.reservadas ? ` · ${plural(m.reservadas, "reservada")}` : ""}
              </p>
            </div>
            {a.fase === "practicas" && m.disponibles > 0 && (
              <Link href="/alumno/reservar" className="btn-primario">
                <Icono nombre="calendar_add_on" /> Reservar
              </Link>
            )}
          </div>
          {m.disponibles <= 1 && a.fase === "practicas" && (
            <div className="mt-3 flex flex-col gap-2 rounded-lg bg-faro-50 p-3 text-sm text-faro-800 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {m.disponibles === 1 ? "Te queda 1 práctica." : "No te quedan prácticas."}{" "}
                {solicitud ? "Ya has pedido una recarga: secretaría te dirá cómo pagar." : "Recarga tu bono para seguir reservando."}
              </span>
              {!solicitud && <Link href="/alumno/pagos#recarga" className="btn-oscuro btn-sm shrink-0">Solicitar recarga</Link>}
            </div>
          )}
          {deudas.length > 0 && (
            <p className="mt-3 text-sm text-gris">
              Tienes pendiente {eurCorto(R.totalDeuda(db, a.id))} ({deudas.map((d) => R.MOTIVOS_DEUDA[d.motivo].toLowerCase()).join(", ")}). <Link href="/alumno/pagos" className="enlace">Ver pagos</Link>
            </p>
          )}
        </section>
      )}

      {proxima && !porConfirmar.some((p) => p.id === proxima.id) && (
        <Link href="/alumno/practicas" className="tarjeta flex items-center gap-3 p-4">
          <Icono nombre="event" className="text-faro-600" />
          <span className="flex-1">
            <span className="block text-sm text-gris">Tu próxima práctica</span>
            <span className="block font-semibold">
              {mayus(relativo(proxima.fecha))}, {proxima.inicio} <span className="font-normal text-gris">· {fechaLarga(proxima.fecha)}</span>
            </span>
          </span>
          <Icono nombre="chevron_right" className="text-tenue" />
        </Link>
      )}

      {ultima?.mensajeAlumno && (
        <section className="rounded-2xl bg-hundido/70 p-4">
          <p className="text-sm text-gris">{prof?.nombre} te dejó una nota · {relativo(ultima.fecha)}</p>
          <p className="mt-1 leading-relaxed">«{ultima.mensajeAlumno}»</p>
        </section>
      )}

      {a.fase === "practicas" && (
        <Link href="/alumno/progreso" className="tarjeta flex items-center gap-3 p-4">
          <span className="flex-1">
            <span className="block text-sm text-gris">Tu camino al examen</span>
            <span className="mt-1 flex flex-wrap items-center gap-2">
              <SemaforoChip valor={R.semaforoDe(db, a.id)} />
              {plaza ? (
                <span className="font-semibold">Examen el {fechaLarga(plaza.fecha)}</span>
              ) : puesto ? (
                <span className="font-semibold">Puesto {puesto} en la cola · aprox. {fechaCorta(R.estimarExamen(db, puesto).fecha)}</span>
              ) : null}
            </span>
          </span>
          <Icono nombre="chevron_right" className="text-tenue" />
        </Link>
      )}

      {a.fase === "practicas" && !a.listaEspera && (
        <Link href="/alumno/espera" className="flex items-center gap-3 rounded-xl px-1 py-2 text-sm font-semibold text-gris hover:text-tinta">
          <Icono nombre="bolt" /> ¿Quieres prácticas antes? Apúntate a la lista de espera
        </Link>
      )}

      {a.fase === "aprobado" && (
        <section className="rounded-2xl bg-verde-50 p-5 text-verde-800">
          <p className="text-xl font-bold">¡Enhorabuena, ya tienes el carnet!</p>
          <p className="mt-1">Aprobaste el {a.aprobadoEl ? fechaLarga(a.aprobadoEl) : "práctico"}. Gracias por confiar en Autoescuela Faro. Si te ha gustado, cuéntaselo a tus amigos.</p>
        </section>
      )}
    </div>
  );
}
