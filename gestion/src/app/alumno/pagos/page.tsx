import { leer } from "@/lib/db";
import { exigirAlumno } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { FORMAS_PAGO } from "@/lib/tipos";
import { fechaCorta, fechaHora } from "@/lib/fechas";
import { eurCorto } from "@/lib/formato";
import { Alerta, Icono, Vacio, VolverA } from "@/components/ui";
import { BotonEnviar } from "@/components/BotonEnviar";
import { solicitarRecarga } from "@/app/acciones/pagos";

export default async function PagosAlumno() {
  const id = await exigirAlumno();
  const db = await leer();
  const a = R.alumnoPorId(db, id)!;
  const m = R.monedero(db, a.id);
  const deudas = R.deudasDe(db, a.id);
  const pagos = db.pagos.filter((p) => p.alumnoId === a.id).sort((x, y) => y.fecha.localeCompare(x.fecha));
  const solicitud = db.solicitudes.find((s) => s.alumnoId === a.id && !s.atendida);
  const recargables = db.tarifas.filter((t) => t.practicas > 0);
  const ruta = "/alumno/pagos";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Pagos</h1>
        <p className="text-sm text-gris">Sin letra pequeña: aquí ves lo que has pagado y lo que queda.</p>
      </div>

      <section className="tarjeta grid grid-cols-2 divide-x divide-linea">
        <div className="p-4">
          <p className="text-sm text-gris">Prácticas disponibles</p>
          <p className={`cifra text-3xl font-bold ${m.disponibles <= 1 && a.fase === "practicas" ? "text-rojo-600" : ""}`}>{m.disponibles}</p>
        </div>
        <div className="p-4">
          <p className="text-sm text-gris">Pendiente de pagar</p>
          <p className={`cifra text-3xl font-bold ${deudas.length ? "text-rojo-600" : ""}`}>{eurCorto(R.totalDeuda(db, a.id))}</p>
        </div>
      </section>

      {deudas.length > 0 && (
        <section>
          <h2 className="mb-2 text-base font-bold">Lo que queda por pagar</h2>
          <ul className="tarjeta divide-y divide-linea">
            {deudas.map((d) => (
              <li key={d.cargo.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span>
                  <span className="block font-semibold">{R.MOTIVOS_DEUDA[d.motivo]}</span>
                  <span className="block text-sm text-gris">{d.cargo.concepto} · {fechaCorta(d.cargo.fecha)}</span>
                </span>
                <span className="cifra font-semibold text-rojo-600">{eurCorto(d.pendiente)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-gris">Puedes pagarlo por Bizum, con tarjeta en la oficina o en efectivo.</p>
        </section>
      )}

      {a.fase !== "aprobado" && a.fase !== "teorico" && (
        <section id="recarga" className="scroll-mt-4">
          <h2 className="mb-2 text-base font-bold">Recargar prácticas</h2>
          {solicitud ? (
            <Alerta tono="faro" icono="schedule" titulo="Solicitud enviada">
              Pediste {db.tarifas.find((t) => t.id === solicitud.tarifaId)?.concepto.toLowerCase()} el {fechaHora(solicitud.fecha)}. Secretaría te dirá cómo pagar y, en cuanto lo registre, las prácticas aparecerán en tu monedero. Puedes cambiarla abajo.
            </Alerta>
          ) : null}
          <form action={solicitarRecarga} className="tarjeta mt-3 flex flex-col gap-3 p-4">
            <VolverA ruta={ruta} />
            <fieldset className="flex flex-col gap-2">
              <legend className="etiqueta">¿Qué quieres recargar?</legend>
              {recargables.map((t, i) => (
                <label key={t.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 border border-linea has-[:checked]:border-faro-500 has-[:checked]:bg-faro-50">
                  <input type="radio" name="tarifaId" value={t.id} defaultChecked={solicitud ? solicitud.tarifaId === t.id : i === recargables.length - 2} className="h-4 w-4 accent-faro-600" />
                  <span className="flex-1">
                    <span className="block font-semibold">{t.concepto}</span>
                    {t.practicas > 1 && <span className="block text-sm text-gris">{eurCorto(Math.round((t.precio / t.practicas) * 100) / 100)} cada práctica · se puede pagar en dos plazos</span>}
                  </span>
                  <span className="cifra font-semibold">{eurCorto(t.precio)}</span>
                </label>
              ))}
            </fieldset>
            <div>
              <label htmlFor="mensaje" className="etiqueta">Mensaje para secretaría <span className="font-normal text-gris">(opcional)</span></label>
              <input id="mensaje" name="mensaje" className="campo" placeholder="Por ejemplo: lo pago por Bizum esta tarde" />
            </div>
            <BotonEnviar className="btn-primario w-full">
              <Icono nombre="send" /> {solicitud ? "Actualizar solicitud" : "Solicitar recarga"}
            </BotonEnviar>
            <p className="text-center text-xs text-gris">Desde aquí no se paga: le llega a secretaría y te dice cómo hacerlo.</p>
          </form>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-base font-bold">Pagos hechos</h2>
        {pagos.length === 0 ? (
          <Vacio titulo="Aún no hay pagos" />
        ) : (
          <ul className="tarjeta divide-y divide-linea">
            {pagos.map((p) => {
              const c = db.cargos.find((x) => x.id === p.cargoId);
              return (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span>
                    <span className="block font-semibold">{c?.concepto}</span>
                    <span className="block text-sm text-gris">
                      {fechaCorta(p.fecha)} · {FORMAS_PAGO[p.forma]}
                      {c?.plazos === 2 && ` · ${p.plazo}.º plazo`}
                    </span>
                  </span>
                  <span className="cifra font-semibold">{eurCorto(p.importe)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
