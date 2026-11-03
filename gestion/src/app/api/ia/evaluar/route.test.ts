// Evaluación por voz con IA (docs/spec.md, «Profesores» y «Quién puede hacer qué»).
// OpenRouter se simula: estas pruebas no gastan saldo.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { reiniciarLimites } from "@faro/compartido";
import type { Perfil } from "@/lib/auth";
import { usarDemoTemporal } from "@/pruebas/demo";
import { sesion } from "@/pruebas/acciones";
import { leer } from "@/lib/db";
import * as R from "@/lib/reglas";
import { POST } from "./route";

vi.mock("@/lib/perfil", async () => (await import("@/pruebas/acciones")).perfilSimulado);

const ANA: Perfil = { rol: "profesor", id: "p1" };

beforeEach(() => {
  usarDemoTemporal();
  reiniciarLimites();
  vi.stubEnv("OPENROUTER_API_KEY", "sk-or-v1-prueba-simulada");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify({ maniobras: [{ id: "autovia", nivel: "dominada" }], fallo_grave: false, motivo_fallo_grave: "", resumen: "Bien.", mensaje_alumno: "¡Bien!" }) } }],
        }),
        { status: 200 },
      ),
    ),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function pedir(como: Perfil | null, practicaId: string, notas = "Hoy ha ido bien en la autovía.") {
  sesion.perfil = como;
  const r = await POST(
    new NextRequest("http://localhost:3001/api/ia/evaluar", {
      method: "POST",
      body: JSON.stringify({ practicaId, notas }),
      headers: { "content-type": "application/json", host: "localhost:3001" },
    }),
  );
  return { estado: r.status, cuerpo: await r.json() };
}

const sinCerrarDe = async (profesorId: string) => R.practicasSinCerrar(await leer(), profesorId)[0];

describe("Evaluación con IA", () => {
  it("el profesor la pide para su práctica y recibe la propuesta", async () => {
    const r = await pedir(ANA, (await sinCerrarDe("p1")).id);
    expect(r.estado).toBe(200);
    expect(r.cuerpo.propuesta.niveles.autovia).toBe("dominada");
  });

  it("no puede pedirla para la práctica de otro profesor", async () => {
    expect((await pedir(ANA, (await sinCerrarDe("p2")).id)).estado).toBe(404);
  });

  it("un alumno o alguien sin sesión no puede usarla", async () => {
    const practica = (await sinCerrarDe("p1")).id;
    expect((await pedir({ rol: "alumno", id: "a11" }, practica)).estado).toBe(403);
    expect((await pedir(null, practica)).estado).toBe(403);
  });

  it("con notas demasiado cortas no llama a la IA", async () => {
    const r = await pedir(ANA, (await sinCerrarDe("p1")).id, "Bien.");
    expect(r.estado).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
});
