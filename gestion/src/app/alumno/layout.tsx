import { leer } from "@/lib/db";
import { exigirAlumno } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { FASES } from "@/lib/tipos";
import { Marco } from "@/components/Marco";
import type { PestanaMovil } from "@/components/NavMovil";
import { tonoDe } from "@/components/ui";

export default async function LayoutAlumno({ children }: { children: React.ReactNode }) {
  const id = await exigirAlumno();
  const db = await leer();
  const a = R.alumnoPorId(db, id);
  if (!a) return <p className="p-6">Alumno no encontrado.</p>;
  const prof = R.profesorPorId(db, a.profesorId);
  const ofertas = R.ofertasParaAlumno(db, a).disponibles.length;
  const porConfirmar = R.practicasPorConfirmar(db, a.id).length;
  const pestanas: PestanaMovil[] = [
    { href: "/alumno", texto: "Inicio", icono: "home", exacto: true, aviso: ofertas + porConfirmar > 0 },
    { href: "/alumno/reservar", texto: "Reservar", icono: "calendar_add_on" },
    { href: "/alumno/practicas", texto: "Prácticas", icono: "directions_car" },
    { href: "/alumno/progreso", texto: "Progreso", icono: "flag" },
    { href: "/alumno/pagos", texto: "Pagos", icono: "account_balance_wallet" },
  ];
  return (
    <Marco
      inicio="/alumno"
      ambito={`${R.nombreCompleto(a)} · ${prof ? `con ${prof.nombre}` : FASES[a.fase]}`}
      titulo="Mi autoescuela"
      grupos={[{ items: pestanas }]}
      pestanas={pestanas}
      cuenta={{ nombre: R.nombreCompleto(a), iniciales: `${a.nombre[0]}${a.apellidos[0]}`, tono: tonoDe(a.id) }}
      estrecho
    >
      {children}
    </Marco>
  );
}
