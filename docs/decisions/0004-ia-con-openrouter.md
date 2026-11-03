# 0004 · IA con OpenRouter y la clave solo en .env.local

- **Estado:** aceptada
- **Fecha:** 2026-11-03

## Contexto y problema

La app ya usaba OpenRouter para el asistente de la web y la evaluación por voz. La clave podía pegarse en la
pantalla de Ajustes, que la guardaba en un archivo del servidor; las reglas del proyecto dicen que las claves
van solo en `.env.local`.

## Opciones consideradas

- Clave solo en `.env.local`; Ajustes enseña si está puesta.
- Mantener el campo para pegarla desde la app, como excepción.

## Decisión

OpenRouter, llamado solo desde el servidor, con la clave en el `.env.local` de la raíz, que comparten las
dos apps. Ajustes enseña si está puesta (sus 4 últimos caracteres) y cómo ponerla, y sigue permitiendo
elegir el modelo de la evaluación. Con una sola clave se puede usar cualquier modelo; el de por defecto es
`anthropic/claude-haiku-5.5`, rápido y barato para estas tareas.

## Consecuencias

- Cambiar la clave obliga a reiniciar la app.
- Sin clave, todo funciona: el asistente contesta con la ficha y la evaluación se rellena a mano.
