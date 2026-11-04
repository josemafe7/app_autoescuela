"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { salir } from "@/app/acciones/perfil";
import { Icono } from "./ui";

export interface ItemNav {
  href: string;
  texto: string;
  icono: string;
  cuenta?: number;
  exacto?: boolean;
}

export interface GrupoNav {
  titulo?: string;
  items: ItemNav[];
  /** Utilidades como los ajustes: van al pie del menú. */
  abajo?: boolean;
}

function esActiva(it: ItemNav, ruta: string) {
  return it.exacto ? ruta === it.href : ruta === it.href || ruta.startsWith(`${it.href}/`);
}

/** Las secciones, sobre el marco. La abierta es una píldora gris: el naranja no va en el menú. */
export function NavLateral({ grupos }: { grupos: GrupoNav[] }) {
  const ruta = usePathname();
  return (
    <nav aria-label="Secciones" className="flex flex-1 flex-col gap-5">
      {grupos.map((g, i) => (
        <div key={i} className={g.abajo ? "mt-auto" : undefined}>
          {g.titulo && <p className="mb-1 px-3 text-xs font-medium text-tenue">{g.titulo}</p>}
          <ul className="flex flex-col gap-0.5">
            {g.items.map((it) => {
              const activa = esActiva(it, ruta);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={activa ? "page" : undefined}
                    className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm transition-colors ${
                      activa ? "bg-activo font-semibold text-tinta" : "text-gris hover:bg-activo/60 hover:text-tinta"
                    }`}
                  >
                    <Icono nombre={it.icono} className="!text-[19px]" />
                    <span className="min-w-0 flex-1 truncate">{it.texto}</span>
                    {!!it.cuenta && (
                      <span className="cifra min-w-[22px] rounded-md bg-superficie px-1.5 text-center text-xs font-semibold leading-5 text-tinta">
                        {it.cuenta}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** En el móvil, el menú de Secretaría se abre a pantalla completa desde la barra de arriba. */
export function MenuMovil({ grupos, marca }: { grupos: GrupoNav[]; marca: React.ReactNode }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  useEffect(() => setAbierto(false), [ruta]);

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-activo lg:hidden"
        aria-label="Abrir menú"
        aria-expanded={abierto}
      >
        <Icono nombre="menu" />
      </button>
      {abierto && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <button className="absolute inset-0 bg-tinta/30" onClick={() => setAbierto(false)} aria-label="Cerrar menú" />
          <div className="aparecer absolute inset-y-0 left-0 flex w-[288px] max-w-[85vw] flex-col gap-5 overflow-y-auto bg-marco px-3 pb-5 pt-2 shadow-xl">
            <div className="flex h-12 items-center justify-between gap-2">
              {marca}
              <button onClick={() => setAbierto(false)} className="rounded-lg p-2 hover:bg-activo" aria-label="Cerrar menú">
                <Icono nombre="close" />
              </button>
            </div>
            <NavLateral grupos={grupos} />
            <form action={salir}>
              <button
                type="submit"
                className="flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-sm text-gris transition-colors hover:bg-activo hover:text-tinta"
              >
                <Icono nombre="logout" className="!text-[19px]" />
                <span>Cerrar sesión</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
