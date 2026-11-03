import Link from "next/link";
import { leer } from "@/lib/db";
import { exigirAlumno } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { desdeISO, diaCorto, fechaCorta, fechaLarga, franjaDe, horaFin, hoy, mayus, relativo } from "@/lib/fechas";
import { plural } from "@/lib/formato";
import { Alerta, Icono, VolverA } from "@/components/ui";
import { BotonEnviar } from "@/components/BotonEnviar";
import { reservarComoAlumno } from "@/app/acciones/agenda";

export default async function Reservar({ searchParams }: { searchParams: Promise<{ fecha?: string }> }) {
  const id = await exigirAlumno();
  const sp = await searchParams;
  const db = await leer();
  const a = R.alumnoPorId(db, id)!;
  const puede = R.puedeReservar(db, a);
  const prof = R.profesorPorId(db, a.profesorId);
  const dias = R.diasReservables();
  const saldo = R.saldo(db, a.id);

  if (!puede.puede || !prof) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold">Reservar práctica</h1>
        <Alerta tono={saldo < 1 && a.fase === "practicas" ? "faro" : "neutro"} icono="info" titulo={puede.motivo ?? "Ahora no puedes reservar."}
          accion={saldo < 1 && a.fase === "practicas" ? <Link href="/alumno/pagos#recarga" className="btn-oscuro btn-sm">Solicitar recarga</Link> : undefined} />
      </div>
    );
  }

  const disponiblesPorDia = dias.map((d) => ({ fecha: d, bloques: R.bloquesPermitidos(db, prof.id, d) }));
  const elegido = disponiblesPorDia.find((d) => d.fecha === sp.fecha) ?? disponiblesPorDia.find((d) => d.bloques.length) ?? disponiblesPorDia[0];
  const misDelDia = db.practicas.filter((p) => p.alumnoId === a.id && p.fecha === elegido.fecha && p.estado === "reservada");
  const puesto = R.puestoEnCola(db, a.id);
  const est = puesto ? R.estimarExamen(db, puesto) : null;
  const plaza = R.plazaPendiente(db, a.id);
  const enVentana = est && elegido.fecha >= est.desdeVentana && elegido.fecha <= est.hastaVentana;
  const ruta = `/alumno/reservar?fecha=${elegido.fecha}`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold">Reservar práctica</h1>
        <p className="text-sm text-gris">
          Con {prof.nombre} · te {saldo === 1 ? "queda 1 práctica" : `quedan ${saldo} prácticas`} en el monedero
        </p>
      </div>

      {saldo === 1 && (
        <Alerta tono="faro" icono="account_balance_wallet" titulo="Te queda 1 práctica"
          accion={<Link href="/alumno/pagos#recarga" className="btn-oscuro btn-sm">Solicitar recarga</Link>}>
          Puedes reservarla ya; recarga para seguir reservando después.
        </Alerta>
      )}

      {(plaza || est) && (
        <p className="rounded-xl bg-verde-50 px-4 py-3 text-sm text-verde-800">
          <Icono nombre="tips_and_updates" className="mr-1" />
          {plaza
            ? `Tu examen es el ${fechaLarga(plaza.fecha)}. Te recomendamos 2 o 3 prácticas por semana hasta entonces.`
            : est!.desdeVentana <= hoy()
              ? `Tu examen aproximado es hacia el ${fechaLarga(est!.fecha)}: ya estás en las 4 semanas previas. Te recomendamos 2 o 3 prácticas por semana.`
              : `Tu examen aproximado es hacia el ${fechaLarga(est!.fecha)}. Concentra tus prácticas a partir del ${fechaCorta(est!.desdeVentana)} (4 semanas antes), 2 o 3 por semana, y no gastes en clases de mantenimiento.`}
        </p>
      )}

      {/* Días */}
      <nav aria-label="Elige día" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {disponiblesPorDia.map((d) => {
          const activo = d.fecha === elegido.fecha;
          const n = d.bloques.length;
          return (
            <Link
              key={d.fecha}
              href={`/alumno/reservar?fecha=${d.fecha}`}
              aria-current={activo ? "date" : undefined}
              className={`flex w-[60px] shrink-0 flex-col items-center rounded-xl py-2 ${
                activo ? "bg-tinta text-white" : n ? "bg-superficie ring-1 ring-linea" : "bg-hundido/50 text-tenue"
              }`}
            >
              <span className="text-xs font-semibold capitalize">{diaCorto(d.fecha)}</span>
              <span className="cifra text-xl font-bold">{desdeISO(d.fecha).getDate()}</span>
              <span className={`text-[0.6875rem] ${activo ? "text-white/75" : "text-gris"}`}>{n ? `${n} libre${n === 1 ? "" : "s"}` : "lleno"}</span>
            </Link>
          );
        })}
      </nav>

      <section>
        <h2 className="mb-1 text-base font-bold">{mayus(fechaLarga(elegido.fecha))}</h2>
        <p className="mb-3 text-sm text-gris">
          {mayus(relativo(elegido.fecha))}. Te enseñamos las horas pegadas a otras clases de {prof.nombre}, así no quedan huecos sueltos y hay sitio para todos.
        </p>
        {enVentana && <p className="mb-3 text-sm font-semibold text-verde-800">Este día está dentro de tus 4 semanas antes del examen.</p>}

        {misDelDia.length > 0 && (
          <ul className="mb-3 flex flex-col gap-1.5">
            {misDelDia.map((p) => (
              <li key={p.id} className="flex items-center gap-2 rounded-lg bg-faro-50 px-3 py-2 text-sm font-semibold text-faro-800">
                <Icono nombre="event_available" /> Ya tienes práctica a las {p.inicio}–{horaFin(p.inicio)}
              </li>
            ))}
          </ul>
        )}

        {elegido.bloques.length === 0 ? (
          <Alerta tono="neutro" icono="event_busy" titulo="No quedan horas este día"
            accion={<Link href="/alumno/espera" className="btn-secundario btn-sm">Lista de espera</Link>}>
            Prueba otro día o apúntate a la lista de espera: si alguien cancela, te avisamos.
          </Alerta>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {elegido.bloques.map((b) => (
              <li key={b}>
                <form action={reservarComoAlumno}>
                  <VolverA ruta={ruta} />
                  <input type="hidden" name="fecha" value={elegido.fecha} />
                  <input type="hidden" name="inicio" value={b} />
                  <BotonEnviar
                    className="btn-secundario h-auto w-full flex-col gap-0 py-3 hover:border-faro-500"
                    confirmar={`¿Reservar el ${fechaLarga(elegido.fecha)} a las ${b}? Si cancelas con menos de 24 horas, la práctica se descuenta.`}
                    pendiente="Reservando…"
                  >
                    <span className="cifra text-lg font-bold">{b}</span>
                    <span className="text-xs font-normal text-gris">hasta las {horaFin(b)} · {franjaDe(b) === "manana" ? "mañana" : "tarde"}</span>
                  </BotonEnviar>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/alumno/espera" className="tarjeta flex items-center gap-3 p-4">
        <Icono nombre="bolt" className="text-faro-600" />
        <span className="flex-1">
          <span className="block font-semibold">{a.listaEspera ? "Estás en la lista de espera" : "¿No te viene ninguna hora?"}</span>
          <span className="block text-sm text-gris">
            {a.listaEspera ? "Te avisaremos al momento si se libera una hora en tus días y franjas." : "Apúntate a la lista de espera y coge las horas que otros cancelan."}
          </span>
        </span>
        <Icono nombre="chevron_right" className="text-tenue" />
      </Link>
      <p className="text-center text-xs text-gris">Puedes reservar hasta {plural(14, "día")} vista. Prácticas de 45 minutos, salida desde la autoescuela.</p>
    </div>
  );
}
