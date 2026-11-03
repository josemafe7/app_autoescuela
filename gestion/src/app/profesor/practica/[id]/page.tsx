import { notFound } from "next/navigation";
import { leer } from "@/lib/db";
import { exigirProfesor } from "@/lib/perfil";
import { Volver } from "@/components/ui";
import { DetallePractica } from "@/components/DetallePractica";

export default async function PracticaProfesor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ editar?: string }>;
}) {
  const profesorId = await exigirProfesor();
  const { id } = await params;
  const { editar } = await searchParams;
  const db = await leer();
  const p = db.practicas.find((x) => x.id === id && x.profesorId === profesorId);
  if (!p) notFound();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Volver href={`/profesor?fecha=${p.fecha}`}>Mi día</Volver>
        <h1 className="mt-2 text-xl font-bold">Práctica</h1>
      </div>
      <DetallePractica
        db={db}
        practica={p}
        rol="profesor"
        ruta={`/profesor/practica/${p.id}`}
        volverTrasGuardar="/profesor"
        editar={editar === "1"}
      />
    </div>
  );
}
