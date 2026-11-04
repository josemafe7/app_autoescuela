"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icono } from "./ui";

export interface PestanaMovil {
  href: string;
  texto: string;
  icono: string;
  exacto?: boolean;
  aviso?: boolean;
}

/** Pestañas abajo en el móvil (profesor y alumno). La abierta, en tinta con una raya naranja encima. */
export function NavMovil({ pestanas }: { pestanas: PestanaMovil[] }) {
  const ruta = usePathname();
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-linea bg-superficie pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex max-w-xl">
        {pestanas.map((p) => {
          const activa = p.exacto ? ruta === p.href : ruta === p.href || ruta.startsWith(`${p.href}/`);
          return (
            <li key={p.href} className="flex-1">
              <Link
                href={p.href}
                aria-current={activa ? "page" : undefined}
                className={`relative flex h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
                  activa ? "text-tinta" : "text-gris hover:text-tinta"
                }`}
              >
                {activa && <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-faro-600" />}
                <span className="relative">
                  <Icono nombre={p.icono} className="!text-[24px]" />
                  {p.aviso && <span className="absolute -right-0.5 top-0 h-2.5 w-2.5 rounded-full border-2 border-superficie bg-faro-600" />}
                </span>
                {p.texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
