import { leer } from "@/lib/db";
import { exigirSecretaria } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { fechaCorta, fechaLarga, hoy, mayus, sumarDias } from "@/lib/fechas";
import { plural } from "@/lib/formato";
import { Cabecera, Icono, Insignia, Seccion, Vacio, VolverA } from "@/components/ui";
import { BotonEnviar } from "@/components/BotonEnviar";
import { borrarIncidencia, crearIncidencia } from "@/app/acciones/gestion";

export default async function Coches() {
  await exigirSecretaria();
  const db = await leer();
  const h = hoy();
  const ruta = "/secretaria/coches";
  const proximas = db.incidencias.filter((i) => i.hasta >= h).sort((a, b) => a.desde.localeCompare(b.desde));
  const pasadas = db.incidencias.filter((i) => i.hasta < h).sort((a, b) => b.desde.localeCompare(a.desde));
  const reserva = R.cocheReserva(db);
  const examenes = db.convocatorias.filter((c) => c.confirmada && c.fecha >= h).sort((a, b) => a.fecha.localeCompare(b.fecha));

  // Uso del coche de reserva en los próximos 14 días
  const usosReserva = Array.from({ length: 15 }, (_, i) => sumarDias(h, i))
    .map((fecha) => {
      const sustituye = db.profesores.filter((p) => R.cocheDelDia(db, p.id, fecha).sustitucion);
      const examen = examenes.find((c) => c.fecha === fecha);
      return { fecha, sustituye, examen };
    })
    .filter((u) => u.sustituye.length || u.examen);

  return (
    <>
      <Cabecera titulo="Coches" subtitulo="Cada profesor sale con su coche. El de reserva cubre talleres, ITV y el día del examen." />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-8">
          <Seccion titulo="La flota">
            <ul className="grid gap-3 sm:grid-cols-2">
              {db.coches.map((c) => {
                const prof = db.profesores.find((p) => p.cocheId === c.id);
                const parado = R.incidenciaEn(db, c.id, h);
                const n = db.practicas.filter((p) => p.cocheId === c.id && p.estado === "reservada" && p.fecha >= h).length;
                return (
                  <li key={c.id} className="tarjeta p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-lg font-bold">{c.modelo}</p>
                        <p className="cifra text-gris">{c.matricula} · manual, doble mando</p>
                      </div>
                      {parado ? (
                        <Insignia tono="rojo">{parado.tipo === "itv" ? "En la ITV" : "En el taller"}</Insignia>
                      ) : c.esReserva ? (
                        <Insignia tono="faro">Reserva</Insignia>
                      ) : (
                        <Insignia tono="verde">Disponible</Insignia>
                      )}
                    </div>
                    <p className="mt-3 text-sm">
                      {prof ? <>Coche de <span className="font-semibold">{prof.nombre}</span></> : "Sin profesor fijo"}
                      <span className="text-gris"> · {plural(n, "práctica reservada", "prácticas reservadas")}</span>
                    </p>
                  </li>
                );
              })}
            </ul>
          </Seccion>

          <Seccion titulo={`Coche de reserva${reserva ? ` (${reserva.matricula})` : ""}: próximos 14 días`}>
            {usosReserva.length === 0 ? (
              <Vacio icono="directions_car" titulo="Libre todos los días" />
            ) : (
              <ul className="tarjeta divide-y divide-linea">
                {usosReserva.map((u) => (
                  <li key={u.fecha} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <span className="font-semibold">{mayus(fechaLarga(u.fecha))}</span>
                    <span className="flex flex-wrap gap-1.5">
                      {u.sustituye.map((p) => (
                        <Insignia key={p.id} tono="ambar">Sustituye el coche de {p.nombre}</Insignia>
                      ))}
                      {u.examen && <Insignia tono="faro">Examen práctico ({plural(u.examen.plazas.length, "alumno")})</Insignia>}
                      {u.sustituye.length > 0 && u.examen && <Insignia tono="rojo">¡Coinciden!</Insignia>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Seccion>

          <Seccion titulo="Talleres e ITV">
            {proximas.length === 0 && pasadas.length === 0 ? (
              <Vacio titulo="Sin incidencias" />
            ) : (
              <ul className="tarjeta divide-y divide-linea">
                {[...proximas, ...pasadas.slice(0, 5)].map((i) => {
                  const c = db.coches.find((x) => x.id === i.cocheId)!;
                  const pasada = i.hasta < h;
                  return (
                    <li key={i.id} className={`flex items-center gap-3 px-4 py-3 ${pasada ? "text-gris" : ""}`}>
                      <Icono nombre={i.tipo === "itv" ? "fact_check" : "build"} className="text-gris" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                          {c.modelo} {c.matricula} · {i.tipo === "itv" ? "ITV" : "Taller"}
                        </p>
                        <p className="text-sm text-gris">
                          {i.desde === i.hasta ? fechaCorta(i.desde) : `Del ${fechaCorta(i.desde)} al ${fechaCorta(i.hasta)}`}
                          {i.nota && ` · ${i.nota}`}
                        </p>
                      </div>
                      {!pasada && (
                        <form action={borrarIncidencia}>
                          <VolverA ruta={ruta} />
                          <input type="hidden" name="incidenciaId" value={i.id} />
                          <BotonEnviar className="btn-secundario btn-sm" confirmar="¿Borrar esta incidencia? Las prácticas vuelven a su coche habitual.">Borrar</BotonEnviar>
                        </form>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Seccion>
        </div>

        <aside>
          <Seccion titulo="Apuntar taller o ITV">
            <form action={crearIncidencia} className="tarjeta flex flex-col gap-3 p-4">
              <VolverA ruta={ruta} />
              <div>
                <label htmlFor="cocheId" className="etiqueta">Coche</label>
                <select id="cocheId" name="cocheId" className="campo" required defaultValue="">
                  <option value="" disabled>Elige…</option>
                  {db.coches.map((c) => (
                    <option key={c.id} value={c.id}>{c.modelo} {c.matricula}{c.esReserva ? " (reserva)" : ""}</option>
                  ))}
                </select>
              </div>
              <fieldset>
                <legend className="etiqueta">Motivo</legend>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-hundido p-1">
                  {[["taller", "Taller"], ["itv", "ITV"]].map(([v, t]) => (
                    <label key={v} className="flex min-h-[36px] cursor-pointer items-center justify-center rounded-md text-sm font-semibold text-gris has-[:checked]:bg-superficie has-[:checked]:text-tinta has-[:checked]:ring-1 has-[:checked]:ring-linea">
                      <input type="radio" name="tipo" value={v} defaultChecked={v === "taller"} className="sr-only" />
                      {t}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="desde" className="etiqueta">Desde</label>
                  <input id="desde" name="desde" type="date" defaultValue={h} className="campo" required />
                </div>
                <div>
                  <label htmlFor="hasta" className="etiqueta">Hasta</label>
                  <input id="hasta" name="hasta" type="date" defaultValue={h} className="campo" />
                </div>
              </div>
              <div>
                <label htmlFor="nota" className="etiqueta">Nota</label>
                <input id="nota" name="nota" className="campo" placeholder="Cambio de aceite, pastillas…" />
              </div>
              <p className="ayuda">Las prácticas de esos días pasan solas al coche de reserva.</p>
              <BotonEnviar>Guardar</BotonEnviar>
            </form>
          </Seccion>
        </aside>
      </div>
    </>
  );
}
