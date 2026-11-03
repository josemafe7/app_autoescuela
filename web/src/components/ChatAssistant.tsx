"use client";

import React, { useState, useEffect, useRef } from "react";
import type { MensajeChat } from "@faro/compartido";

const PREGUNTAS_RAPIDAS = [
  "¿Cuánto cuesta el carnet en total?",
  "¿Cuánto tarda el examen práctico en Málaga?",
  "¿Cómo funcionan las prácticas y cancelaciones?",
];

export default function ChatAssistant() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [sessionId, setSessionId] = useState("faro_sess");
  const [restantes, setRestantes] = useState<number>(10);
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);
  const [mostrarFormContacto, setMostrarFormContacto] = useState(false);
  const [nombreContacto, setNombreContacto] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [contactoGuardado, setContactoGuardado] = useState(false);
  const [enviandoContacto, setEnviandoContacto] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const almacenado = window.sessionStorage.getItem("faro_chat_session_id");
    if (almacenado) {
      setSessionId(almacenado);
    } else {
      const nuevo = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      window.sessionStorage.setItem("faro_chat_session_id", nuevo);
      setSessionId(nuevo);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes, cargando, mostrarFormContacto, abierto]);

  async function enviarMensaje(textoUsuario: string) {
    const limpio = textoUsuario.trim();
    if (!limpio || cargando || limiteAlcanzado) return;

    const nuevosMensajes: MensajeChat[] = [
      ...mensajes,
      { role: "user", content: limpio, timestamp: new Date().toISOString() },
    ];
    setMensajes(nuevosMensajes);
    setInput("");
    setCargando(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nuevosMensajes,
          sessionId,
        }),
      });

      const data = await res.json();
      if (data.ok && data.reply) {
        setMensajes((prev) => [
          ...prev,
          { role: "assistant", content: data.reply, timestamp: new Date().toISOString() },
        ]);
        if (typeof data.remainingMessages === "number") {
          setRestantes(data.remainingMessages);
        }
        if (data.limitReached) {
          setLimiteAlcanzado(true);
        }
        if (data.leadSaved) {
          setContactoGuardado(true);
          setMostrarFormContacto(false);
        }
      } else {
        setMensajes((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Disculpa, no he podido responder ahora mismo. Si quieres, déjanos tu nombre y teléfono o escríbenos al 600 000 000.",
          },
        ]);
      }
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Ha habido un problema de conexión. Puedes llamarnos o escribirnos por WhatsApp al 600 000 000.",
        },
      ]);
    } finally {
      setCargando(false);
    }
  }

  async function guardarContactoRapido(e: React.FormEvent) {
    e.preventDefault();
    if (!nombreContacto.trim() || !telefonoContacto.trim() || enviandoContacto) return;
    setEnviandoContacto(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages:
            mensajes.length > 0
              ? mensajes
              : [
                  {
                    role: "user",
                    content: `Solicito que me llaméis. Soy ${nombreContacto} (${telefonoContacto}).`,
                  },
                ],
          sessionId,
          datosContacto: {
            nombre: nombreContacto.trim(),
            telefono: telefonoContacto.trim(),
          },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setContactoGuardado(true);
        setMostrarFormContacto(false);
        if (data.reply) {
          setMensajes((prev) => [
            ...prev,
            { role: "assistant", content: data.reply, timestamp: new Date().toISOString() },
          ]);
        }
      } else {
        // Dice qué dato no vale (por ejemplo, el teléfono) y deja el formulario abierto para corregirlo.
        setMensajes((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "No he podido guardar tus datos. Revísalos o llámanos al 600 000 000.",
          },
        ]);
      }
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ha habido un problema de conexión. Puedes llamarnos o escribirnos por WhatsApp al 600 000 000.",
        },
      ]);
    } finally {
      setEnviandoContacto(false);
    }
  }

  return (
    <>
      {/* Contenedor flotante del Asistente FaroBot (derecha) */}
      <aside
        className="fixed bottom-5 right-5 z-50 flex flex-col items-end"
        id="farobot-container"
      >
        {abierto && (
          <div
            className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[390px] bg-surface-container-lowest rounded-2xl shadow-[0_16px_40px_rgba(11,28,48,0.18)] border border-surface-container-highest overflow-hidden flex flex-col"
            id="farobot-popover"
            role="dialog"
            aria-label="Asistente de Autoescuela Faro"
          >
            {/* Cabecera del chat */}
            <div className="bg-primary text-on-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-on-primary text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                </div>
                <div>
                  <p className="font-headline-sm text-headline-sm text-[1rem] leading-none text-on-primary">
                    Asistente Autoescuela Faro
                  </p>
                  <p className="font-label-sm text-label-sm text-primary-fixed mt-0.5">
                    Precios reales y dudas • {restantes} msg restantes
                  </p>
                </div>
              </div>
              <button
                className="text-on-primary hover:bg-primary-container p-1.5 rounded-full transition-colors"
                onClick={() => setAbierto(false)}
                type="button"
                aria-label="Cerrar asistente"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Cuerpo de mensajes */}
            <div
              ref={scrollRef}
              className="p-4 max-h-[380px] min-h-[260px] overflow-y-auto space-y-3 bg-surface-bright"
            >
              {/* Saludo inicial */}
              <div className="p-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm leading-relaxed">
                <span className="font-label-md text-label-md text-primary block mb-1">
                  ¡Hola! Soy el asistente de Autoescuela Faro
                </span>
                Te respondo al momento con nuestros precios reales (bonos, tasa DGT, matrícula), horarios y cómo funciona la cola de examen en Málaga.
              </div>

              {/* Sugerencias rápidas si aún no ha escrito */}
              {mensajes.length === 0 && (
                <div className="space-y-2 pt-1">
                  <p className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                    Preguntas frecuentes:
                  </p>
                  {PREGUNTAS_RAPIDAS.map((pregunta) => (
                    <button
                      key={pregunta}
                      onClick={() => enviarMensaje(pregunta)}
                      className="w-full text-left p-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center justify-between gap-2"
                      type="button"
                    >
                      <span>{pregunta}</span>
                      <span className="material-symbols-outlined text-primary text-[16px] shrink-0">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Historial de la conversación */}
              {mensajes.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[86%] p-3 rounded-2xl font-body-sm text-body-sm whitespace-pre-line leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-on-primary rounded-br-sm"
                        : "bg-surface-container-low text-on-surface rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {cargando && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span>Consultando la ficha de Autoescuela Faro...</span>
                  </div>
                </div>
              )}

              {!mostrarFormContacto && !limiteAlcanzado && !contactoGuardado && mensajes.length > 0 && (
                <div className="pt-1 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setMostrarFormContacto(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-primary/30 text-primary font-label-sm text-label-sm hover:bg-primary-fixed/40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">call</span>
                    <span>Prefiero dejar mi nombre y teléfono</span>
                  </button>
                </div>
              )}

              {/* Cajetín rápido para dejar nombre y teléfono directamente */}
              {(mostrarFormContacto || limiteAlcanzado) && !contactoGuardado && (
                <form
                  id="farobot-contact-form"
                  onSubmit={guardarContactoRapido}
                  className="p-3.5 rounded-xl bg-surface-container-lowest border border-primary/30 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-label-md text-label-md text-on-surface">
                      ¿Quieres que te llamemos nosotros?
                    </p>
                    {!limiteAlcanzado && (
                      <button
                        type="button"
                        onClick={() => setMostrarFormContacto(false)}
                        className="text-on-surface-variant hover:text-on-surface"
                        aria-label="Cerrar formulario de contacto"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={nombreContacto}
                    onChange={(e) => setNombreContacto(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="tel"
                    required
                    value={telefonoContacto}
                    onChange={(e) => setTelefonoContacto(e.target.value)}
                    placeholder="Tu teléfono (ej. 600 123 456)"
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={enviandoContacto}
                    className="w-full h-9 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors"
                  >
                    {enviandoContacto ? "Guardando..." : "Pedir que me llamen"}
                  </button>
                </form>
              )}

              {contactoGuardado && (
                <div className="p-3 rounded-xl bg-tertiary/15 text-tertiary font-label-sm text-label-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Hemos guardado tu contacto y conversación para llamarte.</span>
                </div>
              )}
            </div>

            {/* Barra inferior de envío */}
            <form
              id="farobot-message-form"
              onSubmit={(e) => {
                e.preventDefault();
                enviarMensaje(input);
              }}
              className="p-3 bg-surface-container-lowest border-t border-surface-container flex items-center gap-2"
            >
              <input
                id="farobot-message-input"
                className="flex-1 bg-surface-container-low rounded-xl px-3.5 py-2.5 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                placeholder={
                  limiteAlcanzado
                    ? "Límite de mensajes alcanzado"
                    : "Escribe tu pregunta o teléfono..."
                }
                type="text"
                disabled={limiteAlcanzado || cargando}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors disabled:opacity-50 shrink-0"
                type="submit"
                disabled={limiteAlcanzado || cargando || !input.trim()}
                aria-label="Enviar mensaje"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </div>
        )}

        {/* Botón burbuja para abrir/cerrar */}
        <button
          className="group relative flex items-center gap-2.5 h-14 px-4 sm:px-5 rounded-full bg-primary text-on-primary shadow-[0_12px_32px_-4px_rgba(163,57,0,0.4)] hover:bg-primary-container transition-all"
          onClick={() => setAbierto(!abierto)}
          type="button"
          aria-label="Abrir chat con asistente de Autoescuela Faro"
        >
          <span className="material-symbols-outlined text-[26px]">
            {abierto ? "close" : "smart_toy"}
          </span>
          <span className="font-label-lg text-label-lg pr-1">
            {abierto ? "Cerrar chat" : "¿Dudas? Pregúntame"}
          </span>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-tertiary-fixed ring-2 ring-surface-container-lowest flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
          </span>
        </button>
      </aside>
    </>
  );
}
