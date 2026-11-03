# Diseño · «Luz y Asfalto»

Las reglas del aspecto de la web y de Faro Gestión, sacadas de lo que ya está construido (diseño hecho con
Google Stitch). Una pantalla nueva sigue estas reglas; cambiarlas se pide aparte, como dice `docs/design.md`.

## Overview

Claro, limpio y cercano: fondo azulado muy pálido, texto azul noche y el naranja de la marca (el del faro)
como acento. La web vende con confianza y sin letra pequeña; la gestión es una herramienta de trabajo
tranquila, pensada para el móvil en el caso de profesores y alumnos y para el ordenador en Secretaría.

## Colors

Los mismos tonos en las dos apps; cada una los nombra a su manera (`web/tailwind.config.ts` con nombres de
Material 3, `gestion/tailwind.config.ts` con nombres en español).

| Papel | Color | Web | Gestión |
|---|---|---|---|
| Fondo | `#f8f9ff` | `background`, `surface` | `fondo` |
| Tarjetas | `#ffffff` | `surface-container-lowest` | `superficie` |
| Zonas hundidas | `#eff4ff` | `surface-container-low` | `hundido` |
| Texto principal | `#0b1c30` | `on-surface` | `tinta` |
| Texto secundario | `#4f5b6e` / `#45352f` | `secondary`, `on-surface-variant` | `gris` |
| Marca (naranja) | `#a33900` | `primary` | `faro-600` |
| Marca viva | `#cc4900` | `primary-container` | `faro-500` |
| Tintes de la marca | `#ffdbce`, `#fff6f1` | `primary-fixed` | `faro-200`, `faro-50` |
| Bien / verde | `#006947` | `tertiary` | `verde-600` |
| Aviso / ámbar | `#8f5a00` | — | `ambar-600` |
| Error / rojo | `#ba1a1a` | `error` | `rojo-600` |
| Líneas | `#e3e8f2` | `surface-container-highest` | `linea` |

## Typography

- **Plus Jakarta Sans** (con `next/font`), pesos 400 a 800, en las dos apps.
- Iconos: **Material Symbols Outlined** (una sola familia), cargados desde Google Fonts.
- Cifras alineadas (`.cifra`, números tabulares) en precios, horas y saldos.
- Títulos con el espaciado de letra ligeramente cerrado (`-0.015em`).

## Layout

- Web: secciones a todo el ancho con el contenido centrado (máximo 1280 px) y márgenes laterales de 24 a 48 px.
- Gestión, Secretaría: menú lateral a la izquierda en el ordenador y contenido de hasta 1440 px.
- Gestión, profesores y alumnos: marco de móvil con pestañas abajo.
- Los formularios son de una columna en el móvil y de dos en pantallas anchas.

## Elevation & Depth

Casi plano: las tarjetas se separan del fondo con un borde fino (`linea`) y el color de superficie, no con
sombras. Las sombras se reservan para lo que flota (avisos, ventana del asistente).

## Shapes

- Radios: 6 px por defecto, 8 px en botones y campos, 12 px en tarjetas, 16 px en bloques grandes; las
  píldoras e insignias son redondas del todo.
- Botones de al menos 40 px de alto (32 px los pequeños) para que se pulsen bien con el dedo.

## Components

- Botón principal: fondo naranja de la marca y texto blanco. Secundario: borde fino y fondo blanco.
  Peligro: texto rojo con borde rojo pálido.
- Insignias y semáforo: tinte pálido del color con el texto en su tono oscuro (verde, ámbar, rojo, marca).
- Avisos tras una acción: tarjeta oscura abajo en el centro, verde o roja, que desaparece sola.
- Campos: borde fino, foco con borde naranja y halo naranja pálido.

## Do's and Don'ts

- Sí: el naranja a tope solo en marcas pequeñas (botón principal, dato importante, icono activo); sus
  tintes pálidos hacen el trabajo en las áreas.
- Sí: textos en español de España, cercanos y sin letra pequeña.
- No: colores nuevos fuera de esta tabla, otra familia de iconos ni sombras grandes.
- No: cambiar el diseño de una pantalla existente sin pedirlo.
