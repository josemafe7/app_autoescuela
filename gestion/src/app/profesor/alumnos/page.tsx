import Link from "next/link";
import { leer } from "@/lib/db";
import { exigirProfesor } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { Semaforo, SEMAFOROS } from "@/lib/tipos";
import { relativo } from "@/lib/fechas";
import { plural } from "@/lib/formato";
import { Avatar, Icono, SemaforoChip, tonoDe, Vacio } from "@/components/ui";

export default async function MisAlumnos() {
  const profesorId = await exigirProfesor();
  const db = await leer();
  const alumnos = db.alumnos.filter((a) => a.profesorId === profesorId && a.fase === "practicas");
  const orden: Semaforo[] = ["verde", "ambar", "rojo"];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Mis alumnos</h1>
        <p className="text-sm text-gris">{plural(alumnos.length, "alumno")} en prácticas</p>
      </div>
      {alumnos.length === 0 && <Vacio titulo="Aún no tienes alumnos asignados" />}
      {orden.map((s) => {
        const grupo = alumnos.filter((a) => R.semaforoDe(db, a.id) === s);
        if (!grupo.length) return null;
        return (
          <section key={s}>
            <h2 className="mb-2 flex items-center gap-2 text-base font-bold">
              <SemaforoChip valor={s} /> <span className="font-normal text-gris">{grupo.length}</span>
            </h2>
            <ul className="tarjeta divide-y divide-linea">
              {grupo.map((a) => {
                const proxima = R.proximasPracticas(db, a.id)[0];
                const puesto = R.puestoEnCola(db, a.id);
                const ultima = R.evaluacionesDe(db, a.id).at(-1);
                return (
                  <li key={a.id}>
                    <Link href={`/profesor/alumnos/${a.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-fondo">
                      <Avatar texto={R.iniciales(a)} tono={tonoDe(a.id)} tamano="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{R.nombreCompleto(a)}</span>
                        <span className="block truncate text-sm text-gris">
                          {R.monedero(db, a.id).realizadas} hechas
                          {proxima ? ` · próxima ${relativo(proxima.fecha)} ${proxima.inicio}` : " · sin reservas"}
                          {puesto ? ` · puesto ${puesto} examen` : ""}
                          {!puesto && ultima && s !== "verde" ? ` · faltan ${R.maniobrasQueFaltan(ultima.niveles).length}` : ""}
                        </span>
                      </span>
                      <Icono nombre="chevron_right" className="text-tenue" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <p className="text-xs text-gris">
        {SEMAFOROS.verde}: todas las maniobras dominadas y 2 prácticas seguidas sin fallos graves. {SEMAFOROS.ambar}: le faltan 1 o 2.
      </p>
    </div>
  );
}
