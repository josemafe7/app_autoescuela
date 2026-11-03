// Para probar las Server Actions fuera de Next.js. Cada archivo de pruebas simula
// la sesión, las cookies y redirect() con estas piezas:
//
//   vi.mock("@/lib/perfil", async () => (await import("@/pruebas/acciones")).perfilSimulado);
//   vi.mock("next/navigation", async () => (await import("@/pruebas/acciones")).navegacionSimulada);
//   vi.mock("next/headers", async () => (await import("@/pruebas/acciones")).cabecerasSimuladas);

import type { Perfil } from "@/lib/auth";
import { COOKIE_AVISO, type Aviso } from "@/lib/aviso";

export const sesion = { perfil: null as Perfil | null, ip: "10.0.0.1" };
const cookiesPuestas = new Map<string, string>();

export class Redireccion extends Error {
  constructor(public destino: string) {
    super(destino);
  }
}

export const perfilSimulado = { perfilActual: async () => sesion.perfil };

export const navegacionSimulada = {
  redirect: (destino: string) => {
    throw new Redireccion(destino);
  },
};

export const cabecerasSimuladas = {
  cookies: async () => ({
    get: (nombre: string) => (cookiesPuestas.has(nombre) ? { name: nombre, value: cookiesPuestas.get(nombre)! } : undefined),
    set: (nombre: string, valor: string) => void cookiesPuestas.set(nombre, valor),
    delete: (nombre: string) => void cookiesPuestas.delete(nombre),
  }),
  headers: async () => new Headers({ "x-forwarded-for": sesion.ip }),
};

/** Lo que verá la persona: el aviso que deja la acción y a dónde la lleva. */
export interface Respuesta {
  ok: string | null;
  error: string | null;
  destino: string;
}

/** Ejecuta la acción como esa persona (o sin sesión) con esos campos de formulario. */
export async function enviar(
  como: Perfil | null,
  accion: (f: FormData) => Promise<void>,
  campos: Record<string, string | string[]> = {},
): Promise<Respuesta> {
  sesion.perfil = como;
  cookiesPuestas.delete(COOKIE_AVISO);
  const f = new FormData();
  for (const [k, v] of Object.entries(campos)) for (const x of [v].flat()) f.append(k, x);
  try {
    await accion(f);
  } catch (e) {
    if (!(e instanceof Redireccion)) throw e;
    const crudo = cookiesPuestas.get(COOKIE_AVISO);
    const aviso: Aviso | null = crudo ? JSON.parse(crudo) : null;
    return {
      ok: aviso?.tipo === "ok" ? aviso.texto : null,
      error: aviso?.tipo === "error" ? aviso.texto : null,
      destino: e.destino,
    };
  }
  throw new Error("La acción no ha terminado con una redirección");
}

/** La cookie de sesión que ha dejado el inicio de sesión (si lo ha dejado). */
export const cookieDeSesion = () => cookiesPuestas.get("faro_sesion");
