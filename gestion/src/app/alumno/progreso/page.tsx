import Link from "next/link";
import { leer } from "@/lib/db";
import { exigirAlumno } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { MANIOBRAS, SEMAFOROS } from "@/lib/tipos";
import { diasEntre, fechaCorta, fechaLarga, hoy, mayus } from "@/lib/fechas";
import { decimal, eurCorto, plural } from "@/lib/formato";
import { Alerta, Barra, Icono, NivelChip, SemaforoChip, Vacio } from "@/components/ui";

export default async function Progreso() {
  const id = await exigirAlumno();
  const db = await leer();
  const a = R.alumnoPorId(db, id)!;
  const h = hoy();
  const evals = R.evaluacionesDe(db, a.id);
  const niveles = R.nivelesActuales(db, a.id);
  const semaforo = R.semaforoDe(db, a.id);
  const dominadas = MANIOBRAS.filter((m) => niveles[m.id] === "dominada").length;
  const conv = R.convocatoriasDe(db, a.id);
  const puesto = R.puestoEnCola(db, a.id);
  const plaza = R.plazaPendiente(db, a.id);
  const est = puesto ? R.estimarExamen(db, puesto) : null;
  const cola = R.colaExamen(db);
  const req = R.requisitosExamen(db, a);
  const caducidad = R.caducidadTeorico(a);
  const enVentana = est
    ? db.practicas.filter((p) => p.alumnoId === a.id && p.estado === "reservada" && p.fecha >= est.desdeVentana && p.fecha <= est.hastaVentana).length
    : 0;
  const examenTarifa = db.tarifas.find((t) => t.tipo === "examen")!;

  if (a.fase === "teorico" || a.fase === "espera_practicas") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold">Mi progreso</h1>
        <Vacio icono="flag" titulo={a.fase === "teorico" ? "Primero, el teórico" : "Pronto empezarás con el coche"}>
          Cuando empieces las prácticas verás aquí cómo llevas cada maniobra, tu semáforo y tu puesto en la cola del examen práctico.
        </Vacio>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Mi progreso</h1>

      {/* Semáforo */}
      <section className="tarjeta p-4">
        <div className="flex items-center justify-between gap-3">
          <SemaforoChip valor={semaforo} />
          <span className="cifra text-sm text-gris">{dominadas} de {MANIOBRAS.length} dominadas</span>
        </div>
        <div className="mt-3">
          <Barra valor={dominadas} total={MANIOBRAS.length} tono={semaforo === "verde" ? "verde" : "faro"} />
        </div>
        <p className="mt-3 text-sm text-gris">
          {semaforo === "verde"
            ? "¡Estás listo para examen! Tu profesor te ha puesto en verde."
            : semaforo === "ambar"
              ? `${SEMAFOROS.ambar}: ${R.maniobrasQueFaltan(niveles).length ? `te falta${R.maniobrasQueFaltan(niveles).length === 1 ? "" : "n"} ${R.maniobrasQueFaltan(niveles).map((m) => m.nombre.toLowerCase()).join(" y ")}` : "solo te faltan 2 prácticas seguidas sin fallos graves"}.`
              : "Vas aprendiendo. Pasarás a verde con todas las maniobras dominadas y 2 prácticas seguidas sin fallos graves."}
        </p>
      </section>

      {/* Examen */}
      <section id="examen">
        <h2 className="mb-2 text-base font-bold">Mi examen práctico</h2>
        {conv.agotadas ? (
          <Alerta tono="rojo" icono="block" titulo="Convocatorias agotadas">
            Para volver a la cola hace falta una tasa nueva de la DGT ({eurCorto(db.tarifas.find((t) => t.tipo === "tasa")!.precio)}), sin gastos de gestión.
          </Alerta>
        ) : plaza ? (
          <section className="rounded-2xl bg-tinta p-5 text-white">
            <p className="text-sm text-white/70">Tu examen es el</p>
            <p className="text-2xl font-bold">{mayus(fechaLarga(plaza.fecha))}</p>
            <p className="mt-1 text-sm text-white/80">Faltan {plural(diasEntre(h, plaza.fecha), "día")}. Irás con el coche de la autoescuela y tu profesor.</p>
          </section>
        ) : puesto && est ? (
          <section className="tarjeta overflow-hidden">
            <div className="flex items-end gap-4 p-4">
              <div>
                <p className="text-sm text-gris">Tu puesto en la cola</p>
                <p className="cifra text-[2.75rem] font-bold leading-none text-faro-600">{puesto}</p>
              </div>
              <div className="pb-1">
                <p className="text-sm text-gris">Fecha aproximada</p>
                <p className="text-lg font-bold">Hacia el {fechaCorta(est.fecha)}</p>
              </div>
            </div>
            <p className="px-4 pb-4 text-sm text-gris">
              Calculada con el cupo medio que nos da Tráfico ({decimal(est.cupoMedio)} plazas cada {est.intervalo} días). Puede cambiar: las plazas las reparte Tráfico y nadie puede saltarse la cola. Delante de ti hay {plural(puesto - 1, "alumno")}.
            </p>
            <div className="bg-verde-50 p-4 text-sm text-verde-800">
              <p className="font-semibold">
                {est.desdeVentana <= h ? `Ya estás en tus 4 semanas previas: concentra las prácticas hasta el ${fechaCorta(est.hastaVentana)}` : `Concentra tus prácticas del ${fechaCorta(est.desdeVentana)} al ${fechaCorta(est.hastaVentana)}`}
              </p>
              <p className="mt-1">
                Son las 4 semanas antes de tu fecha aproximada: 2 o 3 prácticas por semana para llegar en forma sin gastar en clases de mantenimiento.
                {enVentana ? ` Ya tienes ${plural(enVentana, "reservada")} en esas semanas.` : ""}
              </p>
              <Link href="/alumno/reservar" className="btn-oscuro btn-sm mt-3">Reservar en esas semanas</Link>
            </div>
          </section>
        ) : (
          <section className="tarjeta p-4 text-sm">
            <p>Entrarás en la cola del examen cuando tu profesor te ponga en verde. Ahora mismo hay {plural(cola.enCola.length, "alumno")} esperando.</p>
          </section>
        )}

        {!plaza && !conv.agotadas && (
          <ul className="mt-3 flex flex-col gap-1.5 text-sm">
            <Req ok={semaforo === "verde" || !!a.verdeDesde} texto="En verde (listo para examen)" />
            <Req ok={req.convocatorias} texto={`Convocatorias de tu tasa: te ${conv.disponibles === 1 ? "queda 1" : `quedan ${conv.disponibles}`} de 2`} />
            <Req ok={req.teorico} texto={caducidad ? `Aprobado del teórico válido hasta el ${fechaLarga(caducidad)}` : "Teórico aprobado"} />
            <Req ok={req.derecho} texto={req.derecho ? "Derecho de examen pagado" : `Derecho de examen sin pagar (${eurCorto(examenTarifa.precio)})`} />
          </ul>
        )}
      </section>

      {/* Maniobras */}
      <section>
        <h2 className="mb-2 text-base font-bold">Mis maniobras</h2>
        {evals.length === 0 ? (
          <Vacio titulo="Después de tu primera práctica verás aquí cómo vas" />
        ) : (
          <ul className="tarjeta divide-y divide-linea px-4">
            {MANIOBRAS.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-[0.9375rem]">
                {m.nombre}
                <NivelChip nivel={niveles[m.id]} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Req({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <li className={`flex items-start gap-2 ${ok ? "text-verde-800" : "text-gris"}`}>
      <Icono nombre={ok ? "check_circle" : "radio_button_unchecked"} lleno={ok} className="!text-[20px]" />
      {texto}
    </li>
  );
}
