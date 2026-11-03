// Protecciones comunes para lo que llega de fuera: límite de peticiones y
// comprobación de que la petición sale de la propia web.

const MAX_CLAVES = 5_000;
const marcas = new Map<string, number[]>();

function recientes(clave: string, ventanaMs: number, ahora: number): number[] {
  if (marcas.size > MAX_CLAVES) {
    for (const [k, v] of marcas) if (ahora - (v.at(-1) ?? 0) > ventanaMs) marcas.delete(k);
  }
  return (marcas.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);
}

/** true si esa clave ya ha llegado al máximo en la ventana de tiempo (sin apuntar nada). */
export function estaBloqueado(clave: string, maximo: number, ventanaMs: number, ahora = Date.now()): boolean {
  return recientes(clave, ventanaMs, ahora).length >= maximo;
}

/** Apunta un intento (por ejemplo, un inicio de sesión fallido). */
export function apuntar(clave: string, ventanaMs: number, ahora = Date.now()): void {
  marcas.set(clave, [...recientes(clave, ventanaMs, ahora), ahora]);
}

/**
 * Devuelve true si esa clave (por ejemplo, «chat:IP») ya ha hecho `maximo`
 * peticiones en la ventana de tiempo; si no, apunta esta. Vive en la memoria
 * del servidor: basta para una app que corre en un solo proceso.
 */
export function superaLimite(clave: string, maximo: number, ventanaMs: number, ahora = Date.now()): boolean {
  if (estaBloqueado(clave, maximo, ventanaMs, ahora)) return true;
  apuntar(clave, ventanaMs, ahora);
  return false;
}

/** Para las pruebas: empieza de cero. */
export function reiniciarLimites(): void {
  marcas.clear();
}

/**
 * IP de quien hace la petición. Detrás de un proxy (al publicar) es la última de
 * x-forwarded-for, la que añade el proxy. En local no hay proxy y quien llama
 * desde el propio ordenador podría inventarla: por eso hay además topes globales.
 */
export function ipDe(cabeceras: Headers): string {
  const ips = (cabeceras.get("x-forwarded-for") ?? "").split(",").map((ip) => ip.trim()).filter(Boolean);
  return ips.at(-1) || cabeceras.get("x-real-ip")?.trim() || "local";
}

/** true si el navegador dice que la petición sale de otra web (cabecera Origin distinta). */
export function vieneDeOtraWeb(cabeceras: Headers): boolean {
  const origen = cabeceras.get("origin");
  if (!origen) return false;
  const host = cabeceras.get("x-forwarded-host") ?? cabeceras.get("host");
  try {
    return new URL(origen).host !== host;
  } catch {
    return true;
  }
}
