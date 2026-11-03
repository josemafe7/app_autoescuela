import Link from "next/link";
import { notFound } from "next/navigation";
import { leer } from "@/lib/db";
import { exigirSecretaria } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { fechaLarga, hoy, mayus, relativo } from "@/lib/fechas";
import { plural } from "@/lib/formato";
import { Alerta, Cabecera, Icono, Insignia, Seccion, Vacio, Volver, VolverA } from "@/components/ui";
import { BotonEnviar } from "@/components/BotonEnviar";
import { confirmarConvocatoria, editarCupo, eliminarConvocatoria, registrarResultados } from "@/app/acciones/examenes";

export default async function Convocatoria({ params }: { params: Promise<{ id: string }> }) {
  await exigirSecretaria();
  const { id } = await params;
  const db = await leer();
  const c = db.convocatorias.find((x) => x.id === id);
  if (!c) notFound();
  const h = hoy();
  const ruta = `/secretaria/examenes/${c.id}`;
  const reserva = R.cocheReserva(db);

  return (
    <div className="max-w-4xl">
      <Cabecera
        antes={<Volver href="/secretaria/examenes">Cola de examen</Volver>}
        titulo={`Examen del ${fechaLarga(c.fecha)}`}
        subtitulo={`${mayus(relativo(c.fecha))} · cupo de ${plural(c.cupo, "plaza")}${reserva ? ` · coche de reserva ${reserva.modelo} ${reserva.matricula}` : ""}`}
      />

      {!c.confirmada ? <Propuesta db={db} c={c} ruta={ruta} /> : (
        <Seccion titulo={c.fecha <= h ? "Resultados" : "Alumnos convocados"}>
          {c.plazas.length === 0 ? (
            <Vacio titulo="Sin alumnos" />
          ) : (
            <form action={registrarResultados} className="flex flex-col gap-4">
              <VolverA ruta={ruta} />
              <input type="hidden" name="convocatoriaId" value={c.id} />
              <ul className="tarjeta divide-y divide-linea">
                {c.plazas.map((pl) => {
                  const a = R.alumnoPorId(db, pl.alumnoId)!;
                  const conv = R.convocatoriasDe(db, a.id);
                  return (
                    <li key={pl.alumnoId} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <Link href={`/secretaria/alumnos/${a.id}`} className="font-semibold hover:underline">{R.nombreCompleto(a)}</Link>
                        <p className="text-sm text-gris">
                          Con {R.profesorPorId(db, a.profesorId)?.nombre ?? "—"} ·{" "}
                          {pl.resultado ? (pl.resultado === "apto" ? "aprobó" : "suspendió") : `le ${conv.disponibles === 1 ? "queda 1 convocatoria" : `quedan ${conv.disponibles} convocatorias`}`}
                        </p>
                      </div>
                      {pl.resultado ? (
                        <Insignia tono={pl.resultado === "apto" ? "verde" : "rojo"}>{pl.resultado === "apto" ? "Apto" : "No apto"}</Insignia>
                      ) : c.fecha <= h ? (
                        <fieldset className="grid grid-cols-2 gap-1 rounded-lg bg-hundido p-1">
                          <legend className="sr-only">Resultado de {a.nombre}</legend>
                          {[
                            ["apto", "Apto", "has-[:checked]:bg-verde-600"],
                            ["no_apto", "No apto", "has-[:checked]:bg-rojo-600"],
                          ].map(([v, t, color]) => (
                            <label key={v} className={`flex min-h-[36px] min-w-[88px] cursor-pointer items-center justify-center rounded-md px-3 text-sm font-semibold text-gris has-[:checked]:text-white ${color}`}>
                              <input type="radio" name={`r_${a.id}`} value={v} className="sr-only" />
                              {t}
                            </label>
                          ))}
                        </fieldset>
                      ) : (
                        <Insignia tono="faro">Convocado</Insignia>
                      )}
                    </li>
                  );
                })}
              </ul>
              {c.fecha <= h && c.plazas.some((p) => !p.resultado) && (
                <>
                  <p className="ayuda">Un apto termina el curso. Un no apto gasta una convocatoria y vuelve al final de la cola (necesitará un derecho de examen nuevo). Al segundo suspenso con la misma tasa, quedan las convocatorias agotadas.</p>
                  <div>
                    <BotonEnviar>Guardar resultados</BotonEnviar>
                  </div>
                </>
              )}
              {c.fecha > h && <p className="ayuda">Los resultados se registran a partir del día del examen.</p>}
            </form>
          )}
        </Seccion>
      )}
    </div>
  );
}

