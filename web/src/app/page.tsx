import React from "react";
import Link from "next/link";
import HomeCalculatorWidget from "@/components/HomeCalculatorWidget";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-surface pt-8 pb-16 lg:pt-14 lg:pb-24">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Columna izquierda: Mensaje editorial limpio */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2.5 text-primary font-label-lg text-label-lg">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span>Málaga · Teatinos y Centro · Permiso B</span>
                </div>

                <h1 className="font-display text-display-mobile sm:text-display text-on-surface tracking-tight leading-[1.06]">
                  Carnet B en Málaga sin letra pequeña.
                </h1>

                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                  Sabes exactamente lo que vas a pagar desde el primer día con tasas e impuestos incluidos, reservas tus clases prácticas desde el móvil y consultas en todo momento tu puesto real para subir a examen.
                </p>
              </div>

              {/* Acciones limpias sin iconos artificiales */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-colors"
                  href="/precios-y-calculadora"
                >
                  Calcula tu precio real
                </Link>
                <Link
                  className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-surface-container-low text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high transition-colors"
                  href="/contacto-y-matricula?tab=prueba"
                >
                  <span>Clase de prueba gratis (30 min)</span>
                  <span className="transition-transform group-hover:translate-x-1 text-primary">
                    →
                  </span>
                </Link>
              </div>

              {/* Cifras clave en línea editorial */}
              <div className="pt-4 grid grid-cols-3 gap-4 sm:gap-8">
                <div className="space-y-1">
                  <p className="font-headline-md text-[1.35rem] sm:text-headline-md text-on-surface font-extrabold tracking-tight whitespace-nowrap">
                    829,05 €
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant leading-snug">
                    Total real con 20 prácticas, tasa DGT y examen
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-headline-md text-[1.35rem] sm:text-headline-md text-on-surface font-extrabold tracking-tight whitespace-nowrap">
                    45 min
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant leading-snug">
                    Duración completa al volante en cada práctica
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-headline-md text-[1.35rem] sm:text-headline-md text-tertiary font-extrabold tracking-tight whitespace-nowrap">
                    L a S
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant leading-snug">
                    Prácticas de 8:00 a 21:00 con 4 coches y 3 profesores
                  </p>
                </div>
              </div>
            </div>

            {/* Columna derecha: Fotografía editorial en Málaga con tarjeta flotante mínima */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-[460px] rounded-[28px] overflow-hidden bg-surface-container-low">
                <img
                  src="/hero-autoescuela-faro.jpg"
                  alt="Alumna de Autoescuela Faro conduciendo por Málaga junto a su profesor al atardecer"
                  className="w-full h-[440px] sm:h-[520px] object-cover object-center block"
                />

                {/* Única tarjeta flotante limpia e informativa */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-label-md text-label-md text-primary font-bold">
                      Reservas y cola en tu móvil
                    </p>
                    <p className="font-headline-sm text-headline-sm text-[1rem] text-on-surface">
                      Sabes tu puesto exacto antes de subir a examen
                    </p>
                  </div>
                  <Link
                    href="/como-funciona"
                    className="shrink-0 w-10 h-10 rounded-full bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center font-bold"
                    aria-label="Ver cómo funciona"
                  >
                    →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 PILARES INNEGOCIABLES */}
      <section className="w-full py-16 lg:py-24 bg-surface-container-low">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 space-y-12">
          <div className="max-w-3xl space-y-3">
            <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
              Tres compromisos reales en Málaga
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Sin ofertas gancho que luego se duplican y sin tener que llamar por teléfono para pedir hora de práctica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pilar 1 */}
            <div className="flex flex-col bg-surface-container-lowest rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mb-5">
                <span className="material-symbols-outlined text-[28px]">price_check</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">
                Precio real sin letra pequeña
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed flex-1">
                Matrícula y teórico por 150 €, prácticas sueltas a 30 € o en bonos de 10 (260 €) y 20 (500 €). Incluimos en la calculadora la tasa oficial de la DGT (94,05 €), el derecho de examen (50 €) y el psicotécnico (unos 35 €).
              </p>
              <div className="mt-6 pt-4 bg-surface-container-low rounded-2xl p-4">
                <span className="font-label-sm text-label-sm text-on-surface font-bold block mb-1">
                  Sin recargos por renovar:
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Pagamos la tasa de la DGT en tu nombre y te damos el recibo. Si algún día tienes que renovar expediente, no cobramos gestión.
                </span>
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="flex flex-col bg-surface-container-lowest rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-fixed mb-5">
                <span className="material-symbols-outlined text-[28px]">smartphone</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">
                Reservas desde tu móvil
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed flex-1">
                Tú mismo reservas y cambias tus clases desde el móvil de lunes a sábado de 8:00 a 21:00, siempre que tengas prácticas disponibles en tu bono. El día antes te mandamos un recordatorio para confirmar.
              </p>
              <div className="mt-6 pt-4 bg-surface-container-low rounded-2xl p-4">
                <span className="font-label-sm text-label-sm text-on-surface font-bold block mb-1">
                  Cancelaciones claras y lista de espera:
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Con más de 24 h de antelación, la práctica vuelve a tu bono. Y si alguien cancela, avisamos al momento a la lista de espera.
                </span>
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="flex flex-col bg-surface-container-lowest rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-tertiary mb-5">
                <span className="material-symbols-outlined text-[28px]">event_available</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">
                Tu puesto en la cola de examen
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed flex-1">
                En Málaga hay espera en Tráfico y ninguna autoescuela puede saltarse la cola. Lo que hacemos es enseñarte en el móvil tu puesto real en nuestra cola y una fecha aproximada en cuanto tu profesor te pone en verde.
              </p>
              <div className="mt-6 pt-4 bg-surface-container-low rounded-2xl p-4">
                <span className="font-label-sm text-label-sm text-on-surface font-bold block mb-1">
                  Cero clases de relleno:
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Concentramos tus prácticas en las 4 semanas anteriores a tu examen para que llegues preparado sin gastar de más.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROFESORES & COCHES */}
      <section className="w-full py-16 lg:py-24 bg-surface">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 space-y-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
                3 profesores y 4 coches dobles
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-2">
                Después de cada clase de 45 minutos, tu profesor anota cómo vas (rotondas, incorporaciones, aparcamiento) para que sepas qué te falta antes de pasar a examen.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md shrink-0">
              <span className="material-symbols-outlined text-tertiary text-[20px]">
                fact_check
              </span>
              <span>Evaluación en tu móvil tras cada práctica</span>
            </div>
          </div>

          {/* Cuadrícula de los 3 profesores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profesor 1: Alejandro */}
            <div className="bg-surface-container-low rounded-3xl overflow-hidden flex flex-col">
              <div className="relative h-64 overflow-hidden bg-surface-container">
                <img
                  alt="Alejandro Ortiz, profesor de Autoescuela Faro en Málaga"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBd38yh847_jaTnbLhH2H7X44G2_1m0xDe5l7Lf_wNTF9qu5UdtFtXoR0q544YSGxzpwFIxCy7V7efgRzY9nxPRUte38sLLWdv8JxbRUHiTpnocgBcwKvm1JjdK2E3jW4qcNSGbX61DQGyNGJk-JASOqGjXumLNZKqwt9Hmja8AYCpwtIGOvHyewWPjkALG7PIDb16h6gBv1dwgSEyuan4uEzs2O7G3Rj5H9E_dgmLtZVNa8MafkH45pA"
                />
                <div className="absolute bottom-3 left-3 bg-surface-container-lowest/95 px-3 py-1 rounded-full text-label-sm font-label-sm font-bold text-on-surface">
                  Permiso B • Maniobras y calma
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Alejandro Ortiz
                  </h3>
                  <p className="font-label-md text-label-md text-primary font-semibold mt-0.5">
                    Especialista en primeras clases y seguridad al volante
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 leading-relaxed">
                    Ideal si te pones nervioso en cuestas o en el tráfico urbano. Trabaja paso a paso el punto de embrague, las rotondas de dos carriles y el aparcamiento en línea y en batería.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                  <span>Zonas: Teatinos y polígonos</span>
                  <span className="text-tertiary font-bold">Profesor titular</span>
                </div>
              </div>
            </div>

            {/* Profesor 2: Carmen */}
            <div className="bg-surface-container-low rounded-3xl overflow-hidden flex flex-col">
              <div className="relative h-64 overflow-hidden bg-surface-container">
                <img
                  alt="Carmen Rivas, profesora de Autoescuela Faro en Málaga"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8BBUz7EhRA4gMB6dF3h_ectW9zgI2gsAhrps06x4S-BCXxH-9YjUSf8yj8oaWEJLsRdKeO99_1M5qmjMAvr94XRrZiC0JSMbO4zWiEx2u0QyMK_-aMSsAUkBn0_-fDdy7LWgMp8aTamuwtdIJAT-D-63O9psROfdCgnUQAh9i3y6pq6IXW8t5meQ079bBNj9fsBPLC8HVuX-nP4jylV5Eild64wZee8qI7nxEvt4ZPZmkEJ4bAH3IVA"
                />
                <div className="absolute bottom-3 left-3 bg-surface-container-lowest/95 px-3 py-1 rounded-full text-label-sm font-label-sm font-bold text-on-surface">
                  Permiso B • Zonas de examen
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Carmen Rivas
                  </h3>
                  <p className="font-label-md text-label-md text-primary font-semibold mt-0.5">
                    Apoyo en teórico y recorridos oficiales de Málaga
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 leading-relaxed">
                    Te guía desde que empiezas con los test en la app hasta las últimas prácticas por las zonas de examen de Málaga que asigna Tráfico, explicando cada cruce y señalización con claridad.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                  <span>Zonas: Centro y oeste</span>
                  <span className="text-tertiary font-bold">Profesora titular</span>
                </div>
              </div>
            </div>

            {/* Profesor 3: Marcos */}
            <div className="bg-surface-container-low rounded-3xl overflow-hidden flex flex-col">
              <div className="relative h-64 overflow-hidden bg-surface-container">
                <img
                  alt="Marcos Soler, profesor de Autoescuela Faro en Málaga"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyIQjT8qdiooKGib0SdYYutv-wJQ9AWduzY_YFG1w3K82r-hel-xubYpwVk4mS1OdbWrwXUUzBAxQSZPphVgz0frBztzf0k9UTbD446hHyIkZ59Rhp1k5rbR9UBFK0cdCuwuTTsvHzxvQNMiR85CqgHAeRarJyJXozuZtlRd0u2JMSH7zMyMy8v5X8HhMIiV7Up8XzTNY1_plugYMpoQHeFQgwAw_QwMmQ5E0QmqT4ZkHHmCrfGFcblw"
                />
                <div className="absolute bottom-3 left-3 bg-surface-container-lowest/95 px-3 py-1 rounded-full text-label-sm font-label-sm font-bold text-on-surface">
                  Permiso B • Simulacros de examen
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Marcos Soler
                  </h3>
                  <p className="font-label-md text-label-md text-primary font-semibold mt-0.5">
                    Incorporaciones en autovía y preparación final
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 leading-relaxed">
                    En las 4 semanas previas a tu fecha de examen repasa contigo todos los detalles en condiciones reales de circulación para ponerte en verde con total confianza.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                  <span>Zonas: Autovía y rondas</span>
                  <span className="text-tertiary font-bold">Profesor titular</span>
                </div>
              </div>
            </div>
          </div>

          {/* Banner de los 4 coches */}
          <div className="bg-surface-container-low rounded-3xl p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  4 coches con doble mando listos
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Contamos con una flota propia de 4 vehículos equipados con doble mando homologado. Además, si antes de matricularte quieres comprobar cómo damos las clases, puedes pedir una clase de prueba gratuita de 30 minutos.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-surface-container-lowest p-4 rounded-2xl">
                    <span className="material-symbols-outlined text-primary text-[24px]">
                      tune
                    </span>
                    <p className="font-label-md text-label-md text-on-surface font-bold mt-1">
                      Doble mando
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      4 coches listos de lunes a sábado
                    </p>
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-2xl">
                    <span className="material-symbols-outlined text-tertiary text-[24px]">
                      timer
                    </span>
                    <p className="font-label-md text-label-md text-on-surface font-bold mt-1">
                      Prácticas de 45 min
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      Desde 25 €/clase con bono de 20
                    </p>
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-2xl">
                    <span className="material-symbols-outlined text-secondary text-[24px]">
                      badge
                    </span>
                    <p className="font-label-md text-label-md text-on-surface font-bold mt-1">
                      Coche en examen
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      Derecho de examen: 50 € por intento
                    </p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 relative">
                <div className="rounded-2xl overflow-hidden aspect-video bg-surface-container-highest">
                  <img
                    alt="Coche de prácticas de Autoescuela Faro en Málaga"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf8luK5FNAKakZqCgcsmh_c1wToYGye8c09fzMbUbwXq22cklK08_qk8X8LXvbuqUJs4buWvo6BFW-pldhHj47yaQwGDMTYI1W37A1KrMSkXkryO9tfOeDOF6pzy2VAF5_tKoN9BCO8FluAM6j0C1WvaPMpAujJzzVKdSoP3EEtYoGuFILdA8v9tHlceMLeK0IGkzyIZAXbwL617YS6630pIJ5ddVNSKgv9gBWnLuFN1F4p2yWWphvIQ"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULADORA DE PRECIO REAL DESTACADA */}
      <section className="w-full py-16 lg:py-24 bg-surface-container-low">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
                Calcula tu coste real en Málaga
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                La mayoría de alumnos necesita entre 20 y 30 prácticas. En vez de esconder la tasa de la DGT o el coste de ir a examen, aquí puedes mover el selector y ver exactamente cuánto suma todo.
              </p>
              <p className="font-body-md text-body-md text-on-surface font-semibold">
                Con 20 prácticas (usando el bono de 20 de 500 €) y aprobando a la primera, el coste total con tasa DGT, examen y psicotécnico es de 829,05 €.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">
                    check_circle
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    <span className="font-bold">Optimización automática de bonos:</span> La calculadora usa los bonos de 10 (260 €) o 20 prácticas (500 €) siempre que te ahorren dinero frente a las sueltas (30 €).
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">
                    check_circle
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    <span className="font-bold">Tasa de la DGT (94,05 €):</span> Se paga una vez, cubre 2 convocatorias y nosotros la pagamos en tu nombre dándote el recibo.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">
                    check_circle
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    <span className="font-bold">Pago en dos plazos:</span> Tanto la matrícula como los bonos de prácticas se pueden pagar en dos plazos en la oficina.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <HomeCalculatorWidget />
            </div>
          </div>
        </div>
      </section>

      {/* OPINIONES DE ALUMNOS (#opiniones) */}
      <section id="opiniones" className="w-full py-16 lg:py-24 bg-surface scroll-mt-24">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 space-y-12">
          <div className="max-w-2xl space-y-3">
            <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
              Opiniones de alumnos en Málaga
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Cuentas claras desde el primer día, reservas desde el móvil y seguimiento real en cada práctica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-container-low p-8 rounded-3xl space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                  «Para compaginar con las clases de la universidad me venía genial reservar las prácticas desde el móvil sin tener que llamar a la oficina. Con Alejandro perdí el miedo a las rotondas de dos carriles y al salir a la autovía.»
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <div className="w-11 h-11 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-on-primary-fixed">
                  LV
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-bold">
                    Lucía V.
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Alumna en zona Teatinos
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-8 rounded-3xl space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                  «Lo que más agradecimos en casa fue saber desde el primer día que con el bono de 20 prácticas, la tasa de la DGT y el examen todo salía por 829,05 €. Nos explicaron con total sinceridad la espera de Tráfico en Málaga y concentraron sus clases al final.»
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <div className="w-11 h-11 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-fixed">
                  FM
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-bold">
                    Francisco M.
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Padre de alumno en Málaga
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-8 rounded-3xl space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                  «Me cambié desde otra autoescuela porque llevaba meses sin saber cuándo iba a examinarme. En Faro me tramitaron el traslado del expediente sin cobrarme gestión y desde la app vi en todo momento mi puesto en la cola.»
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <div className="w-11 h-11 rounded-full bg-tertiary-fixed flex items-center justify-center font-bold text-on-tertiary-fixed-variant">
                  SR
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-bold">
                    Sara R.
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Alumna de traslado de expediente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES OFICIALES (#preguntas-frecuentes) */}
      <section
        id="preguntas-frecuentes"
        className="w-full py-16 lg:py-24 bg-surface-container-low scroll-mt-24"
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 space-y-10">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
              Preguntas frecuentes sobre Faro
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Todo lo que necesitas saber antes de empezar con el permiso B en Autoescuela Faro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-2xl bg-surface-container-lowest space-y-2">
              <h3 className="font-headline-sm text-headline-sm text-[1.1rem] text-on-surface">
                ¿Hay letra pequeña en los precios?
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                No. El precio que ves en nuestra tabla y en la calculadora es todo lo que vas a pagar, incluyendo la tasa oficial de la DGT (94,05 €), el derecho de examen práctico (50 €) y el cálculo del psicotécnico (unos 35 € en el centro médico).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest space-y-2">
              <h3 className="font-headline-sm text-headline-sm text-[1.1rem] text-on-surface">
                ¿Puedo pagar a plazos?
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Sí, tanto la matrícula como los bonos de 10 y 20 prácticas se pueden pagar en dos plazos. Pregúntanos en la oficina o al hacer tu inscripción y lo organizamos contigo.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest space-y-2">
              <h3 className="font-headline-sm text-headline-sm text-[1.1rem] text-on-surface">
                ¿Cuántas prácticas necesitaré?
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Depende de cada persona; la mayoría de alumnos necesita entre 20 y 30 prácticas de 45 minutos. Tu profesor te dice cómo vas después de cada clase para que sepas tu progreso real.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest space-y-2">
              <h3 className="font-headline-sm text-headline-sm text-[1.1rem] text-on-surface">
                ¿Me puedo cambiar desde otra autoescuela?
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Sí. Si ya tienes el teórico aprobado o empezaste en otra autoescuela, te ayudamos con el traslado del expediente sin ningún coste de gestión por nuestra parte.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest space-y-2">
              <h3 className="font-headline-sm text-headline-sm text-[1.1rem] text-on-surface">
                ¿Dónde se hace el examen práctico?
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                En las zonas de examen de Málaga que asigne Tráfico. En las últimas prácticas antes de tu convocatoria te llevamos por esas zonas para que las conozcas bien.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest space-y-2">
              <h3 className="font-headline-sm text-headline-sm text-[1.1rem] text-on-surface">
                ¿Qué papeles necesito para matricularme?
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Solo necesitas tu DNI o NIE en vigor y el informe del psicotécnico hecho en un centro de reconocimiento de conductores (vale 90 días para presentarse al teórico).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BANNER CTA FINAL */}
      <section className="w-full py-16 lg:py-20 bg-primary text-on-primary">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-primary tracking-tight">
                Pide tu clase de prueba gratis
              </h2>
              <p className="font-body-lg text-body-lg text-primary-fixed max-w-2xl">
                30 minutos gratis en uno de nuestros 4 coches con doble mando con Alejandro, Carmen o Marcos. Conoces nuestra forma de enseñar y cómo funciona la app, sin compromiso.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3.5 justify-center">
              <Link
                className="w-full py-4 px-8 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-label-lg text-center hover:bg-surface-bright transition-colors font-bold"
                href="/contacto-y-matricula?tab=prueba"
              >
                Pedir clase de prueba gratis
              </Link>
              <Link
                className="w-full py-4 px-8 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg text-center hover:bg-on-primary-fixed-variant transition-colors font-semibold"
                href="/contacto-y-matricula?tab=matricula"
              >
                Matricularme online
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
