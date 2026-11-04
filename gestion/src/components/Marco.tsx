// El marco de las tres vistas, en el estilo de hoja sobre marco: el menú y la barra de arriba
// comparten el gris azulado del asfalto, sin raya entre ellos, y el trabajo va en una hoja blanca
// con un borde fino y sin sombra. En el móvil el marco desaparece y la hoja es la pantalla.

import Image from "next/image";
import Link from "next/link";
import { salir } from "@/app/acciones/perfil";
import { fechaLarga, hoy, mayus } from "@/lib/fechas";
import { MenuMovil, NavLateral, type GrupoNav } from "./NavLateral";
import { NavMovil, type PestanaMovil } from "./NavMovil";
import { Avatar, Icono } from "./ui";

export function Marco({
  inicio,
  ambito,
  titulo,
  grupos,
  cuenta,
  buscar = false,
  pestanas,
  estrecho = false,
  children,
}: {
  /** A dónde lleva la marca. */
  inicio: string;
  /** La línea bajo «Autoescuela Faro»: la vista o la persona. */
  ambito: string;
  /** Nombre corto de la vista para la barra del móvil de Secretaría. */
  titulo: string;
  grupos: GrupoNav[];
  cuenta: { nombre: string; iniciales: string; tono: number };
  /** Buscador de alumnos en la barra de arriba (Secretaría). */
  buscar?: boolean;
  /** Profesores y alumnos: pestañas abajo en el móvil en lugar del menú. */
  pestanas?: PestanaMovil[];
  /** Vistas pensadas para el móvil: en el ordenador, una columna centrada en la hoja. */
  estrecho?: boolean;
  children: React.ReactNode;
}) {
  const marca = (
    <Link href={inicio} className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1">
      <Image src="/icono-faro.svg" alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="min-w-0 leading-tight">
        <span className="block text-[0.9375rem] font-extrabold">Autoescuela Faro</span>
        <span className="block truncate text-xs text-gris">{ambito}</span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-marco lg:grid lg:grid-cols-[236px_minmax(0,1fr)]">
      {/* Ordenador: el menú lateral, sobre el marco */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-4 overflow-y-auto px-3 pb-4 lg:flex">
        <div className="flex h-14 shrink-0 items-center">{marca}</div>
        <NavLateral grupos={grupos} />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 bg-marco px-2 sm:px-3 lg:static lg:pl-1 lg:pr-3">
          {pestanas ? (
            <div className="min-w-0 flex-1 lg:hidden">{marca}</div>
          ) : (
            <>
              <MenuMovil grupos={grupos} marca={marca} />
              <p className="min-w-0 flex-1 truncate font-bold lg:hidden">{titulo}</p>
            </>
          )}
          <p className="hidden shrink-0 text-sm text-gris lg:block">{mayus(fechaLarga(hoy()))}</p>
          {buscar && (
            <form action="/secretaria/alumnos" role="search" className="mx-auto hidden w-full max-w-[440px] px-4 lg:block">
              <label htmlFor="buscar-alumno" className="sr-only">
                Buscar alumno
              </label>
              <div className="relative">
                <Icono nombre="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 !text-[18px] text-tenue" />
                <input
                  id="buscar-alumno"
                  name="q"
                  type="search"
                  placeholder="Buscar alumno por nombre, DNI o teléfono"
                  className="h-9 w-full rounded-lg border border-control bg-superficie pl-9 pr-3 text-sm text-tinta placeholder:text-tenue focus:border-faro-500 focus:outline-none focus:ring-2 focus:ring-faro-100"
                />
              </div>
            </form>
          )}
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <span className="flex items-center gap-2 pr-1 text-sm font-medium">
              <Avatar texto={cuenta.iniciales} tono={cuenta.tono} tamano="sm" />
              <span className="hidden lg:inline">{cuenta.nombre}</span>
            </span>
            <form action={salir}>
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-gris transition-colors hover:bg-activo hover:text-tinta"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <Icono nombre="logout" className="!text-[19px]" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>
        </header>

        {/* La hoja: blanca, separada del marco por un borde fino */}
        <main
          className={`flex-1 bg-superficie px-4 pt-5 sm:px-6 lg:mb-2 lg:mr-2 lg:rounded-2xl lg:border lg:border-linea lg:px-8 lg:pb-12 lg:pt-7 ${
            pestanas ? "pb-24" : "pb-16"
          }`}
        >
          {estrecho ? <div className="mx-auto w-full max-w-3xl">{children}</div> : children}
        </main>
      </div>

      {pestanas && <NavMovil pestanas={pestanas} />}
    </div>
  );
}
