"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ContactoYMatriculaContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"prueba" | "matricula">("prueba");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "matricula") {
      setActiveTab("matricula");
    } else if (tabParam === "prueba") {
      setActiveTab("prueba");
    }
  }, [searchParams]);

  // Estado para Formulario A: Clase de prueba gratis
  const [trialName, setTrialName] = useState("");
  const [trialPhone, setTrialPhone] = useState("");
  const [trialAge, setTrialAge] = useState("");
  const [trialZone, setTrialZone] = useState("teatinos");
  const [trialExp, setTrialExp] = useState("nunca");
  const [trialDate, setTrialDate] = useState("");
  const [trialTime, setTrialTime] = useState("manana");
  const [trialSubmitting, setTrialSubmitting] = useState(false);
  const [trialSuccess, setTrialSuccess] = useState(false);
  const [trialError, setTrialError] = useState("");

  // Estado para Formulario B: Matricúlate
  const [enrollName, setEnrollName] = useState("");
  const [enrollDni, setEnrollDni] = useState("");
  const [enrollEmail, setEnrollEmail] = useState("");
  const [enrollPhone, setEnrollPhone] = useState("");
  const [enrollPack, setEnrollPack] = useState("mat_bono20");
  const [enrollPayment, setEnrollPayment] = useState("pago_unico");
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  async function handleTrialSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTrialError("");
    setTrialSubmitting(true);

    try {
      const res = await fetch("/api/interesados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origen: "clase_prueba",
          nombre: trialName,
          telefono: trialPhone,
          edad: trialAge ? Number(trialAge) : undefined,
          zona: trialZone,
          experienciaPrevia: trialExp,
          diaPreferido: trialDate || undefined,
          franjaHoraria: trialTime,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setTrialSuccess(true);
      } else {
        setTrialError(data.error || "No se pudo enviar la solicitud.");
      }
    } catch {
      setTrialError("Error de conexión al guardar tu solicitud. Inténtalo de nuevo.");
    } finally {
      setTrialSubmitting(false);
    }
  }

  async function handleEnrollSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnrollError("");
    setEnrollSubmitting(true);

    try {
      const res = await fetch("/api/interesados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origen: "matricula",
          nombre: enrollName,
          dni: enrollDni,
          email: enrollEmail,
          telefono: enrollPhone,
          packElegido: enrollPack,
          modalidadPago: enrollPayment,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setEnrollSuccess(true);
      } else {
        setEnrollError(data.error || "No se pudo completar la solicitud de matrícula.");
      }
    } catch {
      setEnrollError("Error de conexión al guardar tu matrícula. Inténtalo de nuevo.");
    } finally {
      setEnrollSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col w-full">
      {/* CABECERA SUPERIOR */}
      <section className="w-full bg-surface-container-low pt-10 pb-16 px-6 lg:px-12">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary/15 text-tertiary font-label-md text-label-md">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Clase de prueba gratis (30 min) o Matrícula online</span>
            </span>
            <span className="text-on-surface-variant font-label-md text-label-md flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[16px]">
                location_on
              </span>
              <span>Autoescuela Faro • Málaga</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="font-display text-display-mobile sm:text-display text-on-surface tracking-tight leading-[1.08]">
                Empieza a conducir en Málaga.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Elige si prefieres probar antes una clase gratuita de 30 minutos o matricularte directamente con nuestras tarifas oficiales.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <a
                className="group flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-highest hover:bg-surface-bright transition-colors"
                href="https://wa.me/34600000000?text=Hola%20Autoescuela%20Faro,%20quiero%20empezar%20mi%20carnet"
                rel="noopener noreferrer"
                target="_blank"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-[24px]">chat</span>
                  </div>
                  <div>
                    <p className="font-headline-sm text-headline-sm text-[1rem] text-on-surface leading-tight group-hover:text-primary transition-colors">
                      WhatsApp y Teléfono
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      600 000 000 • hola@autoescuelafaro.es
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary text-[20px]">
                  arrow_forward
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PESTAÑAS INTERACTIVAS Y FORMULARIOS */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-12 -mt-7 relative z-20 w-full">
        {/* Selector de pestaña */}
        <div
          className="bg-surface-container-lowest p-2 rounded-2xl border border-surface-container-highest shadow-[0_8px_24px_rgba(11,28,48,0.08)] flex flex-col md:flex-row gap-2 max-w-2xl mx-auto mb-10"
          role="tablist"
        >
          <button
            role="tab"
            aria-selected={activeTab === "prueba"}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-label-lg text-label-lg transition-colors ${
              activeTab === "prueba"
                ? "bg-primary text-on-primary"
                : "text-on-surface hover:bg-surface-container-low"
            }`}
            id="tab-btn-prueba"
            onClick={() => setActiveTab("prueba")}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">directions_car</span>
            <span>Clase de Prueba Gratis (30 min)</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "matricula"}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-label-lg text-label-lg transition-colors ${
              activeTab === "matricula"
                ? "bg-primary text-on-primary"
                : "text-on-surface hover:bg-surface-container-low"
            }`}
            id="tab-btn-matricula"
            onClick={() => setActiveTab("matricula")}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            <span>Matricúlate Online</span>
          </button>
        </div>

        {/* Cuadrícula principal: Formulario activo (8 cols) + Información lateral (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            {/* FORMULARIO A: CLASE DE PRUEBA */}
            {activeTab === "prueba" && (
              <div
                className="bg-surface-container-lowest p-6 sm:p-8 lg:p-10 rounded-3xl border border-surface-container-highest space-y-8"
                id="form-container-prueba"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">
                    <span>Gratis • 30 minutos • Coche con doble mando</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Pide tu clase de prueba gratuita de 30 minutos
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Conoce a nuestros profesores (Alejandro, Carmen o Marcos), súbete al coche y comprueba cómo trabajamos sin pagar matrícula ni compromiso.
                  </p>
                </div>

                {!trialSuccess ? (
                  <form className="space-y-6" id="free-trial-form" onSubmit={handleTrialSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label
                          className="font-label-lg text-label-lg text-on-surface block"
                          htmlFor="trial-name"
                        >
                          Nombre y apellidos *
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-secondary text-[20px]">
                            person
                          </span>
                          <input
                            className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-low border border-surface-container-highest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                            id="trial-name"
                            placeholder="Ej. Lucía Gómez"
                            required
                            type="text"
                            value={trialName}
                            onChange={(e) => setTrialName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label
                          className="font-label-lg text-label-lg text-on-surface block"
                          htmlFor="trial-phone"
                        >
                          Teléfono / WhatsApp *
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-secondary text-[20px]">
                            call
                          </span>
                          <input
                            className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-low border border-surface-container-highest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                            id="trial-phone"
                            placeholder="Ej. 654 321 098"
                            required
                            type="tel"
                            value={trialPhone}
                            onChange={(e) => setTrialPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label
                          className="font-label-lg text-label-lg text-on-surface block"
                          htmlFor="trial-age"
                        >
                          Edad *
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-secondary text-[20px]">
                            cake
                          </span>
                          <input
                            className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-low border border-surface-container-highest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                            id="trial-age"
                            max={85}
                            min={17}
                            placeholder="Ej. 20"
                            required
                            type="number"
                            value={trialAge}
                            onChange={(e) => setTrialAge(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label
                          className="font-label-lg text-label-lg text-on-surface block"
                          htmlFor="trial-zone"
                        >
                          Zona preferida en Málaga *
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-secondary text-[20px]">
                            pin_drop
                          </span>
                          <select
                            className="w-full h-12 pl-11 pr-8 rounded-xl bg-surface-container-low border border-surface-container-highest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                            id="trial-zone"
                            required
                            value={trialZone}
                            onChange={(e) => setTrialZone(e.target.value)}
                          >
                            <option value="teatinos">Zona Teatinos / Universidad</option>
                            <option value="centro">Zona Centro / Alameda</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-secondary text-[20px] pointer-events-none">
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="font-label-lg text-label-lg text-on-surface block">
                        ¿Has cogido un coche antes? *
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { val: "nunca", label: "Nunca, cero experiencia" },
                          { val: "algo", label: "Algo (prácticas previas)" },
                          { val: "traslado", label: "Vengo de otra autoescuela" },
                        ].map((opt) => (
                          <label
                            key={opt.val}
                            className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer border transition-colors ${
                              trialExp === opt.val
                                ? "bg-primary/10 border-primary"
                                : "bg-surface-container-low border-surface-container-highest"
                            }`}
                          >
                            <input
                              checked={trialExp === opt.val}
                              onChange={() => setTrialExp(opt.val)}
                              className="accent-primary w-4 h-4"
                              name="driving_experience"
                              type="radio"
                              value={opt.val}
                            />
                            <span className="font-label-md text-label-md text-on-surface">
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label
                          className="font-label-lg text-label-lg text-on-surface block"
                          htmlFor="trial-date"
                        >
                          Día preferido (opcional)
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-secondary text-[20px]">
                            calendar_today
                          </span>
                          <input
                            className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-low border border-surface-container-highest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                            id="trial-date"
                            type="date"
                            value={trialDate}
                            onChange={(e) => setTrialDate(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label
                          className="font-label-lg text-label-lg text-on-surface block"
                          htmlFor="trial-time"
                        >
                          Franja horaria preferida
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-secondary text-[20px]">
                            schedule
                          </span>
                          <select
                            className="w-full h-12 pl-11 pr-8 rounded-xl bg-surface-container-low border border-surface-container-highest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                            id="trial-time"
                            value={trialTime}
                            onChange={(e) => setTrialTime(e.target.value)}
                          >
                            <option value="manana">Mañanas (08:00 - 13:30)</option>
                            <option value="mediodia">Mediodía (13:30 - 16:30)</option>
                            <option value="tarde">Tardes (16:30 - 21:00)</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-secondary text-[20px] pointer-events-none">
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>

                    {trialError && (
                      <div className="p-4 rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm">
                        {trialError}
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-tertiary/10 flex items-start gap-3">
                      <span className="material-symbols-outlined text-tertiary text-[22px] mt-0.5">
                        shield
                      </span>
                      <div className="text-on-surface font-body-sm text-body-sm">
                        <span className="font-bold text-tertiary">Sin letra pequeña:</span> La clase de prueba de 30 minutos es totalmente gratuita y sin compromiso de matricularte después.
                      </div>
                    </div>

                    <button
                      className="w-full h-12 py-3.5 px-8 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
                      type="submit"
                      disabled={trialSubmitting}
                    >
                      <span>
                        {trialSubmitting
                          ? "Guardando tu solicitud..."
                          : "Solicitar mi clase de prueba gratis"}
                      </span>
                      <span className="material-symbols-outlined text-[20px]">
                        arrow_forward
                      </span>
                    </button>
                  </form>
                ) : (
                  <div
                    className="p-6 rounded-2xl bg-tertiary text-on-tertiary space-y-3"
                    id="trial-success-msg"
                  >
                    <div className="flex items-center gap-2 font-headline-sm text-headline-sm">
                      <span className="material-symbols-outlined text-[26px]">
                        check_circle
                      </span>
                      <span>¡Solicitud de clase de prueba guardada!</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-tertiary-container">
                      Gracias, <strong>{trialName}</strong>. Hemos registrado tus datos y nos pondremos en contacto contigo en el <strong>{trialPhone}</strong> dentro de nuestro horario de oficina para confirmar el día y hora de tu clase gratuita de 30 minutos.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* FORMULARIO B: MATRÍCULA ONLINE */}
            {activeTab === "matricula" && (
              <div
                className="bg-surface-container-lowest p-6 sm:p-8 lg:p-10 rounded-3xl border border-surface-container-highest space-y-8"
                id="form-container-matricula"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                    <span>Matrícula oficial • Precios sin letra pequeña</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Matricúlate en Autoescuela Faro
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Recuerda que para matricularse solo hacen falta tu DNI o NIE en vigor y el informe del psicotécnico (vale 90 días para presentarse al teórico). Nosotros pagamos la tasa de la DGT en tu nombre y te damos el recibo.
                  </p>
                </div>

                {!enrollSuccess ? (
                  <form
                    className="space-y-6"
                    id="online-enroll-form"
                    onSubmit={handleEnrollSubmit}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label
                          className="font-label-lg text-label-lg text-on-surface block"
                          htmlFor="enroll-name"
                        >
                          Nombre completo *
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-secondary text-[20px]">
                            badge
                          </span>
                          <input
                            className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-low border border-surface-container-highest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                            id="enroll-name"
                            placeholder="Ej. Alejandro Soler Martínez"
                            required
                            type="text"
                            value={enrollName}
                            onChange={(e) => setEnrollName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label
                          className="font-label-lg text-label-lg text-on-surface block"
                          htmlFor="enroll-dni"
                        >
                          DNI o NIE en vigor *
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-secondary text-[20px]">
                            credit_card
                          </span>
                          <input
                            className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-low border border-surface-container-highest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                            id="enroll-dni"
                            placeholder="Ej. 12345678Z"
                            required
                            type="text"
                            value={enrollDni}
                            onChange={(e) => setEnrollDni(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label
                          className="font-label-lg text-label-lg text-on-surface block"
                          htmlFor="enroll-email"
                        >
                          Correo electrónico (para la app de test) *
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-secondary text-[20px]">
                            mail
                          </span>
                          <input
                            className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-low border border-surface-container-highest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                            id="enroll-email"
                            placeholder="tuemail@ejemplo.es"
                            required
                            type="email"
                            value={enrollEmail}
                            onChange={(e) => setEnrollEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label
                          className="font-label-lg text-label-lg text-on-surface block"
                          htmlFor="enroll-phone"
                        >
                          Teléfono móvil *
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-secondary text-[20px]">
                            smartphone
                          </span>
                          <input
                            className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-low border border-surface-container-highest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                            id="enroll-phone"
                            placeholder="Ej. 611 223 344"
                            required
                            type="tel"
                            value={enrollPhone}
                            onChange={(e) => setEnrollPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Selección de opción inicial con los precios reales exactos */}
                    <div className="space-y-2">
                      <span className="font-label-lg text-label-lg text-on-surface block">
                        Elige cómo quieres empezar *
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <label
                          className={`flex flex-col p-4 rounded-2xl cursor-pointer border transition-colors ${
                            enrollPack === "solo_matricula"
                              ? "bg-primary/10 border-primary"
                              : "bg-surface-container-low border-surface-container-highest"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-headline-sm text-headline-sm text-[1rem] text-on-surface">
                              Matrícula y Curso Teórico
                            </span>
                            <input
                              checked={enrollPack === "solo_matricula"}
                              onChange={() => setEnrollPack("solo_matricula")}
                              className="accent-primary w-4 h-4"
                              name="enroll_pack"
                              type="radio"
                              value="solo_matricula"
                            />
                          </div>
                          <span className="font-headline-sm text-headline-sm text-primary mb-1">
                            150 €
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Con app de test y seguimiento. Añades tus bonos o prácticas más adelante.
                          </span>
                        </label>

                        <label
                          className={`flex flex-col p-4 rounded-2xl cursor-pointer border transition-colors ${
                            enrollPack === "mat_bono10"
                              ? "bg-primary/10 border-primary"
                              : "bg-surface-container-low border-surface-container-highest"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-headline-sm text-headline-sm text-[1rem] text-on-surface">
                              Matrícula + Bono 10 Prácticas
                            </span>
                            <input
                              checked={enrollPack === "mat_bono10"}
                              onChange={() => setEnrollPack("mat_bono10")}
                              className="accent-primary w-4 h-4"
                              name="enroll_pack"
                              type="radio"
                              value="mat_bono10"
                            />
                          </div>
                          <span className="font-headline-sm text-headline-sm text-primary mb-1">
                            410 € (150 € + 260 €)
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Teórico con app + bono de 10 prácticas de 45 min (a 26 € cada una).
                          </span>
                        </label>

                        <label
                          className={`flex flex-col p-4 rounded-2xl cursor-pointer border transition-colors relative ${
                            enrollPack === "mat_bono20"
                              ? "bg-primary/10 border-primary"
                              : "bg-surface-container-low border-surface-container-highest"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-headline-sm text-headline-sm text-[1rem] text-on-surface">
                              Matrícula + Bono 20 (O Completo)
                            </span>
                            <input
                              checked={enrollPack === "mat_bono20"}
                              onChange={() => setEnrollPack("mat_bono20")}
                              className="accent-primary w-4 h-4"
                              name="enroll_pack"
                              type="radio"
                              value="mat_bono20"
                            />
                          </div>
                          <span className="font-headline-sm text-headline-sm text-primary mb-1">
                            650 € (829,05 € con tasa, examen y psicotécnico)
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Matrícula (150 €) + bono de 20 prácticas (500 €, a 25 €/clase).
                          </span>
                        </label>

                        <label
                          className={`flex flex-col p-4 rounded-2xl cursor-pointer border transition-colors ${
                            enrollPack === "traslado"
                              ? "bg-primary/10 border-primary"
                              : "bg-surface-container-low border-surface-container-highest"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-headline-sm text-headline-sm text-[1rem] text-on-surface">
                              Traslado de expediente
                            </span>
                            <input
                              checked={enrollPack === "traslado"}
                              onChange={() => setEnrollPack("traslado")}
                              className="accent-primary w-4 h-4"
                              name="enroll_pack"
                              type="radio"
                              value="traslado"
                            />
                          </div>
                          <span className="font-headline-sm text-headline-sm text-tertiary mb-1">
                            0 € gestión de traslado
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Si ya empezaste en otra autoescuela, te ayudamos con el traslado sin coste de gestión.
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Modalidad de pago (acorde a la ficha: pago único o en 2 plazos) */}
                    <div className="space-y-2">
                      <span className="font-label-lg text-label-lg text-on-surface block">
                        Preferencia de pago
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label
                          className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer border transition-colors ${
                            enrollPayment === "pago_unico"
                              ? "bg-primary/10 border-primary"
                              : "bg-surface-container-low border-surface-container-highest"
                          }`}
                        >
                          <input
                            checked={enrollPayment === "pago_unico"}
                            onChange={() => setEnrollPayment("pago_unico")}
                            className="accent-primary w-4 h-4"
                            name="payment_mode"
                            type="radio"
                            value="pago_unico"
                          />
                          <div className="flex flex-col">
                            <span className="font-label-md text-label-md text-on-surface">
                              En un solo pago
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              Online o en la oficina
                            </span>
                          </div>
                        </label>

                        <label
                          className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer border transition-colors ${
                            enrollPayment === "dos_plazos"
                              ? "bg-primary/10 border-primary"
                              : "bg-surface-container-low border-surface-container-highest"
                          }`}
                        >
                          <input
                            checked={enrollPayment === "dos_plazos"}
                            onChange={() => setEnrollPayment("dos_plazos")}
                            className="accent-primary w-4 h-4"
                            name="payment_mode"
                            type="radio"
                            value="dos_plazos"
                          />
                          <div className="flex flex-col">
                            <span className="font-label-md text-label-md text-on-surface">
                              Pagar en 2 plazos
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              La matrícula y los bonos admiten 2 plazos
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {enrollError && (
                      <div className="p-4 rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm">
                        {enrollError}
                      </div>
                    )}

                    <button
                      className="w-full h-12 py-3.5 px-8 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
                      type="submit"
                      disabled={enrollSubmitting}
                    >
                      <span>
                        {enrollSubmitting
                          ? "Registrando tu matrícula..."
                          : "Confirmar inscripción y recibir acceso"}
                      </span>
                      <span className="material-symbols-outlined text-[20px]">
                        lock_open
                      </span>
                    </button>
                  </form>
                ) : (
                  <div
                    className="p-6 rounded-2xl bg-tertiary text-on-tertiary space-y-3"
                    id="enroll-success-msg"
                  >
                    <div className="flex items-center gap-2 font-headline-sm text-headline-sm">
                      <span className="material-symbols-outlined text-[26px]">
                        celebration
                      </span>
                      <span>¡Tu inscripción se ha guardado correctamente!</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-tertiary-container">
                      Muchas gracias, <strong>{enrollName}</strong>. Hemos registrado tus datos (DNI/NIE <strong>{enrollDni}</strong>) y nos pondremos en contacto contigo en el <strong>{enrollPhone}</strong> y en <strong>{enrollEmail}</strong> para darte acceso a la app de test y tramitar la tasa de la DGT en tu nombre.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Columna derecha: Equipo de profesores y datos de contacto oficiales (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container-highest space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Nuestros 3 profesores
                </h3>
                <span className="px-2.5 py-1 rounded-full bg-tertiary/15 text-tertiary font-label-sm text-label-sm font-bold">
                  Málaga
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Puedes escribirnos directamente por WhatsApp al 600 000 000 para cualquier consulta antes de apuntarte.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low">
                  <div className="flex items-center gap-3">
                    <img
                      alt="Alejandro, profesor de Autoescuela Faro"
                      className="w-11 h-11 rounded-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzWy_E7Oou49b0lBEoCLA9lroDLZqYH0ttf1VGOTrPnbJqnY6VsWnaL5VkcUAdG6H0adof3a11UN06g2BkPTfe5LRg7tZ56655S65XkcolazQJE0jMqpJIWZuM8EEv2zYhL0bHjq-cX_wN_TsCu-A_8xHcbxFC5jQ8qzZ1ACL1WxF8-WochYU33yREtEifVDMwSoL3W0r7JW3ZBGCvqH_0ub9WQME06bTdL6Z49oSXCzlEomNkhP8SvA"
                    />
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-bold">
                        Alejandro
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Profesor Permiso B
                      </p>
                    </div>
                  </div>
                  <a
                    className="w-9 h-9 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center"
                    href="https://wa.me/34600000000?text=Hola%20Alejandro,%20tengo%20dudas%20sobre%20las%20clases"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Escribir por WhatsApp"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                  </a>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low">
                  <div className="flex items-center gap-3">
                    <img
                      alt="Carmen, profesora de Autoescuela Faro"
                      className="w-11 h-11 rounded-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuADXArDG0FCTpEIRDw6oNXUQayfIeXs7_UWKay7TEqT6eg-SSmnk9cjqfHNNdB9Z3TuXc1V9j48PyFYo94r6L08rbUFUZshqlXAA-F6hLNIQKeAQ7bW_whU__DPbRLQKwCdGXG80az-ylQTrxPUXAiav5Eg3HbkxULjsR_MbC55getpKRBulFDmw5qxV513Ajnxf4jdGqjlKIyXd3NgP1qZI0Gw2eOqmml0AFYvsRUknMutUnBJCLBnnw"
                    />
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-bold">
                        Carmen
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Profesora Permiso B
                      </p>
                    </div>
                  </div>
                  <a
                    className="w-9 h-9 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center"
                    href="https://wa.me/34600000000?text=Hola%20Carmen,%20me%20gustaria%20preguntar%20por%20el%20permiso%20B"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Escribir por WhatsApp"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                  </a>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low">
                  <div className="flex items-center gap-3">
                    <img
                      alt="Marcos, profesor de Autoescuela Faro"
                      className="w-11 h-11 rounded-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHHQ6s5qfXT7mbVdDMEwnq-IszOoAq1lNtGMYUEq7nDcccJqfFrj1_Ua3C5QKeXyMfWBkHPFczA3oLdkFyQ-QRunRIz5xT6_BcaXPtUPsaHRKuTlK3kUXz_1SNLTr_hg__3X_APqIr87-a1h9fBYw0Ltx-7DgXtzscrqwswCVHUCMQf5RgcPMhLDE92gUsC5F6WSOcgTt3fuGpdaqSN0rSkwrvqVSXp9GJQi0KA_rqgVPoY6nTV8pB2g"
                    />
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-bold">
                        Marcos
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Profesor Permiso B
                      </p>
                    </div>
                  </div>
                  <a
                    className="w-9 h-9 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center"
                    href="https://wa.me/34600000000?text=Hola%20Marcos,%20quiero%20informacion%20sobre%20las%20practicas"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Escribir por WhatsApp"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Horarios y contacto oficial */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container-highest space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  schedule
                </span>
                <h4 className="font-headline-sm text-headline-sm text-[1.05rem] text-on-surface">
                  Horario y contacto oficial
                </h4>
              </div>
              <ul className="space-y-3 font-body-sm text-body-sm text-on-surface-variant">
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5">
                    storefront
                  </span>
                  <span>
                    <strong className="text-on-surface">Oficina:</strong> De lunes a viernes de 9:30 a 13:30 y de 16:30 a 20:30; sábados de 10:00 a 13:00.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5">
                    directions_car
                  </span>
                  <span>
                    <strong className="text-on-surface">Prácticas:</strong> De lunes a sábado de 8:00 a 21:00.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5">
                    call
                  </span>
                  <span>
                    <strong className="text-on-surface">Teléfono y WhatsApp:</strong> 600 000 000
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5">
                    mail
                  </span>
                  <span>
                    <strong className="text-on-surface">Correo:</strong> hola@autoescuelafaro.es
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ZONAS Y SEDES EN MÁLAGA */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-12 mt-20 mb-16 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface">
              Dónde estamos en Málaga
            </h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Pásate por la oficina en horario de atención o escríbenos para quedar directamente en tu clase de prueba.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-surface-container-lowest rounded-3xl border border-surface-container-highest overflow-hidden flex flex-col justify-between">
            <div className="relative h-60 w-full bg-surface-container">
              <img
                alt="Mapa de zona Teatinos en Málaga"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWY0HJAfdF4QugMb4v1_lW3bHzhXi1hVtenHFrBxBeyWDa2tC8jKC8Mm2NeLee2hZNqkpFWXRCu5GxWv0ANKeElLaVVmKmkQoDt2ZpI997h6dc3NB4lgv1xHhroSZ0_sTLD58ujhu6E_cKb0vTPJCsb8PSPg0PVrwDYsLhcfwz9HSIijO2jik_mRc72fLZCSrX3CaHH3gdBQOb_KMa21foFZKllmdw3kr8c9w0o5yHrBVjXWsgAgMf0Q"
              />
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <h3 className="font-headline-md text-headline-md text-[1.35rem] text-on-surface">
                  Zona Teatinos / Universidad
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Punto de referencia junto al campus universitario y acceso directo a las zonas de examen de Málaga.
                </p>
              </div>
              <div className="space-y-2.5 font-body-sm text-body-sm text-on-surface">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    schedule
                  </span>
                  <span>
                    <strong>Oficina:</strong> L–V 9:30–13:30 y 16:30–20:30 • Sáb 10:00–13:00
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    phone
                  </span>
                  <span>
                    <strong>Teléfono y WhatsApp:</strong> 600 000 000
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl border border-surface-container-highest overflow-hidden flex flex-col justify-between">
            <div className="relative h-60 w-full bg-surface-container">
              <img
                alt="Mapa de zona Centro en Málaga"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDOYUX4RC5EVz6SjMf5tzfKTWjyqWnt3mEXQ6S2GoplAyqBJbUqpIf-llwsJd0kC4uO2zrFXfMcrsuQ3vyX0qOLYut8Y6ktR4o8_XmBsXQKXcqhTrUCKRHkPoU_kmfTFzgVa3cgKMGVcUvzqnmITPEPI9o556RXr2qfhhjq5kBBewcE30FY5X9wMj0MjThXo7aQ9zeW6sSfM-2gLLKHntwMsJ7iY17IjdTs49bPBY0-KBFsgU0TaPHFw"
              />
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <h3 className="font-headline-md text-headline-md text-[1.35rem] text-on-surface">
                  Zona Centro / Alameda
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Recorridos de práctica por circulación urbana en Málaga, glorietas e incorporaciones a la autovía.
                </p>
              </div>
              <div className="space-y-2.5 font-body-sm text-body-sm text-on-surface">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    directions_car
                  </span>
                  <span>
                    <strong>Prácticas:</strong> Lunes a sábado de 8:00 a 21:00
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    mail
                  </span>
                  <span>
                    <strong>Correo:</strong> hola@autoescuelafaro.es
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BANNER TRASLADO DE EXPEDIENTE */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-12 mb-16 w-full">
        <div className="p-8 lg:p-12 rounded-3xl bg-surface-container-highest/60 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              ¿Ya empezaste en otra autoescuela y quieres cambiarte?
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Te ayudamos con el traslado de tu expediente sin ningún coste de gestión por nuestra parte.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setActiveTab("matricula");
                setEnrollPack("traslado");
                window.scrollTo({ top: 280, behavior: "smooth" });
              }}
              className="h-12 px-6 rounded-full bg-on-surface text-surface-container-lowest font-label-lg text-label-lg hover:bg-primary transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">sync_alt</span>
              <span>Solicitar traslado sin coste de gestión</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ContactoYMatriculaPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1280px] mx-auto px-6 py-16 text-on-surface-variant">
          Cargando formularios...
        </div>
      }
    >
      <ContactoYMatriculaContent />
    </Suspense>
  );
}
