"use client";

import Image from "next/image";
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
}

function Lista({ grupos, ruta }: { grupos: GrupoNav[]; ruta: string }) {
  return (
    <nav aria-label="Secciones" className="flex flex-1 flex-col gap-5">
      {grupos.map((g, i) => (
        <div key={i}>
          {g.titulo && <p className="mb-1 px-3 text-[0.8125rem] font-medium text-tenue">{g.titulo}</p>}
          <ul className="flex flex-col gap-0.5">
            {g.items.map((it) => {
              const activo = it.exacto ? ruta === it.href : ruta === it.href || ruta.startsWith(`${it.href}/`);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={activo ? "page" : undefined}
                    className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-[0.9375rem] transition-colors ${
                      activo ? "bg-faro-50 font-semibold text-faro-800" : "text-gris hover:bg-hundido hover:text-tinta"
                    }`}
                  >
                    <Icono nombre={it.icono} className={activo ? "text-faro-600" : ""} lleno={activo} />
                    <span className="flex-1">{it.texto}</span>
                    {!!it.cuenta && (
                      <span className="cifra min-w-[22px] rounded-full bg-faro-600 px-1.5 text-center text-xs font-bold leading-5 text-white">
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

function BotonSalir() {
  return (
    <form action={salir} className="border-t border-linea pt-4">
      <button
        type="submit"
        className="flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-[0.9375rem] font-medium text-gris transition-colors hover:bg-hundido hover:text-tinta"
      >
        <Icono nombre="logout" />
        <span>Cerrar sesión</span>
      </button>
    </form>
  );
}

export function NavSecretaria({ grupos, titulo }: { grupos: GrupoNav[]; titulo: string }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  useEffect(() => setAbierto(false), [ruta]);

  const marca = (
    <Link href="/secretaria" className="flex items-center gap-2.5 px-3">
      <Image src="/icono-faro.svg" alt="" width={28} height={28} className="h-7 w-7" />
      <span className="leading-tight">
        <span className="block text-[0.9375rem] font-extrabold">Autoescuela Faro</span>
        <span className="block text-xs text-gris">Secretaría · Málaga</span>
      </span>
    </Link>
  );

  return (
    <>
      {/* Escritorio: barra lateral */}
      <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-linea px-3 pb-6 pt-5 lg:flex">
        {marca}
        <Lista grupos={grupos} ruta={ruta} />
        <BotonSalir />
      </aside>

      {/* Móvil: barra superior con menú */}
      <div className="sticky top-0 z-30 flex h-12 items-center justify-between gap-2 border-b border-linea bg-fondo px-3 lg:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAbierto(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-hundido"
            aria-label="Abrir menú"
            aria-expanded={abierto}
          >
            <Icono nombre="menu" />
          </button>
          <span className="truncate font-bold">{titulo}</span>
        </div>
        <form action={salir}>
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gris hover:bg-hundido hover:text-tinta"
            title="Cerrar sesión"
          >
            <Icono nombre="logout" />
            <span>Salir</span>
          </button>
        </form>
      </div>
      {abierto && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <button className="absolute inset-0 bg-tinta/30" onClick={() => setAbierto(false)} aria-label="Cerrar menú" />
          <div className="aparecer absolute inset-y-0 left-0 flex w-[280px] flex-col gap-6 overflow-y-auto bg-fondo px-3 pb-6 pt-4 shadow-xl">
            <div className="flex items-center justify-between">
              {marca}
              <button onClick={() => setAbierto(false)} className="rounded-lg p-2 hover:bg-hundido" aria-label="Cerrar menú">
                <Icono nombre="close" />
              </button>
            </div>
            <Lista grupos={grupos} ruta={ruta} />
            <BotonSalir />
          </div>
        </div>
      )}
    </>
  );
}
