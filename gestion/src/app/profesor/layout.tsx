import { leer } from "@/lib/db";
import { exigirProfesor } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { Marco } from "@/components/Marco";
import type { PestanaMovil } from "@/components/NavMovil";
import { tonoDe } from "@/components/ui";

export default async function LayoutProfesor({ children }: { children: React.ReactNode }) {
  const id = await exigirProfesor();
  const db = await leer();
  const p = R.profesorPorId(db, id);
  if (!p) return <p className="p-6">Profesor no encontrado.</p>;
  const coche = db.coches.find((c) => c.id === p.cocheId);
  const pendientes = R.practicasSinCerrar(db, p.id).length;
  const pestanas: PestanaMovil[] = [
    { href: "/profesor", texto: "Mi día", icono: "today", exacto: true, aviso: pendientes > 0 },
    { href: "/profesor/alumnos", texto: "Mis alumnos", icono: "group" },
  ];
  return (
    <Marco
      inicio="/profesor"
      ambito={`${R.nombreCompleto(p)} · ${coche?.modelo ?? ""}`}
      titulo="Mi día"
      grupos={[{ items: pestanas }]}
      pestanas={pestanas}
      cuenta={{ nombre: R.nombreCompleto(p), iniciales: `${p.nombre[0]}${p.apellidos[0]}`, tono: tonoDe(p.id) }}
      estrecho
    >
      {children}
    </Marco>
  );
}
