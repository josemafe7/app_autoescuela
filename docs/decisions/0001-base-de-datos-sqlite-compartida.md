# 0001 · Base de datos SQLite compartida por la web y la gestión

- **Estado:** aceptada
- **Fecha:** 2026-11-03

## Contexto y problema

La app estaba conectada a Supabase y se quitó. Sin Supabase, cada app guardaba en su propio archivo JSON y
los contactos de la web nunca llegaban a la gestión. Hacía falta una base de datos local, sencilla y común a
las dos, para que cualquiera pueda descargar el proyecto y ejecutarlo sin crear cuentas ni desplegar nada.

## Opciones consideradas

- SQLite en un solo archivo, con el SQLite que trae Node.js.
- Un archivo JSON compartido.
- SQLite con Prisma.

## Decisión

SQLite en un archivo (`datos/faro.db`), con el módulo `node:sqlite` de Node.js: no hay que instalar nada,
aguanta que la web y la gestión escriban a la vez (cada cambio va en una transacción y el otro espera su
turno) y se puede abrir con cualquier visor de SQLite. El esquema está en `compartido/src/esquema.ts`:
tablas con sus columnas, tipos estrictos y claves ajenas; las listas y objetos (niveles, plazas,
conversación…) van como JSON. El JSON compartido se descartó porque dos escrituras a la vez pueden perder
un cambio, y Prisma, porque añade dependencias y un paso de generación que la demo no necesita.

## Consecuencias

- Funciona en local y en un servidor con disco propio; no en plataformas sin disco persistente como Vercel.
- SQLite no tiene usuarios ni Row Level Security: los permisos se comprueban en el código (ver
  `docs/security.md`).
- La gestión lee todos sus datos en cada petición, que es rápido con el tamaño de una autoescuela. Si un día
  creciera mucho, habría que leer solo lo que necesita cada pantalla.
- Requiere Node.js 22.16 o posterior.
