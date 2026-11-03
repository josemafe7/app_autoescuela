// Cada archivo de pruebas usa su propia base de datos en una carpeta temporal:
// nunca la de la demo (datos/faro.db).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { cerrarBD } from "../bd";

export function usarBDTemporal(): string {
  const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "faro-pruebas-"));
  const ruta = path.join(carpeta, "faro.db");
  cerrarBD();
  process.env.FARO_DB = ruta;
  return ruta;
}
