import Link from "next/link";
import { leer } from "@/lib/db";
import { fechaDeURL } from "@/lib/acciones-util";
import { exigirProfesor } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { TURNO_MANANA, TURNO_TARDE } from "@/lib/tipos";
import { esDomingo, fechaLarga, hoy, horaFin, mayus, relativo, sumarDias, yaTerminada } from "@/lib/fechas";
import { plural } from "@/lib/formato";
import { Alerta, Icono, Insignia, SemaforoPunto } from "@/components/ui";
import { CintaDia, cintaDe } from "@/components/CintaDia";

export default async function MiDia({ searchParams }: { searchParams: Promise<{ fecha?: string }> }) {
  const profesorId = await exigirProfesor();
  const sp = await searchParams;
  const db = await leer();
  const h = hoy();
  const fecha = fechaDeURL(sp.fecha, h);
  const sinCerrar = R.practicasSinCerrar(db, profesorId);
  const delDia = R.practicasDelDia(db, profesorId, fecha).filter((p) => R.ESTADOS_QUE_OCUPAN.includes(p.estado));
  const coche = R.cocheDelDia(db, profesorId, fecha);
  const c = db.coches.find((x) => x.id === coche.cocheId);
  const huecos = db.ofertas.filter((o) => o.profesorId === profesorId && o.fecha === fecha && R.estadoOferta(db, o).startsWith("abierta"));
  const anterior = esDomingo(sumarDias(fecha, -1)) ? sumarDias(fecha, -2) : sumarDias(fecha, -1);
  const siguiente = esDomingo(sumarDias(fecha, 1)) ? sumarDias(fecha, 2) : sumarDias(fecha, 1);
  const proximoLab = esDomingo(h) ? sumarDias(h, 1) : h;

  return (
    <div className="flex flex-col gap-6">
      {sinCerrar.length > 0 && (
        <section>
          <h1 className="sr-only">Mi día</h1>
          <h2 className="mb-2 text-base font-bold">Por cerrar <span className="font-normal text-gris">· {plural(sinCerrar.length, "práctica")}</span></h2>
          <ul className="flex flex-col gap-2">
            {sinCerrar.map((p) => {
              const a = R.alumnoPorId(db, p.alumnoId)!;
              return (
                <li key={p.id}>
                  <Link href={`/profesor/practica/${p.id}`} className="flex items-center gap-3 rounded-xl bg-ambar-50 px-4 py-3 text-ambar-800 active:scale-[0.99]">
                    <Icono nombre="edit_note" className="!text-[26px]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{R.nombreCompleto(a)}</span>
                      <span className="block text-sm">
                        {mayus(relativo(p.fecha))} a las {p.inicio} · falta evaluar
                      </span>
                    </span>
                    <span className="btn-oscuro btn-sm">Evaluar</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <Link href={`/profesor?fecha=${anterior}`} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-hundido" aria-label="Día anterior">
            <Icono nombre="chevron_left" />
          </Link>
          <div className="text-center">
            {sinCerrar.length === 0 && <h1 className="sr-only">Mi día</h1>}
            <p className="text-lg font-bold">{fecha === h ? "Hoy" : mayus(relativo(fecha))}</p>
            <p className="text-sm text-gris">{mayus(fechaLarga(fecha))}</p>
          </div>
          <Link href={`/profesor?fecha=${siguiente}`} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-hundido" aria-label="Día siguiente">
            <Icono nombre="chevron_right" />
          </Link>
        </div>

        {esDomingo(fecha) ? (
          <Alerta tono="neutro" icono="weekend" titulo="Domingo: no hay prácticas"
            accion={<Link href={`/profesor?fecha=${sumarDias(fecha, 1)}`} className="btn-secundario btn-sm">Ver el lunes</Link>} />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
              <Insignia tono={coche.sustitucion ? "ambar" : "neutro"}>
                <Icono nombre="directions_car" className="!text-[16px]" />
                {c?.modelo} {c?.matricula}
                {coche.sustitucion && " · coche de reserva"}
              </Insignia>
              <Insignia tono="neutro">{plural(delDia.length, "clase")}</Insignia>
              {huecos.length > 0 && <Insignia tono="faro">{plural(huecos.length, "hueco ofrecido", "huecos ofrecidos")}</Insignia>}
            </div>
            <div className="mb-4">
              <CintaDia compacta bloques={cintaDe(db, profesorId, fecha)} />
            </div>

            <ol className="flex flex-col">
              {[TURNO_MANANA, TURNO_TARDE].map((turno, t) => (
                <li key={t}>
                  {t === 1 && (
                    <p className="my-2 flex items-center gap-2 text-xs font-semibold text-tenue">
                      <span className="h-px flex-1 bg-linea" /> Comida · 14:00–16:00 <span className="h-px flex-1 bg-linea" />
                    </p>
                  )}
                  <ol className="flex flex-col gap-1.5">
                    {agrupar(turno, (b) => R.ocupanteDe(db, profesorId, fecha, b)?.id ?? (huecos.some((o) => o.inicio === b) ? `hueco:${b}` : null)).map((g) => {
                      if (!g.practicaId || g.practicaId.startsWith("hueco:")) {
                        const oferta = g.practicaId ? huecos.find((o) => o.inicio === g.bloques[0]) : undefined;
                        return (
                          <li key={g.bloques[0]} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${oferta ? "border-2 border-dashed border-faro-500 text-faro-800" : "text-tenue"}`}>
                            <span className="cifra w-[92px] shrink-0">{g.bloques[0]}–{horaFin(g.bloques.at(-1)!)}</span>
                            {oferta ? "Hueco ofrecido a la lista de espera" : g.bloques.length > 1 ? `Libre (${g.bloques.length} clases)` : "Libre"}
                          </li>
                        );
                      }
                      const p = db.practicas.find((x) => x.id === g.practicaId)!;
                      const a = R.alumnoPorId(db, p.alumnoId)!;
                      const terminada = yaTerminada(p.fecha, p.inicio);
                      const estado =
                        p.estado === "realizada" ? <Insignia tono="oscuro">Hecha</Insignia>
                        : p.estado === "no_presentado" ? <Insignia tono="rojo">No vino</Insignia>
                        : terminada ? <Insignia tono="ambar">Por cerrar</Insignia>
                        : p.confirmada ? <Insignia tono="verde">Confirmada</Insignia>
                        : <Insignia tono="neutro">Sin confirmar</Insignia>;
                      const ultima = R.evaluacionesDe(db, a.id).at(-1);
                      const faltan = ultima ? R.maniobrasQueFaltan(ultima.niveles) : [];
                      return (
                        <li key={p.id}>
                          <Link href={`/profesor/practica/${p.id}`} className="tarjeta flex items-start gap-3 px-3 py-3 active:scale-[0.99]">
                            <span className="cifra w-[92px] shrink-0 pt-0.5 text-sm font-semibold">{p.inicio}–{horaFin(p.inicio)}</span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2 font-semibold">
                                <SemaforoPunto valor={R.semaforoDe(db, a.id)} />
                                <span className="truncate">{R.nombreCompleto(a)}</span>
                              </span>
                              <span className="mt-0.5 block truncate text-sm text-gris">
                                {faltan.length ? `Trabajar: ${faltan.slice(0, 3).map((m) => m.nombre.toLowerCase()).join(", ")}` : ultima ? "Todo dominado: repaso de zonas de examen" : "Primera práctica"}
                              </span>
                            </span>
                            <span className="shrink-0">{estado}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </li>
              ))}
            </ol>
          </>
        )}
        {fecha !== h && fecha !== proximoLab && (
          <p className="mt-4 text-center">
            <Link href="/profesor" className="btn-texto">Volver a hoy</Link>
          </p>
        )}
      </section>
    </div>
  );
}

/** Agrupa bloques seguidos libres; cada práctica va sola. */
function agrupar(turno: string[], ocupante: (b: string) => string | null) {
  const grupos: { practicaId: string | null; bloques: string[] }[] = [];
  for (const b of turno) {
    const id = ocupante(b);
    const ultimo = grupos.at(-1);
    if (!id && ultimo && !ultimo.practicaId) ultimo.bloques.push(b);
    else grupos.push({ practicaId: id, bloques: [b] });
  }
  return grupos;
}
