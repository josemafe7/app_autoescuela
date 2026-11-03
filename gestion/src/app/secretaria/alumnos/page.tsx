import Link from "next/link";
import { leer } from "@/lib/db";
import { exigirSecretaria } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { Fase, FASES } from "@/lib/tipos";
import { situacionAlumno } from "@/lib/situacion";
import { eurCorto } from "@/lib/formato";
import { Avatar, Cabecera, Icono, SemaforoChip, tonoDe, Vacio, VolverA } from "@/components/ui";
import { BotonEnviar } from "@/components/BotonEnviar";
import { crearAlumno } from "@/app/acciones/alumnos";

type Params = Promise<{ fase?: string; q?: string; nuevo?: string }>;

export default async function Alumnos({ searchParams }: { searchParams: Params }) {
  await exigirSecretaria();
  const sp = await searchParams;
  const db = await leer();
  const fase = (sp.fase && sp.fase in FASES ? sp.fase : "") as Fase | "";
  const q = (sp.q ?? "").trim().toLowerCase();
  const normal = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const lista = db.alumnos
    .filter((a) => !fase || a.fase === fase)
    .filter((a) => !q || normal(`${a.nombre} ${a.apellidos} ${a.dni} ${a.telefono}`).includes(normal(q)))
    .sort((a, b) => `${a.nombre} ${a.apellidos}`.localeCompare(`${b.nombre} ${b.apellidos}`, "es"));

  const pestanas: { valor: Fase | ""; texto: string }[] = [
    { valor: "", texto: "Todos" },
    { valor: "teorico", texto: "Teórico" },
    { valor: "espera_practicas", texto: "Esperando prácticas" },
    { valor: "practicas", texto: "En prácticas" },
    { valor: "aprobado", texto: "Aprobados" },
  ];
  const enlace = (f: string) => {
    const p = new URLSearchParams();
    if (f) p.set("fase", f);
    if (q) p.set("q", sp.q!);
    const s = p.toString();
    return s ? `/secretaria/alumnos?${s}` : "/secretaria/alumnos";
  };

  return (
    <>
      <Cabecera
        titulo="Alumnos"
        subtitulo={`${db.alumnos.length} alumnos · ${db.alumnos.filter((a) => a.fase !== "aprobado").length} activos`}
        acciones={
          <Link href="/secretaria/alumnos?nuevo=1#nuevo" className="btn-primario">
            <Icono nombre="person_add" /> Nuevo alumno
          </Link>
        }
      />

      {sp.nuevo === "1" && (
        <section id="nuevo" className="tarjeta aparecer mb-6 p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold">Alta de alumno</h2>
              <p className="ayuda">Entra en la fase de teórico. Después registra el pago de la matrícula y la tasa desde su ficha.</p>
            </div>
            <Link href="/secretaria/alumnos" className="rounded-lg p-1.5 text-gris hover:bg-hundido" aria-label="Cerrar">
              <Icono nombre="close" />
            </Link>
          </div>
          <form action={crearAlumno} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <VolverA ruta="/secretaria/alumnos?nuevo=1" />
            <div>
              <label className="etiqueta" htmlFor="nombre">Nombre</label>
              <input id="nombre" name="nombre" className="campo" required autoComplete="off" />
            </div>
            <div>
              <label className="etiqueta" htmlFor="apellidos">Apellidos</label>
              <input id="apellidos" name="apellidos" className="campo" required autoComplete="off" />
            </div>
            <div>
              <label className="etiqueta" htmlFor="dni">DNI o NIE</label>
              <input id="dni" name="dni" className="campo uppercase" placeholder="12345678Z" autoComplete="off" />
            </div>
            <div>
              <label className="etiqueta" htmlFor="telefono">Teléfono (WhatsApp)</label>
              <input id="telefono" name="telefono" className="campo" required inputMode="tel" placeholder="600 000 000" />
            </div>
            <div>
              <label className="etiqueta" htmlFor="email">Correo</label>
              <input id="email" name="email" type="email" className="campo" />
            </div>
            <div className="flex items-end">
              <BotonEnviar className="btn-primario w-full">Dar de alta</BotonEnviar>
            </div>
          </form>
        </section>
      )}

      <nav aria-label="Fases" className="mb-4 flex gap-1 overflow-x-auto border-b border-linea">
        {pestanas.map((p) => {
          const n = p.valor ? db.alumnos.filter((a) => a.fase === p.valor).length : db.alumnos.length;
          const activo = fase === p.valor;
          return (
            <Link
              key={p.valor || "todos"}
              href={enlace(p.valor)}
              aria-current={activo ? "page" : undefined}
              className={`-mb-px shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-[0.9375rem] ${activo ? "border-faro-600 font-semibold text-tinta" : "border-transparent text-gris hover:text-tinta"}`}
            >
              {p.texto} <span className="cifra text-tenue">{n}</span>
            </Link>
          );
        })}
      </nav>

      <form className="mb-4 flex flex-wrap items-center justify-between gap-3" role="search">
        {fase && <input type="hidden" name="fase" value={fase} />}
        <div className="relative w-full sm:w-80">
          <Icono nombre="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tenue" />
          <label htmlFor="q" className="sr-only">Buscar alumno</label>
          <input id="q" name="q" defaultValue={sp.q ?? ""} placeholder="Nombre, DNI o teléfono" className="campo pl-10" />
        </div>
        <p className="text-sm text-gris">{lista.length} {lista.length === 1 ? "alumno" : "alumnos"}</p>
      </form>

      {lista.length === 0 ? (
        <Vacio icono="search_off" titulo="Ningún alumno coincide">Prueba con otro nombre o quita el filtro.</Vacio>
      ) : (
        <>
          {/* Escritorio */}
          <div className="tarjeta hidden overflow-x-auto md:block">
            <table className="tabla">
              <thead>
                <tr>
                  <th className="pl-5">Alumno</th>
                  <th>Situación</th>
                  <th>Profesor</th>
                  <th className="text-right">Prácticas</th>
                  <th className="text-right">Debe</th>
                  <th className="pr-5">Semáforo</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((a) => {
                  const prof = R.profesorPorId(db, a.profesorId);
                  const deuda = R.totalDeuda(db, a.id);
                  const s = R.saldo(db, a.id);
                  return (
                    <tr key={a.id} className="relative">
                      <td className="pl-5">
                        <Link href={`/secretaria/alumnos/${a.id}`} className="flex items-center gap-3 after:absolute after:inset-0">
                          <Avatar texto={R.iniciales(a)} tono={tonoDe(a.id)} tamano="sm" />
                          <span>
                            <span className="block font-semibold">{R.nombreCompleto(a)}</span>
                            <span className="cifra block text-[0.8125rem] text-gris">{a.dni || "Sin DNI"} · {a.telefono}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="text-gris">
                        <span className="block text-tinta">{FASES[a.fase]}</span>
                        <span className="text-[0.8125rem]">{situacionAlumno(db, a)}</span>
                      </td>
                      <td>{prof ? prof.nombre : <span className="text-tenue">—</span>}</td>
                      <td className={`cifra text-right ${a.fase === "practicas" && s <= 1 ? "font-semibold text-rojo-600" : ""}`}>
                        {a.fase === "teorico" ? <span className="text-tenue">—</span> : s}
                      </td>
                      <td className={`cifra text-right ${deuda > 0 ? "font-semibold text-rojo-600" : "text-tenue"}`}>{deuda > 0 ? eurCorto(deuda) : "—"}</td>
                      <td className="pr-5">{a.fase === "practicas" ? <SemaforoChip valor={R.semaforoDe(db, a.id)} corto /> : <span className="text-tenue">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Móvil */}
          <ul className="tarjeta divide-y divide-linea md:hidden">
            {lista.map((a) => {
              const deuda = R.totalDeuda(db, a.id);
              return (
                <li key={a.id}>
                  <Link href={`/secretaria/alumnos/${a.id}`} className="flex items-center gap-3 px-4 py-3">
                    <Avatar texto={R.iniciales(a)} tono={tonoDe(a.id)} tamano="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="flex justify-between gap-2 font-semibold">
                        <span className="truncate">{R.nombreCompleto(a)}</span>
                        {deuda > 0 && <span className="cifra shrink-0 text-rojo-600">{eurCorto(deuda)}</span>}
                      </span>
                      <span className="block truncate text-[0.8125rem] text-gris">{situacionAlumno(db, a)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
