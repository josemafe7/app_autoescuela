# Diseño · «Luz y Asfalto»

Las reglas del aspecto de la web y de Faro Gestión. La web sigue el diseño hecho con Google Stitch; la gestión
se rehízo con la skill de diseño (`design-taste-frontend`, estilo «hoja sobre marco») manteniendo los mismos
colores y la misma letra. Una pantalla nueva sigue estas reglas; cambiarlas se pide aparte, como dice
`docs/design.md`.

## Overview

Claro, limpio y cercano: texto azul noche y el naranja de la marca (el del faro) como acento. La web vende con
confianza y sin letra pequeña. La gestión es una herramienta de trabajo tranquila: el menú y la barra de arriba
forman un marco gris azulado, el asfalto, y el trabajo va encima en una hoja blanca; la luz del faro, el
naranja, solo se enciende en los datos que importan y en la acción principal. Secretaría la usa en el
ordenador durante horas; profesores y alumnos, sobre todo en el móvil.

## Colors

Los mismos tonos en las dos apps; cada una los nombra a su manera (`web/tailwind.config.ts` con nombres de
Material 3, `gestion/tailwind.config.ts` con nombres en español).

| Papel | Color | Web | Gestión |
|---|---|---|---|
| Fondo de la web | `#f8f9ff` | `background`, `surface` | `fondo` (solo para el paso del ratón) |
| Marco: menú y barra de arriba | `#eef1f6` | — | `marco` |
| Hoja y tarjetas | `#ffffff` | `surface-container-lowest` | `superficie` |
| Zonas hundidas dentro de la hoja | `#f3f5f9` | — | `hundido` |
| Sección abierta del menú | `#e1e6ee` | — | `activo` |
| Texto principal | `#0b1c30` | `on-surface` | `tinta` |
| Texto secundario | `#4f5b6e` | `secondary` | `gris` |
| Texto terciario (4,5:1 también sobre el marco) | `#5f6b7f` | — | `tenue` |
| Marca (naranja) | `#a33900` | `primary` | `faro-600` |
| Marca viva | `#cc4900` | `primary-container` | `faro-500` |
| Tintes de la marca | `#ffdbce`, `#fff6f1` | `primary-fixed` | `faro-200`, `faro-50` |
| Bien / verde | `#006947` | `tertiary` | `verde-600` |
| Aviso / ámbar | `#8f5a00` | — | `ambar-600` |
| Error / rojo | `#ba1a1a` | `error` | `rojo-600` |
| Líneas | `#e5e9f0` | `surface-container-highest` | `linea` |
| Borde de botones y campos | `#cfd6e0` | — | `control` |

## Typography

- **Plus Jakarta Sans** (con `next/font`), pesos 400 a 800, en las dos apps.
- Iconos: **Material Symbols Outlined** (una sola familia), cargados desde Google Fonts; en la gestión, de
  contorno y en gris, nunca dentro de un cuadrado de color.
- Cifras alineadas (`.cifra`, números tabulares) en precios, horas y saldos.
- Gestión: título de pantalla a 24 px, títulos de bloque a 16 px, texto a 14-15 px, etiquetas a 12-13 px.
  Nada por debajo de 11 px. Los campos van a 16 px en el móvil para que el iPhone no amplíe la pantalla.
- Títulos con el espaciado de letra ligeramente cerrado (`-0.015em`).

## Layout

- Web: secciones a todo el ancho con el contenido centrado (máximo 1280 px) y márgenes laterales de 24 a 48 px.
- Gestión en el ordenador (`components/Marco.tsx`): menú lateral de 236 px y barra de arriba de 56 px sobre el
  marco, sin raya entre ellos. La barra lleva la fecha, la cuenta y el botón de salir; en Secretaría, también el
  buscador de alumnos. La hoja blanca queda a 8 px del borde derecho e inferior de la ventana, con el
  contenido a 32 px del borde de la hoja.
- Gestión en el móvil: el marco desaparece y la hoja ocupa la pantalla, con la barra de arriba sobre el marco.
  Secretaría abre el menú desde esa barra; profesores y alumnos tienen pestañas abajo.
- Profesores y alumnos, en el ordenador: el mismo marco, con su contenido en una columna centrada de 768 px.
- Cada pantalla empieza con su título (`h1`, un sustantivo) y, debajo, una línea con lo que hay que mirar hoy.
- Los bloques que comparten fila terminan a la misma altura: se reparten las listas en columnas que acaben a
  la par, en vez de dejar tarjetas de alturas distintas.
- Los formularios son de una columna en el móvil y de dos en pantallas anchas.

## Elevation & Depth

Plano: el marco, la hoja y las tarjetas se separan por un paso de tono y un borde fino (`linea`), nunca con
sombras. Solo flota lo que flota de verdad: el menú del móvil, los avisos tras una acción y la ventana del
asistente.

## Shapes

- Radios que bajan al anidar: 16 px la hoja, 10 px las tarjetas, 8 px botones y campos, 6 px por defecto; las
  píldoras e insignias, redondas del todo.
- Botones de al menos 40 px de alto (32 px los pequeños) para que se pulsen bien con el dedo.

## Components

- Botón principal: fondo naranja de la marca y texto blanco, uno por pantalla. Secundario: fondo blanco con el
  borde `control`; es el de las acciones de cada fila. Peligro: texto rojo con borde rojo pálido.
- Menú: la sección abierta es una píldora gris con el texto en tinta; los contadores son un número en una
  pastilla blanca, sin color. En las pestañas del móvil, la abierta va en tinta con una raya naranja encima.
- Insignias y semáforo: tinte pálido del color con el texto en su tono oscuro (verde, ámbar, rojo, marca).
- Avisos dentro de la pantalla (`Alerta`): tarjeta blanca con el color solo en el icono; el ámbar, que pide
  atención, lleva además su tinte pálido.
- Bloque vacío (`Vacio`): el mismo sitio, con un borde discontinuo y una frase; sin dibujos ni fondos.
- La cinta del día (`CintaDia`), la pieza propia de la gestión: cada estado con su marca. Reservada, en tinte
  naranja; realizada, en gris oscuro; sin cerrar, con borde ámbar; no se presentó, con trama roja; hueco
  ofrecido, con borde naranja discontinuo; libre, en gris suave. La leyenda usa las mismas marcas.
- El monedero del alumno: una tira con una casilla por práctica comprada (hechas, perdidas, reservadas y por
  reservar) y su leyenda debajo.
- Avisos tras una acción: tarjeta oscura abajo en el centro, verde o roja, que desaparece sola.
- Campos: borde `control`, foco con borde naranja y halo naranja pálido.

## Do's and Don'ts

- Sí: el naranja a tope solo en marcas pequeñas (botón principal, la tira del monedero, la raya de la pestaña
  abierta, las reservas de la cinta); sus tintes pálidos hacen el trabajo en las áreas de datos.
- Sí: el rojo como señal, una vez por cosa; las cantidades que se deben van en tinta, no en rojo.
- Sí: textos en español de España, cercanos y sin letra pequeña.
- No: el naranja en el marco (menú, contadores, barra de arriba) ni bloques enteros de color para avisar.
- No: colores nuevos fuera de esta tabla, otra familia de iconos, sombras en lo que no flota ni degradados.
- No: cambiar el diseño de una pantalla existente sin pedirlo.
