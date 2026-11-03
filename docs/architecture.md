# Arquitectura

## Visión general

Dos apps de Next.js que se arrancan juntas con `pnpm dev` y comparten una base de datos SQLite, un solo
archivo en `datos/faro.db`. La web pública guarda lo que envían los visitantes; la gestión lo lee y
gestiona todo lo demás. Ninguna habla con la otra directamente: se encuentran en la base de datos. Lo único
que sale del ordenador son las llamadas a la IA (OpenRouter), siempre desde el servidor.

## Piezas

| Pieza | Qué hace | Con qué está hecha |
|---|---|---|
| `web/` | Web pública: páginas, calculadora, asistente y formularios (puerto 3000) | Next.js 15, Tailwind CSS 3 |
| `web/src/app/api/interesados` | Recibe los formularios, los valida y los guarda | Route Handler, Zod |
| `web/src/app/api/chat` | El asistente: valida, limita el uso, pregunta a la IA o contesta con la ficha | Route Handler, Zod, OpenRouter |
| `web/data/info-autoescuela-faro.md` | La ficha de la autoescuela: lo único que puede contar el asistente | Markdown |
| `gestion/` | Faro Gestión para Secretaría, profesores y alumnos (puerto 3001) | Next.js 15, Tailwind CSS 3 |
| `gestion/src/lib/auth.ts` y `perfil.ts` | Inicio de sesión, sesiones y comprobación del perfil en cada página y acción | Node.js (scrypt), cookies de Next.js |
| `gestion/src/lib/db.ts` | Lee y guarda los datos de la gestión en la base de datos compartida | SQLite |
| `gestion/src/lib/reglas.ts` | Las reglas de la autoescuela: monedero, deudas, semáforo, colas, huecos y caza-huecos | TypeScript |
| `gestion/src/lib/seed.ts` | Los datos de demostración, con fechas alrededor de hoy | TypeScript |
| `gestion/src/lib/ia.ts` | La evaluación por voz con IA | OpenRouter |
| `gestion/src/app/acciones/` | Lo que pasa al pulsar cada botón: valida, comprueba el permiso y guarda | Server Actions, Zod |
| `compartido/` | La base de datos compartida (esquema, conexión, interesados) y los límites de peticiones | SQLite de Node.js |
| `datos/faro.db` | El archivo de la base de datos. Se crea solo y no se sube a Git | SQLite |
| `e2e/` | Los recorridos de Playwright | Playwright |

## Cómo viajan los datos

**Un formulario de la web.** La persona envía la clase de prueba → `POST /api/interesados` comprueba que
sale de la propia web, que esa IP no ha enviado más de 5 en una hora y que los datos son válidos (Zod) →
`guardarInteresado()` lo escribe en la tabla `interesados` de `datos/faro.db` → la próxima vez que
Secretaría abre Interesados, la gestión lo lee del mismo archivo.

**El asistente.** Cada mensaje va a `POST /api/chat` con la conversación → se valida (solo mensajes de la
persona y del asistente, con tamaño máximo) y se comprueban los límites → el servidor pregunta a OpenRouter
con las reglas y la ficha (o contesta con la ficha si no hay clave) → si en la conversación hay un
teléfono, se guarda el interesado con la conversación.

**Una acción en la gestión.** La persona pulsa un botón → la Server Action valida el formulario (Zod) y
comprueba en el servidor quién es (su sesión en la tabla `sesiones`) y si puede tocar ese dato → `mutar()`
abre una transacción, lee los datos, aplica el cambio y escribe solo las filas que han cambiado; si algo
falla, no se guarda nada → vuelve a la pantalla con un aviso de éxito o de error.

**Al arrancar por primera vez.** La primera app que abre `datos/faro.db` crea las tablas; la gestión, al
ver que no hay datos de ejemplo, los carga junto con las cuentas de prueba (conservando lo que la web ya
hubiera guardado).

## Servicios externos

- **OpenRouter** (opcional): da acceso a los modelos de IA con una sola clave. Lo usan el asistente de la
  web y la evaluación por voz. Sin clave, la app funciona igual con respuestas de la ficha y evaluación a
  mano.
- **Google Fonts:** la fuente de iconos (Material Symbols) se carga desde Google; Plus Jakarta Sans la
  descarga Next.js al compilar.
- **Imágenes de la web:** las fotos de la web pública están en un servidor de Google
  (`lh3.googleusercontent.com`), donde las dejó la herramienta de diseño.
