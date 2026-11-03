import { leer } from "@/lib/db";
import { exigirSecretaria } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { NavSecretaria, GrupoNav } from "@/components/NavSecretaria";

export default async function LayoutSecretaria({ children }: { children: React.ReactNode }) {
  await exigirSecretaria();
  const db = await leer();

  const sinConfirmar = db.convocatorias.filter((c) => !c.confirmada).length;
  const grupos: GrupoNav[] = [
    {
      items: [
        { href: "/secretaria", texto: "Hoy", icono: "today", exacto: true },
        { href: "/secretaria/agenda", texto: "Agenda", icono: "calendar_view_week" },
        { href: "/secretaria/alumnos", texto: "Alumnos", icono: "group" },
      ],
    },
    {
      titulo: "Colas",
      items: [
        { href: "/secretaria/cola-practicas", texto: "Cola de prácticas", icono: "hourglass_top", cuenta: R.colaPracticas(db).length },
        { href: "/secretaria/examenes", texto: "Cola de examen", icono: "flag", cuenta: sinConfirmar },
      ],
    },
    {
      titulo: "Dinero",
      items: [
        { href: "/secretaria/cobros", texto: "Cobros y deudas", icono: "account_balance_wallet", cuenta: R.solicitudesPendientes(db).length },
        { href: "/secretaria/tarifas", texto: "Tarifas", icono: "sell" },
      ],
    },
    {
      titulo: "Más",
      items: [
        { href: "/secretaria/interesados", texto: "Interesados", icono: "person_add", cuenta: R.interesadosNuevos(db).length },
        { href: "/secretaria/coches", texto: "Coches", icono: "directions_car" },
        { href: "/secretaria/ajustes", texto: "Ajustes", icono: "settings" },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
        <NavSecretaria grupos={grupos} titulo="Secretaría" />
        <main className="min-w-0 flex-1 px-4 pb-16 pt-5 sm:px-8 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
