"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { guardarEvaluacion } from "@/app/acciones/evaluacion";
import { MANIOBRAS, ManiobraId, Nivel, NIVELES, Niveles } from "@/lib/tipos";
import { BotonEnviar } from "./BotonEnviar";
import { Icono } from "./ui";

interface Props {
  practicaId: string;
  alumnoNombre: string;
  niveles: Niveles;
  previaSinGrave: boolean | null; // null si no hay práctica evaluada anterior
  teoricoAprobado: boolean;
  existente?: { falloGrave: boolean; resumen: string; mensajeAlumno: string; notasDictadas: string; conIA: boolean };
  iaConfigurada: boolean;
  modelo: string;
  volver: string;
}

type Reconocimiento = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};

const ORDEN: Nivel[] = ["por_trabajar", "en_progreso", "dominada"];
const COLOR_ACTIVO: Record<Nivel, string> = {
  por_trabajar: "bg-rojo-600 text-white",
  en_progreso: "bg-ambar-600 text-white",
  dominada: "bg-verde-600 text-white",
};

export function FormEvaluacion(props: Props) {
  const [niveles, setNiveles] = useState<Niveles>(props.niveles);
  const [notas, setNotas] = useState(props.existente?.notasDictadas ?? "");
  const [provisional, setProvisional] = useState("");
  const [grave, setGrave] = useState(props.existente?.falloGrave ?? false);
  const [motivoGrave, setMotivoGrave] = useState("");
  const [resumen, setResumen] = useState(props.existente?.resumen ?? "");
  const [mensaje, setMensaje] = useState(props.existente?.mensajeAlumno ?? "");
  const [conIA, setConIA] = useState(props.existente?.conIA ?? false);
  const [cambiadas, setCambiadas] = useState<ManiobraId[]>([]);
  const [escuchando, setEscuchando] = useState(false);
  const [hayMicro, setHayMicro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reco = useRef<Reconocimiento | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => Reconocimiento; webkitSpeechRecognition?: new () => Reconocimiento };
    setHayMicro(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => reco.current?.stop();
  }, []);

  function alternarMicro() {
    if (escuchando) {
      reco.current?.stop();
      return;
    }
    const w = window as unknown as { SpeechRecognition?: new () => Reconocimiento; webkitSpeechRecognition?: new () => Reconocimiento };
    const Clase = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Clase) return;
    const r = new Clase();
    r.lang = "es-ES";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let finales = "";
      let interino = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finales += res[0].transcript;
        else interino += res[0].transcript;
      }
      if (finales) setNotas((n) => `${n}${n && !n.endsWith(" ") ? " " : ""}${finales.trim()}`);
      setProvisional(interino);
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed") setError("El navegador no tiene permiso para usar el micrófono.");
      else if (e.error !== "no-speech" && e.error !== "aborted") setError("Se ha cortado el dictado. Puedes seguir escribiendo.");
    };
    r.onend = () => {
      setEscuchando(false);
      setProvisional("");
    };
    reco.current = r;
    setError(null);
    r.start();
    setEscuchando(true);
  }

  async function convertir() {
    reco.current?.stop();
    setCargando(true);
    setError(null);
    try {
      const r = await fetch("/api/ia/evaluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ practicaId: props.practicaId, notas }),
      });
      const datos = await r.json();
      if (!datos.ok) throw new Error(datos.error);
      const p = datos.propuesta as {
        niveles: Niveles;
        cambiadas: ManiobraId[];
        falloGrave: boolean;
        motivoFalloGrave: string;
        resumen: string;
        mensajeAlumno: string;
      };
      setNiveles(p.niveles);
      setCambiadas(p.cambiadas);
      setGrave(p.falloGrave);
      setMotivoGrave(p.motivoFalloGrave);
      setResumen(p.resumen);
      setMensaje(p.mensajeAlumno);
      setConIA(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se ha podido contactar con la IA.");
    } finally {
      setCargando(false);
    }
  }

  // Vista previa del semáforo con esta evaluación
  const previa = useMemo(() => {
    const faltan = MANIOBRAS.filter((m) => niveles[m.id] !== "dominada").length;
    const dosLimpias = !grave && props.previaSinGrave === true;
    if (faltan === 0 && dosLimpias) return { color: "verde", texto: props.teoricoAprobado ? "Verde: listo para examen. Entra en la cola." : "Verde: listo para examen." };
    if (faltan === 0) return { color: "ambar", texto: "Ámbar: todas dominadas, pero hacen falta 2 prácticas seguidas sin fallos graves." };
    if (faltan <= 2) return { color: "ambar", texto: `Ámbar: casi listo, le ${faltan === 1 ? "falta 1 maniobra" : "faltan 2 maniobras"}.` };
    return { color: "rojo", texto: `Rojo: en aprendizaje, le faltan ${faltan} maniobras.` };
  }, [niveles, grave, props.previaSinGrave, props.teoricoAprobado]);

  const punto = { verde: "bg-verde-600", ambar: "bg-ambar-600", rojo: "bg-rojo-600" }[previa.color];

  return (
    <form action={guardarEvaluacion} className="flex flex-col gap-6">
      <input type="hidden" name="practicaId" value={props.practicaId} />
      <input type="hidden" name="volver" value={props.volver} />
      <input type="hidden" name="conIA" value={conIA ? "1" : "0"} />
      <input type="hidden" name="notas" value={notas} />

      {/* Dictado */}
      <section className="tarjeta p-4">
        <h2 className="text-base font-bold">Tus notas de la práctica</h2>
        <p className="ayuda mt-0.5">Dicta como hablas. La IA lo convierte en la evaluación y tú la revisas antes de guardar.</p>
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={alternarMicro}
            disabled={!hayMicro}
            aria-pressed={escuchando}
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white transition-transform active:scale-95 disabled:bg-linea disabled:text-tenue ${
              escuchando ? "bg-rojo-600" : "bg-faro-600 hover:bg-faro-800"
            }`}
            aria-label={escuchando ? "Parar el dictado" : "Empezar a dictar"}
          >
            <Icono nombre={escuchando ? "stop" : "mic"} lleno className="!text-[30px]" />
          </button>
          <div className="text-sm">
            {escuchando ? (
              <p className="font-semibold text-rojo-600"><span className="pulso">●</span> Escuchando… pulsa para parar</p>
            ) : hayMicro ? (
              <p className="font-semibold">Pulsa el micrófono y cuenta cómo ha ido</p>
            ) : (
              <p className="font-semibold">Este navegador no permite dictar: escribe o pega tus notas</p>
            )}
            <p className="text-gris">Por ejemplo: «hoy bien las rotondas, pero en la cuesta se le cala…»</p>
          </div>
        </div>
        <label htmlFor="notas-texto" className="sr-only">Notas</label>
        <textarea
          id="notas-texto"
          value={notas + (provisional ? ` ${provisional}` : "")}
          onChange={(e) => setNotas(e.target.value)}
          rows={4}
          placeholder="Aquí aparece lo que dictas. También puedes escribir."
          className="campo mt-4"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={convertir} disabled={!props.iaConfigurada || cargando || notas.trim().length < 10} className="btn-oscuro">
            <Icono nombre="auto_awesome" />
            {cargando ? "Convirtiendo…" : "Convertir con IA"}
          </button>
          <span className="text-xs text-gris">
            {props.iaConfigurada ? `Modelo: ${props.modelo}` : "Falta la clave de OpenRouter: secretaría puede pegarla en Ajustes. Mientras, rellena a mano."}
          </span>
        </div>
        {error && <p role="alert" className="mt-3 rounded-lg bg-rojo-50 px-3 py-2 text-sm text-rojo-800">{error}</p>}
        {conIA && !cargando && cambiadas.length > 0 && (
          <p className="mt-3 rounded-lg bg-faro-50 px-3 py-2 text-sm text-faro-800">
            La IA ha actualizado {cambiadas.length} {cambiadas.length === 1 ? "maniobra" : "maniobras"} (marcadas abajo). Revisa y guarda.
          </p>
        )}
      </section>

      {/* Maniobras */}
      <section className="tarjeta p-4">
        <h2 className="mb-3 text-base font-bold">Maniobras</h2>
        <ul className="flex flex-col divide-y divide-linea">
          {MANIOBRAS.map((m) => (
            <li key={m.id} className="py-2.5">
              <fieldset>
                <legend className="mb-1.5 flex items-center gap-2 text-[0.9375rem] font-semibold">
                  {m.nombre}
                  {cambiadas.includes(m.id) && <span className="rounded-full bg-faro-50 px-2 text-xs font-semibold text-faro-800">IA</span>}
                </legend>
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-hundido p-1">
                  {ORDEN.map((n) => {
                    const activo = niveles[m.id] === n;
                    return (
                      <label
                        key={n}
                        className={`flex min-h-[36px] cursor-pointer items-center justify-center rounded-md px-1 text-center text-[0.8125rem] font-semibold transition-colors ${
                          activo ? COLOR_ACTIVO[n] : "text-gris hover:bg-superficie"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`n_${m.id}`}
                          value={n}
                          checked={activo}
                          onChange={() => setNiveles((x) => ({ ...x, [m.id]: n }))}
                          className="sr-only"
                        />
                        {NIVELES[n]}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </li>
          ))}
        </ul>
      </section>

      {/* Fallo grave y textos */}
      <section className="tarjeta flex flex-col gap-4 p-4">
        <label className="flex items-start justify-between gap-4">
          <span>
            <span className="block font-semibold">¿Ha cometido algún fallo grave?</span>
            <span className="ayuda block">Lo que en el examen sería eliminatorio. {motivoGrave && <em className="text-rojo-800">IA: {motivoGrave}</em>}</span>
          </span>
          <span className="relative mt-1 inline-flex shrink-0">
            <input type="checkbox" name="falloGrave" value="1" checked={grave} onChange={(e) => setGrave(e.target.checked)} className="peer sr-only" />
            <span className="h-7 w-12 rounded-full bg-linea transition-colors peer-checked:bg-rojo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-faro-500" />
            <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white ring-1 ring-black/10 transition-transform peer-checked:translate-x-5" />
          </span>
        </label>
        <div>
          <label htmlFor="resumen" className="etiqueta">Resumen para la ficha (una frase)</label>
          <input id="resumen" name="resumen" value={resumen} onChange={(e) => setResumen(e.target.value)} className="campo" required maxLength={300} />
        </div>
        <div>
          <label htmlFor="mensajeAlumno" className="etiqueta">Mensaje para {props.alumnoNombre}</label>
          <textarea id="mensajeAlumno" name="mensajeAlumno" value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={4} className="campo" maxLength={1200} />
          <p className="ayuda mt-1">Lo verá en su portal, junto a la práctica.</p>
        </div>
      </section>

      <div className="sticky bottom-[72px] z-10 -mx-4 flex flex-col gap-2 border-t border-linea bg-fondo/95 px-4 py-3 md:bottom-0">
        <p className="flex items-center gap-2 text-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${punto}`} />
          {previa.texto}
        </p>
        <BotonEnviar className="btn-primario w-full">Guardar práctica</BotonEnviar>
      </div>
    </form>
  );
}
