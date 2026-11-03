import Link from "next/link";
import { notFound } from "next/navigation";
import { leer } from "@/lib/db";
import { exigirProfesor } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { MANIOBRAS } from "@/lib/tipos";
import { fechaCorta, fechaLarga, mayus, relativo } from "@/lib/fechas";
import { plural } from "@/lib/formato";
import { Alerta, Avatar, Icono, NivelChip, SemaforoChip, tonoDe, Vacio, Volver } from "@/components/ui";

export default async function AlumnoDelProfesor({ params }: { params: Promise<{ id: string }> }) {
  const profesorId = await exigirProfesor();
  const { id } = await params;
  const db = await leer();
  const a = R.alumnoPorId(db, id);
  if (!a || a.profesorId !== profesorId) notFound();
  const evals = R.evaluacionesDe(db, a.id);
  const niveles = R.nivelesActuales(db, a.id);
  const semaforo = R.semaforoDe(db, a.id);
  const proximas = R.proximasPracticas(db, a.id);
  const puesto = R.puestoEnCola(db, a.id);
  const plaza = R.plazaPendiente(db, a.id);
  const m = R.monedero(db, a.id);

  return (
    <div className="flex flex-col gap-5">
      <Volver href="/profesor/alumnos">Mis alumnos</Volver>
      <header className="flex items-center gap-3">
        <Avatar texto={R.iniciales(a)} tono={tonoDe(a.id)} tamano="lg" />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">{R.nombreCompleto(a)}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <SemaforoChip valor={semaforo} />
            <a href={`tel:${a.telefono.replace(/\s/g, "")}`} className="text-sm font-semibold text-gris hover:text-tinta">
              <Icono nombre="call" className="!text-[16px]" /> {a.telefono}
            </a>
          </div>
        </div>
      </header>

      <dl className="tarjeta grid grid-cols-3 divide-x divide-linea text-center">
        <div className="p-3">
          <dt className="text-xs text-gris">Hechas</dt>
          <dd className="cifra text-xl font-semibold">{m.realizadas}</dd>
        </div>
        <div className="p-3">
          <dt className="text-xs text-gris">Le quedan</dt>
          <dd className={`cifra text-xl font-semibold ${m.disponibles <= 1 ? "text-rojo-600" : ""}`}>{m.disponibles}</dd>
        </div>
        <div className="p-3">
          <dt className="text-xs text-gris">Examen</dt>
          <dd className="text-sm font-semibold leading-7">{plaza ? fechaCorta(plaza.fecha) : puesto ? `Puesto ${puesto}` : "—"}</dd>
        </div>
      </dl>

      {a.avisoRetroceso && <Alerta tono="ambar" icono="trending_down" titulo="Estaba en verde y ha bajado">Secretaría decide si sigue en la cola de examen.</Alerta>}

      <section>
        <h2 className="mb-2 text-base font-bold">Maniobras</h2>
        {evals.length === 0 ? (
          <Vacio titulo="Aún sin evaluar" />
        ) : (
          <ul className="tarjeta divide-y divide-linea px-4">
            {MANIOBRAS.map((mm) => (
              <li key={mm.id} className="flex items-center justify-between gap-3 py-2.5 text-[0.9375rem]">
                {mm.nombre}
                <NivelChip nivel={niveles[mm.id]} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {proximas.length > 0 && (
        <section>
          <h2 className="mb-2 text-base font-bold">Próximas prácticas</h2>
          <ul className="tarjeta divide-y divide-linea">
            {proximas.map((p) => (
              <li key={p.id}>
                <Link href={`/profesor/practica/${p.id}`} className="flex items-center justify-between px-4 py-3">
                  <span className="font-semibold">{mayus(relativo(p.fecha))}, {p.inicio}</span>
                  <span className="text-sm text-gris">{p.confirmada ? "Confirmada" : "Sin confirmar"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-base font-bold">Últimas notas</h2>
        {evals.length === 0 ? (
          <Vacio titulo="Sin notas todavía" />
        ) : (
          <ol className="flex flex-col gap-2">
            {[...evals].reverse().slice(0, 5).map((e) => (
              <li key={e.id}>
                <Link href={`/profesor/practica/${e.practicaId}`} className="tarjeta block px-4 py-3">
                  <p className="flex items-center justify-between text-sm text-gris">
                    {mayus(fechaLarga(e.fecha))}
                    {e.falloGrave && <span className="font-semibold text-rojo-600">Fallo grave</span>}
                  </p>
                  <p className="mt-0.5">{e.resumen}</p>
                </Link>
              </li>
            ))}
          </ol>
        )}
        {evals.length > 5 && <p className="mt-2 text-sm text-gris">Y {plural(evals.length - 5, "práctica")} más.</p>}
      </section>
    </div>
  );
}
