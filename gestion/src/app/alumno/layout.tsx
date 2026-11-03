import { leer } from "@/lib/db";
import { exigirAlumno } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { FASES } from "@/lib/tipos";
import { MarcoMovil } from "@/components/MarcoMovil";

export default async function LayoutAlumno({ children }: { children: React.ReactNode }) {
  const id = await exigirAlumno();
  const db = await leer();
  const a = R.alumnoPorId(db, id);
  if (!a) return <p className="p-6">Alumno no encontrado.</p>;
  const prof = R.profesorPorId(db, a.profesorId);
  const ofertas = R.ofertasParaAlumno(db, a).disponibles.length;
  const porConfirmar = R.practicasPorConfirmar(db, a.id).length;
  return (
    <MarcoMovil
      persona={a}
      idPersona={a.id}
      rol={`${R.nombreCompleto(a)} · ${prof ? `con ${prof.nombre}` : FASES[a.fase]}`}
      pestanas={[
        { href: "/alumno", texto: "Inicio", icono: "home", exacto: true, aviso: ofertas + porConfirmar > 0 },
        { href: "/alumno/reservar", texto: "Reservar", icono: "calendar_add_on" },
        { href: "/alumno/practicas", texto: "Prácticas", icono: "directions_car" },
        { href: "/alumno/progreso", texto: "Progreso", icono: "flag" },
        { href: "/alumno/pagos", texto: "Pagos", icono: "account_balance_wallet" },
      ]}
    >
      {children}
    </MarcoMovil>
  );
}
