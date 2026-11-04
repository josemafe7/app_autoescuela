// Piezas pequeñas de interfaz reutilizadas en las tres vistas.

import Link from "next/link";
import { Nivel, NIVELES, Semaforo, SEMAFOROS } from "@/lib/tipos";

export function Icono({ nombre, className = "", lleno = false }: { nombre: string; className?: string; lleno?: boolean }) {
  return (
    <span aria-hidden className={`material-symbols-outlined ${lleno ? "icono-lleno" : ""} ${className}`}>
      {nombre}
    </span>
  );
}

type Tono = "neutro" | "faro" | "verde" | "ambar" | "rojo" | "oscuro";

const TONOS: Record<Tono, string> = {
  neutro: "bg-hundido text-gris",
  faro: "bg-faro-50 text-faro-800",
  verde: "bg-verde-50 text-verde-800",
  ambar: "bg-ambar-50 text-ambar-800",
  rojo: "bg-rojo-50 text-rojo-800",
  oscuro: "bg-tinta text-white",
};

export function Insignia({ tono = "neutro", children, className = "" }: { tono?: Tono; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex flex-none items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${TONOS[tono]} ${className}`}>
      {children}
    </span>
  );
}

const PUNTO: Record<Semaforo, string> = { rojo: "bg-rojo-600", ambar: "bg-ambar-600", verde: "bg-verde-600" };
const TONO_SEMAFORO: Record<Semaforo, Tono> = { rojo: "rojo", ambar: "ambar", verde: "verde" };

export function SemaforoChip({ valor, corto = false }: { valor: Semaforo; corto?: boolean }) {
  return (
    <Insignia tono={TONO_SEMAFORO[valor]}>
      <span className={`h-2 w-2 rounded-full ${PUNTO[valor]}`} />
      {corto ? { rojo: "Rojo", ambar: "Ámbar", verde: "Verde" }[valor] : SEMAFOROS[valor]}
    </Insignia>
  );
}

export function SemaforoPunto({ valor }: { valor: Semaforo }) {
  return <span title={SEMAFOROS[valor]} className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${PUNTO[valor]}`} />;
}

// Lo dominado va en gris: el color se queda para lo que falta, que es lo que hay que mirar.
const TONO_NIVEL: Record<Nivel, Tono> = { por_trabajar: "rojo", en_progreso: "ambar", dominada: "neutro" };

export function NivelChip({ nivel }: { nivel: Nivel }) {
  return <Insignia tono={TONO_NIVEL[nivel]}>{NIVELES[nivel]}</Insignia>;
}

/** Barra de progreso: la parte llena es la proporción real. */
export function Barra({ valor, total, tono = "faro" }: { valor: number; total: number; tono?: "faro" | "verde" | "tinta" }) {
  const pct = total > 0 ? Math.min(100, Math.max(0, (valor / total) * 100)) : 0;
  const color = tono === "verde" ? "bg-verde-600" : tono === "tinta" ? "bg-tinta" : "bg-faro-600";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-hundido" role="presentation">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Bloque vacío: conserva su sitio con un marco discontinuo y una frase, sin dibujos. */
export function Vacio({ icono = "inbox", titulo, children }: { icono?: string; titulo: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-control px-4 py-3">
      <Icono nombre={icono} className="mt-px !text-[18px] text-tenue" />
      <div className="min-w-0 text-sm">
        <p className="font-semibold text-tinta">{titulo}</p>
        {children && <div className="mt-0.5 text-gris">{children}</div>}
      </div>
    </div>
  );
}

export function Seccion({
  titulo,
  accion,
  children,
  className = "",
  id,
}: {
  titulo: React.ReactNode;
  accion?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={className} id={id}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-base font-semibold">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  );
}

export function Dato({ etiqueta, children, className = "" }: { etiqueta: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-sm text-gris">{etiqueta}</dt>
      <dd className="mt-0.5 font-semibold text-tinta">{children}</dd>
    </div>
  );
}

export function Avatar({ texto, tono = 0, tamano = "md" }: { texto: string; tono?: number; tamano?: "sm" | "md" | "lg" }) {
  // Cada persona tiene un tinte pálido propio y estable (identidad, no dato).
  const tintes = ["#ffe9de", "#dff3ea", "#e3e9ff", "#fbe7f0", "#fff0c9", "#e4f2fb"];
  const tintas = ["#7f2b00", "#004a32", "#2c3f8f", "#80244f", "#6a4200", "#13506e"];
  const i = Math.abs(tono) % tintes.length;
  const tam = tamano === "sm" ? "h-8 w-8 text-xs" : tamano === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${tam}`}
      style={{ background: tintes[i], color: tintas[i] }}
    >
      {texto}
    </span>
  );
}

export function tonoDe(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** Fila de título de cada pantalla: un h1 con un sustantivo, una línea sobre los datos y las acciones. */
export function Cabecera({
  titulo,
  subtitulo,
  acciones,
  antes,
}: {
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  acciones?: React.ReactNode;
  antes?: React.ReactNode;
}) {
  return (
    <header className="mb-6">
      {antes && <div className="mb-3">{antes}</div>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{titulo}</h1>
          {subtitulo && <p className="mt-1 text-[0.9375rem] text-gris">{subtitulo}</p>}
        </div>
        {acciones && <div className="flex shrink-0 flex-wrap gap-2">{acciones}</div>}
      </div>
    </header>
  );
}

export function Volver({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-gris hover:text-tinta">
      <Icono nombre="arrow_back" className="!text-[18px]" />
      {children}
    </Link>
  );
}

/** Campo oculto con la ruta a la que volver tras la acción. */
export function VolverA({ ruta }: { ruta: string }) {
  return <input type="hidden" name="volver" value={ruta} />;
}

export function Alerta({
  tono = "faro",
  icono = "info",
  titulo,
  children,
  accion,
}: {
  tono?: "faro" | "verde" | "ambar" | "rojo" | "neutro";
  icono?: string;
  titulo: React.ReactNode;
  children?: React.ReactNode;
  accion?: React.ReactNode;
}) {
  // El color va en el icono, no en todo el bloque; solo el aviso ámbar lleva su tinte, porque pide atención.
  const marca = { faro: "text-faro-600", verde: "text-verde-600", ambar: "text-ambar-600", rojo: "text-rojo-600", neutro: "text-gris" }[tono];
  const fondo = tono === "ambar" ? "border-[#f3dfae] bg-[#fffbeb]" : "border-linea bg-superficie";
  return (
    <div className={`flex flex-col gap-3 rounded-xl border px-4 py-3.5 sm:flex-row sm:items-center ${fondo}`}>
      <div className="flex flex-1 items-start gap-3">
        <Icono nombre={icono} className={`mt-0.5 ${marca}`} />
        <div className="min-w-0">
          <p className="font-semibold leading-snug text-tinta">{titulo}</p>
          {children && <div className="mt-0.5 text-sm leading-relaxed text-gris">{children}</div>}
        </div>
      </div>
      {accion && <div className="flex shrink-0 gap-2 pl-8 sm:pl-0">{accion}</div>}
    </div>
  );
}
