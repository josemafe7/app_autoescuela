import Link from "next/link";
import { leer } from "@/lib/db";
import { exigirSecretaria } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { fechaCorta, fechaLarga, hoy, mayus, sumarDias } from "@/lib/fechas";
import { decimal, plural } from "@/lib/formato";
import { Cabecera, Icono, Insignia, Seccion, Vacio, VolverA } from "@/components/ui";
import { BotonEnviar } from "@/components/BotonEnviar";
import { crearConvocatoria } from "@/app/acciones/examenes";

export default async function Examenes() {
  await exigirSecretaria();
  const db = await leer();
  const h = hoy();
  const cola = R.colaExamen(db);
  const est = R.estimarExamen(db, 1);
  const convs = [...db.convocatorias].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const siguienteFecha = convs.length ? sumarDias(convs[0].fecha, est.intervalo) : sumarDias(h, 14);
  const ruta = "/secretaria/examenes";

  return (
    <>
      <Cabecera
        titulo="Cola de examen práctico"
        subtitulo={`Entran los alumnos en verde, por la fecha en que se pusieron en verde. Cupo medio de las últimas convocatorias: ${decimal(est.cupoMedio)} plazas, una cada ${est.intervalo} días.`}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-8">
          <Seccion titulo={`En la cola · ${plural(cola.enCola.length, "alumno")}`}>
            {cola.enCola.length === 0 ? (
              <Vacio titulo="Nadie en la cola">Los alumnos entran cuando su profesor les pone en verde.</Vacio>
            ) : (
              <div className="tarjeta overflow-x-auto">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th className="pl-5 text-right">Puesto</th>
                      <th>Alumno</th>
                      <th>En verde desde</th>
                      <th>Requisitos</th>
                      <th className="pr-5">Fecha aproximada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cola.enCola.map((a, i) => {
                      const e = R.estimarExamen(db, i + 1);
                      // Requisitos comprobados para su fecha aproximada (el teórico puede caducar antes).
                      const req = R.requisitosExamen(db, a, e.fecha);
                      const prof = R.profesorPorId(db, a.profesorId);
                      return (
                        <tr key={a.id}>
                          <td className="cifra pl-5 text-right text-lg font-semibold text-faro-600">{i + 1}</td>
                          <td>
                            <Link href={`/secretaria/alumnos/${a.id}`} className="font-semibold hover:underline">{R.nombreCompleto(a)}</Link>
                            <span className="block text-[0.8125rem] text-gris">
                              Con {prof?.nombre}
                              {a.avisoRetroceso && <> · <span className="text-ambar-800">ha bajado de verde</span></>}
                            </span>
                          </td>
                          <td className="cifra whitespace-nowrap">{fechaCorta(a.verdeDesde!)}</td>
                          <td>
                            <div className="flex flex-wrap gap-1">
                              <Req ok={req.convocatorias} texto="Convocatorias" />
                              <Req ok={req.teorico} texto="Teórico" />
                              <Req ok={req.derecho} texto="Derecho" />
                            </div>
                          </td>
                          <td className="cifra whitespace-nowrap pr-5">{fechaCorta(e.fecha)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="border-t border-linea px-5 py-3 text-sm text-gris">
                  Derecho = derecho de examen práctico pagado ({db.tarifas.find((t) => t.tipo === "examen")!.precio} € por intento). Teórico = aprobado en vigor (2 años) en la fecha aproximada. Al crear una convocatoria, la app propone solo a quien cumple los tres.
                </p>
              </div>
            )}
          </Seccion>

          {cola.conFecha.length > 0 && (
            <Seccion titulo="Con fecha de examen">
              <ul className="tarjeta divide-y divide-linea">
                {cola.conFecha.map(({ alumno, convocatoria }) => (
                  <li key={alumno.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <Link href={`/secretaria/alumnos/${alumno.id}`} className="font-semibold hover:underline">{R.nombreCompleto(alumno)}</Link>
                    <Link href={`/secretaria/examenes/${convocatoria.id}`} className="text-sm text-gris hover:text-tinta">{mayus(fechaLarga(convocatoria.fecha))}</Link>
                  </li>
                ))}
              </ul>
            </Seccion>
          )}

          {cola.tasaPendiente.length > 0 && (
            <Seccion titulo="Fuera de la cola: tasa pendiente">
              <ul className="tarjeta divide-y divide-linea">
                {cola.tasaPendiente.map((a) => (
                  <li key={a.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      <Link href={`/secretaria/alumnos/${a.id}`} className="font-semibold hover:underline">{R.nombreCompleto(a)}</Link>
                      <span className="block text-sm text-gris">Convocatorias agotadas. Al registrar la tasa nueva vuelve con su fecha de verde ({fechaCorta(a.verdeDesde!)}).</span>
                    </span>
                    <Link href={`/secretaria/alumnos/${a.id}#pagos`} className="btn-secundario btn-sm shrink-0">Registrar tasa</Link>
                  </li>
                ))}
              </ul>
            </Seccion>
          )}
        </div>

        <aside className="flex flex-col gap-8">
          <Seccion titulo="Nueva convocatoria">
            <form action={crearConvocatoria} className="tarjeta flex flex-col gap-3 p-4">
              <VolverA ruta={ruta} />
              <p className="ayuda">Cuando Tráfico os asigne fecha, apúntala con el cupo de alumnos. La app propondrá a quién presentar.</p>
              <div className="grid grid-cols-[1fr_96px] gap-3">
                <div>
                  <label htmlFor="fecha" className="etiqueta">Fecha</label>
                  <input id="fecha" name="fecha" type="date" min={h} defaultValue={siguienteFecha < h ? sumarDias(h, 14) : siguienteFecha} className="campo" required />
                </div>
                <div>
                  <label htmlFor="cupo" className="etiqueta">Cupo</label>
                  <input id="cupo" name="cupo" type="number" min={1} max={20} defaultValue={Math.round(est.cupoMedio)} className="campo cifra" required />
                </div>
              </div>
              <BotonEnviar className="btn-primario">Crear y ver propuesta</BotonEnviar>
            </form>
          </Seccion>

          <Seccion titulo="Convocatorias">
            <ul className="tarjeta divide-y divide-linea">
              {convs.map((c) => {
                const aptos = c.plazas.filter((p) => p.resultado === "apto").length;
                const pendientes = c.confirmada && c.fecha <= h && c.plazas.some((p) => !p.resultado);
                return (
                  <li key={c.id}>
                    <Link href={`/secretaria/examenes/${c.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-fondo">
                      <span>
                        <span className="block font-semibold">{mayus(fechaLarga(c.fecha))}</span>
                        <span className="block text-sm text-gris">
                          {c.confirmada ? `${plural(c.plazas.length, "alumno")} de ${c.cupo}` : `Cupo ${c.cupo}`}
                          {c.fecha < h && c.confirmada && !pendientes && ` · ${aptos} ${aptos === 1 ? "apto" : "aptos"}`}
                        </span>
                      </span>
                      {!c.confirmada ? (
                        <Insignia tono="faro">Por confirmar</Insignia>
                      ) : pendientes ? (
                        <Insignia tono="ambar">Faltan resultados</Insignia>
                      ) : c.fecha >= h ? (
                        <Insignia tono="verde">Confirmada</Insignia>
                      ) : (
                        <Icono nombre="chevron_right" className="text-tenue" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Seccion>
        </aside>
      </div>
    </>
  );
}

function Req({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <Insignia tono={ok ? "verde" : "rojo"}>
      <Icono nombre={ok ? "check" : "close"} className="!text-[14px]" />
      {texto}
    </Insignia>
  );
}

