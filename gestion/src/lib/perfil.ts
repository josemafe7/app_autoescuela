// Quién está usando la app. La sesión se comprueba siempre en el servidor, contra
// la base de datos: la cookie solo lleva un token aleatorio, no el perfil.

import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESION, perfilDeSesion, type Perfil } from "./auth";
import { baseDatos } from "./db";

export type { Perfil };

export const perfilActual = cache(async (): Promise<Perfil | null> => {
  const token = (await cookies()).get(COOKIE_SESION)?.value;
  return perfilDeSesion(baseDatos(), token);
});

export async function exigirSecretaria(): Promise<void> {
  const p = await perfilActual();
  if (p?.rol !== "secretaria") redirect("/");
}

export async function exigirProfesor(): Promise<string> {
  const p = await perfilActual();
  if (p?.rol !== "profesor") redirect("/");
  return p.id;
}

export async function exigirAlumno(): Promise<string> {
  const p = await perfilActual();
  if (p?.rol !== "alumno") redirect("/");
  return p.id;
}
