import Link from "next/link";
import { leer } from "@/lib/db";
import { exigirAlumno } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { fechaCorta } from "@/lib/fechas";
import { Alerta, Icono, Volver, VolverA } from "@/components/ui";
import { BotonEnviar } from "@/components/BotonEnviar";
import { guardarListaEspera } from "@/app/acciones/agenda";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default async function ListaEspera() {
  const id = await exigirAlumno();
  const db = await leer();
  const a = R.alumnoPorId(db, id)!;
  const prof = R.profesorPorId(db, a.profesorId);
  const le = a.listaEspera;
  const ruta = "/alumno/espera";

  if (!prof || a.fase !== "practicas") {
    return (
      <div className="flex flex-col gap-4">
        <Volver href="/alumno">Inicio</Volver>
        <h1 className="text-xl font-bold">Lista de espera</h1>
        <Alerta tono="neutro" titulo="Podrás apuntarte cuando estés en prácticas con un profesor asignado." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Volver href="/alumno/reservar">Reservar</Volver>
      <div>
        <h1 className="text-xl font-bold">Lista de espera</h1>
        <p className="mt-1 text-sm text-gris">
          Cuando un compañero de {prof.nombre} cancela con tiempo, ofrecemos la hora al momento a quien esté en la lista y pueda ese día y franja. El primero que la acepta se la queda. Si nadie la coge, 2 horas antes se abre a todos los alumnos de {prof.nombre}.
        </p>
      </div>

      {le && (
        <Alerta tono="verde" icono="check_circle" titulo="Estás apuntado">
          Desde el {fechaCorta(le.desde)}. Necesitas tener al menos 1 práctica en el monedero para que te lleguen los avisos.
        </Alerta>
      )}

      <form action={guardarListaEspera} className="tarjeta flex flex-col gap-5 p-4">
        <VolverA ruta={ruta} />
        <fieldset>
          <legend className="etiqueta">¿Qué días podrías venir?</legend>
          <div className="grid grid-cols-3 gap-2">
            {DIAS.map((d, i) => (
              <label key={d} className="flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg text-sm font-semibold ring-1 ring-linea has-[:checked]:bg-tinta has-[:checked]:text-white has-[:checked]:ring-tinta">
                <input type="checkbox" name="dias" value={i + 1} defaultChecked={le ? le.dias.includes(i + 1) : false} className="sr-only" />
                {d}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="etiqueta">¿En qué franja?</legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["manana", "Mañana", "8:00 – 14:00"],
              ["tarde", "Tarde", "16:00 – 20:30"],
            ].map(([v, t, h]) => (
              <label key={v} className="flex min-h-[56px] cursor-pointer flex-col items-center justify-center rounded-lg ring-1 ring-linea has-[:checked]:bg-tinta has-[:checked]:text-white has-[:checked]:ring-tinta">
                <input type="checkbox" name="franjas" value={v} defaultChecked={le ? le.franjas.includes(v as "manana" | "tarde") : false} className="sr-only" />
                <span className="text-sm font-semibold">{t}</span>
                <span className="text-xs opacity-75">{h}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <BotonEnviar className="btn-primario w-full">
          <Icono nombre="bolt" /> {le ? "Guardar cambios" : "Apuntarme"}
        </BotonEnviar>
      </form>

      {le && (
        <form action={guardarListaEspera}>
          <VolverA ruta={ruta} />
          <input type="hidden" name="salir" value="1" />
          <BotonEnviar className="btn-texto text-gris" confirmar="¿Salir de la lista de espera?">Salir de la lista de espera</BotonEnviar>
        </form>
      )}
      <p className="text-sm text-gris">
        Los avisos te salen en el <Link href="/alumno" className="enlace">inicio</Link> de tu portal.
      </p>
    </div>
  );
}
