"use client";

import React, { useState } from "react";
import Link from "next/link";
import { calcularPresupuestoCompleto, formatearEuros, PRECIOS } from "@/lib/pricing";

export default function PreciosYCalculadoraPage() {
  const [numPracticas, setNumPracticas] = useState(20);
  const [zonaSalida, setZonaSalida] = useState("teatinos");
  const [suspenderUnaVez, setSuspenderUnaVez] = useState(false);
  const [practicasRepaso, setPracticasRepaso] = useState(3);

  const presupuesto = calcularPresupuestoCompleto(
    numPracticas,
    suspenderUnaVez,
    practicasRepaso
  );

  function seleccionarPack(n: number) {
    setNumPracticas(n);
    const el = document.getElementById("calculadora-oficial");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function compartirPresupuestoWhatsApp() {
    const modo = suspenderUnaVez
      ? `contando 1 suspenso y ${practicasRepaso} prácticas de repaso`
      : "aprobando a la primera";
    const texto = encodeURIComponent(
      `Hola Autoescuela Faro, he calculado mi presupuesto en la web con ${numPracticas} prácticas (${presupuesto.practicasDetalle.descripcionCombinacion}), ${modo}, por un total de ${formatearEuros(
        presupuesto.totalFinalMostrado
      )}. Quería consultaros disponibilidad.`
    );
    window.open(`https://wa.me/34600000000?text=${texto}`, "_blank");
  }

  return (
    <div className="flex flex-col w-full">
      {/* CABECERA Y PROPUESTA DE VALOR */}
      <section className="w-full pt-10 pb-14 px-6 lg:px-12 bg-surface">
        <div className="max-w-[1280px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tertiary/15 text-tertiary font-label-md text-label-md mb-6">
            <span className="material-symbols-outlined text-tertiary text-[18px]">
              verified_user
            </span>
            <span>Tarifas Oficiales Autoescuela Faro • Permiso B Málaga</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="font-display text-display-mobile sm:text-display text-on-surface tracking-tight leading-[1.08]">
                Precios reales, sin letra pequeña.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Todo desglosado desde el primer minuto: matrícula y curso teórico con app de test (150 €), bonos de prácticas para que cada clase te salga más barata, derecho de examen práctico (50 €), tasa oficial de la DGT (94,05 €) y psicotécnico (unos 35 €).
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <div className="p-4 rounded-2xl bg-surface-container-low flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[24px]">price_check</span>
                </div>
                <div>
                  <p className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                    0 € en gestiones
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    No cobramos gestión por renovar expediente ni por traslados
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-low flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0">
                  <span className="material-symbols-outlined text-[24px]">payments</span>
                </div>
                <div>
                  <p className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                    Pago en 2 plazos
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    La matrícula y los bonos se pueden abonar en dos plazos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN PRINCIPAL DE LA CALCULADORA INTERACTIVA */}
      <section
        id="calculadora-oficial"
        className="w-full pb-20 px-6 lg:px-12 bg-surface scroll-mt-24"
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Columna izquierda: Controles (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-surface-container-highest space-y-8">
                <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                  <div>
                    <span className="font-label-sm text-label-sm text-primary font-bold">
                      Paso 1 • Tus prácticas de 45 minutos
                    </span>
                    <h2 className="font-headline-md text-headline-md text-on-surface mt-0.5">
                      ¿Cuántas prácticas quieres calcular?
                    </h2>
                  </div>
                  <span className="material-symbols-outlined text-primary text-[30px]">
                    directions_car
                  </span>
                </div>

                {/* Control deslizante */}
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <label
                      htmlFor="practices-slider"
                      className="font-body-md text-body-md text-on-surface-variant"
                    >
                      Número de prácticas de 45 min:
                    </label>
                    <span
                      className="font-display text-[2.75rem] text-primary leading-none font-extrabold"
                      id="practices-count-display"
                    >
                      {numPracticas}
                    </span>
                  </div>

                  <div className="relative py-2">
                    <input
                      aria-label="Número de prácticas"
                      className="w-full h-3 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
                      id="practices-slider"
                      max={45}
                      min={1}
                      step={1}
                      type="range"
                      value={numPracticas}
                      onChange={(e) => setNumPracticas(parseInt(e.target.value, 10))}
                    />
                    <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm pt-2">
                      <span>1 clase (30 €)</span>
                      <span className="text-tertiary font-bold">
                        20–30 prácticas (media habitual de los alumnos)
                      </span>
                      <span>45 clases</span>
                    </div>
                  </div>

                  {/* Botones rápidos de selección */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {[
                      { count: 10, label: "10 clases (1 Bono 10)" },
                      { count: 20, label: "20 clases (1 Bono 20)" },
                      { count: 25, label: "25 clases (Bono 20 + 5)" },
                      { count: 30, label: "30 clases (Bono 20 + Bono 10)" },
                    ].map((preset) => (
                      <button
                        key={preset.count}
                        onClick={() => setNumPracticas(preset.count)}
                        type="button"
                        className={`px-3.5 py-2 rounded-full font-label-md text-label-md transition-colors ${
                          numPracticas === preset.count
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Explicación de la combinación óptima elegida */}
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-highest flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="font-label-md text-label-md text-on-surface font-bold">
                        Combinación más económica aplicada automáticamente:
                      </p>
                      <p className="font-body-sm text-body-sm text-primary font-semibold">
                        {presupuesto.practicasDetalle.descripcionCombinacion}
                      </p>
                      {presupuesto.practicasDetalle.practicasCubiertas > numPracticas && (
                        <p className="font-label-sm text-label-sm text-tertiary">
                          Nota: Te sale más barato coger el bono ({presupuesto.practicasDetalle.practicasCubiertas} prácticas) que pagar {numPracticas} prácticas sueltas.
                        </p>
                      )}
                    </div>
                    {presupuesto.practicasDetalle.ahorroBonos > 0 && (
                      <span className="px-3 py-1.5 rounded-full bg-tertiary text-on-tertiary font-label-sm text-label-sm font-bold shrink-0 w-fit">
                        Ahorras {formatearEuros(presupuesto.practicasDetalle.ahorroBonos)} con bono
                      </span>
                    )}
                  </div>
                </div>

                {/* Selección de zona preferida en Málaga */}
                <div className="pt-2 space-y-3">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                    Paso 2 • Tu zona preferida en Málaga
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-colors border ${
                        zonaSalida === "teatinos"
                          ? "bg-primary/10 border-primary text-on-surface"
                          : "bg-surface-container-low border-transparent hover:bg-surface-container"
                      }`}
                    >
                      <input
                        checked={zonaSalida === "teatinos"}
                        onChange={() => setZonaSalida("teatinos")}
                        className="accent-primary w-4 h-4"
                        name="campus"
                        type="radio"
                        value="teatinos"
                      />
                      <div>
                        <p className="font-headline-sm text-headline-sm text-[1rem] leading-none mb-1">
                          Zona Teatinos / Universidad
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-none">
                          Enlace rápido a zonas de examen
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-colors border ${
                        zonaSalida === "centro"
                          ? "bg-primary/10 border-primary text-on-surface"
                          : "bg-surface-container-low border-transparent hover:bg-surface-container"
                      }`}
                    >
                      <input
                        checked={zonaSalida === "centro"}
                        onChange={() => setZonaSalida("centro")}
                        className="accent-primary w-4 h-4"
                        name="campus"
                        type="radio"
                        value="centro"
                      />
                      <div>
                        <p className="font-headline-sm text-headline-sm text-[1rem] leading-none mb-1">
                          Zona Centro / Alameda
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-none">
                          Recorridos urbanos y autovía
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Escenario de suspender una vez */}
                <div className="pt-4 bg-surface-container-low p-5 sm:p-6 rounded-2xl border border-surface-container-highest space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-primary text-[24px]">
                        help_outline
                      </span>
                      <span className="font-headline-sm text-headline-sm text-[1.05rem] text-on-surface">
                        Escenario: ¿Y si suspendo el examen práctico una vez?
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        className="sr-only peer"
                        id="contingency-toggle"
                        type="checkbox"
                        checked={suspenderUnaVez}
                        onChange={(e) => setSuspenderUnaVez(e.target.checked)}
                      />
                      <div className="w-12 h-7 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">Cómo funciona la tasa de la DGT:</strong> La tasa oficial de 94,05 € da derecho a <strong>2 convocatorias</strong>. Si apruebas el teórico a la primera y suspendes el práctico una vez, <strong>la tasa sigue valiendo</strong> y no tienes que pagar una nueva. Solo abonas un nuevo derecho de examen práctico (50 €) y las prácticas de repaso que quieras hacer.
                  </p>

                  {suspenderUnaVez && (
                    <div className="p-4 rounded-xl bg-surface-container-lowest border border-primary/30 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label
                          htmlFor="repaso-slider"
                          className="font-label-md text-label-md text-on-surface font-bold"
                        >
                          Prácticas de repaso antes del 2.º intento: {practicasRepaso} clases ({formatearEuros(presupuesto.costePracticasRepaso)})
                        </label>
                        <div className="flex items-center gap-1.5">
                          {[2, 3, 5, 10].map((numRep) => (
                            <button
                              key={numRep}
                              type="button"
                              onClick={() => setPracticasRepaso(numRep)}
                              className={`px-2.5 py-1 rounded-lg font-label-sm text-label-sm ${
                                practicasRepaso === numRep
                                  ? "bg-primary text-on-primary font-bold"
                                  : "bg-surface-container text-on-surface"
                              }`}
                            >
                              +{numRep}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="font-label-sm text-label-sm text-tertiary flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>
                          Si se suspendiera dos veces, habría que pagar una tasa nueva de la DGT (94,05 €), pero en Autoescuela Faro no cobramos gestión por renovar el expediente.
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumen de tabla de tarifas unitarias */}
              <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-surface-container-highest space-y-4">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Tabla completa de precios (con IVA incluido donde corresponde)
                </h3>
                <div className="divide-y divide-surface-container text-body-sm">
                  <div className="py-3 flex justify-between items-center gap-4">
                    <span className="text-on-surface font-medium">
                      Matrícula y curso teórico (con app de test)
                    </span>
                    <span className="font-bold text-on-surface shrink-0">150 €</span>
                  </div>
                  <div className="py-3 flex justify-between items-center gap-4">
                    <span className="text-on-surface font-medium">
                      Práctica suelta de 45 minutos
                    </span>
                    <span className="font-bold text-on-surface shrink-0">30 €</span>
                  </div>
                  <div className="py-3 flex justify-between items-center gap-4">
                    <span className="text-on-surface font-medium">
                      Bono de 10 prácticas (sale a 26 € cada una)
                    </span>
                    <span className="font-bold text-primary shrink-0">260 €</span>
                  </div>
                  <div className="py-3 flex justify-between items-center gap-4">
                    <span className="text-on-surface font-medium">
                      Bono de 20 prácticas (sale a 25 € cada una)
                    </span>
                    <span className="font-bold text-primary shrink-0">500 €</span>
                  </div>
                  <div className="py-3 flex justify-between items-center gap-4">
                    <span className="text-on-surface font-medium">
                      Derecho de examen práctico (coche y profesor el día del examen)
                    </span>
                    <span className="font-bold text-on-surface shrink-0">50 € por intento</span>
                  </div>
                  <div className="py-3 flex justify-between items-center gap-4">
                    <span className="text-on-surface font-medium">
                      Tasa de la DGT (se paga una vez y da derecho a 2 convocatorias)
                    </span>
                    <span className="font-bold text-on-surface shrink-0">94,05 €</span>
                  </div>
                  <div className="py-3 flex justify-between items-center gap-4">
                    <span className="text-on-surface font-medium">
                      Psicotécnico (en un centro de reconocimiento médico)
                    </span>
                    <span className="font-bold text-on-surface shrink-0">unos 35 €</span>
                  </div>
                  <div className="py-3 flex justify-between items-center gap-4">
                    <span className="text-tertiary font-bold">
                      Clase de prueba (30 minutos)
                    </span>
                    <span className="font-bold text-tertiary shrink-0">Gratis</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha: Tarjeta fija con el desglose completo (5 cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="bg-surface-container-lowest rounded-3xl border-2 border-primary/20 shadow-[0_16px_40px_-6px_rgba(11,28,48,0.1)] p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    Desglose Completo
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-tertiary/15 text-tertiary font-label-sm text-label-sm font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                    Sin letra pequeña
                  </span>
                </div>

                {/* Líneas del presupuesto */}
                <div className="space-y-3.5 font-body-sm text-body-sm">
                  <div className="flex justify-between items-start py-1.5">
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">
                        Matrícula y curso teórico
                      </p>
                      <p className="text-on-surface-variant text-[0.8rem]">
                        Con app de test y aviso si llevas 7 días sin hacer test
                      </p>
                    </div>
                    <span className="font-headline-sm text-headline-sm text-[1.05rem] text-on-surface shrink-0">
                      {formatearEuros(PRECIOS.matricula)}
                    </span>
                  </div>

                  <div className="flex justify-between items-start py-1.5">
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">
                        {numPracticas} prácticas de 45 min
                      </p>
                      <p className="text-primary font-semibold text-[0.8rem]">
                        {presupuesto.practicasDetalle.descripcionCombinacion}
                      </p>
                    </div>
                    <span
                      className="font-headline-sm text-headline-sm text-[1.05rem] text-on-surface shrink-0"
                      id="summary-practices-cost"
                    >
                      {formatearEuros(presupuesto.practicasDetalle.costeOptimal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-start py-1.5">
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">
                        Derecho de examen práctico (1.ª vez)
                      </p>
                      <p className="text-on-surface-variant text-[0.8rem]">
                        Coche con doble mando y tu profesor el día del examen
                      </p>
                    </div>
                    <span className="font-headline-sm text-headline-sm text-[1.05rem] text-on-surface shrink-0">
                      {formatearEuros(PRECIOS.derechoExamen)}
                    </span>
                  </div>

                  <div className="flex justify-between items-start py-1.5">
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">
                        Tasa oficial de la DGT
                      </p>
                      <p className="text-on-surface-variant text-[0.8rem]">
                        Da derecho a 2 convocatorias (pagada en tu nombre)
                      </p>
                    </div>
                    <span className="font-headline-sm text-headline-sm text-[1.05rem] text-on-surface shrink-0">
                      {formatearEuros(PRECIOS.tasaDgt)}
                    </span>
                  </div>

                  <div className="flex justify-between items-start py-1.5">
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">
                        Psicotécnico (estimado)
                      </p>
                      <p className="text-on-surface-variant text-[0.8rem]">
                        Se abona directamente en el centro de reconocimiento médico
                      </p>
                    </div>
                    <span className="font-headline-sm text-headline-sm text-[1.05rem] text-on-surface shrink-0">
                      ~{formatearEuros(PRECIOS.psicotecnico)}
                    </span>
                  </div>

                  {/* Subtotal aprobando a la primera */}
                  <div className="pt-2 border-t border-surface-container flex justify-between items-center">
                    <span className="font-label-md text-label-md text-on-surface-variant">
                      Total aprobando a la primera:
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface">
                      {formatearEuros(presupuesto.totalPrimeraConvocatoria)}
                    </span>
                  </div>

                  {/* Desglose adicional si activa el escenario de suspender una vez */}
                  {suspenderUnaVez && (
                    <div className="p-3.5 rounded-2xl bg-primary-fixed/40 border border-primary/20 space-y-2">
                      <p className="font-label-md text-label-md text-primary font-bold">
                        Escenario: Suspender el práctico 1 vez
                      </p>
                      <div className="flex justify-between text-on-surface text-[0.82rem]">
                        <span>2.º derecho de examen práctico:</span>
                        <span className="font-bold">+{formatearEuros(PRECIOS.derechoExamen)}</span>
                      </div>
                      <div className="flex justify-between text-on-surface text-[0.82rem]">
                        <span>{practicasRepaso} prácticas de repaso:</span>
                        <span className="font-bold">
                          +{formatearEuros(presupuesto.costePracticasRepaso)}
                        </span>
                      </div>
                      <div className="flex justify-between text-tertiary text-[0.82rem] font-semibold">
                        <span>Tasa DGT (2.ª convocatoria incluida):</span>
                        <span>0 €</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Caja del Total */}
                <div className="p-5 rounded-2xl bg-surface-container text-on-surface space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-headline-sm text-headline-sm text-[1rem] text-on-surface">
                      {suspenderUnaVez
                        ? "TOTAL CON 1 SUSPENSO"
                        : "TOTAL REAL A LA PRIMERA"}
                    </span>
                    <div className="text-right">
                      <span
                        className="font-display text-[2.4rem] text-primary leading-none font-extrabold"
                        id="grand-total-display"
                      >
                        {formatearEuros(presupuesto.totalFinalMostrado)}
                      </span>
                      <span className="block font-label-sm text-label-sm text-on-surface-variant mt-1">
                        Con tasas, examen y psicotécnico
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="space-y-3 pt-1">
                  <Link
                    href="/contacto-y-matricula?tab=matricula"
                    className="w-full h-12 rounded-full bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Matricularme con este presupuesto</span>
                    <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
                  </Link>
                  <button
                    onClick={compartirPresupuestoWhatsApp}
                    type="button"
                    className="w-full h-11 rounded-full bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[19px]">send</span>
                    <span>Enviar desglose por WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONFIGURACIONES HABITUALES CON BONOS */}
      <section className="w-full py-16 px-6 lg:px-12 bg-surface-container-low">
        <div className="max-w-[1280px] mx-auto space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
              Ejemplos reales completos según las prácticas que necesites
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Todos incluyen matrícula y teórico (150 €), tasa DGT (94,05 €), derecho de examen práctico (50 €) y psicotécnico estimado (35 €).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Opción 10 prácticas */}
            <div className="bg-surface-container-lowest p-8 rounded-3xl border border-surface-container-highest flex flex-col justify-between">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm inline-block">
                  Con Bono de 10 prácticas (260 €)
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Presupuesto con 10 prácticas
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-display text-on-surface">589,05 €</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Para quienes ya tienen experiencia previa o vienen de traslado y necesitan pocas clases.
                </p>
                <div className="pt-4 space-y-2.5 font-body-sm text-body-sm text-on-surface">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      check_circle
                    </span>
                    <span>Matrícula y curso teórico: 150 €</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      check_circle
                    </span>
                    <span>Bono de 10 prácticas (26 €/ud.): 260 €</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      check_circle
                    </span>
                    <span>Tasa DGT (94,05 €) + Examen (50 €)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      check_circle
                    </span>
                    <span>Psicotécnico médico (~35 €)</span>
                  </div>
                </div>
              </div>
              <div className="pt-8">
                <button
                  className="w-full h-11 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-colors"
                  onClick={() => seleccionarPack(10)}
                  type="button"
                >
                  Cargar 10 prácticas en calculadora
                </button>
              </div>
            </div>

            {/* Opción 20 prácticas (Destacado: 829,05 €) */}
            <div className="bg-surface-container-lowest p-8 rounded-3xl border-2 border-primary flex flex-col justify-between relative">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm inline-block font-bold">
                  Ejemplo oficial • Bono de 20 prácticas (500 €)
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Presupuesto con 20 prácticas
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-display text-primary">829,05 €</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  150 € matrícula + 500 € bono 20 + 50 € examen + 94,05 € tasa DGT + 35 € psicotécnico.
                </p>
                <div className="pt-4 space-y-2.5 font-body-sm text-body-sm text-on-surface">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      check_circle
                    </span>
                    <span>
                      <strong>Bono de 20 prácticas</strong> (sale a 25 €/clase)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      check_circle
                    </span>
                    <span>Matrícula y teórico con app (150 €)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      check_circle
                    </span>
                    <span>Tasa DGT (94,05 €) + 1.er Examen (50 €)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      check_circle
                    </span>
                    <span>Psicotécnico (~35 €) • Pago en 2 plazos</span>
                  </div>
                </div>
              </div>
              <div className="pt-8">
                <button
                  className="w-full h-11 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors"
                  onClick={() => seleccionarPack(20)}
                  type="button"
                >
                  Cargar 20 prácticas en calculadora
                </button>
              </div>
            </div>

            {/* Opción 30 prácticas */}
            <div className="bg-surface-container-lowest p-8 rounded-3xl border border-surface-container-highest flex flex-col justify-between">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm inline-block">
                  Bono 20 (500 €) + Bono 10 (260 €)
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Presupuesto con 30 prácticas
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-display text-on-surface">1.089,05 €</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  La mayoría de alumnos necesita entre 20 y 30 prácticas. Combinando ambos bonos ahorras 140 € frente a clases sueltas.
                </p>
                <div className="pt-4 space-y-2.5 font-body-sm text-body-sm text-on-surface">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      check_circle
                    </span>
                    <span>30 prácticas de 45 min (760 € en bonos)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      check_circle
                    </span>
                    <span>Matrícula y teórico con app (150 €)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      check_circle
                    </span>
                    <span>Tasa DGT (94,05 €) + Examen (50 €)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      check_circle
                    </span>
                    <span>Psicotécnico médico (~35 €)</span>
                  </div>
                </div>
              </div>
              <div className="pt-8">
                <button
                  className="w-full h-11 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-colors"
                  onClick={() => seleccionarPack(30)}
                  type="button"
                >
                  Cargar 30 prácticas en calculadora
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARATIVA TRANSPARENTE */}
      <section className="w-full py-16 px-6 lg:px-12 bg-surface">
        <div className="max-w-[1280px] mx-auto space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
              Por qué enseñamos todos los gastos desde el principio
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Compara qué incluye un presupuesto completo frente a las ofertas que solo anuncian el precio de la matrícula.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna Faro */}
            <div className="bg-surface-container-low p-6 sm:p-8 rounded-3xl space-y-6 border border-surface-container-highest">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Autoescuela Faro (Málaga)
                  </h3>
                  <p className="font-label-sm text-label-sm text-tertiary font-bold">
                    Cuentas claras antes de matricularte
                  </p>
                </div>
              </div>

              <div className="space-y-4 font-body-sm text-body-sm text-on-surface">
                <div className="p-4 rounded-2xl bg-surface-container-lowest space-y-1">
                  <p className="font-label-md text-label-md text-tertiary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Tasa de la DGT a su precio exacto
                  </p>
                  <p className="text-on-surface-variant">
                    94,05 € oficiales que dan derecho a 2 convocatorias. La pagamos en tu nombre y te entregamos el recibo.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-lowest space-y-1">
                  <p className="font-label-md text-label-md text-tertiary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Sin recargo por renovar expediente
                  </p>
                  <p className="text-on-surface-variant">
                    Si alguien suspende dos veces hay que abonar una nueva tasa a la DGT (94,05 €), pero en Faro no cobramos gestión por renovar.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-lowest space-y-1">
                  <p className="font-label-md text-label-md text-tertiary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Prácticas concentradas antes de tu examen
                  </p>
                  <p className="text-on-surface-variant">
                    Concentramos las prácticas en las 4 semanas previas a tu fecha de examen para que no gastes dinero en clases de mantenimiento.
                  </p>
                </div>
              </div>
            </div>

            {/* Columna Ofertas Gancho */}
            <div className="bg-surface-container-high/50 p-6 sm:p-8 rounded-3xl space-y-6 border border-surface-container-highest">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error text-on-error flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Ofertas con letra pequeña
                  </h3>
                  <p className="font-label-sm text-label-sm text-error font-bold">
                    Costes que aparecen a mitad del camino
                  </p>
                </div>
              </div>

              <div className="space-y-4 font-body-sm text-body-sm text-on-surface">
                <div className="p-4 rounded-2xl bg-surface-container-lowest space-y-1">
                  <p className="font-label-md text-label-md text-error flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    Tasas y derechos de examen no anunciados
                  </p>
                  <p className="text-on-surface-variant">
                    Anuncian solo el teórico sin avisar de la tasa DGT ni de cuánto cuesta llevar el coche al examen práctico.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-lowest space-y-1">
                  <p className="font-label-md text-label-md text-error flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    Comisiones por renovar o trasladar expediente
                  </p>
                  <p className="text-on-surface-variant">
                    Cobran gastos administrativos propios cada vez que agotas convocatorias o si decides cambiar de autoescuela.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-lowest space-y-1">
                  <p className="font-label-md text-label-md text-error flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    Meses dando clases sueltas sin saber tu turno
                  </p>
                  <p className="text-on-surface-variant">
                    Empiezas a dar prácticas sin saber tu puesto en la cola de Tráfico y acabas pagando decenas de clases extra para no perder práctica.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="w-full py-16 px-6 lg:px-12 bg-primary text-on-primary">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-primary tracking-tight">
              ¿Te encaja el presupuesto? Pruébanos gratis 30 minutos.
            </h2>
            <p className="font-body-lg text-body-lg text-primary-fixed">
              Puedes reservar tu clase de prueba gratuita de 30 minutos o matricularte directamente online o en nuestra oficina de Málaga.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              className="w-full sm:w-auto h-12 px-8 rounded-full bg-surface-container-lowest text-primary font-label-lg text-label-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
              href="/contacto-y-matricula?tab=matricula"
            >
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
              <span>Matricularme ahora</span>
            </Link>
            <Link
              className="w-full sm:w-auto h-12 px-6 rounded-full bg-primary-container text-on-primary-container font-label-lg text-label-lg hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-2"
              href="/contacto-y-matricula?tab=prueba"
            >
              <span className="material-symbols-outlined text-[20px]">directions_car</span>
              <span>Clase de prueba gratis</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
