# Convenciones de código

Cómo está montado el proyecto y cómo se escribe y se organiza el código para que se pueda mantener.

## El proyecto

Ya está creado: es un espacio de trabajo de pnpm (`pnpm-workspace.yaml`) con tres partes, que se instalan
juntas con un solo `pnpm install` desde la raíz:

- `web/`: la web pública (Next.js, puerto 3000).
- `gestion/`: Faro Gestión (Next.js, puerto 3001).
- `compartido/`: la base de datos compartida y lo que usan las dos (paquete `@faro/compartido`, en
  TypeScript; Next.js lo compila con `transpilePackages`).

Si algún día hiciera falta una app nueva, se crea con `pnpm create next-app` en una carpeta temporal, se trae
aquí y se añade a `pnpm-workspace.yaml`, con su `next.config.ts` como el de las otras dos (cabeceras de
seguridad, `--hostname localhost` y el `.env.local` de la raíz).

## Documentación de las librerías

Antes de instalar, actualizar o escribir código con una librería, consulta su documentación actual con
Context7:

- Busca el identificador de la librería con `resolve-library-id` (o `ctx7 library`), salvo que ya lo sepas.
- Pide la documentación con `query-docs` (o `ctx7 docs`): una pregunta concreta y la versión de `package.json`.
- En Next.js manda la documentación del paquete instalado (`node_modules/next/dist/docs/`).
- Si no tienes Context7, dímelo y usa la documentación oficial.

## Principios

- Lo más simple que resuelva lo pedido. Nada de capas, abstracciones ni opciones «por si acaso».
- Antes de crear algo, se busca si ya existe y se reutiliza: una misma lógica no se escribe dos veces.
- Cada cambio toca solo lo necesario y sigue el estilo del código que ya hay, aunque haya otra forma válida.
- El código que deja de usarse se borra, no se comenta.

## Organización

- `src/app/`: rutas, páginas, layouts y Route Handlers de cada app. Tienen poca lógica: la piden a otras
  carpetas.
- `gestion/src/app/acciones/`: las Server Actions. Son finas: validan con Zod (`campo` y `leerFormulario`
  de `src/lib/acciones-util.ts`), comprueban quién las hace y llaman a `mutar()`.
- `src/components/`: componentes compartidos de cada app. No se usa shadcn/ui: los estilos son los de
  `DESIGN.md`, puestos una sola vez como tema en `tailwind.config.ts` y `globals.css`.
- `src/lib/`: utilidades y acceso a datos. En la gestión, `db.ts` (leer y guardar), `perfil.ts` (quién es),
  `reglas.ts` (las reglas de la autoescuela, sin efectos) y `seed.ts` (los datos de ejemplo). Lo que solo
  corre en el servidor empieza con `import "server-only"`.
- `compartido/src/`: el esquema de la base de datos (`esquema.ts`), la conexión (`bd.ts`), los contactos de
  la web (`interesados.ts`) y los límites de peticiones (`peticiones.ts`).
- La base de datos cambia solo desde `compartido/src/esquema.ts`: cada tabla y su conversión salen de ahí, y
  no se escribe SQL suelto para crear o cambiar tablas. Al cambiar el esquema se sube `ESQUEMA_VERSION` y la
  base de datos de la demo se vuelve a crear (solo tiene datos inventados). Con datos reales, antes se
  decide cómo migrar sin perderlos.
- Los datos de ejemplo están en `gestion/src/lib/seed.ts` y se cargan con `pnpm seed`: datos realistas del
  negocio y un usuario de prueba de cada tipo (en `gestion/src/lib/usuarios.ts`). Lo usan las pruebas, la
  demo y quien descargue el proyecto. No se crea una segunda base de datos ni un modo de demostración
  aparte: la app es la misma, con datos de ejemplo.
- Componentes de servidor por defecto. `'use client'` solo en los que necesitan interacción, y lo más abajo
  posible en el árbol.

## TypeScript y nombres

- Modo estricto. Nada de `any`: si no se conoce el tipo, `unknown`, y se valida. Nada de `@ts-ignore` ni de
  desactivar ESLint sin un comentario que explique por qué.
- Los tipos de lo que entra (formularios, API) salen de los esquemas de Zod.
- Excepción de este proyecto: el código ya estaba escrito con nombres en español (`leer`, `mutar`,
  `alumnos`, `reglas`…) y se sigue así para no mezclar idiomas. Los textos que ve el usuario, en español de
  España. Nombres que dicen qué hacen: `practicasSinCerrar`, no `datos`.
- Archivos en minúsculas con guiones (`acciones-util.ts`) y componentes en PascalCase (`FormPago`).
- Funciones cortas que hacen una sola cosa. Un archivo que pasa de unas 300 líneas o mezcla temas se divide.
- Nada de números ni textos sueltos repetidos: constantes con nombre.

## Errores y estilo

- Los errores esperados (datos no válidos, «no encontrado», sin permiso) se lanzan como `ErrorUsuario` y se
  explican al usuario con un aviso; los inesperados se registran y el usuario solo ve un mensaje genérico.
  Nunca un `catch` vacío ni un error ignorado.
- Los comentarios explican el porqué, no el qué. Sin código comentado ni `console.log` de depuración en lo
  que se sube.
