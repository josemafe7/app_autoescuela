import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low pt-16 pb-24 md:pb-14 mt-16">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <img
              alt="Autoescuela Faro Málaga"
              className="h-10 w-auto object-contain"
              src="/logo-faro-oscuro.png"
            />
          </Link>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Autoescuela en Málaga para el permiso B (coche). 3 profesores, 4 coches con doble mando, reservas desde el móvil y precios reales sin letra pequeña.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tertiary/10 text-tertiary font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Precio real sin letra pequeña</span>
          </div>
        </div>

        <div>
          <p className="font-headline-sm text-headline-sm text-[1.1rem] text-on-surface mb-4">
            Navegación
          </p>
          <ul className="space-y-2.5 font-body-sm text-body-sm text-on-surface-variant">
            <li>
              <Link className="hover:text-primary transition-colors" href="/">
                Inicio
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-primary transition-colors"
                href="/precios-y-calculadora"
              >
                Precios y Calculadora Real
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary transition-colors" href="/como-funciona">
                Cómo Funciona, Paso a Paso
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary transition-colors" href="/#opiniones">
                Opiniones de Alumnos
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-primary transition-colors"
                href="/#preguntas-frecuentes"
              >
                Preguntas Frecuentes
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-primary transition-colors"
                href="/contacto-y-matricula"
              >
                Contacto, Clase de Prueba y Matrícula
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-headline-sm text-headline-sm text-[1.1rem] text-on-surface mb-4">
            Horario y Contacto
          </p>
          <div className="space-y-3 font-body-sm text-body-sm text-on-surface-variant">
            <div>
              <p className="font-label-md text-label-md text-on-surface font-bold">
                Horario de oficina
              </p>
              <p>Lunes a viernes: 9:30–13:30 y 16:30–20:30</p>
              <p>Sábados: 10:00–13:00</p>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface font-bold">
                Horario de prácticas
              </p>
              <p>Lunes a sábado: 8:00 a 21:00</p>
            </div>
            <div className="pt-1 space-y-1">
              <p>
                <strong className="text-on-surface">Tel. y WhatsApp:</strong>{" "}
                <a href="tel:+34600000000" className="hover:text-primary underline">
                  600 000 000
                </a>
              </p>
              <p>
                <strong className="text-on-surface">Correo:</strong>{" "}
                <a
                  href="mailto:hola@autoescuelafaro.es"
                  className="hover:text-primary underline"
                >
                  hola@autoescuelafaro.es
                </a>
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="font-headline-sm text-headline-sm text-[1.1rem] text-on-surface mb-4">
            Transparencia de Tarifas
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
            Pagamos la tasa de la DGT en tu nombre y te entregamos el recibo oficial. Sin gastos de gestión por renovar ni por trasladar tu expediente.
          </p>
          <div className="p-3.5 rounded-xl bg-surface-container-highest/60 text-on-surface font-label-sm text-label-sm space-y-1">
            <p className="font-bold text-primary">Tasa Oficial DGT: 94,05 €</p>
            <p className="text-on-surface-variant">
              Cubre 2 convocatorias y está desglosada desde el primer día en tu presupuesto.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 font-label-sm text-label-sm text-on-surface-variant">
        <p>© 2026 Autoescuela Faro • Málaga. Permiso B sin letra pequeña.</p>
        <div className="flex items-center gap-5">
          <Link className="hover:text-primary transition-colors" href="/precios-y-calculadora">
            Tarifas oficiales
          </Link>
          <Link className="hover:text-primary transition-colors" href="/como-funciona">
            Proceso de examen
          </Link>
          <Link className="hover:text-primary transition-colors" href="/contacto-y-matricula">
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  );
}
