import Link from "next/link";
import { leer } from "@/lib/db";
import { fechaDeURL } from "@/lib/acciones-util";
import { exigirSecretaria } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { BLOQUES } from "@/lib/tipos";
import { diaCorto, esDomingo, fechaLarga, hoy, horaFin, lunesDe, mayus, sumarDias, desdeISO, nombreMes } from "@/lib/fechas";
import { plural } from "@/lib/formato";
import { Avatar, Cabecera, Icono, Insignia, tonoDe, VolverA } from "@/components/ui";
import { CintaDia, cintaDe, Leyenda } from "@/components/CintaDia";
import { BotonEnviar } from "@/components/BotonEnviar";
import { reservarComoSecretaria } from "@/app/acciones/agenda";

type Params = Promise<{ fecha?: string; profesor?: string; hora?: string }>;

export default async function Agenda({ searchParams }: { searchParams: Params }) {
  await exigirSecretaria();
  const sp = await searchParams;
  const db = await leer();
  const h = hoy();
  let fecha = fechaDeURL(sp.fecha, h);
  if (esDomingo(fecha)) fecha = sumarDias(fecha, 1);
  const lunes = lunesDe(fecha);
  const dias = Array.from({ length: 6 }, (_, i) => sumarDias(lunes, i));
  const sabado = dias[5];
  const reservando =
    sp.profesor && sp.hora && BLOQUES.includes(sp.hora) && R.profesorPorId(db, sp.profesor) && !R.ocupanteDe(db, sp.profesor, fecha, sp.hora)
      ? { profesor: R.profesorPorId(db, sp.profesor)!, hora: sp.hora }
      : null;
  const ruta = `/secretaria/agenda?fecha=${fecha}`;
  const enlaceLibre = (profesorId: string) => (inicio: string) => `/secretaria/agenda?fecha=${fecha}&profesor=${profesorId}&hora=${inicio}#reservar`;

  const dl = desdeISO(lunes);
  const ds = desdeISO(sabado);
  const rango =
    dl.getMonth() === ds.getMonth()
      ? `del ${dl.getDate()} al ${ds.getDate()} de ${nombreMes(ds.getMonth())}`
      : `del ${dl.getDate()} de ${nombreMes(dl.getMonth())} al ${ds.getDate()} de ${nombreMes(ds.getMonth())}`;

  const alumnosPracticas = db.alumnos.filter((a) => a.fase === "practicas").sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return (
    <>
      <Cabecera
        titulo="Agenda"
        subtitulo={`Semana ${rango}. Pulsa una hora libre para reservar o una clase para abrirla.`}
        acciones={
          <div className="flex items-center gap-1">
            <Link href={`/secretaria/agenda?fecha=${sumarDias(lunes, -7)}`} className="btn-secundario btn-sm" aria-label="Semana anterior">
              <Icono nombre="chevron_left" />
            </Link>
            <Link href="/secretaria/agenda" className="btn-secundario btn-sm">Hoy</Link>
            <Link href={`/secretaria/agenda?fecha=${sumarDias(lunes, 7)}`} className="btn-secundario btn-sm" aria-label="Semana siguiente">
              <Icono nombre="chevron_right" />
            </Link>
          </div>
        }
      />

      {/* Pestañas de días */}
      <nav aria-label="Días de la semana" className="mb-5 flex gap-1 overflow-x-auto border-b border-linea">
        {dias.map((d) => {
          const n = db.practicas.filter((p) => p.fecha === d && R.ESTADOS_QUE_OCUPAN.includes(p.estado)).length;
          const activo = d === fecha;
          return (
            <Link
              key={d}
              href={`/secretaria/agenda?fecha=${d}`}
              aria-current={activo ? "date" : undefined}
              className={`-mb-px shrink-0 border-b-2 px-3 pb-2 pt-1 text-center ${activo ? "border-faro-600 text-tinta" : "border-transparent text-gris hover:text-tinta"}`}
            >
              <span className="block text-sm font-semibold capitalize">
                {diaCorto(d)} {desdeISO(d).getDate()}
                {d === h && <span className="ml-1 text-faro-600">· hoy</span>}
              </span>
              <span className="cifra block text-xs">{plural(n, "clase")}</span>
            </Link>
          );
        })}
      </nav>

      {reservando && (
        <section id="reservar" className="tarjeta aparecer mb-6 border-faro-200 p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">
                Reservar con {reservando.profesor.nombre}: {fechaLarga(fecha)}, {reservando.hora}–{horaFin(reservando.hora)}
              </h2>
              <p className="ayuda mt-0.5">
                Como secretaría puedes reservar cualquier hora libre, aunque deje un hueco.
                {R.cocheDelDia(db, reservando.profesor.id, fecha).sustitucion && " Ese día sale con el coche de reserva."}
              </p>
            </div>
            <Link href={ruta} className="rounded-lg p-1.5 text-gris hover:bg-hundido" aria-label="Cerrar">
              <Icono nombre="close" />
            </Link>
          </div>
          <form action={reservarComoSecretaria} className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <VolverA ruta={ruta} />
            <input type="hidden" name="profesorId" value={reservando.profesor.id} />
            <input type="hidden" name="fecha" value={fecha} />
            <input type="hidden" name="inicio" value={reservando.hora} />
            <div>
              <label htmlFor="alumnoId" className="etiqueta">Alumno</label>
              <select id="alumnoId" name="alumnoId" className="campo" required defaultValue="">
                <option value="" disabled>Elige un alumno…</option>
                <optgroup label={`Alumnos de ${reservando.profesor.nombre}`}>
                  {alumnosPracticas
                    .filter((a) => a.profesorId === reservando.profesor.id)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {R.nombreCompleto(a)} · {plural(R.saldo(db, a.id), "práctica")}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Otros alumnos">
                  {alumnosPracticas
                    .filter((a) => a.profesorId !== reservando.profesor.id)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {R.nombreCompleto(a)} · {plural(R.saldo(db, a.id), "práctica")}
                      </option>
                    ))}
                </optgroup>
              </select>
              <label className="mt-3 flex items-start gap-2 text-sm">
                <input type="checkbox" name="sinSaldo" value="1" className="mt-0.5 h-4 w-4 accent-faro-600" />
                <span>
                  <span className="font-semibold">Asignar sin saldo</span>
                  <span className="text-gris">. Solo para un caso puntual: queda como deuda de {db.tarifas.find((t) => t.tipo === "suelta")!.precio} € en su ficha y en el panel.</span>
                </span>
              </label>
            </div>
            <BotonEnviar>Reservar</BotonEnviar>
          </form>
        </section>
      )}

      {/* Día seleccionado */}
      <section className="tarjeta mb-8 p-5">
        <h2 className="mb-4 text-base font-bold">{mayus(fechaLarga(fecha))}</h2>
        <div className="flex flex-col gap-5">
          {db.profesores.map((p) => {
            const coche = R.cocheDelDia(db, p.id, fecha);
            const c = db.coches.find((x) => x.id === coche.cocheId)!;
            const examen = R.examenEnFecha(db, fecha);
            return (
              <div key={p.id}>
                <p className="mb-1.5 flex flex-wrap items-center gap-2 text-[0.9375rem] font-semibold">
                  <Avatar texto={R.iniciales(p)} tono={tonoDe(p.id)} tamano="sm" />
                  {R.nombreCompleto(p)}
                  <span className="font-normal text-gris">· {c.modelo} {c.matricula}</span>
                  {coche.sustitucion && <Insignia tono="ambar">Coche de reserva</Insignia>}
                  {examen && examen.confirmada && <Insignia tono="faro">Día de examen</Insignia>}
                </p>
                <CintaDia bloques={cintaDe(db, p.id, fecha, (id) => `/secretaria/practicas/${id}`, enlaceLibre(p.id))} />
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Leyenda />
          <p className="flex items-center gap-1.5 text-[0.8125rem] text-gris">
            <span className="h-1.5 w-1.5 rounded-full bg-rojo-600" /> Práctica dada sin saldo
          </p>
        </div>
      </section>

      {/* Semana completa */}
      <section>
        <h2 className="mb-3 text-base font-bold">La semana de un vistazo</h2>
        <div className="tarjeta overflow-x-auto p-5">
          <table className="w-full min-w-[760px] border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="w-[140px] pb-1 text-left text-[0.8125rem] font-medium text-gris">Profesor</th>
                {dias.map((d) => (
                  <th key={d} className="px-1 pb-1 text-left text-[0.8125rem] font-medium capitalize text-gris">
                    <Link href={`/secretaria/agenda?fecha=${d}`} className={`hover:text-tinta ${d === fecha ? "text-tinta" : ""}`}>
                      {diaCorto(d)} {desdeISO(d).getDate()}
                    </Link>
                  </th>
                ))}
                <th className="pb-1 text-right text-[0.8125rem] font-medium text-gris">Horas</th>
              </tr>
            </thead>
            <tbody>
              {db.profesores.map((p) => {
                const oc = R.ocupacionSemana(db, p.id, fecha);
                return (
                  <tr key={p.id}>
                    <td className="pr-3 text-[0.9375rem] font-semibold">{p.nombre}</td>
                    {dias.map((d) => (
                      <td key={d} className="px-1">
                        <Link href={`/secretaria/agenda?fecha=${d}`} className="block rounded hover:opacity-80" aria-label={`${p.nombre}, ${fechaLarga(d)}`}>
                          <CintaDia compacta bloques={cintaDe(db, p.id, d)} />
                        </Link>
                      </td>
                    ))}
                    <td className="cifra pl-3 text-right text-sm text-gris">
                      <span className="font-semibold text-tinta">{oc.ocupadas}</span>/{oc.total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
