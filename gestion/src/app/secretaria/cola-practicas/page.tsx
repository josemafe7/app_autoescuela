import Link from "next/link";
import { leer } from "@/lib/db";
import { exigirSecretaria } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { diasEntre, fechaLarga, hoy } from "@/lib/fechas";
import { plural } from "@/lib/formato";
import { Avatar, Cabecera, Seccion, tonoDe, Vacio, VolverA } from "@/components/ui";
import { BotonEnviar } from "@/components/BotonEnviar";
import { asignarProfesor } from "@/app/acciones/alumnos";

export default async function ColaPracticas() {
  await exigirSecretaria();
  const db = await leer();
  const cola = R.colaPracticas(db);
  const ruta = "/secretaria/cola-practicas";
  const carga = db.profesores.map((p) => {
    const alumnos = db.alumnos.filter((a) => a.profesorId === p.id && a.fase === "practicas");
    const verdes = alumnos.filter((a) => a.verdeDesde).length;
    return { p, alumnos: alumnos.length, verdes, oc: R.ocupacionSemana(db, p.id) };
  });

  return (
    <>
      <Cabecera
        titulo="Cola de prácticas"
        subtitulo="Alumnos con el teórico aprobado que esperan profesor, por orden de fecha de aprobado. Al asignarles profesor, empiezan."
      />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Seccion titulo={`${plural(cola.length, "alumno")} esperando`}>
          {cola.length === 0 ? (
            <Vacio icono="check_circle" titulo="Nadie esperando">Todos los alumnos con el teórico aprobado tienen profesor.</Vacio>
          ) : (
            <ol className="tarjeta divide-y divide-linea">
              {cola.map((a, i) => {
                const saldo = R.saldo(db, a.id);
                return (
                  <li key={a.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
                    <span className="cifra w-8 shrink-0 text-2xl font-semibold text-faro-600">{i + 1}</span>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar texto={R.iniciales(a)} tono={tonoDe(a.id)} tamano="sm" />
                      <div className="min-w-0">
                        <Link href={`/secretaria/alumnos/${a.id}`} className="block truncate font-semibold hover:underline">{R.nombreCompleto(a)}</Link>
                        <p className="text-sm text-gris">
                          Aprobó el teórico el {fechaLarga(a.teorico.aprobadoEl!)} · espera hace {plural(diasEntre(a.teorico.aprobadoEl!, hoy()), "día")}
                          {saldo > 0 && ` · ${plural(saldo, "práctica")} pagada${saldo === 1 ? "" : "s"}`}
                        </p>
                      </div>
                    </div>
                    <form action={asignarProfesor} className="flex gap-2">
                      <VolverA ruta={ruta} />
                      <input type="hidden" name="alumnoId" value={a.id} />
                      <label htmlFor={`p-${a.id}`} className="sr-only">Profesor para {a.nombre}</label>
                      <select id={`p-${a.id}`} name="profesorId" required defaultValue="" className="campo min-h-[36px] w-40 py-1">
                        <option value="" disabled>Profesor…</option>
                        {carga.map(({ p, alumnos }) => (
                          <option key={p.id} value={p.id}>{p.nombre} ({alumnos})</option>
                        ))}
                      </select>
                      <BotonEnviar className="btn-primario btn-sm">Asignar</BotonEnviar>
                    </form>
                  </li>
                );
              })}
            </ol>
          )}
        </Seccion>

        <aside>
          <Seccion titulo="Carga de cada profesor">
            <ul className="tarjeta divide-y divide-linea">
              {carga.map(({ p, alumnos, verdes, oc }) => (
                <li key={p.id} className="px-4 py-3">
                  <p className="flex items-center justify-between font-semibold">
                    {R.nombreCompleto(p)}
                    <span className="cifra">{alumnos}</span>
                  </p>
                  <p className="text-sm text-gris">
                    {plural(alumnos, "alumno")} en prácticas · {verdes} en verde (saldrán pronto) · {oc.ocupadas} de {oc.total} horas esta semana
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-gris">
              Cuando un alumno aprueba el práctico, su profesor libera hueco: es el momento de asignar al primero de la cola.
            </p>
          </Seccion>
        </aside>
      </div>
    </>
  );
}
