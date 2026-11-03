// Lo que llega de los formularios y del asistente se comprueba aquí, en el servidor,
// antes de guardar nada. Los códigos de los formularios se guardan con su texto
// legible, para que Secretaría los entienda en la gestión.

import { z } from "zod";
import { dniValido, normalizarDni } from "@faro/compartido";

export const MAX_MENSAJES_USUARIO = 10;
const MAX_TEXTO_USUARIO = 1000;
const MAX_TEXTO_ASISTENTE = 4000;
// Las mismas edades que deja elegir el formulario.
const EDAD_MINIMA = 17;
const EDAD_MAXIMA = 85;

const nombre = z
  .string()
  .trim()
  .min(2, "Por favor, indica tu nombre.")
  .max(80, "El nombre es demasiado largo.");

const telefono = z
  .string()
  .trim()
  .max(20, "Escribe un teléfono válido.")
  .refine((t) => /^[+\d\s().-]+$/.test(t) && t.replace(/\D/g, "").length >= 9, "Escribe un teléfono válido (al menos 9 cifras).");

/** Convierte el código de un desplegable en su texto; cualquier otro valor se rechaza. */
const opcion = <const T extends Record<string, string>>(textos: T, error: string) =>
  z.enum(Object.keys(textos) as [keyof T & string, ...(keyof T & string)[]], error).transform((k) => textos[k]);

const ZONAS = { teatinos: "Teatinos / Universidad", centro: "Centro / Alameda" };
const EXPERIENCIA = { nunca: "Ninguna", algo: "Algo (prácticas previas)", traslado: "Viene de otra autoescuela" };
const FRANJAS = { manana: "Mañanas (08:00 - 13:30)", mediodia: "Mediodía (13:30 - 16:30)", tarde: "Tardes (16:30 - 21:00)" };
const PACKS = {
  solo_matricula: "Solo matrícula",
  mat_bono10: "Matrícula + bono de 10",
  mat_bono20: "Matrícula + bono de 20",
  traslado: "Traslado de expediente",
};
const PAGOS = { pago_unico: "Un pago", dos_plazos: "Dos plazos" };

const diaPreferido = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Elige un día válido.")
  .refine((f) => !Number.isNaN(new Date(`${f}T12:00:00`).getTime()), "Elige un día válido.")
  .transform((f) =>
    new Date(`${f}T12:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }),
  );

export const esquemaClasePrueba = z.strictObject({
  origen: z.literal("clase_prueba"),
  nombre,
  telefono,
  edad: z
    .number("Indica tu edad.")
    .int()
    .min(EDAD_MINIMA, `Indica una edad entre ${EDAD_MINIMA} y ${EDAD_MAXIMA} años.`)
    .max(EDAD_MAXIMA, `Indica una edad entre ${EDAD_MINIMA} y ${EDAD_MAXIMA} años.`),
  zona: opcion(ZONAS, "Elige una zona."),
  experienciaPrevia: opcion(EXPERIENCIA, "Elige tu experiencia."),
  diaPreferido: diaPreferido.optional(),
  franjaHoraria: opcion(FRANJAS, "Elige una franja horaria."),
});

export const esquemaMatricula = z.strictObject({
  origen: z.literal("matricula"),
  nombre,
  telefono,
  dni: z
    .string()
    .trim()
    .transform(normalizarDni)
    .refine(dniValido, "El DNI o NIE no es válido: revisa los números y la letra."),
  email: z.string().trim().max(120, "El correo es demasiado largo.").pipe(z.email("Escribe un correo electrónico válido.")),
  packElegido: opcion(PACKS, "Elige un pack."),
  modalidadPago: opcion(PAGOS, "Elige cómo quieres pagar."),
});

/** Formularios de la página «Contacto y matrícula». */
export const esquemaFormularioWeb = z.discriminatedUnion("origen", [esquemaClasePrueba, esquemaMatricula]);

const mensaje = z
  .strictObject({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(MAX_TEXTO_ASISTENTE),
    timestamp: z.string().max(40).optional(),
  })
  .refine((m) => m.role !== "user" || m.content.length <= MAX_TEXTO_USUARIO, "El mensaje es demasiado largo.");

/** Lo que manda la ventana del asistente. */
export const esquemaChat = z.strictObject({
  messages: z
    .array(mensaje)
    .min(1)
    .max(2 * MAX_MENSAJES_USUARIO + 2),
  sessionId: z.string().regex(/^[\w-]{1,64}$/).optional(),
  datosContacto: z.strictObject({ nombre, telefono }).optional(),
});

/** Primer error, en un texto que se puede enseñar a la persona. */
export function primerError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Revisa los datos e inténtalo de nuevo.";
}
