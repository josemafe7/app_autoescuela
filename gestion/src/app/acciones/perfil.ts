"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { apuntar, estaBloqueado, ipDe } from "@faro/compartido";
import { autenticar, cerrarSesion, COOKIE_SESION, crearSesion, DURACION_SESION_MS } from "@/lib/auth";
import { baseDatos } from "@/lib/db";
import { conAviso } from "@/lib/acciones-util";

const INICIO = { secretaria: "/secretaria", profesor: "/profesor", alumno: "/alumno" } as const;

// Solo cuentan los intentos fallidos: entrar bien no bloquea a nadie.
const QUINCE_MINUTOS = 15 * 60 * 1000;
const FALLOS_POR_CORREO = 5;
const FALLOS_POR_IP = 20;

const esquemaAcceso = z.object({
  email: z.string().trim().toLowerCase().max(120).pipe(z.email()),
  password: z.string().min(1).max(200),
});

async function volverConError(texto: string): Promise<never> {
  redirect(await conAviso("/", "error", texto));
}

/** Inicio de sesión con correo y contraseña, comprobados contra la base de datos. */
export async function iniciarSesion(formData: FormData) {
  const datos = esquemaAcceso.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!datos.success) return volverConError("Introduce tu correo electrónico y tu contraseña.");
  const { email, password } = datos.data;

  const cabeceras = await headers();
  const ip = ipDe(cabeceras);
  const claveIp = `acceso:ip:${ip}`;
  const claveCorreo = `acceso:correo:${email}`;
  if (estaBloqueado(claveIp, FALLOS_POR_IP, QUINCE_MINUTOS) || estaBloqueado(claveCorreo, FALLOS_POR_CORREO, QUINCE_MINUTOS)) {
    console.warn("Inicio de sesión bloqueado por demasiados intentos fallidos", { ip });
    return volverConError("Demasiados intentos fallidos seguidos. Espera unos minutos y vuelve a probar.");
  }

  const bd = baseDatos();
  const usuario = autenticar(bd, email, password);
  if (!usuario) {
    apuntar(claveIp, QUINCE_MINUTOS);
    apuntar(claveCorreo, QUINCE_MINUTOS);
    console.warn("Inicio de sesión fallido", { ip });
    return volverConError("Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.");
  }

  const token = crearSesion(bd, usuario.usuarioId);
  (await cookies()).set(COOKIE_SESION, token, {
    httpOnly: true,
    sameSite: "lax",
    // En local se usa http; si algún día se publica con https, la cookie solo viaja cifrada.
    secure: cabeceras.get("x-forwarded-proto") === "https",
    path: "/",
    maxAge: DURACION_SESION_MS / 1000,
  });
  redirect(INICIO[usuario.perfil.rol]);
}

export async function salir() {
  const c = await cookies();
  cerrarSesion(baseDatos(), c.get(COOKIE_SESION)?.value);
  c.delete(COOKIE_SESION);
  redirect(await conAviso("/", "ok", "Sesión cerrada."));
}
