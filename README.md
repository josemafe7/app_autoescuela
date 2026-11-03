# Autoescuela Faro

Demo de una autoescuela de Málaga: la web pública y la app de gestión (Faro Gestión) compartiendo una misma
base de datos local. Se descarga, se arranca en tu ordenador y funciona; solo hace falta la clave de la IA.

- **Web pública** (http://localhost:3000): precios sin letra pequeña, calculadora del coste real, asistente
  con IA que contesta con la ficha de la autoescuela, y formularios de clase de prueba y matrícula.
- **Faro Gestión** (http://localhost:3001): Secretaría (agenda, cobros, colas de prácticas y de examen,
  coches, tarifas e interesados que llegan de la web), profesores (su día y la evaluación por voz con IA) y
  alumnos (reservas, monedero de prácticas, lista de espera y progreso).

Lo que se envía desde la web aparece al momento en la gestión, porque las dos usan el mismo archivo de base
de datos: `datos/faro.db`.

## Cómo arrancarlo

Hace falta tener instalado:

- **Node.js 24 LTS** o más nuevo (sirve desde la 22.16): https://nodejs.org
- **pnpm**: si no lo tienes, `npm install -g pnpm`

Los pasos, desde la carpeta del proyecto:

```bash
pnpm install
```

```bash
cp -n .env.example .env.local
```

(Si ya tienes un `.env.local`, no lo toca.) Abre `.env.local` y pon tu clave de OpenRouter en `OPENROUTER_API_KEY` (se consigue en
https://openrouter.ai/keys). Es opcional: sin ella todo funciona, el asistente contesta con la ficha de la
autoescuela y los profesores rellenan la evaluación a mano.

```bash
pnpm dev
```

Y abre http://localhost:3000 (la web) y http://localhost:3001 (la gestión). La primera vez la base de datos
se crea sola con los datos de ejemplo.

Las fechas de los datos de ejemplo se calculan alrededor del día en que se crean (prácticas de ayer sin
cerrar, recordatorios para mañana, un examen en dos semanas…). Si vuelves a la demo otro día, déjala como
nueva con:

```bash
pnpm seed
```

Consejo: en el panel de OpenRouter pon un límite de gasto mensual a la clave. La app ya limita cuántas
preguntas se pueden hacer seguidas, pero así el gasto nunca te dará sustos.

## Cómo probarla

Todas las cuentas de prueba usan la contraseña **`Faro2026!`**. Son inventadas y solo existen en la base de
datos de la demo.

| Perfil | Correo |
|---|---|
| Secretaría | `secretaria@autoescuelafaro.es` |
| Profesora Ana | `ana.morales@autoescuelafaro.es` |
| Profesor Luis | `luis.ortega@autoescuelafaro.es` |
| Profesora Marta | `marta.ruiz@autoescuelafaro.es` |
| Alumna en prácticas (con prácticas en el monedero) | `lucia.fernandez@correo.es` |
| Alumno en lista de espera | `ruben.vidal@correo.es` |
| Alumno sin prácticas pagadas | `noelia.cabrera@correo.es` |
| Alumno en el teórico | `pablo.jimenez@correo.es` |

Cada alumno entra con el correo de su ficha (lo ve Secretaría). Los alumnos que dé de alta Secretaría
entran también con esa contraseña.

Un recorrido para enseñarla:

1. En la web, pide una clase de prueba desde «Contacto y matrícula» o deja tu teléfono al asistente.
2. Entra en la gestión como Secretaría: el contacto aparece en «Interesados» y lo puedes convertir en alumno.
3. Entra como Ana: cierra una práctica de ayer dictando la evaluación (con la clave de la IA puesta).
4. Entra como Lucía: reserva una práctica, mira tu progreso y tu monedero.

## Cómo se trabaja en este proyecto

Se construye por fases con un agente de código. Lo que el agente cumple sin que se lo pidan está en
`AGENTS.md` y en `docs/`. Esto es lo que se le pide en cada momento:

| Cuándo | Qué se le pide |
|---|---|
| Para cambiar el aspecto | «Quiero cambiar el diseño. Sigue docs/design.md.» |
| Al volver con el diseño hecho fuera | «Ya he dejado el diseño en docs/design/. Léelo y dime qué has entendido.» |
| Al empezar cada fase, en una conversación nueva | «Vamos con la fase 2 de docs/spec.md. Propón un plan.» |
| Si la conversación se llena a mitad de una fase | En una conversación nueva: «Sigue con la fase 2 de docs/spec.md.» |
| Si algo no funciona | Lo que se ve y lo que se esperaba: «Al pulsar Guardar no pasa nada; esperaba ver el contacto en la lista.» |
| Al acabar una fase | «Cierra la fase 2.» |
| Para un retoque: un texto, un color, un botón que se mueve | Se pide tal cual, sin más: «Cambia el título de la portada por…» |
| Para añadir o cambiar algo | «Quiero que la app también…» o «Quiero que esto funcione de otra forma»: primero cambia la especificación y después se construye |
| Para que el agente cumpla algo siempre | «Añade a las reglas de AGENTS.md: …» |
| Para que otro revise una fase, en una conversación nueva | «Revisa la fase 1 siguiendo docs/review.md. No cambies nada.» |
| Antes de publicar, en una conversación nueva | «Revisa el proyecto contra docs/security.md.» |
| Para publicar la app o una versión nueva | «Quiero publicar la app.» |
| Cada mes o dos, con la app publicada | «Haz el mantenimiento.» |

## Documentación

Todo lo demás está en `docs/`.
