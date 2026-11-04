import Link from "next/link";
import { leer } from "@/lib/db";
import { exigirSecretaria } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { FORMAS_PAGO } from "@/lib/tipos";
import { fechaCorta, fechaHora } from "@/lib/fechas";
import { eurCorto } from "@/lib/formato";
import { Cabecera, Icono, Insignia, Seccion, Vacio, VolverA } from "@/components/ui";
import { BotonEnviar } from "@/components/BotonEnviar";
import { FormPago } from "@/components/FormPago";
import { cobrarPendiente, descartarSolicitud } from "@/app/acciones/pagos";

export default async function Cobros({ searchParams }: { searchParams: Promise<{ solicitud?: string }> }) {
  await exigirSecretaria();
  const sp = await searchParams;
  const db = await leer();
  const solicitudes = R.solicitudesPendientes(db);
  const elegida = solicitudes.find((s) => s.id === sp.solicitud);
  const deudas = db.alumnos
    .flatMap((a) => R.deudasDe(db, a.id).map((d) => ({ ...d, alumno: a })))
    .sort((x, y) => x.cargo.fecha.localeCompare(y.cargo.fecha));
  const total = R.redondear(deudas.reduce((s, d) => s + d.pendiente, 0));
  const ultimos = [...db.pagos].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 10);
  const alumnosActivos = db.alumnos.filter((a) => a.fase !== "aprobado").sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const ruta = "/secretaria/cobros";

  return (
    <>
      <Cabecera
        titulo="Cobros y deudas"
        subtitulo={`${eurCorto(total)} por cobrar en ${deudas.length} ${deudas.length === 1 ? "cargo" : "cargos"} · ${solicitudes.length} ${solicitudes.length === 1 ? "recarga pedida" : "recargas pedidas"}. Las facturas se hacen en vuestro programa homologado.`}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex min-w-0 flex-col gap-8">
          <Seccion titulo="Recargas pedidas desde el portal">
            {solicitudes.length === 0 ? (
              <Vacio icono="notifications_off" titulo="Ninguna pendiente">Cuando un alumno pulse «Solicitar recarga» aparecerá aquí.</Vacio>
            ) : (
              <ul className="tarjeta divide-y divide-linea">
                {solicitudes.map((s) => {
                  const a = R.alumnoPorId(db, s.alumnoId)!;
                  const t = db.tarifas.find((x) => x.id === s.tarifaId);
                  return (
                    <li key={s.id} className={`flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center ${s.id === elegida?.id ? "bg-faro-50/60" : ""}`}>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                          <Link href={`/secretaria/alumnos/${a.id}`} className="hover:underline">{R.nombreCompleto(a)}</Link>
                          <span className="font-normal text-gris"> pide {t?.concepto.toLowerCase()} ({t ? eurCorto(t.precio) : "—"})</span>
                        </p>
                        <p className="text-sm text-gris">
                          {fechaHora(s.fecha)} · le {R.saldo(db, a.id) === 1 ? "queda 1 práctica" : `quedan ${R.saldo(db, a.id)} prácticas`}
                          {s.mensaje && <> · <em>«{s.mensaje}»</em></>}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`${ruta}?solicitud=${s.id}#registrar`} className="btn-secundario btn-sm">Registrar pago</Link>
                        <form action={descartarSolicitud}>
                          <VolverA ruta={ruta} />
                          <input type="hidden" name="solicitudId" value={s.id} />
                          <BotonEnviar className="btn-secundario btn-sm" confirmar="¿Archivar la solicitud sin registrar pago?">Archivar</BotonEnviar>
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Seccion>

          <Seccion titulo="Lo que se debe">
            {deudas.length === 0 ? (
              <Vacio icono="savings" titulo="Nadie debe nada" />
            ) : (
              <div className="tarjeta overflow-x-auto">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th className="pl-5">Alumno</th>
                      <th>Motivo</th>
                      <th>Desde</th>
                      <th className="text-right">Pendiente</th>
                      <th className="pr-5 text-right">Cobrar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deudas.map((d) => (
                      <tr key={d.cargo.id}>
                        <td className="pl-5">
                          <Link href={`/secretaria/alumnos/${d.alumno.id}#pagos`} className="font-semibold hover:underline">{R.nombreCompleto(d.alumno)}</Link>
                        </td>
                        <td>
                          <Insignia tono={d.motivo === "sin_saldo" ? "rojo" : "ambar"}>{R.MOTIVOS_DEUDA[d.motivo]}</Insignia>
                          <span className="block text-[0.8125rem] text-gris">{d.cargo.concepto}</span>
                        </td>
                        <td className="cifra whitespace-nowrap text-gris">{fechaCorta(d.cargo.fecha)}</td>
                        <td className="cifra text-right font-semibold">{eurCorto(d.pendiente)}</td>
                        <td className="pr-5">
                          <form action={cobrarPendiente} className="flex justify-end gap-2">
                            <VolverA ruta={ruta} />
                            <input type="hidden" name="cargoId" value={d.cargo.id} />
                            <label htmlFor={`f-${d.cargo.id}`} className="sr-only">Forma de pago</label>
                            <select id={`f-${d.cargo.id}`} name="forma" defaultValue="bizum" className="campo min-h-[32px] w-auto py-1 text-sm">
                              {Object.entries(FORMAS_PAGO).map(([v, t]) => (
                                <option key={v} value={v}>{t}</option>
                              ))}
                            </select>
                            <BotonEnviar className="btn-secundario btn-sm">Cobrar</BotonEnviar>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="border-t border-linea py-3 pl-5 font-semibold">Total</td>
                      <td className="cifra border-t border-linea py-3 text-right font-semibold">{eurCorto(total)}</td>
                      <td className="border-t border-linea" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Seccion>

          <Seccion titulo="Últimos pagos registrados">
            <ul className="tarjeta divide-y divide-linea">
              {ultimos.map((p) => {
                const a = R.alumnoPorId(db, p.alumnoId)!;
                const c = db.cargos.find((x) => x.id === p.cargoId);
                return (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[0.9375rem]">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{R.nombreCompleto(a)}</span>
                      <span className="block text-sm text-gris">
                        {c?.concepto} · {FORMAS_PAGO[p.forma]} · {fechaCorta(p.fecha)}
                        {c?.plazos === 2 && ` · ${p.plazo}.º plazo`}
                      </span>
                    </span>
                    <span className="cifra shrink-0 font-semibold">{eurCorto(p.importe)}</span>
                  </li>
                );
              })}
            </ul>
          </Seccion>
        </div>

        <aside id="registrar" className="scroll-mt-6">
          <Seccion titulo={elegida ? "Registrar el pago de la recarga" : "Registrar un pago"}>
            <div className="tarjeta p-5">
              {elegida && (
                <p className="mb-4 flex items-center gap-2 rounded-lg bg-faro-50 px-3 py-2 text-sm text-faro-800">
                  <Icono nombre="notifications" /> Solicitud de {R.alumnoPorId(db, elegida.alumnoId)!.nombre}: se marcará como atendida.
                </p>
              )}
              <FormPago
                key={elegida?.id ?? "nuevo"}
                tarifas={db.tarifas}
                alumnos={alumnosActivos}
                alumnoId={elegida?.alumnoId}
                tarifaId={elegida?.tarifaId}
                solicitudId={elegida?.id}
                volver={ruta}
              />
            </div>
          </Seccion>
        </aside>
      </div>
    </>
  );
}
