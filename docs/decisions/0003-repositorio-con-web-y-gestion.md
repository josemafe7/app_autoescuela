# 0003 · Un repositorio con la web y la gestión, en un espacio de trabajo de pnpm

- **Estado:** aceptada
- **Fecha:** 2026-11-03

## Contexto y problema

La carpeta del curso tiene mucho más que las apps (vídeos, propuesta comercial, expedientes, zips). Al
repositorio solo tienen que ir la web y la gestión, y tienen que poder instalarse y arrancarse juntas.

## Opciones consideradas

- Mover `web/` y `gestion/` a una carpeta nueva, `autoescuela-faro/`, que es el repositorio.
- Dejar el repositorio en la carpeta del curso con un `.gitignore` que solo deje pasar las dos apps.

## Decisión

La carpeta nueva, con un espacio de trabajo de pnpm: `web/`, `gestion/` y `compartido/` (la base de datos
común). Un solo `pnpm install` y un solo `pnpm dev` para las dos apps, un solo `.env.local` y un solo
`AGENTS.md`, que no manda sobre el resto del material del curso.

## Consecuencias

- El README general del curso apunta a `autoescuela-faro/`.
- pnpm es obligatorio (`npm install -g pnpm` si no está).
