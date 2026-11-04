import { notFound } from "next/navigation";
import { leer } from "@/lib/db";
import { exigirSecretaria } from "@/lib/perfil";
import { Cabecera, Volver } from "@/components/ui";
import { DetallePractica } from "@/components/DetallePractica";
import { fechaLarga, mayus } from "@/lib/fechas";

export default async function PracticaSecretaria({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ editar?: string }>;
}) {
  await exigirSecretaria();
  const { id } = await params;
  const { editar } = await searchParams;
  const db = await leer();
  const p = db.practicas.find((x) => x.id === id);
  if (!p) notFound();
  return (
    <div className="mx-auto max-w-2xl">
      <Cabecera
        antes={<Volver href={`/secretaria/agenda?fecha=${p.fecha}`}>Agenda del {fechaLarga(p.fecha)}</Volver>}
        titulo="Práctica"
        subtitulo={`${mayus(fechaLarga(p.fecha))}, ${p.inicio}`}
      />
      <DetallePractica
        db={db}
        practica={p}
        rol="secretaria"
        ruta={`/secretaria/practicas/${p.id}`}
        volverTrasGuardar={`/secretaria/agenda?fecha=${p.fecha}`}
        editar={editar === "1"}
      />
    </div>
  );
}
