"use client";

import React, { useState } from "react";
import Link from "next/link";
import { calcularPresupuestoCompleto, formatearEuros, PRECIOS } from "@/lib/pricing";

export default function HomeCalculatorWidget() {
  const [numPracticas, setNumPracticas] = useState(20);
  const [suspenderUnaVez, setSuspenderUnaVez] = useState(false);

  const presupuesto = calcularPresupuestoCompleto(numPracticas, suspenderUnaVez, 3);

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 lg:p-10 space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            Calculadora de Precio Real Faro
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Aplica automáticamente los bonos de 10 o 20 prácticas cuando te salen más baratos
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">
          Con IVA y tasa DGT
        </span>
      </div>

      {/* Selector de número de prácticas */}
      <div className="space-y-4 bg-surface-container-low p-5 sm:p-6 rounded-2xl">
        <div className="flex justify-between items-center gap-2">
          <label
            htmlFor="home-clases-slider"
            className="font-label-md text-label-md text-on-surface font-bold"
          >
            Número de prácticas (45 min):
          </label>
          <span className="font-headline-sm text-headline-sm text-primary font-extrabold bg-surface-container-lowest px-4 py-1.5 rounded-xl">
            {numPracticas} prácticas
          </span>
        </div>

        <input
          id="home-clases-slider"
          className="w-full h-3 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
          max={40}
          min={1}
          step={1}
          type="range"
          value={numPracticas}
          onChange={(e) => setNumPracticas(parseInt(e.target.value, 10))}
        />

        <div className="flex justify-between text-label-sm font-label-sm text-on-surface-variant">
          <span>10 (con bono: 260 €)</span>
          <span className="font-bold text-on-surface">20–30 (lo más habitual)</span>
          <span>40 prácticas</span>
        </div>

        {/* Botones rápidos */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[10, 20, 25, 30].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNumPracticas(n)}
              className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-colors ${
                numPracticas === n
                  ? "bg-primary text-on-primary font-bold"
                  : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {n} prácticas
            </button>
          ))}
        </div>
      </div>

      {/* Desglose en cuadrícula */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-body-sm">
        <div className="p-4 rounded-xl bg-surface-container-low/70 space-y-1">
          <span className="text-on-surface-variant font-label-sm text-label-sm block">
            Matrícula y curso teórico (con app de test)
          </span>
          <span className="font-headline-sm text-headline-sm text-[1.15rem] text-on-surface font-bold">
            {formatearEuros(PRECIOS.matricula)}
          </span>
          <span className="text-label-sm text-tertiary block font-semibold">
            Seguimiento del estudio incluido
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low/70 space-y-1">
          <span className="text-on-surface-variant font-label-sm text-label-sm block">
            {numPracticas} prácticas de 45 min (mejor tarifa)
          </span>
          <span className="font-headline-sm text-headline-sm text-[1.15rem] text-on-surface font-bold">
            {formatearEuros(presupuesto.practicasDetalle.costeOptimal)}
          </span>
          <span className="text-label-sm text-primary block font-semibold">
            {presupuesto.practicasDetalle.descripcionCombinacion}
            {presupuesto.practicasDetalle.ahorroBonos > 0 &&
              ` (ahorras ${formatearEuros(presupuesto.practicasDetalle.ahorroBonos)})`}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low/70 space-y-1">
          <span className="text-on-surface-variant font-label-sm text-label-sm block">
            Tasa oficial de la DGT (2 convocatorias)
          </span>
          <span className="font-headline-sm text-headline-sm text-[1.15rem] text-on-surface font-bold">
            {formatearEuros(PRECIOS.tasaDgt)}
          </span>
          <span className="text-label-sm text-on-surface-variant block">
            Pagada en tu nombre con recibo oficial
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low/70 space-y-1">
          <span className="text-on-surface-variant font-label-sm text-label-sm block">
            Examen práctico (50 €) + Psicotécnico (~35 €)
          </span>
          <span className="font-headline-sm text-headline-sm text-[1.15rem] text-on-surface font-bold">
            {formatearEuros(PRECIOS.derechoExamen + PRECIOS.psicotecnico)}
          </span>
          <span className="text-label-sm text-on-surface-variant block">
            50 € derecho examen + unos 35 € en centro médico
          </span>
        </div>
      </div>

      {/* Interruptor de escenario: suspender una vez */}
      <div className="p-4 rounded-2xl bg-surface-container-low space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-label-md text-label-md text-on-surface font-bold">
              ¿Qué pasa si suspendo el práctico una vez?
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              La tasa DGT sigue valiendo (da 2 convocatorias). Solo sumas un nuevo derecho de examen (50 €) y las clases de repaso (ej. 3 sueltas = 90 €).
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={suspenderUnaVez}
              onChange={(e) => setSuspenderUnaVez(e.target.checked)}
              aria-label="Simular suspender el examen práctico una vez"
            />
            <div className="w-12 h-7 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {suspenderUnaVez && (
          <div className="pt-2 flex items-center justify-between text-label-md font-label-md text-primary">
            <span>Suplemento por 2.º intento (nuevo examen 50 € + 3 prácticas 90 €):</span>
            <span className="font-bold">+{formatearEuros(presupuesto.costeExtraSuspenderUnaVez)}</span>
          </div>
        )}
      </div>

      {/* Total final */}
      <div className="p-6 rounded-2xl bg-surface-container-highest flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span
              className="font-display text-[2.2rem] sm:text-[2.5rem] leading-none text-primary font-extrabold whitespace-nowrap"
              id="home-precio-total"
            >
              {formatearEuros(presupuesto.totalFinalMostrado)}
            </span>
            <span className="font-label-md text-label-md text-on-surface">
              {suspenderUnaVez
                ? "total a la segunda"
                : "total a la primera"}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Matrícula, prácticas, tasa DGT, examen y psicotécnico incluidos
          </p>
        </div>

        <Link
          href="/precios-y-calculadora"
          className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-primary text-on-primary font-label-lg text-label-lg text-center hover:bg-primary-container transition-colors shrink-0"
        >
          Ver desglose completo
        </Link>
      </div>
    </div>
  );
}
