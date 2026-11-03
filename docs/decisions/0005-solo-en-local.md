# 0005 · La demo se usa solo en local

- **Estado:** aceptada
- **Fecha:** 2026-11-03

## Contexto y problema

El proyecto es una demo para el curso: tiene que poder descargarse y ejecutarse sin desplegar nada en
ningún sitio.

## Opciones consideradas

- En local, sin publicar.
- Publicarla en un VPS con Dokploy.
- Publicarla en Vercel.

## Decisión

En local. Las dos apps se arrancan con `--hostname localhost`, así que solo se abren desde el propio
ordenador.

## Consecuencias

- Se aplica «Si se usa solo en local» de `docs/security.md`; lo de publicar espera a que se decida.
- Publicarla más adelante es una decisión nueva: SQLite necesita un servidor con disco propio (no Vercel).
