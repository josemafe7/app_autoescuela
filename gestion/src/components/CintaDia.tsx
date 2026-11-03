// La «cinta del día»: los 14 bloques de 45 minutos de un profesor, con la parada
// de la comida en medio. Es la pieza propia de Faro Gestión: de un vistazo se ve
// qué horas están ocupadas, cuáles libres, los plantones y los huecos ofrecidos.

import Link from "next/link";
import { BaseDatos, TURNO_MANANA, TURNO_TARDE } from "@/lib/tipos";
import * as R from "@/lib/reglas";
import { horaFin, yaTerminada } from "@/lib/fechas";

export type TipoBloque = "libre" | "pasado" | "reservada" | "sin_cerrar" | "realizada" | "no_presentado" | "hueco";

export interface BloqueCinta {
  inicio: string;
  tipo: TipoBloque;
  texto?: string;
  detalle?: string;
  href?: string;
  sinSaldo?: boolean;
  confirmada?: boolean;
}

export function cintaDe(
  db: BaseDatos,
  profesorId: string,
  fecha: string,
  enlace?: (practicaId: string) => string,
  enlaceLibre?: (inicio: string) => string,
): BloqueCinta[] {
  const ahora = new Date();
  return [...TURNO_MANANA, ...TURNO_TARDE].map((inicio) => {
    const p = R.ocupanteDe(db, profesorId, fecha, inicio);
    if (p) {
      const a = R.alumnoPorId(db, p.alumnoId)!;
      const terminada = yaTerminada(p.fecha, p.inicio, ahora);
      const tipo: TipoBloque =
        p.estado === "realizada" ? "realizada" : p.estado === "no_presentado" ? "no_presentado" : terminada ? "sin_cerrar" : "reservada";
      return {
        inicio,
        tipo,
        texto: a.nombre,
        detalle: `${inicio}–${horaFin(inicio)} · ${R.nombreCompleto(a)}`,
        href: enlace?.(p.id),
        sinSaldo: p.sinSaldo,
        confirmada: p.confirmada,
      };
    }
    const oferta = db.ofertas.find(
      (o) => o.profesorId === profesorId && o.fecha === fecha && o.inicio === inicio && R.estadoOferta(db, o).startsWith("abierta"),
    );
    if (oferta) return { inicio, tipo: "hueco", texto: "Hueco ofrecido", detalle: `${inicio} · ofrecido a la lista de espera`, href: enlaceLibre?.(inicio) };
    const pasado = yaTerminada(fecha, inicio, ahora);
    return {
      inicio,
      tipo: pasado ? "pasado" : "libre",
      detalle: `${inicio}–${horaFin(inicio)} · libre`,
      href: pasado ? undefined : enlaceLibre?.(inicio),
    };
  });
}

const ESTILO: Record<TipoBloque, string> = {
  libre: "bg-superficie text-tenue border border-dashed border-linea",
  pasado: "bg-hundido/50 text-tenue",
  reservada: "bg-faro-100 text-faro-800",
  sin_cerrar: "bg-ambar-50 text-ambar-800 ring-1 ring-inset ring-ambar-600/40",
  realizada: "bg-tinta text-white",
  no_presentado: "rayado bg-rojo-50 text-rojo-800",
  hueco: "bg-superficie text-faro-800 border-2 border-dashed border-faro-500",
};

export const LEYENDA: { tipo: TipoBloque; texto: string }[] = [
  { tipo: "reservada", texto: "Reservada" },
  { tipo: "sin_cerrar", texto: "Sin cerrar" },
  { tipo: "realizada", texto: "Realizada" },
  { tipo: "no_presentado", texto: "No se presentó" },
  { tipo: "hueco", texto: "Hueco ofrecido" },
  { tipo: "libre", texto: "Libre" },
];

function Bloque({ b, compacta }: { b: BloqueCinta; compacta?: boolean }) {
  const contenido = compacta ? null : (
    <>
      <span className="cifra hidden text-[0.6875rem] font-semibold opacity-75 sm:block">{b.inicio}</span>
      {b.texto && <span className="hidden truncate text-[0.75rem] font-semibold leading-tight sm:block">{b.texto}</span>}
    </>
  );
  const estilo = compacta && (b.tipo === "libre" || b.tipo === "pasado") ? "bg-hundido" : ESTILO[b.tipo];
  const clase = `relative block min-w-0 flex-1 overflow-hidden rounded-[4px] ${compacta ? "h-5" : "h-8 sm:h-[52px] sm:px-1.5 sm:py-1"} ${estilo}`;
  const marca = b.sinSaldo && !compacta ? <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rojo-600" title="Sin saldo" /> : null;
  if (b.href)
    return (
      <Link href={b.href} title={b.detalle} className={`${clase} transition-opacity hover:opacity-80`}>
        {contenido}
        {marca}
      </Link>
    );
  return (
    <span title={b.detalle} className={clase}>
      {contenido}
      {marca}
    </span>
  );
}

export function CintaDia({ bloques, compacta = false }: { bloques: BloqueCinta[]; compacta?: boolean }) {
  const manana = bloques.slice(0, TURNO_MANANA.length);
  const tarde = bloques.slice(TURNO_MANANA.length);
  return (
    <div className="flex items-stretch gap-1">
      <div className="flex min-w-0 flex-[8] gap-[3px]">
        {manana.map((b) => (
          <Bloque key={b.inicio} b={b} compacta={compacta} />
        ))}
      </div>
      <div className={`flex shrink-0 items-center justify-center ${compacta ? "w-2" : "w-6"}`} title="Comida, de 14:00 a 16:00">
        <span className={`h-full w-px bg-linea`} />
      </div>
      <div className="flex min-w-0 flex-[6] gap-[3px]">
        {tarde.map((b) => (
          <Bloque key={b.inicio} b={b} compacta={compacta} />
        ))}
      </div>
    </div>
  );
}

export function Leyenda({ tipos = LEYENDA }: { tipos?: typeof LEYENDA }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[0.8125rem] text-gris">
      {tipos.map((l) => (
        <li key={l.tipo} className="flex items-center gap-1.5">
          <span className={`inline-block h-3 w-4 rounded-[3px] ${ESTILO[l.tipo]}`} />
          {l.texto}
        </li>
      ))}
    </ul>
  );
}
