// Convierte las notas dictadas por el profesor en una propuesta de evaluación.
// La llamada a OpenRouter se hace aquí, en el servidor: la clave nunca sale de él.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { superaLimite, vieneDeOtraWeb } from "@faro/compartido";
import { leer } from "@/lib/db";
import { perfilActual } from "@/lib/perfil";
import { ErrorIA, evaluarConIA } from "@/lib/ia";
import * as R from "@/lib/reglas";

const UNA_HORA = 60 * 60 * 1000;
const EVALUACIONES_POR_HORA = 30;

const esquema = z.object({
  practicaId: z.string().min(1).max(64),
  notas: z.string().trim().min(10, "Dicta o escribe un poco más sobre la práctica.").max(4000, "Las notas son demasiado largas."),
});

export async function POST(req: NextRequest) {
  if (vieneDeOtraWeb(req.headers)) {
    return NextResponse.json({ ok: false, error: "Petición no permitida." }, { status: 403 });
  }
  const perfil = await perfilActual();
  if (!perfil || perfil.rol === "alumno") {
    return NextResponse.json({ ok: false, error: "No tienes permiso." }, { status: 403 });
  }
  const quien = perfil.rol === "profesor" ? perfil.id : perfil.rol;
  if (superaLimite(`ia:${quien}`, EVALUACIONES_POR_HORA, UNA_HORA)) {
    return NextResponse.json({ ok: false, error: "Has pedido muchas evaluaciones seguidas. Espera un rato o rellénala a mano." }, { status: 429 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Petición no válida." }, { status: 400 });
  }
  const datos = esquema.safeParse(cuerpo);
  if (!datos.success) {
    return NextResponse.json({ ok: false, error: datos.error.issues[0]?.message ?? "Petición no válida." }, { status: 400 });
  }

  const db = await leer();
  const p = db.practicas.find((x) => x.id === datos.data.practicaId);
  if (!p || (perfil.rol === "profesor" && p.profesorId !== perfil.id)) {
    return NextResponse.json({ ok: false, error: "No se encuentra la práctica." }, { status: 404 });
  }
  const alumno = R.alumnoPorId(db, p.alumnoId);
  if (!alumno) {
    return NextResponse.json({ ok: false, error: "No se encuentra la práctica." }, { status: 404 });
  }
  // Niveles de partida: los de la evaluación anterior a esta práctica.
  const previas = R.evaluacionesDe(db, alumno.id).filter((e) => e.practicaId !== p.id);
  const actuales = previas.at(-1)?.niveles ?? R.nivelesVacios();
  try {
    const propuesta = await evaluarConIA(datos.data.notas, alumno.nombre, actuales, db.ajustes.modeloIA);
    return NextResponse.json({ ok: true, propuesta });
  } catch (e) {
    if (!(e instanceof ErrorIA)) console.error("Error en la evaluación con IA:", e instanceof Error ? e.message : e);
    const mensaje = e instanceof ErrorIA ? e.message : "No se ha podido contactar con la IA. Puedes rellenar la evaluación a mano.";
    return NextResponse.json({ ok: false, error: mensaje }, { status: 502 });
  }
}
