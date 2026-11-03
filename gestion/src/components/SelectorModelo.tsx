"use client";

import { useEffect, useMemo, useState } from "react";
import { guardarModeloIA } from "@/app/acciones/gestion";
import { BotonEnviar } from "./BotonEnviar";
import { Icono } from "./ui";

interface Modelo {
  id: string;
  nombre: string;
  entrada: number | null;
  salida: number | null;
  contexto: number | null;
}

const precio = (n: number | null) =>
  n === null ? "—" : n === 0 ? "Gratis" : `${n.toLocaleString("es-ES", { maximumFractionDigits: n < 1 ? 3 : 2 })} $`;

/** Buscador de modelos de OpenRouter con su precio por millón de tokens. */
export function SelectorModelo({ actual }: { actual: string }) {
  const [modelos, setModelos] = useState<Modelo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [elegido, setElegido] = useState(actual);

  useEffect(() => {
    fetch("/api/ia/modelos")
      .then((r) => r.json())
      .then((d) => (d.ok ? setModelos(d.modelos) : setError(d.error)))
      .catch(() => setError("No se ha podido cargar la lista de modelos."));
  }, []);

  const filtrados = useMemo(() => {
    if (!modelos) return [];
    const q = busqueda.trim().toLowerCase();
    const lista = q ? modelos.filter((m) => `${m.id} ${m.nombre}`.toLowerCase().includes(q)) : modelos;
    // El elegido, siempre visible arriba
    return [...lista.filter((m) => m.id === elegido), ...lista.filter((m) => m.id !== elegido)].slice(0, 60);
  }, [modelos, busqueda, elegido]);

  const existeActual = !modelos || modelos.some((m) => m.id === elegido);

  return (
    <form action={guardarModeloIA} className="flex flex-col gap-3">
      <input type="hidden" name="modelo" value={elegido} />
      <div className="relative">
        <Icono nombre="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tenue" />
        <label htmlFor="buscar-modelo" className="sr-only">Buscar modelo</label>
        <input
          id="buscar-modelo"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar: claude, gemini, gpt, llama…"
          className="campo pl-10"
        />
      </div>
      {error && <p className="rounded-lg bg-rojo-50 px-3 py-2 text-sm text-rojo-800">{error}</p>}
      {!existeActual && (
        <p className="rounded-lg bg-ambar-50 px-3 py-2 text-sm text-ambar-800">
          El modelo elegido ({elegido}) no aparece ahora en OpenRouter. Elige otro de la lista.
        </p>
      )}
      <div className="max-h-[360px] overflow-y-auto rounded-lg border border-linea" role="radiogroup" aria-label="Modelos">
        {!modelos && !error && <p className="px-4 py-6 text-center text-sm text-gris">Cargando modelos de OpenRouter…</p>}
        {modelos && filtrados.length === 0 && <p className="px-4 py-6 text-center text-sm text-gris">Ningún modelo coincide.</p>}
        <table className="w-full text-left text-sm">
          {filtrados.length > 0 && (
            <thead className="sticky top-0 bg-superficie">
              <tr className="text-[0.8125rem] text-gris">
                <th className="px-3 py-2 font-medium">Modelo</th>
                <th className="px-3 py-2 text-right font-medium">Entrada</th>
                <th className="px-3 py-2 text-right font-medium">Salida</th>
              </tr>
            </thead>
          )}
          <tbody>
            {filtrados.map((m) => {
              const activo = m.id === elegido;
              return (
                <tr
                  key={m.id}
                  role="radio"
                  aria-checked={activo}
                  tabIndex={0}
                  onClick={() => setElegido(m.id)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setElegido(m.id))}
                  className={`cursor-pointer border-t border-linea ${activo ? "bg-faro-50" : "hover:bg-fondo"}`}
                >
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-2">
                      <Icono nombre={activo ? "radio_button_checked" : "radio_button_unchecked"} className={activo ? "text-faro-600" : "text-tenue"} />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{m.nombre}</span>
                        <span className="block truncate text-xs text-gris">{m.id}</span>
                      </span>
                    </span>
                  </td>
                  <td className="cifra whitespace-nowrap px-3 py-2 text-right">{precio(m.entrada)}</td>
                  <td className="cifra whitespace-nowrap px-3 py-2 text-right">{precio(m.salida)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="ayuda">Precio en dólares por cada millón de tokens. Evaluar una práctica gasta unos 1.500 tokens.</p>
      <div className="flex flex-wrap items-center gap-3">
        <BotonEnviar disabled={elegido === actual}>Usar este modelo</BotonEnviar>
        <span className="text-sm text-gris">
          Elegido: <span className="font-semibold text-tinta">{elegido}</span>
        </span>
      </div>
    </form>
  );
}
