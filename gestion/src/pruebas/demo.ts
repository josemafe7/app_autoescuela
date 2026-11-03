// Base de datos temporal con la demo cargada, para las pruebas. Se siembra una
// vez por archivo de pruebas y cada prueba trabaja sobre su propia copia.

import fs from "node:fs";
import { abrirBD, cerrarBD } from "@faro/compartido";
import { usarBDTemporal } from "@faro/compartido/pruebas";
import { baseDatos } from "@/lib/db";

let plantilla: string | null = null;

export function usarDemoTemporal(): string {
  if (!plantilla) {
    plantilla = usarBDTemporal();
    baseDatos();
    abrirBD().exec("PRAGMA wal_checkpoint(TRUNCATE)");
    cerrarBD();
  }
  const ruta = usarBDTemporal();
  fs.copyFileSync(plantilla, ruta);
  return ruta;
}
