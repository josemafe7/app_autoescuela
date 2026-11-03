"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const navLinks = [
    { href: "/", label: "Inicio", active: pathname === "/" },
    {
      href: "/precios-y-calculadora",
      label: "Precios y Calculadora",
      active: pathname === "/precios-y-calculadora",
    },
    {
      href: "/como-funciona",
      label: "Cómo Funciona",
      active: pathname === "/como-funciona",
    },
    {
      href: "/#opiniones",
      label: "Opiniones",
      active: false,
    },
    {
      href: "/#preguntas-frecuentes",
      label: "Preguntas Frecuentes",
      active: false,
    },
    {
      href: "/contacto-y-matricula",
      label: "Contacto y Matrícula",
      active: pathname === "/contacto-y-matricula",
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-surface/95 backdrop-blur-xl shadow-[0_1px_0_rgba(11,28,48,0.06)]">
      {/* Navegación principal limpia */}
      <div className="h-20 max-w-[1280px] mx-auto px-5 lg:px-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="flex items-center gap-3 focus:outline-none"
            onClick={() => setMenuAbierto(false)}
          >
            <img
              alt="Autoescuela Faro Málaga"
              className="h-10 w-auto object-contain"
              src="/logo-faro-oscuro.png"
            />
          </Link>

          <nav className="hidden xl:flex items-center gap-6" aria-label="Navegación principal">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={
                  item.active
                    ? "relative py-1 font-label-lg text-label-lg text-primary font-bold after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-primary"
                    : "py-1 font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Acciones de escritorio y botón menú móvil */}
        <div className="flex items-center gap-3">
          <Link
            href="/contacto-y-matricula?tab=prueba"
            className="hidden sm:inline-flex items-center justify-center h-11 px-4 rounded-full font-label-lg text-label-lg text-on-surface hover:text-primary transition-colors"
          >
            Clase de prueba
          </Link>
          <Link
            href="/contacto-y-matricula?tab=matricula"
            className="inline-flex items-center justify-center h-11 px-5 sm:px-6 rounded-full font-label-lg text-label-lg text-on-primary bg-primary hover:bg-primary-container transition-colors"
          >
            Matricúlate
          </Link>

          <button
            type="button"
            aria-label={menuAbierto ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="xl:hidden inline-flex items-center justify-center w-11 h-11 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">
              {menuAbierto ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Menú desplegable móvil y tablet */}
      {menuAbierto && (
        <div className="xl:hidden bg-surface-container-lowest border-b border-surface-container-highest px-5 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-1" aria-label="Menú móvil">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuAbierto(false)}
                className={
                  item.active
                    ? "px-4 py-3 rounded-xl bg-primary text-on-primary font-bold text-body-md flex items-center justify-between"
                    : "px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container-low font-semibold text-body-md flex items-center justify-between"
                }
              >
                <span>{item.label}</span>
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </Link>
            ))}
          </nav>

          <div className="pt-2 border-t border-surface-container grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href="/contacto-y-matricula?tab=prueba"
              onClick={() => setMenuAbierto(false)}
              className="w-full h-12 rounded-full bg-surface-container-high text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">directions_car</span>
              <span>Clase de prueba gratis</span>
            </Link>
            <Link
              href="/contacto-y-matricula?tab=matricula"
              onClick={() => setMenuAbierto(false)}
              className="w-full h-12 rounded-full bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
              <span>Matricúlate online</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
