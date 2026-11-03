// Marco de las vistas pensadas para el móvil (profesor y alumno).

import Image from "next/image";
import { salir } from "@/app/acciones/perfil";
import { NavMovil, PestanaMovil } from "./NavMovil";
import { Avatar, Icono, tonoDe } from "./ui";

export function MarcoMovil({
  persona,
  idPersona,
  rol,
  pestanas,
  children,
}: {
  persona: { nombre: string; apellidos: string };
  idPersona: string;
  rol: string;
  pestanas: PestanaMovil[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="border-b border-linea bg-fondo">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Image src="/icono-faro.svg" alt="" width={28} height={28} className="h-7 w-7" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-[0.9375rem] font-extrabold">Autoescuela Faro</p>
            <p className="truncate text-xs text-gris">{rol}</p>
          </div>
          <div className="hidden md:block">
            <NavMovil pestanas={pestanas} />
          </div>
          <Avatar texto={`${persona.nombre[0]}${persona.apellidos[0]}`} tono={tonoDe(idPersona)} tamano="sm" />
          <form action={salir}>
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gris transition-colors hover:bg-hundido hover:text-tinta"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <Icono nombre="logout" />
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pt-5">{children}</main>
      <div className="md:hidden">
        <NavMovil pestanas={pestanas} />
      </div>
    </div>
  );
}
