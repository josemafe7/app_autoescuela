// Guarda la solicitud de los formularios de la web (clase de prueba o matrícula)
// en la base de datos compartida, donde la ve Secretaría en la gestión.
// Solo admite POST: la lista de interesados solo se puede ver desde la gestión.

import { NextRequest, NextResponse } from "next/server";
import { guardarInteresado, ipDe, superaLimite, vieneDeOtraWeb } from "@faro/compartido";
import { esquemaFormularioWeb, primerError } from "@/lib/validacion";

const SOLICITUDES_POR_HORA = 10; // por IP
const SOLICITUDES_POR_HORA_EN_TOTAL = 100; // entre todas, por si alguien se inventa la IP
const UNA_HORA = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  if (vieneDeOtraWeb(req.headers)) {
    return NextResponse.json({ ok: false, error: "Petición no permitida." }, { status: 403 });
  }
  if (
    superaLimite(`interesados:${ipDe(req.headers)}`, SOLICITUDES_POR_HORA, UNA_HORA) ||
    superaLimite("interesados:total", SOLICITUDES_POR_HORA_EN_TOTAL, UNA_HORA)
  ) {
    return NextResponse.json(
      { ok: false, error: "Has enviado varias solicitudes seguidas. Inténtalo más tarde o llámanos al 600 000 000." },
      { status: 429 },
    );
  }

  let cuerpo: unknown;
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Petición no válida." }, { status: 400 });
  }
  const datos = esquemaFormularioWeb.safeParse(cuerpo);
  if (!datos.success) {
    return NextResponse.json({ ok: false, error: primerError(datos.error) }, { status: 400 });
  }

  try {
    guardarInteresado(datos.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error guardando interesado:", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: "Error al guardar tus datos. Inténtalo de nuevo." }, { status: 500 });
  }
}
