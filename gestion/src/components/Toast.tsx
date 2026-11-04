"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { COOKIE_AVISO, type Aviso } from "@/lib/aviso";

/** Lee y borra el aviso que ha dejado el servidor. */
function recogerAviso(): Aviso | null {
  const crudo = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_AVISO}=`))
    ?.slice(COOKIE_AVISO.length + 1);
  document.cookie = `${COOKIE_AVISO}=; Max-Age=0; path=/`;
  if (!crudo) return null;
  try {
    const aviso = JSON.parse(decodeURIComponent(crudo)) as Partial<Aviso>;
    return (aviso.tipo === "ok" || aviso.tipo === "error") && typeof aviso.texto === "string"
      ? { tipo: aviso.tipo, texto: aviso.texto }
      : null;
  } catch {
    // Solo la escribe el servidor: si no se puede leer, no hay aviso que enseñar.
    return null;
  }
}

/** Muestra el resultado de una acción (la marca ?aviso=… en la dirección) y limpia la dirección. */
export function Toast() {
  const params = useSearchParams();
  const ruta = usePathname();
  const [mensaje, setMensaje] = useState<Aviso | null>(null);

  useEffect(() => {
    if (!params.get("aviso")) return;
    const aviso = recogerAviso();
    if (aviso) setMensaje(aviso);
    const resto = new URLSearchParams(params.toString());
    resto.delete("aviso");
    const q = resto.toString();
    // Quita ?aviso de la dirección sin recargar ni mover el scroll.
    window.history.replaceState(null, "", `${q ? `${ruta}?${q}` : ruta}${window.location.hash}`);
  }, [params, ruta]);

  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(null), mensaje.tipo === "error" ? 8000 : 4500);
    return () => clearTimeout(t);
  }, [mensaje]);

  if (!mensaje) return null;
  const esError = mensaje.tipo === "error";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 lg:bottom-6">
      <div
        role={esError ? "alert" : "status"}
        data-toast={mensaje.tipo}
        className={`aparecer pointer-events-auto flex max-w-lg items-start gap-3 rounded-xl px-4 py-3 text-[0.9375rem] shadow-lg ${
          esError ? "bg-rojo-800 text-white" : "bg-tinta text-white"
        }`}
      >
        <span className="material-symbols-outlined mt-0.5">{esError ? "error" : "check_circle"}</span>
        <p className="leading-snug">{mensaje.texto}</p>
        <button
          onClick={() => setMensaje(null)}
          className="-mr-1 ml-1 rounded p-0.5 text-white/70 hover:text-white"
          aria-label="Cerrar aviso"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  );
}