function Propuesta({ db, c, ruta }: { db: Awaited<ReturnType<typeof leer>>; c: NonNullable<Awaited<ReturnType<typeof leer>>["convocatorias"][number]>; ruta: string }) {
  const { filas, propuestos } = R.proponerPlazas(db, c);
  return (
    <div className="flex flex-col gap-6">
      <Alerta tono="faro" icono="auto_awesome" titulo={`La app propone ${plural(propuestos.length, "alumno")} para ${plural(c.cupo, "plaza")}`}>
        Son los primeros de la cola que tienen convocatorias disponibles, el teórico en vigor el día del examen y el derecho de examen pagado. Revisa y confirma.
      </Alerta>

      <form action={confirmarConvocatoria} className="flex flex-col gap-4">
        <VolverA ruta={ruta} />
        <input type="hidden" name="convocatoriaId" value={c.id} />
        {filas.length === 0 ? (
          <Vacio titulo="La cola está vacía" />
        ) : (
          <ul className="tarjeta divide-y divide-linea">
            {filas.map(({ alumno: a, puesto, requisitos }) => {
              const ok = R.cumpleRequisitos(requisitos);
              const falta = [!requisitos.convocatorias && "sin convocatorias", !requisitos.teorico && `teórico caducado (${R.caducidadTeorico(a) ? fechaLarga(R.caducidadTeorico(a)!) : "—"})`, !requisitos.derecho && "derecho de examen sin pagar"].filter(Boolean);
              return (
                <li key={a.id}>
                  <label className={`flex items-center gap-3 px-4 py-3.5 ${ok ? "cursor-pointer hover:bg-fondo" : "opacity-70"}`}>
                    <input type="checkbox" name="alumnos" value={a.id} defaultChecked={propuestos.includes(a.id)} disabled={!ok} className="h-5 w-5 shrink-0 accent-faro-600" />
                    <span className="cifra w-6 shrink-0 text-right font-semibold text-faro-600">{puesto}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{R.nombreCompleto(a)}</span>
                      <span className={`block text-sm ${ok ? "text-gris" : "text-rojo-800"}`}>
                        {ok ? `Con ${R.profesorPorId(db, a.profesorId)?.nombre} · cumple los requisitos` : `No puede ir: ${falta.join(", ")}`}
                        {a.avisoRetroceso && <span className="text-ambar-800"> · ha bajado de verde</span>}
                      </span>
                    </span>
                    {propuestos.includes(a.id) && <Insignia tono="faro">Propuesto</Insignia>}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <BotonEnviar disabled={filas.length === 0}>
            <Icono nombre="check" /> Confirmar convocatoria
          </BotonEnviar>
          <span className="ayuda">Puedes desmarcar o marcar a otros que cumplan, hasta el cupo.</span>
        </div>
      </form>

      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-linea pt-5">
        <form action={editarCupo} className="flex items-end gap-2">
          <VolverA ruta={ruta} />
          <input type="hidden" name="convocatoriaId" value={c.id} />
          <div>
            <label htmlFor="cupo" className="etiqueta">Cambiar cupo</label>
            <input id="cupo" name="cupo" type="number" min={1} max={20} defaultValue={c.cupo} className="campo cifra w-24" />
          </div>
          <BotonEnviar className="btn-secundario">Actualizar</BotonEnviar>
        </form>
        <form action={eliminarConvocatoria}>
          <input type="hidden" name="convocatoriaId" value={c.id} />
          <BotonEnviar className="btn-peligro" confirmar="¿Borrar esta convocatoria?">Borrar convocatoria</BotonEnviar>
        </form>
      </div>
    </div>
  );
}
