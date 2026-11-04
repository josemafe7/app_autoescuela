import Link from "next/link";
import { notFound } from "next/navigation";
import { leer } from "@/lib/db";
import { exigirSecretaria } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { ESTADOS_PRACTICA, FASES, FORMAS_PAGO, MANIOBRAS } from "@/lib/tipos";
import { situacionAlumno } from "@/lib/situacion";
import { fechaCorta, fechaHora, fechaLarga, hoy, relativo } from "@/lib/fechas";
import { decimal, eurCorto, plural } from "@/lib/formato";
import {
  Alerta, Avatar, Cabecera, Icono, Insignia, NivelChip, Seccion, SemaforoChip, tonoDe, Vacio, Volver, VolverA,
} from "@/components/ui";
import { BotonEnviar } from "@/components/BotonEnviar";
import { FormPago } from "@/components/FormPago";
import { actualizarTeorico, asignarProfesor, decidirRetroceso, editarAlumno, registrarExamenTeorico } from "@/app/acciones/alumnos";
import { cobrarPendiente } from "@/app/acciones/pagos";

export default async function FichaAlumno({ params }: { params: Promise<{ id: string }> }) {
  await exigirSecretaria();
  const { id } = await params;
  const db = await leer();
  const a = R.alumnoPorId(db, id);
  if (!a) notFound();
  const ruta = `/secretaria/alumnos/${a.id}`;
  const prof = R.profesorPorId(db, a.profesorId);
  const m = R.monedero(db, a.id);
  const deudas = R.deudasDe(db, a.id);
  const deuda = R.totalDeuda(db, a.id);
  const conv = R.convocatoriasDe(db, a.id);
  const semaforo = R.semaforoDe(db, a.id);
  const niveles = R.nivelesActuales(db, a.id);
  const evals = R.evaluacionesDe(db, a.id);
  const practicas = db.practicas
    .filter((p) => p.alumnoId === a.id)
    .sort((x, y) => (y.fecha + y.inicio).localeCompare(x.fecha + x.inicio));
  const proximas = R.proximasPracticas(db, a.id).sort((x, y) => (x.fecha + x.inicio).localeCompare(y.fecha + y.inicio));
  const pasadas = practicas.filter((p) => !proximas.includes(p));
  const cargos = db.cargos.filter((c) => c.alumnoId === a.id).sort((x, y) => y.fecha.localeCompare(x.fecha));
  const examenes = db.examenes.filter((e) => e.alumnoId === a.id).sort((x, y) => x.fecha.localeCompare(y.fecha));
  const puesto = R.puestoEnCola(db, a.id);
  const plaza = R.plazaPendiente(db, a.id);
  const req = R.requisitosExamen(db, a);
  const derechos = R.derechosExamen(db, a.id);
  const caducidad = R.caducidadTeorico(a);
  const interesado = a.interesadoId ? db.interesados.find((i) => i.id === a.interesadoId) : undefined;
  const solicitud = db.solicitudes.find((s) => s.alumnoId === a.id && !s.atendida);
  const puestoCola1 = R.colaPracticas(db).findIndex((x) => x.id === a.id) + 1;
  const tasaTarifa = db.tarifas.find((t) => t.tipo === "tasa")!;

  const mensajeWa = `¡Hola, ${a.nombre}! Te escribimos de Autoescuela Faro.`;

  return (
    <>
      <Cabecera
        antes={<Volver href="/secretaria/alumnos">Alumnos</Volver>}
        titulo={
          <span className="flex items-center gap-3">
            <Avatar texto={R.iniciales(a)} tono={tonoDe(a.id)} />
            {R.nombreCompleto(a)}
          </span>
        }
        subtitulo={`${FASES[a.fase]} · ${situacionAlumno(db, a)}`}
        acciones={
          <>
            <a href={R.enlaceWhatsApp(a.telefono, mensajeWa)} target="_blank" rel="noreferrer" className="btn-secundario">
              <Icono nombre="chat" /> WhatsApp
            </a>
            {a.fase === "practicas" && (
              <Link href={`/secretaria/agenda`} className="btn-secundario">
                <Icono nombre="calendar_add_on" /> Reservar
              </Link>
            )}
            <a href="#pagos" className="btn-primario">
              <Icono nombre="euro" /> Registrar pago
            </a>
          </>
        }
      />

      {/* Cifras clave */}
      <dl className="tarjeta mb-6 grid grid-cols-2 divide-linea sm:grid-cols-4 sm:divide-x">
        <div className="p-4">
          <dt className="text-sm text-gris">Prácticas en el monedero</dt>
          <dd className={`cifra mt-1 text-[1.75rem] font-semibold leading-none ${m.disponibles <= 1 && a.fase === "practicas" ? "text-rojo-600" : ""}`}>{m.disponibles}</dd>
          <dd className="mt-1 text-xs text-gris">{m.reservadas ? `${plural(m.reservadas, "reservada")} aparte` : "Ninguna reservada"}</dd>
        </div>
        <div className="p-4">
          <dt className="text-sm text-gris">Prácticas hechas</dt>
          <dd className="cifra mt-1 text-2xl font-semibold leading-none">{m.realizadas}</dd>
          <dd className="mt-1 text-xs text-gris">{m.perdidas ? `${plural(m.perdidas, "perdida")} (plantón o cancelación tardía)` : "Sin plantones"}</dd>
        </div>
        <div className="p-4">
          <dt className="text-sm text-gris">Debe</dt>
          <dd className={`cifra mt-1 text-2xl font-semibold leading-none ${deuda > 0 ? "text-rojo-600" : ""}`}>{deuda > 0 ? eurCorto(deuda) : "0 €"}</dd>
          <dd className="mt-1 text-xs text-gris">{deudas.length ? deudas.map((d) => R.MOTIVOS_DEUDA[d.motivo]).join(", ") : "Al día"}</dd>
        </div>
        <div className="p-4">
          <dt className="text-sm text-gris">Convocatorias</dt>
          <dd className={`cifra mt-1 text-2xl font-semibold leading-none ${conv.agotadas ? "text-rojo-600" : ""}`}>
            {conv.tasa ? <>{conv.disponibles}<span className="text-base font-normal text-gris"> de 2</span></> : "—"}
          </dd>
          <dd className="mt-1 text-xs text-gris">{conv.tasa ? (conv.agotadas ? "Agotadas: tasa nueva" : `Tasa pagada el ${fechaCorta(conv.tasa.fechaPago)}`) : "Tasa sin pagar"}</dd>
        </div>
      </dl>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-8">
          {conv.agotadas && (
            <Alerta tono="rojo" icono="block" titulo="Convocatorias agotadas"
              accion={<a href="#pagos" className="btn-secundario btn-sm">Registrar tasa</a>}>
              Ha suspendido 2 veces con esta tasa. Tiene que pagar una tasa nueva de {eurCorto(tasaTarifa.precio)} (sin gastos de gestión). Hasta entonces no entra en la cola de examen.
            </Alerta>
          )}
          {a.avisoRetroceso && a.verdeDesde && (
            <Alerta tono="ambar" icono="trending_down" titulo="Estaba en verde y ha bajado"
              accion={
                <form action={decidirRetroceso} className="flex gap-2">
                  <VolverA ruta={ruta} />
                  <input type="hidden" name="alumnoId" value={a.id} />
                  <BotonEnviar name="decision" value="mantener" className="btn-secundario btn-sm">Mantener</BotonEnviar>
                  <BotonEnviar name="decision" value="sacar" className="btn-peligro btn-sm" confirmar="¿Sacarle de la cola? Perderá su puesto.">Sacar</BotonEnviar>
                </form>
              }>
              Sigue en la cola de examen (puesto {puesto ?? "—"}) hasta que decidas.
            </Alerta>
          )}

          {/* Teórico */}
          {a.fase === "teorico" && (
            <Seccion titulo="Teórico">
              <div className="tarjeta grid gap-6 p-5 lg:grid-cols-2">
                <form action={actualizarTeorico} className="flex flex-col gap-3">
                  <VolverA ruta={ruta} />
                  <input type="hidden" name="alumnoId" value={a.id} />
                  <p className="font-semibold">Progreso en la app de test</p>
                  {R.teoricoParado(a) && (
                    <p className="rounded-lg border border-[#f3dfae] bg-[#fffbeb] px-3 py-2 text-sm text-ambar-800">
                      {R.diasSinTest(a)} días sin hacer test: aparece como parado en el panel.
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3 sm:col-span-1">
                      <label className="etiqueta" htmlFor="ultimoTest">Último test</label>
                      <input id="ultimoTest" name="ultimoTest" type="date" max={hoy()} defaultValue={a.teorico.ultimoTest ?? ""} className="campo" />
                    </div>
                    <div>
                      <label className="etiqueta" htmlFor="numTests">Test hechos</label>
                      <input id="numTests" name="numTests" type="number" min={0} defaultValue={a.teorico.numTests} className="campo cifra" />
                    </div>
                    <div>
                      <label className="etiqueta" htmlFor="mediaFallos">Fallos (últ. 5)</label>
                      <input id="mediaFallos" name="mediaFallos" inputMode="decimal" defaultValue={a.teorico.mediaFallos === null ? "" : decimal(a.teorico.mediaFallos)} className="campo cifra" />
                    </div>
                  </div>
                  <p className="ayuda">Se aprueba con 3 fallos o menos de 30 preguntas.</p>
                  <div>
                    <BotonEnviar className="btn-secundario">Guardar progreso</BotonEnviar>
                  </div>
                </form>
                <form action={registrarExamenTeorico} className="flex flex-col gap-3">
                  <VolverA ruta={ruta} />
                  <input type="hidden" name="alumnoId" value={a.id} />
                  <p className="font-semibold">Resultado del examen teórico</p>
                  <div>
                    <label className="etiqueta" htmlFor="fecha-teorico">Fecha del examen</label>
                    <input id="fecha-teorico" name="fecha" type="date" max={hoy()} defaultValue={hoy()} className="campo" />
                  </div>
                  <p className="ayuda">{conv.tasa ? `Le ${conv.disponibles === 1 ? "queda 1 convocatoria" : `quedan ${conv.disponibles} convocatorias`}. Un suspenso gasta una.` : "Primero registra el pago de la tasa de la DGT."}</p>
                  <div className="flex gap-2">
                    <BotonEnviar name="resultado" value="apto" className="btn-secundario" disabled={!conv.tasa || conv.agotadas}>Apto</BotonEnviar>
                    <BotonEnviar name="resultado" value="no_apto" className="btn-peligro" disabled={!conv.tasa || conv.agotadas} confirmar="¿Registrar suspenso? Gasta una convocatoria.">No apto</BotonEnviar>
                  </div>
                </form>
              </div>
            </Seccion>
          )}

          {/* Cola de prácticas */}
          {a.fase === "espera_practicas" && (
            <Seccion titulo="Empezar las prácticas">
              <div className="tarjeta p-5">
                <p>
                  Aprobó el teórico el {fechaLarga(a.teorico.aprobadoEl!)}. Está en el <strong>puesto {puestoCola1}</strong> de la cola de prácticas.
                  {m.disponibles > 0 && ` Ya tiene ${plural(m.disponibles, "práctica")} pagada${m.disponibles === 1 ? "" : "s"}.`}
                </p>
                <FormAsignar alumnoId={a.id} ruta={ruta} db={db} textoBoton="Asignar profesor y empezar" />
              </div>
            </Seccion>
          )}

          {/* Prácticas: semáforo, maniobras y cola de examen */}
          {(a.fase === "practicas" || a.fase === "aprobado") && (
            <Seccion titulo="Progreso en el coche" accion={<SemaforoChip valor={semaforo} />}>
              <div className="tarjeta grid gap-6 p-5 lg:grid-cols-[1fr_280px]">
                <div>
                  {evals.length === 0 ? (
                    <Vacio titulo="Aún sin prácticas evaluadas" />
                  ) : (
                    <>
                      <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                        {MANIOBRAS.map((mm) => (
                          <li key={mm.id} className="flex items-center justify-between gap-2 border-b border-linea py-2 text-[0.9375rem]">
                            <span className="truncate">{mm.nombre}</span>
                            <NivelChip nivel={niveles[mm.id]} />
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-sm text-gris">
                        Última evaluación, {fechaLarga(evals.at(-1)!.fecha)}: «{evals.at(-1)!.resumen}»
                      </p>
                    </>
                  )}
                </div>
                <div className="flex flex-col gap-4 rounded-lg bg-hundido/60 p-4 text-sm">
                  {a.fase === "practicas" && (
                    <div>
                      <p className="text-gris">Profesor</p>
                      <p className="font-semibold">{prof ? R.nombreCompleto(prof) : "Sin asignar"}</p>
                      <FormAsignar alumnoId={a.id} ruta={ruta} db={db} textoBoton="Cambiar" actual={a.profesorId ?? undefined} compacto />
                    </div>
                  )}
                  <div>
                    <p className="text-gris">Cola de examen</p>
                    {plaza ? (
                      <p className="font-semibold">Examen el {fechaLarga(plaza.fecha)}</p>
                    ) : puesto ? (
                      <p className="font-semibold">Puesto {puesto} · en verde desde el {fechaCorta(a.verdeDesde!)}</p>
                    ) : a.verdeDesde && conv.agotadas ? (
                      <p className="font-semibold text-rojo-600">Fuera hasta pagar la tasa</p>
                    ) : a.fase === "aprobado" ? (
                      <p className="font-semibold">Aprobado el {a.aprobadoEl ? fechaLarga(a.aprobadoEl) : "—"}</p>
                    ) : (
                      <p className="font-semibold">Entra al ponerse en verde</p>
                    )}
                  </div>
                  {a.fase === "practicas" && (
                    <ul className="flex flex-col gap-1">
                      <Requisito ok={req.convocatorias} texto={`Convocatorias disponibles (${conv.disponibles} de 2)`} />
                      <Requisito ok={req.teorico} texto={caducidad ? `Teórico en vigor hasta el ${fechaCorta(caducidad)}` : "Teórico aprobado"} />
                      <Requisito ok={req.derecho} texto={`Derecho de examen pagado (${derechos.disponibles} sin usar)`} />
                    </ul>
                  )}
                  {a.listaEspera && (
                    <div>
                      <p className="text-gris">Lista de espera</p>
                      <p className="font-semibold">
                        {a.listaEspera.dias.map((d) => ["L", "M", "X", "J", "V", "S"][d - 1]).join(" ")} · {a.listaEspera.franjas.map((f) => (f === "manana" ? "mañanas" : "tardes")).join(" y ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Seccion>
          )}

          {/* Prácticas */}
          {practicas.length > 0 && (
            <Seccion titulo="Prácticas">
              <div className="tarjeta overflow-x-auto">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th className="pl-5">Cuándo</th>
                      <th>Estado</th>
                      <th>Con</th>
                      <th className="pr-5">Resumen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...proximas, ...pasadas].slice(0, 14).map((p) => {
                      const ev = db.evaluaciones.find((e) => e.practicaId === p.id);
                      const sinCerrar = p.estado === "reservada" && !proximas.includes(p);
                      return (
                        <tr key={p.id} className="relative">
                          <td className="whitespace-nowrap pl-5">
                            <Link href={`/secretaria/practicas/${p.id}`} className="after:absolute after:inset-0">
                              <span className="cifra font-semibold">{fechaCorta(p.fecha)}</span>
                              <span className="cifra text-gris"> · {p.inicio}</span>
                            </Link>
                          </td>
                          <td className="whitespace-nowrap">
                            <Insignia tono={p.estado === "realizada" ? "neutro" : p.estado === "no_presentado" ? "rojo" : p.estado === "cancelada_tarde" ? "ambar" : sinCerrar ? "ambar" : p.estado === "reservada" ? "faro" : "neutro"}>
                              {sinCerrar ? "Sin cerrar" : ESTADOS_PRACTICA[p.estado]}
                            </Insignia>
                            {p.sinSaldo && <Insignia tono="rojo" className="ml-1">Sin saldo</Insignia>}
                            {p.origen === "caza_huecos" && <Insignia tono="faro" className="ml-1">Hueco</Insignia>}
                          </td>
                          <td>{R.profesorPorId(db, p.profesorId)?.nombre}</td>
                          <td className="max-w-[360px] truncate pr-5 text-gris">{ev?.resumen ?? (proximas.includes(p) ? (p.confirmada ? "Confirmada" : "Sin confirmar") : "—")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {practicas.length > 14 && <p className="border-t border-linea px-5 py-3 text-sm text-gris">Se muestran las 14 más recientes de {practicas.length}.</p>}
              </div>
            </Seccion>
          )}

          {/* Pagos */}
          <Seccion titulo="Pagos y deudas" id="pagos">
            <div className="flex flex-col gap-4">
              {deudas.map((d) => (
                <div key={d.cargo.id} className="flex flex-col gap-3 rounded-xl border border-linea px-4 py-3.5 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <p className="font-semibold">
                      {R.MOTIVOS_DEUDA[d.motivo]}: <span className="cifra">{eurCorto(d.pendiente)}</span>
                    </p>
                    <p className="text-sm text-gris">{d.cargo.concepto} · {fechaCorta(d.cargo.fecha)}</p>
                  </div>
                  <form action={cobrarPendiente} className="flex gap-2">
                    <VolverA ruta={`${ruta}#pagos`} />
                    <input type="hidden" name="cargoId" value={d.cargo.id} />
                    <label htmlFor={`forma-${d.cargo.id}`} className="sr-only">Forma de pago</label>
                    <select id={`forma-${d.cargo.id}`} name="forma" className="campo min-h-[32px] w-auto py-1 text-sm" defaultValue="bizum">
                      {Object.entries(FORMAS_PAGO).map(([v, t]) => (
                        <option key={v} value={v}>{t}</option>
                      ))}
                    </select>
                    <BotonEnviar className="btn-secundario btn-sm">Cobrar</BotonEnviar>
                  </form>
                </div>
              ))}
              {solicitud && (
                <Alerta tono="faro" icono="notifications" titulo={`Ha pedido una recarga: ${db.tarifas.find((t) => t.id === solicitud.tarifaId)?.concepto}`}>
                  {fechaHora(solicitud.fecha)}{solicitud.mensaje && ` · «${solicitud.mensaje}»`}. Al registrar el pago de abajo, la solicitud se marca como atendida.
                </Alerta>
              )}
              <div className="tarjeta p-5">
                <p className="mb-4 font-semibold">Registrar un pago</p>
                <FormPago tarifas={db.tarifas} alumnoId={a.id} tarifaId={solicitud?.tarifaId ?? (conv.agotadas ? tasaTarifa.id : undefined)} solicitudId={solicitud?.id} volver={`${ruta}#pagos`} />
              </div>
              {cargos.length > 0 && (
                <div className="tarjeta overflow-x-auto">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th className="pl-5">Fecha</th>
                        <th>Concepto</th>
                        <th className="text-right">Importe</th>
                        <th className="pr-5 text-right">Pagado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cargos.map((c) => {
                        const pagos = db.pagos.filter((p) => p.cargoId === c.id);
                        const pagado = R.pagadoDe(db, c);
                        return (
                          <tr key={c.id}>
                            <td className="cifra whitespace-nowrap pl-5">{fechaCorta(c.fecha)}</td>
                            <td>
                              {c.concepto}
                              {c.practicas > 0 && <span className="text-gris"> · +{c.practicas}</span>}
                              <span className="block text-[0.8125rem] text-gris">
                                {pagos.map((p) => `${eurCorto(p.importe)} por ${FORMAS_PAGO[p.forma].toLowerCase()} (${c.plazos === 2 ? `${p.plazo}.º plazo, ` : ""}${fechaCorta(p.fecha)})`).join(" · ") || "Sin pagos"}
                              </span>
                            </td>
                            <td className="cifra text-right">{eurCorto(c.importe)}</td>
                            <td className={`cifra pr-5 text-right ${pagado < c.importe ? "font-semibold text-rojo-600" : ""}`}>{eurCorto(pagado)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Seccion>
        </div>

        {/* Columna derecha */}
        <aside className="flex flex-col gap-8">
          <Seccion titulo="Datos">
            <form action={editarAlumno} className="tarjeta flex flex-col gap-3 p-4">
              <VolverA ruta={ruta} />
              <input type="hidden" name="alumnoId" value={a.id} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="etiqueta" htmlFor="nombre">Nombre</label>
                  <input id="nombre" name="nombre" defaultValue={a.nombre} className="campo" required />
                </div>
                <div>
                  <label className="etiqueta" htmlFor="apellidos">Apellidos</label>
                  <input id="apellidos" name="apellidos" defaultValue={a.apellidos} className="campo" required />
                </div>
              </div>
              <div>
                <label className="etiqueta" htmlFor="dni">DNI o NIE</label>
                <input id="dni" name="dni" defaultValue={a.dni} className="campo cifra uppercase" />
              </div>
              <div>
                <label className="etiqueta" htmlFor="telefono">Teléfono</label>
                <input id="telefono" name="telefono" defaultValue={a.telefono} className="campo cifra" required />
              </div>
              <div>
                <label className="etiqueta" htmlFor="email">Correo</label>
                <input id="email" name="email" type="email" defaultValue={a.email} className="campo" />
              </div>
              <div>
                <label className="etiqueta" htmlFor="notas">Notas internas</label>
                <textarea id="notas" name="notas" defaultValue={a.notas} rows={3} className="campo" />
              </div>
              <p className="text-xs text-gris">Matriculado el {fechaLarga(a.fechaMatricula)}.</p>
              <div>
                <BotonEnviar className="btn-secundario">Guardar datos</BotonEnviar>
              </div>
            </form>
          </Seccion>

          <Seccion titulo="Exámenes">
            {examenes.length === 0 ? (
              <Vacio titulo="Aún sin exámenes" />
            ) : (
              <ul className="tarjeta divide-y divide-linea">
                {examenes.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[0.9375rem]">
                    <span>
                      <span className="font-semibold">{e.tipo === "teorico" ? "Teórico" : "Práctico"}</span>
                      <span className="block text-sm text-gris">{fechaLarga(e.fecha)}</span>
                    </span>
                    <Insignia tono={e.resultado === "apto" ? "verde" : "rojo"}>{e.resultado === "apto" ? "Apto" : "No apto"}</Insignia>
                  </li>
                ))}
              </ul>
            )}
          </Seccion>

          {interesado && (
            <Seccion titulo="Cómo llegó">
              <Link href={`/secretaria/interesados/${interesado.id}`} className="tarjeta block p-4 hover:bg-fondo">
                <p className="font-semibold">Desde la web</p>
                <p className="text-sm text-gris">Contacto del {fechaLarga(interesado.fecha.slice(0, 10))} ({relativo(interesado.fecha.slice(0, 10))})</p>
              </Link>
            </Seccion>
          )}
        </aside>
      </div>
    </>
  );
}

function Requisito({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <li className={`flex items-start gap-1.5 ${ok ? "text-verde-800" : "text-rojo-800"}`}>
      <Icono nombre={ok ? "check_circle" : "cancel"} className="!text-[18px]" lleno />
      {texto}
    </li>
  );
}

function FormAsignar({
  alumnoId,
  ruta,
  db,
  textoBoton,
  actual,
  compacto,
}: {
  alumnoId: string;
  ruta: string;
  db: Awaited<ReturnType<typeof leer>>;
  textoBoton: string;
  actual?: string;
  compacto?: boolean;
}) {
  return (
    <form action={asignarProfesor} className={`flex gap-2 ${compacto ? "mt-2" : "mt-4 flex-wrap items-end"}`}>
      <VolverA ruta={ruta} />
      <input type="hidden" name="alumnoId" value={alumnoId} />
      <div className={compacto ? "flex-1" : ""}>
        {!compacto && <label htmlFor={`prof-${alumnoId}`} className="etiqueta">Profesor</label>}
        <select id={`prof-${alumnoId}`} name="profesorId" defaultValue={actual ?? ""} required className={`campo ${compacto ? "min-h-[32px] py-1 text-sm" : "w-64"}`} aria-label="Profesor">
          <option value="" disabled>Elige…</option>
          {db.profesores.map((p) => {
            const n = db.alumnos.filter((x) => x.profesorId === p.id && x.fase === "practicas").length;
            return (
              <option key={p.id} value={p.id}>
                {p.nombre} ({n} alumnos)
              </option>
            );
          })}
        </select>
      </div>
      <BotonEnviar className={compacto ? "btn-secundario btn-sm" : "btn-primario"}>{textoBoton}</BotonEnviar>
    </form>
  );
}

