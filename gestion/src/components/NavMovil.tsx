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

/** Barra inferior de pestañas para el móvil (profesor y alumno). En escritorio queda arriba. */
export function NavMovil({ pestanas }: { pestanas: PestanaMovil[] }) {
  const ruta = usePathname();
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-linea bg-superficie pb-[env(safe-area-inset-bottom)] md:static md:border-0 md:bg-transparent md:pb-0"
    >
      <ul className="mx-auto flex max-w-xl md:max-w-none md:gap-1">
        {pestanas.map((p) => {
          const activo = p.exacto ? ruta === p.href : ruta === p.href || ruta.startsWith(`${p.href}/`);
          return (
            <li key={p.href} className="flex-1 md:flex-none">
              <Link
                href={p.href}
                aria-current={activo ? "page" : undefined}
                className={`relative flex h-16 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-semibold md:h-9 md:flex-row md:gap-2 md:rounded-lg md:px-3 md:text-sm ${
                  activo ? "text-faro-600 md:bg-faro-50 md:text-faro-800" : "text-gris hover:text-tinta md:hover:bg-hundido"
                }`}
              >
                <span className="relative">
                  <Icono nombre={p.icono} lleno={activo} className="!text-[24px] md:!text-[20px]" />
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
