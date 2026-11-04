import Link from "next/link";
import { notFound } from "next/navigation";
import { leer } from "@/lib/db";
import { exigirSecretaria } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { EstadoInteresado, ESTADOS_INTERESADO, ORIGENES_INTERESADO } from "@/lib/tipos";
import { fechaHora } from "@/lib/fechas";
import { Cabecera, Dato, Icono, Seccion, Volver, VolverA } from "@/components/ui";
import { BotonEnviar } from "@/components/BotonEnviar";
import { cambiarEstadoInteresado, convertirEnAlumno, guardarNotasInteresado } from "@/app/acciones/gestion";

export default async function Interesado({ params }: { params: Promise<{ id: string }> }) {
  await exigirSecretaria();
  const { id } = await params;
  const db = await leer();
  const i = db.interesados.find((x) => x.id === id);
  if (!i) notFound();
  const ruta = `/secretaria/interesados/${i.id}`;
  const alumno = i.alumnoId ? R.alumnoPorId(db, i.alumnoId) : undefined;
  const sinNombre = i.nombre === "Interesado en chat";
  const [nombre, ...resto] = sinNombre ? [""] : i.nombre.split(" ");
  const datos: [string, string | number | undefined][] = [
    ["Teléfono", i.telefono || undefined],
    ["Correo", i.email],
    ["DNI", i.dni],
    ["Edad", i.edad],
    ["Zona", i.zona],
    ["Experiencia", i.experienciaPrevia],
    ["Día preferido", i.diaPreferido],
    ["Franja", i.franjaHoraria],
    ["Pack elegido", i.packElegido],
    ["Forma de pago", i.modalidadPago],
  ];

  return (
    <>
      <Cabecera
        antes={<Volver href="/secretaria/interesados">Interesados</Volver>}
        titulo={i.nombre}
        subtitulo={`${ORIGENES_INTERESADO[i.origen]} · ${fechaHora(i.fecha)}`}
        acciones={
          i.telefono ? (
            <a href={R.enlaceWhatsApp(i.telefono, `¡Hola${sinNombre ? "" : `, ${nombre}`}! Te escribimos de Autoescuela Faro por tu consulta en la web.`)} target="_blank" rel="noreferrer" className="btn-secundario">
              <Icono nombre="chat" /> WhatsApp
            </a>
          ) : undefined
        }
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-8">
          {i.conversacion?.length ? (
            <Seccion titulo="Conversación con el asistente de la web">
              <ol className="tarjeta flex flex-col gap-3 p-4">
                {i.conversacion.map((m, k) => (
                  <li key={k} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <p className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.9375rem] leading-relaxed ${m.role === "user" ? "rounded-br-md bg-faro-100 text-faro-800" : "rounded-bl-md bg-hundido text-tinta"}`}>
                      <span className="sr-only">{m.role === "user" ? "Interesado: " : "Asistente: "}</span>
                      {m.content}
                    </p>
                  </li>
                ))}
              </ol>
            </Seccion>
          ) : null}

          <Seccion titulo="Datos del formulario">
            <dl className="tarjeta grid gap-4 p-4 sm:grid-cols-2">
              {datos.filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => (
                <Dato key={k} etiqueta={k}>{v}</Dato>
              ))}
              {datos.every(([, v]) => v === undefined || v === "") && <p className="text-gris">No dejó datos de contacto.</p>}
            </dl>
          </Seccion>

          <Seccion titulo="Notas">
            <form action={guardarNotasInteresado} className="flex flex-col gap-3">
              <VolverA ruta={ruta} />
              <input type="hidden" name="interesadoId" value={i.id} />
              <label htmlFor="notas" className="sr-only">Notas</label>
              <textarea id="notas" name="notas" defaultValue={i.notas ?? ""} rows={3} className="campo" placeholder="Qué habéis hablado, cuándo volver a llamar…" />
              <div>
                <BotonEnviar className="btn-secundario">Guardar notas</BotonEnviar>
              </div>
            </form>
          </Seccion>
        </div>

        <aside className="flex flex-col gap-8">
          <Seccion titulo="Estado">
            <form action={cambiarEstadoInteresado} className="tarjeta grid grid-cols-2 gap-1 p-1.5">
              <VolverA ruta={ruta} />
              <input type="hidden" name="interesadoId" value={i.id} />
              {(Object.keys(ESTADOS_INTERESADO) as EstadoInteresado[]).map((e) => (
                <BotonEnviar
                  key={e}
                  name="estado"
                  value={e}
                  disabled={e === "matriculado" && !i.alumnoId}
                  className={`btn btn-sm ${i.estado === e ? "bg-activo text-tinta" : "text-gris hover:bg-hundido"}`}
                  pendiente="…"
                >
                  {ESTADOS_INTERESADO[e]}
                </BotonEnviar>
              ))}
            </form>
          </Seccion>

          {alumno ? (
            <Seccion titulo="Ya es alumno">
              <Link href={`/secretaria/alumnos/${alumno.id}`} className="tarjeta flex items-center justify-between p-4 hover:bg-fondo">
                <span className="font-semibold">{R.nombreCompleto(alumno)}</span>
                <Icono nombre="arrow_forward" />
              </Link>
            </Seccion>
          ) : (
            <Seccion titulo="Convertir en alumno">
              <form action={convertirEnAlumno} className="tarjeta flex flex-col gap-3 p-4">
                <VolverA ruta={ruta} />
                <input type="hidden" name="interesadoId" value={i.id} />
                <p className="ayuda">Revisa los datos. Entrará como alumno de teórico; después registra la matrícula.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="nombre" className="etiqueta">Nombre</label>
                    <input id="nombre" name="nombre" defaultValue={nombre} className="campo" required />
                  </div>
                  <div>
                    <label htmlFor="apellidos" className="etiqueta">Apellidos</label>
                    <input id="apellidos" name="apellidos" defaultValue={resto.join(" ")} className="campo" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="dni" className="etiqueta">DNI o NIE</label>
                  <input id="dni" name="dni" defaultValue={i.dni ?? ""} className="campo uppercase" />
                </div>
                <div>
                  <label htmlFor="telefono" className="etiqueta">Teléfono</label>
                  <input id="telefono" name="telefono" defaultValue={i.telefono} className="campo" required />
                </div>
                <div>
                  <label htmlFor="email" className="etiqueta">Correo</label>
                  <input id="email" name="email" type="email" defaultValue={i.email ?? ""} className="campo" />
                </div>
                <BotonEnviar>
                  <Icono nombre="person_add" /> Convertir en alumno
                </BotonEnviar>
              </form>
            </Seccion>
          )}
        </aside>
      </div>
    </>
  );
}
