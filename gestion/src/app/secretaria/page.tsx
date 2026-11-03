import Link from "next/link";
import { leer } from "@/lib/db";
import { exigirSecretaria } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { esDomingo, fechaCorta, fechaHora, fechaLarga, hoy, mayus, relativo, sumarDias } from "@/lib/fechas";
import { decimal, eurCorto, plural } from "@/lib/formato";
import { Alerta, Avatar, Barra, Cabecera, Icono, Insignia, Seccion, tonoDe, Vacio, VolverA } from "@/components/ui";
import { CintaDia, cintaDe, Leyenda } from "@/components/CintaDia";
import { BotonEnviar } from "@/components/BotonEnviar";
import { decidirRetroceso } from "@/app/acciones/alumnos";
import { ORIGENES_INTERESADO } from "@/lib/tipos";

export default async function PanelSecretaria() {
  await exigirSecretaria();
  const db = await leer();
  const h = hoy();
  const diaAgenda = esDomingo(h) ? sumarDias(h, 1) : h;

  const parados = db.alumnos.filter((a) => R.teoricoParado(a)).sort((a, b) => R.diasSinTest(b) - R.diasSinTest(a));
  const solicitudes = R.solicitudesPendientes(db);
  const deudores = db.alumnos
    .map((a) => ({ a, deudas: R.deudasDe(db, a.id), total: R.totalDeuda(db, a.id) }))
    .filter((x) => x.total > 0)
    .sort((x, y) => y.total - x.total);
  const totalDeuda = R.redondear(deudores.reduce((s, x) => s + x.total, 0));
  const saldoBajo = db.alumnos.filter((a) => a.fase === "practicas" && R.saldo(db, a.id) <= 1);
  const sinCerrar = R.practicasSinCerrar(db);
  const cola = R.colaExamen(db);
  const retrocesos = db.alumnos.filter((a) => a.avisoRetroceso && a.verdeDesde);
  const convPendientes = db.convocatorias.filter((c) => !c.confirmada);
  const convSinResultado = db.convocatorias.filter((c) => c.confirmada && c.fecha <= h && c.plazas.some((p) => !p.resultado));
  const rellenados = db.ofertas
    .filter((o) => o.estado === "cogida" && o.fecha >= sumarDias(h, -14))
    .sort((a, b) => (b.cogidaEl ?? "").localeCompare(a.cogidaEl ?? ""));
  const nuevos = R.interesadosNuevos(db).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const huecosAbiertos = db.ofertas.filter((o) => R.estadoOferta(db, o).startsWith("abierta"));

  const hallazgo = [
    sinCerrar.length && plural(sinCerrar.length, "práctica sin cerrar", "prácticas sin cerrar"),
    solicitudes.length && plural(solicitudes.length, "recarga pedida", "recargas pedidas"),
    parados.length && `${plural(parados.length, "alumno")} parado${parados.length === 1 ? "" : "s"} en el teórico`,
    cola.tasaPendiente.length && `${plural(cola.tasaPendiente.length, "tasa")} por renovar`,
  ].filter(Boolean);

  return (
    <>
      <Cabecera
        titulo="Hoy"
        subtitulo={
          <>
            {mayus(fechaLarga(h))}
            {hallazgo.length ? ` · ${hallazgo.join(", ")}` : " · todo al día"}
          </>
        }
        acciones={
          <>
            <Link href="/secretaria/agenda" className="btn-secundario">
              <Icono nombre="calendar_add_on" /> Reservar práctica
            </Link>
            <Link href="/secretaria/cobros#registrar" className="btn-primario">
              <Icono nombre="euro" /> Registrar pago
            </Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-8">
          {/* Agenda del día: la pieza principal */}
          <section className="tarjeta p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-base font-bold">
                {diaAgenda === h ? "Agenda de hoy" : <>Agenda del <span>{fechaLarga(diaAgenda)}</span></>}
              </h2>
              <Link href={`/secretaria/agenda?fecha=${diaAgenda}`} className="btn-texto">
                Ver la semana <Icono nombre="arrow_forward" className="!text-[18px]" />
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {db.profesores.map((p) => {
                const coche = R.cocheDelDia(db, p.id, diaAgenda);
                const c = db.coches.find((x) => x.id === coche.cocheId)!;
                const oc = R.ocupacionSemana(db, p.id, diaAgenda);
                return (
                  <div key={p.id}>
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                      <p className="flex items-center gap-2 text-[0.9375rem] font-semibold">
                        <Avatar texto={R.iniciales(p)} tono={tonoDe(p.id)} tamano="sm" />
                        {p.nombre}
                        <span className="font-normal text-gris">
                          · {c.modelo} {c.matricula}
                          {coche.sustitucion && <Insignia tono="ambar" className="ml-2">Coche de reserva</Insignia>}
                        </span>
                      </p>
                      <p className="cifra text-sm text-gris">
                        Semana: <span className="font-semibold text-tinta">{oc.ocupadas}</span> de {oc.total} horas
                      </p>
                    </div>
                    <CintaDia bloques={cintaDe(db, p.id, diaAgenda, (id) => `/secretaria/practicas/${id}`)} />
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <Leyenda />
            </div>
            {huecosAbiertos.length > 0 && (
              <p className="mt-3 text-sm text-gris">
                {plural(huecosAbiertos.length, "hueco ofrecido", "huecos ofrecidos")} ahora mismo a la lista de espera.
              </p>
            )}
          </section>

          {/* Decisiones de examen */}
          {(retrocesos.length > 0 || cola.tasaPendiente.length > 0 || convPendientes.length > 0 || convSinResultado.length > 0) && (
            <Seccion titulo="Examen práctico: necesita tu decisión">
              <div className="flex flex-col gap-2">
                {convSinResultado.map((c) => (
                  <Alerta key={c.id} tono="faro" icono="fact_check" titulo={`Faltan los resultados del examen del ${fechaLarga(c.fecha)}`}
                    accion={<Link href={`/secretaria/examenes/${c.id}`} className="btn-oscuro btn-sm">Registrar resultados</Link>} />
                ))}
                {convPendientes.map((c) => (
                  <Alerta key={c.id} tono="faro" icono="flag" titulo={`Convocatoria del ${fechaLarga(c.fecha)} sin confirmar`}
                    accion={<Link href={`/secretaria/examenes/${c.id}`} className="btn-oscuro btn-sm">Ver propuesta</Link>}>
                    La app propone a los primeros de la cola que cumplen los requisitos. Cupo: {plural(c.cupo, "plaza")}.
                  </Alerta>
                ))}
                {retrocesos.map((a) => (
                  <Alerta key={a.id} tono="ambar" icono="trending_down" titulo={`${R.nombreCompleto(a)} estaba en verde y ha bajado`}
                    accion={
                      <form action={decidirRetroceso} className="flex gap-2">
                        <VolverA ruta="/secretaria" />
                        <input type="hidden" name="alumnoId" value={a.id} />
                        <BotonEnviar name="decision" value="mantener" className="btn-secundario btn-sm">Mantener en la cola</BotonEnviar>
                        <BotonEnviar name="decision" value="sacar" className="btn-peligro btn-sm" confirmar={`¿Sacar a ${a.nombre} de la cola? Perderá su puesto.`}>Sacar</BotonEnviar>
                      </form>
                    }>
                    Puesto {R.puestoEnCola(db, a.id) ?? "—"} en la cola. Su última práctica: «{R.evaluacionesDe(db, a.id).at(-1)?.resumen}»
                  </Alerta>
                ))}
                {cola.tasaPendiente.map((a) => (
                  <Alerta key={a.id} tono="rojo" icono="block" titulo={`${R.nombreCompleto(a)}: convocatorias agotadas`}
                    accion={<Link href={`/secretaria/alumnos/${a.id}#pagos`} className="btn-secundario btn-sm">Registrar tasa</Link>}>
                    Tiene que pagar una tasa nueva de la DGT ({eurCorto(db.tarifas.find((t) => t.tipo === "tasa")!.precio)}). Hasta entonces no entra en la cola.
                  </Alerta>
                ))}
              </div>
            </Seccion>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            <Seccion titulo={<>Teórico parado <span className="font-normal text-gris">· 7 días o más sin test</span></>}>
              {parados.length === 0 ? (
                <Vacio icono="check_circle" titulo="Nadie parado">Todos los alumnos de teórico han hecho test esta semana.</Vacio>
              ) : (
                <ul className="tarjeta divide-y divide-linea">
                  {parados.map((a) => {
                    const dias = R.diasSinTest(a);
                    const texto = `¡Hola, ${a.nombre}! Te escribimos de Autoescuela Faro. Hemos visto que llevas ${dias} días sin hacer test del teórico. ¿Va todo bien? Si te atasca algún tema, pásate por la oficina y lo repasamos juntos. ¡Ánimo, que ya queda menos!`;
                    return (
                      <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <Link href={`/secretaria/alumnos/${a.id}`} className="block truncate font-semibold hover:underline">{R.nombreCompleto(a)}</Link>
                          <p className="text-sm text-gris">
                            <span className="cifra font-semibold text-rojo-600">{dias} días</span>
                            {a.teorico.ultimoTest ? " sin test" : " sin ningún test"}
                            {a.teorico.mediaFallos !== null && ` · ${decimal(a.teorico.mediaFallos)} fallos de media`}
                          </p>
                        </div>
                        <a href={R.enlaceWhatsApp(a.telefono, texto)} target="_blank" rel="noreferrer" className="btn-secundario btn-sm">
                          <Icono nombre="chat" className="!text-[18px]" /> WhatsApp
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Seccion>

            <Seccion titulo={<>Prácticas sin cerrar <span className="font-normal text-gris">· falta evaluar</span></>}>
              {sinCerrar.length === 0 ? (
                <Vacio icono="task_alt" titulo="Todas cerradas">Los profesores han evaluado todas las prácticas.</Vacio>
              ) : (
                <ul className="tarjeta divide-y divide-linea">
                  {sinCerrar.slice(0, 6).map((p) => {
                    const a = R.alumnoPorId(db, p.alumnoId)!;
                    const prof = R.profesorPorId(db, p.profesorId)!;
                    return (
                      <li key={p.id}>
                        <Link href={`/secretaria/practicas/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-fondo">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">{R.nombreCompleto(a)}</p>
                            <p className="text-sm text-gris">
                              Con {prof.nombre} · {mayus(relativo(p.fecha))} a las {p.inicio}
                            </p>
                          </div>
                          <Icono nombre="chevron_right" className="text-tenue" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Seccion>

            <Seccion titulo={<>Monedero casi vacío <span className="font-normal text-gris">· 1 práctica o ninguna</span></>}>
              {saldoBajo.length === 0 ? (
                <Vacio titulo="Nadie con el monedero vacío" />
              ) : (
                <ul className="tarjeta divide-y divide-linea">
                  {saldoBajo.slice(0, 5).map((a) => {
                    const s = R.saldo(db, a.id);
                    const pidio = solicitudes.some((x) => x.alumnoId === a.id);
                    const texto = `¡Hola, ${a.nombre}! Te escribimos de Autoescuela Faro: ${s === 1 ? "te queda 1 práctica" : "no te quedan prácticas"} en tu bono. Puedes recargar por Bizum o en la oficina para seguir reservando desde la app.`;
                    return (
                      <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <Link href={`/secretaria/alumnos/${a.id}`} className="block truncate font-semibold hover:underline">{R.nombreCompleto(a)}</Link>
                          <p className="text-sm text-gris">
                            {s === 1 ? "Le queda 1 práctica" : "Sin prácticas"}
                            {pidio && " · ya ha pedido recarga"}
                          </p>
                        </div>
                        <a href={R.enlaceWhatsApp(a.telefono, texto)} target="_blank" rel="noreferrer" className="btn-secundario btn-sm">
                          <Icono nombre="chat" className="!text-[18px]" /> WhatsApp
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Seccion>

            <Seccion titulo={<>Huecos rellenados <span className="font-normal text-gris">· caza-huecos, últimos 14 días</span></>}>
              {rellenados.length === 0 ? (
                <Vacio icono="event_available" titulo="Aún ninguno">Cuando un alumno de la lista de espera coja un hueco, aparecerá aquí.</Vacio>
              ) : (
                <ul className="tarjeta divide-y divide-linea">
                  {rellenados.slice(0, 6).map((o) => {
                    const quien = R.alumnoPorId(db, o.cogidaPor!)!;
                    const origen = db.practicas.find((p) => p.id === o.practicaOrigenId);
                    const cancelo = origen ? R.alumnoPorId(db, origen.alumnoId) : undefined;
                    const prof = R.profesorPorId(db, o.profesorId)!;
                    const minutos = o.cogidaEl ? Math.max(1, Math.round((new Date(o.cogidaEl).getTime() - new Date(o.creadaEl).getTime()) / 60000)) : null;
                    return (
                      <li key={o.id} className="px-4 py-3">
                        <p className="font-semibold">
                          {quien.nombre} cogió el hueco de {cancelo?.nombre ?? "otro alumno"}
                        </p>
                        <p className="text-sm text-gris">
                          {fechaCorta(o.fecha)} a las {o.inicio} con {prof.nombre}
                          {minutos !== null && ` · en ${minutos < 60 ? `${minutos} min` : `${Math.round(minutos / 60)} h`}`}
                          {o.abiertaATodos && " · abierto a todos"}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Seccion>
          </div>
        </div>

        {/* Columna derecha: dinero e interesados */}
        <aside className="flex flex-col gap-8">
          <Seccion titulo="Recargas pedidas" accion={<Link href="/secretaria/cobros" className="btn-texto">Ir a cobros</Link>}>
            {solicitudes.length === 0 ? (
              <Vacio titulo="Ninguna pendiente" />
            ) : (
              <ul className="tarjeta divide-y divide-linea">
                {solicitudes.map((s) => {
                  const a = R.alumnoPorId(db, s.alumnoId)!;
                  const t = db.tarifas.find((x) => x.id === s.tarifaId);
                  return (
                    <li key={s.id}>
                      <Link href={`/secretaria/cobros?solicitud=${s.id}#registrar`} className="block px-4 py-3 hover:bg-fondo">
                        <p className="flex items-center justify-between gap-2 font-semibold">
                          <span className="truncate">{R.nombreCompleto(a)}</span>
                          <span className="cifra shrink-0">{t ? eurCorto(t.precio) : "—"}</span>
                        </p>
                        <p className="text-sm text-gris">
                          {t?.concepto} · {fechaHora(s.fecha)}
                        </p>
                        {s.mensaje && <p className="mt-1 text-sm italic text-gris">«{s.mensaje}»</p>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Seccion>

          <Seccion titulo={<>Por cobrar <span className="cifra font-normal text-gris">· {eurCorto(totalDeuda)}</span></>}>
            {deudores.length === 0 ? (
              <Vacio titulo="Nadie debe nada" />
            ) : (
              <ul className="tarjeta divide-y divide-linea">
                {deudores.slice(0, 6).map(({ a, deudas, total }) => (
                  <li key={a.id}>
                    <Link href={`/secretaria/alumnos/${a.id}#pagos`} className="block px-4 py-3 hover:bg-fondo">
                      <p className="flex items-center justify-between gap-2 font-semibold">
                        <span className="truncate">{R.nombreCompleto(a)}</span>
                        <span className="cifra shrink-0 text-rojo-600">{eurCorto(total)}</span>
                      </p>
                      <p className="text-sm text-gris">{deudas.map((d) => R.MOTIVOS_DEUDA[d.motivo]).join(" · ")}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Seccion>

          <Seccion titulo="Interesados nuevos" accion={<Link href="/secretaria/interesados" className="btn-texto">Ver todos</Link>}>
            {nuevos.length === 0 ? (
              <Vacio titulo="Sin contactos nuevos" />
            ) : (
              <ul className="tarjeta divide-y divide-linea">
                {nuevos.slice(0, 4).map((i) => (
                  <li key={i.id}>
                    <Link href={`/secretaria/interesados/${i.id}`} className="block px-4 py-3 hover:bg-fondo">
                      <p className="font-semibold">{i.nombre}</p>
                      <p className="text-sm text-gris">
                        {ORIGENES_INTERESADO[i.origen]} · {fechaHora(i.fecha)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Seccion>

          <Seccion titulo="Ocupación esta semana">
            <div className="tarjeta flex flex-col gap-3 p-4">
              {db.profesores.map((p) => {
                const oc = R.ocupacionSemana(db, p.id, diaAgenda);
                return (
                  <div key={p.id}>
                    <p className="mb-1 flex justify-between text-sm">
                      <span className="font-semibold">{p.nombre}</span>
                      <span className="cifra text-gris">{oc.porcentaje} % · {oc.ocupadas} de {oc.total} h</span>
                    </p>
                    <Barra valor={oc.ocupadas} total={oc.total} />
                  </div>
                );
              })}
              <p className="text-xs text-gris">De lunes a sábado, 14 clases de 45 minutos al día por profesor.</p>
            </div>
          </Seccion>
        </aside>
      </div>
    </>
  );
}
