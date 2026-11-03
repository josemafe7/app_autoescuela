// Lista de modelos de OpenRouter con su precio, para la pantalla de Ajustes.

import { NextResponse } from "next/server";
import { perfilActual } from "@/lib/perfil";
import { listarModelos } from "@/lib/ia";

export async function GET() {
  const perfil = await perfilActual();
  if (perfil?.rol !== "secretaria") {
    return NextResponse.json({ ok: false, error: "Solo secretaría." }, { status: 403 });
  }
  try {
    const modelos = await listarModelos();
    return NextResponse.json({ ok: true, modelos });
  } catch (e) {
    console.error("No se ha podido cargar la lista de modelos:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "No se ha podido cargar la lista de modelos." }, { status: 502 });
  }
}
