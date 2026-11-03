import Link from "next/link";
import { leer } from "@/lib/db";
import { exigirAlumno } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { ESTADOS_PRACTICA, HORAS_CANCELACION } from "@/lib/tipos";
import { fechaLarga, horaFin, horasHasta, mayus, relativo, yaTerminada } from "@/lib/fechas";
import { Alerta, Icono, Insignia, Vacio, VolverA } from "@/components/ui";
import { BotonEnviar } from "@/components/BotonEnviar";
import { cancelarPractica, confirmarPractica } from "@/app/acciones/agenda";

export default async function MisPracticas() {
  const id = await exigirAlumno();
  const db = await leer();
  const a = R.alumnoPorId(db, id)!;
  const prof = R.profesorPorId(db, a.profesorId);
  const proximas = R.proximasPracticas(db, a.id);
  const pasadas = db.practicas
    .filter((p) => p.alumnoId === a.id && !proximas.includes(p) && (p.estado !== "reservada" || yaTerminada(p.fecha, p.inicio)))
    .sort((x, y) => (y.fecha + y.inicio).localeCompare(x.fecha + x.inicio));
  const ruta = "/alumno/practicas";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Mis prácticas</h1>
        <p className="text-sm text-gris">Cancela con más de {HORAS_CANCELACION} horas y la práctica vuelve a tu monedero. Con menos, se descuenta.</p>
      </div>

      <section>
        <h2 className="mb-2 text-base font-bold">Próximas</h2>
        {proximas.length === 0 ? (
          <Vacio icono="event" titulo="No tienes prácticas reservadas">
            {a.fase === "practicas" && <Link href="/alumno/reservar" className="enlace">Reservar una práctica</Link>}
          </Vacio>
        ) : (
          <ul className="flex flex-col gap-2">
            {proximas.map((p) => {
              const horas = horasHasta(p.fecha, p.inicio);
              const aTiempo = horas > HORAS_CANCELACION;
              return (
                <li key={p.id} className="tarjeta p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{mayus(relativo(p.fecha))}, {p.inicio}–{horaFin(p.inicio)}</p>
                      <p className="text-sm text-gris">
                        {mayus(fechaLarga(p.fecha))} · con {R.profesorPorId(db, p.profesorId)?.nombre ?? prof?.nombre}
                      </p>
                    </div>
                    <Insignia tono={p.confirmada ? "verde" : "neutro"}>{p.confirmada ? "Confirmada" : "Sin confirmar"}</Insignia>
                  </div>
                  {p.origen === "caza_huecos" && <p className="mt-2 text-sm text-faro-800">La cogiste de la lista de espera.</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!p.confirmada && horas <= 48 && (
                      <form action={confirmarPractica}>
                        <VolverA ruta={ruta} />
                        <input type="hidden" name="practicaId" value={p.id} />
                        <BotonEnviar className="btn-primario btn-sm">
                          <Icono nombre="check" className="!text-[18px]" /> Confirmo
                        </BotonEnviar>
                      </form>
                    )}
                    <form action={cancelarPractica}>
                      <VolverA ruta={ruta} />
                      <input type="hidden" name="practicaId" value={p.id} />
                      <BotonEnviar
                        className={aTiempo ? "btn-secundario btn-sm" : "btn-peligro btn-sm"}
                        confirmar={
                          aTiempo
                            ? "¿Cancelar esta práctica? Vuelve a tu monedero y la hora se ofrece a otro alumno."
                            : `Quedan menos de ${HORAS_CANCELACION} horas: si cancelas, la práctica se descuenta igualmente. ¿Cancelar?`
                        }
                      >
                        Cancelar
                      </BotonEnviar>
                    </form>
                    {!aTiempo && <span className="self-center text-xs text-rojo-800">Menos de {HORAS_CANCELACION} h: se descontaría</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold">Hechas</h2>
        {pasadas.length === 0 ? (
          <Vacio titulo="Aún no has hecho ninguna" />
        ) : (
          <ol className="flex flex-col gap-2">
            {pasadas.slice(0, 20).map((p) => {
              const ev = db.evaluaciones.find((e) => e.practicaId === p.id);
              const sinCerrar = p.estado === "reservada";
              return (
                <li key={p.id} className="tarjeta p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">
                      {mayus(fechaLarga(p.fecha))} <span className="font-normal text-gris">· {p.inicio}</span>
                    </p>
                    {p.estado !== "realizada" && (
                      <Insignia tono={p.estado === "no_presentado" ? "rojo" : p.estado === "cancelada_tarde" ? "ambar" : "neutro"}>
                        {sinCerrar ? "Pendiente de evaluar" : ESTADOS_PRACTICA[p.estado]}
                      </Insignia>
                    )}
                  </div>
                  {ev?.mensajeAlumno && <p className="mt-2 leading-relaxed">«{ev.mensajeAlumno}»</p>}
                  {ev?.falloGrave && <p className="mt-2 text-sm font-semibold text-rojo-600">Hubo un fallo grave en esta práctica.</p>}
                  {p.estado === "no_presentado" && <p className="mt-1 text-sm text-gris">No viniste: la práctica se descontó.</p>}
                  {p.estado === "cancelada" && <p className="mt-1 text-sm text-gris">Cancelada a tiempo: volvió a tu monedero.</p>}
                </li>
              );
            })}
          </ol>
        )}
      </section>
      {pasadas.some((p) => p.estado === "no_presentado") && (
        <Alerta tono="neutro" icono="info" titulo="Si no puedes venir, cancela con tiempo">
          Así no pierdes la práctica y otro compañero puede aprovechar la hora.
        </Alerta>
      )}
    </div>
  );
}
