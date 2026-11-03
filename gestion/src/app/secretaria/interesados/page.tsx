import Link from "next/link";
import { leer } from "@/lib/db";
import { exigirSecretaria } from "@/lib/perfil";
import { EstadoInteresado, ESTADOS_INTERESADO, ORIGENES_INTERESADO } from "@/lib/tipos";
import { fechaHora } from "@/lib/fechas";
import { Cabecera, Icono, Insignia, Vacio } from "@/components/ui";

const TONO: Record<EstadoInteresado, "faro" | "neutro" | "ambar" | "verde"> = {
  nuevo: "faro",
  contactado: "neutro",
  clase_prueba: "ambar",
  matriculado: "verde",
};

const ICONO_ORIGEN = { asistente_ia: "smart_toy", clase_prueba: "directions_car", matricula: "how_to_reg" } as const;

export default async function Interesados({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  await exigirSecretaria();
  const sp = await searchParams;
  const db = await leer();
  const estado = (sp.estado && sp.estado in ESTADOS_INTERESADO ? sp.estado : "") as EstadoInteresado | "";
  const lista = db.interesados.filter((i) => !estado || i.estado === estado).sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <>
      <Cabecera
        titulo="Interesados"
        subtitulo="Contactos que llegan desde la web: el asistente de IA y los formularios «Matricúlate» y «Clase de prueba». Llegan solos: la web y la gestión comparten la base de datos."
      />
      <nav aria-label="Estados" className="mb-4 flex gap-1 overflow-x-auto border-b border-linea">
        {[["", "Todos"] as const, ...Object.entries(ESTADOS_INTERESADO)].map(([v, t]) => {
          const n = v ? db.interesados.filter((i) => i.estado === v).length : db.interesados.length;
          const activo = estado === v;
          return (
            <Link
              key={v || "todos"}
              href={v ? `/secretaria/interesados?estado=${v}` : "/secretaria/interesados"}
              aria-current={activo ? "page" : undefined}
              className={`-mb-px shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-[0.9375rem] ${activo ? "border-faro-600 font-semibold" : "border-transparent text-gris hover:text-tinta"}`}
            >
              {t} <span className="cifra text-tenue">{n}</span>
            </Link>
          );
        })}
      </nav>

      {lista.length === 0 ? (
        <Vacio titulo="Nadie en este estado" />
      ) : (
        <ul className="tarjeta divide-y divide-linea">
          {lista.map((i) => {
            const ultimo = i.conversacion?.filter((m) => m.role === "user").at(-1)?.content;
            return (
              <li key={i.id}>
                <Link href={`/secretaria/interesados/${i.id}`} className="flex items-center gap-4 px-4 py-3.5 hover:bg-fondo">
                  <Icono nombre={ICONO_ORIGEN[i.origen]} className="text-gris" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-2 font-semibold">
                      {i.nombre}
                      {i.telefono && <span className="cifra text-sm font-normal text-gris">{i.telefono}</span>}
                    </p>
                    <p className="truncate text-sm text-gris">
                      {ORIGENES_INTERESADO[i.origen]} · {fechaHora(i.fecha)}
                      {ultimo ? ` · «${ultimo}»` : i.packElegido ? ` · ${i.packElegido}` : i.diaPreferido ? ` · prefiere ${i.diaPreferido.toLowerCase()} por la ${i.franjaHoraria?.toLowerCase()}` : ""}
                    </p>
                  </div>
                  <Insignia tono={TONO[i.estado]}>{ESTADOS_INTERESADO[i.estado]}</Insignia>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
