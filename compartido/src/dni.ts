// DNI y NIE españoles: 8 cifras y letra (o X, Y, Z, 7 cifras y letra), y la letra
// tiene que ser la que corresponde a los números.

const LETRAS = "TRWAGMYFPDXBNJZSQVHLCKE";
const FORMATO = /^([0-9]{8}|[XYZ][0-9]{7})[A-Z]$/;

/** Quita espacios y guiones y pasa a mayúsculas: « 12345678-z » → «12345678Z». */
export const normalizarDni = (dni: string) => dni.toUpperCase().replace(/[\s-]/g, "");

export function dniValido(dni: string): boolean {
  const d = normalizarDni(dni);
  if (!FORMATO.test(d)) return false;
  const numero = Number(d.slice(0, 8).replace("X", "0").replace("Y", "1").replace("Z", "2"));
  return LETRAS[numero % 23] === d[8];
}
