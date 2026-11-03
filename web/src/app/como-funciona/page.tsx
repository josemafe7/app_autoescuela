import React from "react";
import Link from "next/link";

export default function ComoFuncionaPage() {
  return (
    <div className="flex flex-col w-full">
      {/* CABECERA EDITORIAL */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-10 pb-14 w-full">
        <div className="flex flex-col items-start gap-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span>Paso a paso • De la matrícula al examen práctico</span>
          </div>

          <h1 className="font-display text-display-mobile sm:text-display text-on-surface tracking-tight leading-[1.08]">
            Cómo funciona Autoescuela Faro.
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Te explicamos cada paso con claridad: qué papeles necesitas, cómo estudias el teórico, cómo reservas tus prácticas desde el móvil y cómo gestionamos la espera del examen práctico en Málaga.
          </p>
        </div>
      </section>

      {/* EXPLICACIÓN HONESTA SOBRE LA ESPERA DEL EXAMEN EN MÁLAGA */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-12 pb-16 w-full">
        <div className="rounded-3xl bg-surface-container-lowest p-8 lg:p-10 border border-surface-container-highest">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold">
                <span className="material-symbols-outlined text-[16px]">policy</span>
                <span>La espera del examen práctico en Málaga, con honestidad</span>
              </div>

              <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
                Lo que depende de Tráfico y lo que sí hacemos por ti
              </h2>

              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                En la provincia de Málaga hay muchos alumnos esperando para examinarse del práctico y la espera puede ser de varios meses. Las plazas de examen las reparte Tráfico y <strong className="text-on-surface font-semibold">ninguna autoescuela puede saltarse la cola ni prometer fechas exactas</strong>.
              </p>

              <div className="p-5 rounded-2xl bg-surface-container-low space-y-2">
                <div className="flex items-center gap-2 text-primary font-headline-sm text-headline-sm">
                  <span className="material-symbols-outlined text-[22px]">lightbulb</span>
                  <h3>¿Qué hacemos nosotros para que no gastes de más?</h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Primero: cuando tu profesor te pone en verde («listo para examen»), entras en nuestra cola y <strong className="text-on-surface">ves en tu móvil tu puesto real y una fecha aproximada</strong>. Segundo: <strong className="text-on-surface">concentramos tus prácticas en las 4 semanas antes de tu examen</strong>, para que llegues con todo fresco y no gastes dinero en clases de mantenimiento mientras esperas turno.
                </p>
              </div>
            </div>

            {/* Panel visual del sistema de cola en el móvil */}
            <div className="lg:col-span-5 bg-surface-container rounded-2xl p-6 flex flex-col gap-5" data-ui="true">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  Cola transparente en tu móvil
                </span>
                <span className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-tertiary bg-surface-container-lowest px-2.5 py-1 rounded-full font-bold">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  Visible siempre
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface-container-lowest space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-label-md text-label-md text-on-surface font-bold">
                      1. Tu estado de preparación
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary font-bold">
                      En verde (listo para examen)
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Tu profesor anota tu evolución tras cada clase y te avisa en cuanto dominas todos los puntos.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-lowest space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-label-md text-label-md text-on-surface font-bold">
                      2. Tu puesto en la cola
                    </span>
                    <span className="font-label-sm text-label-sm text-primary font-bold">
                      Puesto real + fecha aprox.
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Sin favoritismos ni listas ocultas: sabes cuántas personas tienes delante en todo momento.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-lowest flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                    calendar_month
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    <span className="font-bold">3. Bloque final de 4 semanas:</span> Concentramos tus prácticas justo antes del examen para que no pagues clases de relleno.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOS 6 PASOS OFICIALES */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-12 py-12 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
              Los 6 pasos desde que te apuntas hasta que apruebas
            </h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Un recorrido claro donde tú controlas tus test, tus reservas de coche y tus pagos.
          </p>
        </div>

        <ol className="space-y-6 list-none p-0 m-0">
          {/* Paso 1 */}
          <li className="bg-surface-container-lowest rounded-3xl p-6 lg:p-8 border border-surface-container-highest flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm shrink-0">
              1
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Matrícula: online o en la oficina (150 €)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                  Se puede pagar en 2 plazos
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl leading-relaxed">
                Solo necesitas tu <strong>DNI o NIE en vigor</strong> y el <strong>informe del psicotécnico</strong> hecho en un centro de reconocimiento de conductores (vale 90 días para presentarse al teórico). Nosotros pagamos la tasa de la DGT (94,05 €) en tu nombre y te damos el recibo oficial.
              </p>
            </div>
            <div className="w-full lg:w-52 shrink-0 rounded-2xl overflow-hidden h-32 bg-surface-container-low">
              <img
                alt="Recepción de Autoescuela Faro en Málaga"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUYPCEBdscgbwzcJKM9SEx-WVCMuBS0oC5W2YJGwL9CQ2CZsusTXkLYrqZEUnq-tQmb2hBStE2hxciMqCDLGC2OpFxH0yGu0P7Kk2dYb7BJxyb7JkLC4D_gJXFvuBOu0f6SELi8IT4cwZwmiRa4-OisCuRhCzIXu7g918B8tXSEhX_ZhKuEz-SRdjdH4RSqMX7nzZx2K2ylWUPQAAuSQzCi6ecDRvira0jRu9iPU62QxZlb6IquJO0lw"
              />
            </div>
          </li>

          {/* Paso 2 */}
          <li className="bg-surface-container-lowest rounded-3xl p-6 lg:p-8 border border-surface-container-highest flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-container text-on-surface font-headline-sm text-headline-sm shrink-0">
              2
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Teórico: estudias con la app de test y te acompañamos
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-tertiary/15 text-tertiary font-label-sm text-label-sm font-bold">
                  Seguimiento activo
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl leading-relaxed">
                Practicas desde tu móvil u ordenador con la app de test incluida en tu matrícula. No te dejamos solo: <strong>si llevas 7 días sin hacer test, te escribimos</strong> para ver si te has atascado con algún tema y ayudarte a retomarlo.
              </p>
            </div>
            <div className="w-full lg:w-52 shrink-0 rounded-2xl overflow-hidden h-32 bg-surface-container-low">
              <img
                alt="Alumno haciendo test del permiso B en tablet"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYgdaHfSON-ly5nbmgJVpqJ4wHyJisd8nYTT_jASHiW3qyTG3oAyOq9TLCaUSZgM2FzE-ZtPpjdfBLxEEFXscQR2kaJZQtBT7_lIO_BtKbQfi0ae-VgAX1itCSNQc4e5ffNEDcILcVm8WVx8Hkj-Wj6ne4Q8ItFAyVBNqJ6hrncy-2sNzk938uMliZfkSZUnSO3SiTx7GBueA5BObTIPY00iaD9VUwk8K742WvK8SWNFZsgYpQXkdNgg"
              />
            </div>
          </li>

          {/* Paso 3 */}
          <li className="bg-surface-container-lowest rounded-3xl p-6 lg:p-8 border border-surface-container-highest flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-container text-on-surface font-headline-sm text-headline-sm shrink-0">
              3
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Examen teórico oficial
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm">
                  Validez de 2 años
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl leading-relaxed">
                Cuando tus resultados en los test son constantes, te presentamos al examen teórico de la DGT. Una vez aprobado el examen teórico, <strong>el aprobado vale durante 2 años</strong> para sacarte el examen práctico.
              </p>
            </div>
          </li>

          {/* Paso 4 */}
          <li className="bg-surface-container-lowest rounded-3xl p-6 lg:p-8 border border-surface-container-highest flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-container text-on-surface font-headline-sm text-headline-sm shrink-0">
              4
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Prácticas: las reservas y cambias tú desde el móvil
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold">
                  Lunes a sábado de 8:00 a 21:00
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl leading-relaxed">
                Eliges clases sueltas (30 €) o bonos de 10 (260 €) o 20 prácticas (500 €). Solo puedes reservar si tienes prácticas pagadas en tu bono. Si cancelas con más de 24 h, la práctica vuelve a tu bono; con menos de 24 h se descuenta igual. El día antes te mandamos un recordatorio para que confirmes.
              </p>
            </div>
            <div className="w-full lg:w-52 shrink-0 rounded-2xl overflow-hidden h-32 bg-surface-container-low">
              <img
                alt="Coche de prácticas con doble mando en Málaga"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJtlJ-pBo7TDj1ZjCtUVij2L_c4C6ywfcOmfaFIV4B_6zxu-EYWG3OlkRr_BOx4vK-pCfug_7LttFBeIvLvCZD65tURsiq7WAO_IhBRawkpCr3EcvGh_79zasEBNhQNBRSWEMs0zBf4HrpalKbEGTEkVvwsgP9hkVUO9Q4mGicOoAs_GkAaqs9DOZo1bEXjPfRlEUwugryMaklW-2YN5PPAsbCz_5ecae0IOuSZ-6g-xIKurr24-BCSQ"
              />
            </div>
          </li>

          {/* Paso 5 */}
          <li className="bg-surface-container-lowest rounded-3xl p-6 lg:p-8 border border-surface-container-highest flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-container text-on-surface font-headline-sm text-headline-sm shrink-0">
              5
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Paso a «listo para examen» y cola en tiempo real
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-tertiary/15 text-tertiary font-label-sm text-label-sm font-bold">
                  En verde
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl leading-relaxed">
                Después de cada clase tu profesor te dice cómo vas. Cuando te pone en verde («listo para examen»), entras en la cola del examen práctico, ves en el móvil tu puesto y una fecha aproximada, y practicamos por las zonas de examen de Málaga que asigne Tráfico.
              </p>
            </div>
            <div className="w-full lg:w-52 shrink-0 rounded-2xl overflow-hidden h-32 bg-surface-container-low">
              <img
                alt="Práctica de conducción acompañada por profesor en Málaga"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwmAzmaV0zC6GVJQArwfTStjs5PdeJODJJQdA8rjc0PBRULj4PvwbLHvriWfHRr4N_OHJe_HPbaNbTcM3t9zaYycYOL9xoUQ5C00d8RRrXy-6VHQLLxakwrLpnodUbTyY-llbJbDqWgThqeHVQIlrc4X2kS0LiCV3Y_KqyotxcxwkDCiD6Zo8S3bCLyS_DTMZF2AyQy1oxR--orrncrihsuLD-yaC1uofe-CpFJGxsGPiV6c14BP4Ufw"
              />
            </div>
          </li>

          {/* Paso 6 */}
          <li className="bg-primary text-on-primary rounded-3xl p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-container-lowest text-primary font-headline-sm text-headline-sm shrink-0">
              6
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-headline-sm text-headline-sm text-on-primary">
                  Examen práctico con tu profesor y nuestro coche (50 €)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                  Objetivo final
                </span>
              </div>
              <p className="font-body-md text-body-md text-primary-fixed leading-relaxed max-w-3xl">
                El día del examen práctico vas acompañado de tu profesor en uno de nuestros 4 coches con doble mando (derecho de examen: 50 € por intento).
              </p>
            </div>
            <div className="w-full lg:w-52 shrink-0 rounded-2xl overflow-hidden h-32 bg-primary-container">
              <img
                alt="Alumna con la L después de aprobar el examen práctico en Málaga"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkQZbRPIeEPfE1qWFvf6J5oGyPPlwjYNipi0l4VVxQn7o8yDP43fpi7zBtGj1DUHvCiH-Q5yLmPNanW5dZ-U0XedKq5z14ZxhYFcHQpXftVYI8tB0ny0tmzubqNjRLaS6vHaaPVFgDZJZuWZo00pleSja2ATZxsgAIqgCuTWsLrqds3G1p2ORkGYXB9k29zVrn4KrEGx3hxbAGGHU6Ur7XxYIe_R0FsJwuC1EX7Iq08RmX6fmbFN7Www"
              />
            </div>
          </li>
        </ol>
      </section>

      {/* DEMOSTRACIÓN DE LA APP DE RESERVAS Y CANCELACIONES */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-12 py-12 w-full">
        <div className="rounded-3xl bg-surface-container-low p-8 lg:p-14 border border-surface-container-highest">
          <div className="max-w-2xl mb-10">
            <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
              Cómo funcionan las reservas, cancelaciones y lista de espera
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Todo desde tu móvil, con reglas claras para aprovechar cada clase de tu bono.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-ui="true">
            {/* Tarjeta 1 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[26px]">
                    calendar_month
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Reservas con saldo en tu bono
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  De lunes a sábado de 8:00 a 21:00. Solo necesitas tener prácticas pagadas en tu bono para elegir hueco en el calendario desde el móvil.
                </p>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-surface-container-low space-y-2">
                <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
                  <span>Recordatorio automático</span>
                  <span className="text-tertiary font-bold">24 h antes</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface">
                  El día antes te mandamos un recordatorio al móvil para que confirmes tu asistencia.
                </p>
              </div>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[26px]">event_repeat</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Regla de cancelación de 24 horas
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Si cancelas con <strong>más de 24 horas</strong> de antelación, la práctica vuelve íntegra a tu bono. Con menos de 24 horas, se descuenta igual del bono.
                </p>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-surface-container-low space-y-2">
                <div className="p-2.5 rounded-lg bg-tertiary/15 text-tertiary font-label-sm text-label-sm text-center font-bold">
                  +24 h = vuelve a tu bono sin coste
                </div>
              </div>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[26px]">
                    notifications_active
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Lista de espera instantánea
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  ¿Quieres dar una práctica antes y ese día está lleno? Apúntate a la lista de espera: cuando otro alumno cancela con tiempo, te avisamos al momento para que puedas quedarte ese hueco.
                </p>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-surface-container-low space-y-2">
                <div className="flex items-center justify-between text-label-sm font-label-sm">
                  <span className="text-on-surface-variant">Aviso de hueco libre:</span>
                  <span className="text-primary font-bold">Al momento en tu móvil</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ZONAS DE EXAMEN EN MÁLAGA */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-12 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-surface-container-lowest rounded-3xl p-8 lg:p-12 border border-surface-container-highest">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
              Practicamos por las zonas de examen de Málaga
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              El examen práctico se realiza en las zonas de Málaga que asigne Tráfico. En las últimas prácticas antes de tu fecha te llevamos por esas mismas zonas para que conozcas bien las rotondas, incorporaciones y cruces habituales.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-bold">
                    Horario de oficina
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Lunes a viernes de 9:30 a 13:30 y de 16:30 a 20:30 • Sábados de 10:00 a 13:00.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[18px]">directions_car</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-bold">
                    Horario de prácticas
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    De lunes a sábado de 8:00 a 21:00 en nuestros 4 coches con doble mando.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="w-full h-80 lg:h-96 rounded-2xl overflow-hidden bg-surface-container-high">
              <img
                alt="Mapa de zonas de práctica en Málaga de Autoescuela Faro"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBs8OIVmZJbkPBtU-vjrWRdMH4KPhtK5ilWO3brwJFoTslfpe3-jqNrNmyct7-93oOQTfjS-5xcX6MWR3eNBn-Mm6cQfMXy2C-XJy-Pp1ZnZdTT60e_F1SsM3p_tcAVlVcbbANOcmKIV0U3wOGf7rJDnFYK2NGkoYZDfHOjCFSzqUR1b7RsC-m-IZ_Y63kxNV8QkECoGB6pL6WREff-_u_4GJvp8rehgppooE8jaUpWpW4lwDNqlgvfYw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-12 pb-16 w-full">
        <div className="rounded-3xl bg-surface-container-highest p-8 lg:p-14 text-center flex flex-col items-center">
          <div className="max-w-2xl space-y-4">
            <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
              ¿Listo para dar el primer paso? Reserva tu clase de prueba gratis
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              30 minutos gratis al volante con uno de nuestros profesores para que nos conozcas antes de matricularte.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-colors"
                href="/contacto-y-matricula?tab=prueba"
              >
                Reservar Clase de Prueba (30 min gratis)
              </Link>
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-label-lg hover:bg-surface transition-colors"
                href="/precios-y-calculadora"
              >
                Calcular mi presupuesto real
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
