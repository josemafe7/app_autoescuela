// Evaluación por voz con IA. OpenRouter se simula: estas pruebas no gastan saldo.

import { afterEach, describe, expect, it, vi } from "vitest";
import { estadoClave, evaluarConIA } from "./ia";
import { nivelesVacios } from "./reglas";

const CLAVE = "sk-or-v1-prueba-simulada-1234";

const respuesta = (contenido: string) =>
  new Response(JSON.stringify({ model: "anthropic/claude-haiku-5.5", choices: [{ message: { content: contenido } }] }), { status: 200 });

const propuestaSimulada = {
  maniobras: [
    { id: "autovia", nivel: "dominada" },
    { id: "rotondas_dos_carriles", nivel: "por_trabajar" },
    { id: "aparcamiento_bateria", nivel: "dominada" },
    { id: "aparcamiento_linea", nivel: "en_progreso" },
    { id: "prioridades_peatones", nivel: "dominada" },
    { id: "inventada", nivel: "dominada" },
    { id: "autovia", nivel: "superdominada" },
  ],
  fallo_grave: false,
  motivo_fallo_grave: "",
  resumen: "Buena práctica; le cuestan las rotondas de dos carriles.",
  mensaje_alumno: "¡Bien, Lucía! La autovía, perfecta. Toca trabajar las rotondas de dos carriles.",
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Evaluación con IA", () => {
  it("convierte las notas en niveles y descarta maniobras o niveles inventados", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", CLAVE);
    vi.stubGlobal("fetch", vi.fn(async () => respuesta("```json\n" + JSON.stringify(propuestaSimulada) + "\n```")));
    const r = await evaluarConIA("Hoy Lucía bastante bien…", "Lucía", nivelesVacios(), "anthropic/claude-haiku-5.5");
    expect(r.cambiadas).toEqual(["autovia", "rotondas_dos_carriles", "aparcamiento_bateria", "aparcamiento_linea", "prioridades_peatones"]);
    expect(r.niveles.autovia).toBe("dominada");
    expect(r.niveles.incorporaciones).toBe("por_trabajar");
    expect(r.falloGrave).toBe(false);
  });

  it("si el modelo no admite la respuesta estructurada, lo repite sin ella", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", CLAVE);
    const fetchSimulado = vi.fn(async (_url: string, init?: RequestInit) =>
      JSON.parse(String(init?.body)).response_format ? new Response("no soportado", { status: 400 }) : respuesta(JSON.stringify(propuestaSimulada)),
    );
    vi.stubGlobal("fetch", fetchSimulado);
    await evaluarConIA("Notas de la práctica de hoy", "Lucía", nivelesVacios(), "otro/modelo");
    expect(fetchSimulado).toHaveBeenCalledTimes(2);
  });

  it("sin clave avisa de dónde ponerla y no llama a la IA", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const fetchSimulado = vi.fn();
    vi.stubGlobal("fetch", fetchSimulado);
    await expect(evaluarConIA("Notas de la práctica", "Lucía", nivelesVacios(), "m")).rejects.toThrow(/\.env\.local/);
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  it("si OpenRouter falla, el mensaje no enseña detalles internos", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", CLAVE);
    vi.stubGlobal("fetch", vi.fn(async () => new Response("traza interna con datos", { status: 500 })));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const error = await evaluarConIA("Notas de la práctica", "Lucía", nivelesVacios(), "m").catch((e: Error) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).not.toContain("traza interna");
  });
});

describe("Clave de OpenRouter", () => {
  it("se lee solo del entorno y al navegador solo le llegan sus 4 últimos caracteres", () => {
    vi.stubEnv("OPENROUTER_API_KEY", CLAVE);
    expect(estadoClave()).toEqual({ configurada: true, final: "1234" });
    vi.stubEnv("OPENROUTER_API_KEY", "");
    expect(estadoClave()).toEqual({ configurada: false, final: null });
  });
});
