// Formulario para registrar un pago. El alumno paga por fuera (Bizum, tarjeta o efectivo)
// y secretaría lo apunta aquí: las prácticas entran en el monedero al momento.

import { Alumno, FORMAS_PAGO, Tarifa } from "@/lib/tipos";
import { eurCorto } from "@/lib/formato";
import { nombreCompleto } from "@/lib/reglas";
import { BotonEnviar } from "./BotonEnviar";
import { VolverA } from "./ui";
import { registrarPago } from "@/app/acciones/pagos";

export function FormPago({
  tarifas,
  alumnos,
  alumnoId,
  tarifaId,
  solicitudId,
  volver,
}: {
  tarifas: Tarifa[];
  alumnos?: Alumno[];
  alumnoId?: string;
  tarifaId?: string;
  solicitudId?: string;
  volver: string;
}) {
  return (
    <form action={registrarPago} className="grid gap-4 sm:grid-cols-2">
      <VolverA ruta={volver} />
      {solicitudId && <input type="hidden" name="solicitudId" value={solicitudId} />}
      {alumnoId ? (
        <input type="hidden" name="alumnoId" value={alumnoId} />
      ) : (
        <div className="sm:col-span-2">
          <label htmlFor="pago-alumno" className="etiqueta">Alumno</label>
          <select id="pago-alumno" name="alumnoId" className="campo" required defaultValue="">
            <option value="" disabled>Elige un alumno…</option>
            {(alumnos ?? []).map((a) => (
              <option key={a.id} value={a.id}>{nombreCompleto(a)}</option>
            ))}
          </select>
        </div>
      )}
      <div className="sm:col-span-2">
        <label htmlFor="pago-tarifa" className="etiqueta">Qué paga</label>
        <select id="pago-tarifa" name="tarifaId" className="campo" required defaultValue={tarifaId ?? ""}>
          <option value="" disabled>Elige un concepto…</option>
          {tarifas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.concepto} · {eurCorto(t.precio)}
              {t.practicas ? ` (+${t.practicas} ${t.practicas === 1 ? "práctica" : "prácticas"})` : ""}
            </option>
          ))}
        </select>
      </div>
      <fieldset>
        <legend className="etiqueta">Plazos</legend>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-hundido p-1">
          {[
            ["1", "Un pago"],
            ["2", "Dos plazos"],
          ].map(([v, t]) => (
            <label key={v} className="relative flex min-h-[36px] cursor-pointer items-center justify-center rounded-md text-sm font-semibold text-gris has-[:checked]:bg-superficie has-[:checked]:text-tinta has-[:checked]:ring-1 has-[:checked]:ring-linea">
              <input type="radio" name="plazos" value={v} defaultChecked={v === "1"} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
        <p className="ayuda mt-1">Solo matrícula y bonos admiten dos plazos.</p>
      </fieldset>
      <div>
        <label htmlFor="primerPlazo" className="etiqueta">Importe del 1.er plazo <span className="font-normal text-gris">(si son dos)</span></label>
        <input id="primerPlazo" name="primerPlazo" inputMode="decimal" placeholder="La mitad, si lo dejas vacío" className="campo" />
      </div>
      <fieldset className="sm:col-span-2">
        <legend className="etiqueta">Cómo ha pagado</legend>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-hundido p-1">
          {Object.entries(FORMAS_PAGO).map(([v, t]) => (
            <label key={v} className="relative flex min-h-[36px] cursor-pointer items-center justify-center rounded-md text-sm font-semibold text-gris has-[:checked]:bg-superficie has-[:checked]:text-tinta has-[:checked]:ring-1 has-[:checked]:ring-linea">
              <input type="radio" name="forma" value={v} defaultChecked={v === "bizum"} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="sm:col-span-2">
        <BotonEnviar className="btn-primario w-full sm:w-auto">Registrar pago</BotonEnviar>
      </div>
    </form>
  );
}
