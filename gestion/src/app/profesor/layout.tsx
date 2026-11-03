import { leer } from "@/lib/db";
import { exigirProfesor } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { MarcoMovil } from "@/components/MarcoMovil";

export default async function LayoutProfesor({ children }: { children: React.ReactNode }) {
  const id = await exigirProfesor();
  const db = await leer();
  const p = R.profesorPorId(db, id);
  if (!p) return <p className="p-6">Profesor no encontrado.</p>;
  const coche = db.coches.find((c) => c.id === p.cocheId);
  const pendientes = R.practicasSinCerrar(db, p.id).length;
  return (
    <MarcoMovil
      persona={p}
      idPersona={p.id}
      rol={`${R.nombreCompleto(p)} · ${coche?.modelo ?? ""}`}
      pestanas={[
        { href: "/profesor", texto: "Mi día", icono: "today", exacto: true, aviso: pendientes > 0 },
        { href: "/profesor/alumnos", texto: "Mis alumnos", icono: "group" },
      ]}
    >
      {children}
    </MarcoMovil>
  );
}
