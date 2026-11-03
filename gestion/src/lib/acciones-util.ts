// Utilidades para las acciones de los formularios: validan lo que llega con Zod,
// ejecutan el cambio y vuelven a la pantalla de origen con un aviso de éxito o de error.

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { COOKIE_AVISO, type Aviso } from "./aviso";

/** Error pensado para enseñárselo a la persona tal cual. */
export class ErrorUsuario extends Error {}

export function conParam(ruta: string, clave: string, valor: string) {
  const [sinAncla, ancla = ""] = ruta.split("#");
  const [base, q = ""] = sinAncla.split("?");
  const p = new URLSearchParams(q);
  p.set(clave, valor);
  return `${base}?${p.toString()}${ancla ? `#${ancla}` : ""}`;
}

// Solo rutas de la propia app: «/algo», nunca «//otra-web» ni «/\otra-web».
const RUTA_INTERNA = z.string().max(300).regex(/^\/(?![/\\])[^\s\\]*$/);

export function rutaSegura(valor: FormDataEntryValue | null, porDefecto = "/") {
  const r = RUTA_INTERNA.safeParse(valor);
  return r.success ? r.data : porDefecto;
}

/**
 * Deja el aviso en una cookie de un solo uso, que solo escribe el servidor, y
 * devuelve la ruta con una marca para que la pantalla lo enseñe. El texto no va
 * en la dirección: así nadie puede enseñar un aviso falso con un enlace.
 */
export async function conAviso(ruta: string, tipo: Aviso["tipo"], texto: string): Promise<string> {
  const aviso: Aviso = { tipo, texto };
  // Next.js ya codifica el valor de la cookie (y el navegador lo descodifica una vez).
  (await cookies()).set(COOKIE_AVISO, JSON.stringify(aviso), { path: "/", maxAge: 60, sameSite: "lax" });
  return conParam(ruta, "aviso", Date.now().toString(36));
}

type Resultado = string | { mensaje: string; destino?: string } | void;

export async function ejecutar(volver: string, cambio: () => Promise<Resultado>): Promise<never> {
  let destino: string;
  try {
    const r = await cambio();
    if (typeof r === "object" && r) destino = await conAviso(r.destino ?? volver, "ok", r.mensaje);
    else destino = await conAviso(volver, "ok", r || "Cambios guardados.");
  } catch (e) {
    const texto =
      e instanceof ErrorUsuario ? e.message : "No se ha podido guardar. Vuelve a intentarlo.";
    if (!(e instanceof ErrorUsuario)) console.error(e);
    destino = await conAviso(volver, "error", texto);
  }
  redirect(destino);
}

// ── Validación de formularios ──────────────────────────────────────────

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const esFechaReal = (f: string) => {
  const [a, m, d] = f.split("-").map(Number);
  const fecha = new Date(a, m - 1, d);
  return fecha.getFullYear() === a && fecha.getMonth() === m - 1 && fecha.getDate() === d;
};
/** Un campo que no viene o viene vacío cuenta como texto vacío. */
const comoTexto = (v: unknown) => (v === undefined || v === null ? "" : v);
/** Admite «12,5» además de «12.5». */
const comoNumero = (v: unknown) => (typeof v === "string" && v.trim() ? Number(v.trim().replace(",", ".")) : NaN);

/** Piezas para describir cada formulario. Los mensajes de error se enseñan tal cual. */
export const campo = {
  id: (error: string) => z.preprocess(comoTexto, z.string().trim().min(1, error).max(64, error)),
  texto: (max: number) =>
    z.preprocess(comoTexto, z.string().trim().max(max, `Ese texto es demasiado largo (máximo ${max} caracteres).`)),
  fecha: (error: string) =>
    z.preprocess(comoTexto, z.string().trim().regex(FECHA, error).refine(esFechaReal, error)),
  /** Fecha o vacío (vacío → null). */
  fechaOpcional: (error: string) =>
    z.preprocess(
      comoTexto,
      z.union([z.literal(""), z.string().trim().regex(FECHA, error).refine(esFechaReal, error)]).transform((v) => v || null),
    ),
  entero: (error: string, min: number, max: number) =>
    z.preprocess(comoNumero, z.number(error).int(error).min(min, error).max(max, error)),
  decimal: (error: string, min: number, max: number) =>
    z.preprocess(comoNumero, z.number(error).min(min, error).max(max, error)),
  /** Casilla o botón que manda «1» cuando está marcado. */
  marcado: () => z.preprocess((v) => v === "1" || v === "on", z.boolean()),
  opcion: <const T extends readonly [string, ...string[]]>(valores: T, error: string) =>
    z.preprocess(comoTexto, z.enum(valores, error)),
  /** Campo que se repite (casillas con el mismo nombre). */
  lista: <T extends z.ZodType>(elemento: T) =>
    z.preprocess((v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]), z.array(elemento)),
};

/** Valida el formulario con el esquema. Si algo falla, el primer error se enseña a la persona. */
export function leerFormulario<S extends z.ZodType>(f: FormData, esquema: S): z.output<S> {
  const datos: Record<string, unknown> = {};
  for (const clave of new Set(f.keys())) {
    // Next.js añade sus propios campos ($ACTION_…) a los formularios.
    if (clave.startsWith("$")) continue;
    const valores = f.getAll(clave).filter((v): v is string => typeof v === "string");
    datos[clave] = valores.length > 1 ? valores : valores[0];
  }
  const r = esquema.safeParse(datos);
  if (!r.success) throw new ErrorUsuario(r.error.issues[0]?.message ?? "Revisa los datos del formulario.");
  return r.data;
}

/** Valida un solo campo (para los que tienen nombre variable, como «precio_t_bono10»). */
export function leerCampo<S extends z.ZodType>(f: FormData, nombre: string, esquema: S): z.output<S> {
  const v = f.get(nombre);
  const r = esquema.safeParse(typeof v === "string" ? v : undefined);
  if (!r.success) throw new ErrorUsuario(r.error.issues[0]?.message ?? "Revisa los datos del formulario.");
  return r.data;
}

/** Fecha que llega en la dirección (?fecha=…): si no es una fecha real, la de por defecto. */
export function fechaDeURL(valor: string | undefined, porDefecto: string): string {
  const r = campo.fecha("").safeParse(valor);
  return r.success ? r.data : porDefecto;
}
