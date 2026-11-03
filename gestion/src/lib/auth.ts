// Inicio de sesión de la gestión: usuarios con la contraseña cifrada y sesiones
// guardadas en la base de datos compartida. No depende de ningún servicio externo.

import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { preparar } from "@faro/compartido";

export type Perfil =
  | { rol: "secretaria" }
  | { rol: "profesor"; id: string }
  | { rol: "alumno"; id: string };

export type Rol = Perfil["rol"];

export const COOKIE_SESION = "faro_sesion";
export const DURACION_SESION_MS = 7 * 24 * 60 * 60 * 1000;

const LARGO_HASH = 64;

/** Cifra la contraseña con scrypt y una sal aleatoria: «scrypt$sal$hash». */
export function cifrarContrasena(contrasena: string): string {
  const sal = randomBytes(16);
  const hash = scryptSync(contrasena, sal, LARGO_HASH);
  return `scrypt$${sal.toString("base64")}$${hash.toString("base64")}`;
}

export function contrasenaCorrecta(contrasena: string, guardada: string): boolean {
  const [tipo, sal, hash] = guardada.split("$");
  if (tipo !== "scrypt" || !sal || !hash) return false;
  const esperado = Buffer.from(hash, "base64");
  const calculado = scryptSync(contrasena, Buffer.from(sal, "base64"), esperado.length);
  return timingSafeEqual(calculado, esperado);
}

// Si el correo no existe se comprueba igualmente contra este hash, para que la
// respuesta tarde lo mismo y no delate qué correos están dados de alta.
let hashRelleno: string | null = null;

function perfilDe(rol: Rol, personaId: string | null): Perfil | null {
  if (rol === "secretaria") return { rol };
  return personaId ? { rol, id: personaId } : null;
}

/** Comprueba correo y contraseña. Devuelve el usuario y su perfil, o null. */
export function autenticar(
  bd: DatabaseSync,
  email: string,
  contrasena: string,
): { usuarioId: string; perfil: Perfil } | null {
  const u = preparar(bd, "SELECT id, hash, rol, persona_id FROM usuarios WHERE email = ?").get(email.trim().toLowerCase()) as
    | { id: string; hash: string; rol: Rol; persona_id: string | null }
    | undefined;
  if (!u) {
    contrasenaCorrecta(contrasena, (hashRelleno ??= cifrarContrasena(randomBytes(12).toString("hex"))));
    return null;
  }
  if (!contrasenaCorrecta(contrasena, u.hash)) return null;
  const perfil = perfilDe(u.rol, u.persona_id);
  return perfil ? { usuarioId: u.id, perfil } : null;
}

/** En la base de datos solo se guarda la huella del token, nunca el token. */
const huella = (token: string) => createHash("sha256").update(token).digest("hex");

/** Crea una sesión y devuelve el token que va en la cookie. */
export function crearSesion(bd: DatabaseSync, usuarioId: string, ahora = new Date()): string {
  const token = randomBytes(32).toString("base64url");
  preparar(bd, "DELETE FROM sesiones WHERE caduca_el <= ?").run(ahora.toISOString());
  preparar(bd, "INSERT INTO sesiones (id, usuario_id, caduca_el) VALUES (?, ?, ?)").run(
    huella(token),
    usuarioId,
    new Date(ahora.getTime() + DURACION_SESION_MS).toISOString(),
  );
  return token;
}

export function perfilDeSesion(bd: DatabaseSync, token: string | undefined, ahora = new Date()): Perfil | null {
  if (!token) return null;
  const fila = preparar(
    bd,
    "SELECT u.rol, u.persona_id FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id WHERE s.id = ? AND s.caduca_el > ?",
  ).get(huella(token), ahora.toISOString()) as { rol: Rol; persona_id: string | null } | undefined;
  return fila ? perfilDe(fila.rol, fila.persona_id) : null;
}

export function cerrarSesion(bd: DatabaseSync, token: string | undefined): void {
  if (token) preparar(bd, "DELETE FROM sesiones WHERE id = ?").run(huella(token));
}
