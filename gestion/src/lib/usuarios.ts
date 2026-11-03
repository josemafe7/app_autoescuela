// Cuentas de la demo. Todas usan la contraseña de prueba, que aparece en el
// README: solo existen en la base de datos de la demo, nunca en una con datos reales.

import "server-only";
import type { DatabaseSync } from "node:sqlite";
import { nuevoId, preparar } from "@faro/compartido";
import { cifrarContrasena, type Rol } from "./auth";
import type { Alumno } from "./tipos";

export const CONTRASENA_DEMO = "Faro2026!";

export const CUENTAS_PERSONAL: { email: string; rol: Rol; personaId: string | null }[] = [
  { email: "secretaria@autoescuelafaro.es", rol: "secretaria", personaId: null },
  { email: "ana.morales@autoescuelafaro.es", rol: "profesor", personaId: "p1" },
  { email: "luis.ortega@autoescuelafaro.es", rol: "profesor", personaId: "p2" },
  { email: "marta.ruiz@autoescuelafaro.es", rol: "profesor", personaId: "p3" },
];

export const normalizarCorreo = (email: string) => email.trim().toLowerCase();

/** true si el correo ya es de otra cuenta (personal u otro alumno). */
export function correoOcupado(alumnos: Alumno[], email: string, alumnoId?: string): boolean {
  const correo = normalizarCorreo(email);
  if (!correo) return false;
  return (
    CUENTAS_PERSONAL.some((c) => c.email === correo) ||
    alumnos.some((a) => a.id !== alumnoId && normalizarCorreo(a.email) === correo)
  );
}

function crearUsuario(bd: DatabaseSync, email: string, rol: Rol, personaId: string | null) {
  preparar(bd, "INSERT INTO usuarios (id, email, hash, rol, persona_id) VALUES (?, ?, ?, ?, ?)").run(
    nuevoId("u"),
    normalizarCorreo(email),
    cifrarContrasena(CONTRASENA_DEMO),
    rol,
    personaId,
  );
}

export function crearCuentasPersonal(bd: DatabaseSync): void {
  for (const c of CUENTAS_PERSONAL) crearUsuario(bd, c.email, c.rol, c.personaId);
}

/**
 * Cada alumno con correo puede entrar a su portal: si se da de alta, se le crea
 * la cuenta; si cambia el correo, cambia el de su cuenta; si se borra, la pierde.
 */
export function sincronizarCuentasAlumnos(bd: DatabaseSync, alumnos: Alumno[]): void {
  for (const a of alumnos) {
    const correo = normalizarCorreo(a.email);
    const cuenta = preparar(bd, "SELECT id, email FROM usuarios WHERE rol = 'alumno' AND persona_id = ?").get(a.id) as
      | { id: string; email: string }
      | undefined;
    if (!cuenta) {
      if (correo) crearUsuario(bd, correo, "alumno", a.id);
    } else if (!correo) {
      preparar(bd, "DELETE FROM usuarios WHERE id = ?").run(cuenta.id);
    } else if (cuenta.email !== correo) {
      preparar(bd, "UPDATE usuarios SET email = ? WHERE id = ?").run(correo, cuenta.id);
    }
  }
}
