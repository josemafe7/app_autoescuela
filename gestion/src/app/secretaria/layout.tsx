import { leer } from "@/lib/db";
import { exigirSecretaria } from "@/lib/perfil";
import * as R from "@/lib/reglas";
import { Marco } from "@/components/Marco";
import type { GrupoNav } from "@/components/NavLateral";

export default async function LayoutSecretaria({ children }: { children: React.ReactNode }) {
  await exigirSecretaria();
  const db = await leer();

  const sinConfirmar = db.convocatorias.filter((c) => !c.confirmada).length;
  const grupos: GrupoNav[] = [
    {
      items: [
        { href: "/secretaria", texto: "Hoy", icono: "today", exacto: true, cuenta: R.huecosLiberados(db).filter((h) => !h.oferta.avisadaEl && h.candidatos.length > 0).length },
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
      ],
    },
    { abajo: true, items: [{ href: "/secretaria/ajustes", texto: "Ajustes", icono: "settings" }] },
  ];

  return (
    <Marco
      inicio="/secretaria"
      ambito="Secretaría · Málaga"
      titulo="Secretaría"
      grupos={grupos}
      cuenta={{ nombre: "Secretaría", iniciales: "SE", tono: 2 }}
      buscar
    >
      {children}
    </Marco>
  );
}
