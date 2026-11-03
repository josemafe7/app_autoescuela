// Deja la demo como recién instalada (pnpm seed): datos de ejemplo con fechas
// alrededor de hoy y las cuentas de prueba. Borra lo que hubiera, también los
// contactos de la web y las sesiones abiertas. Nunca donde haya datos reales.

import { rutaBD } from "@faro/compartido";
import { restablecer } from "../src/lib/db";
import { CONTRASENA_DEMO, CUENTAS_PERSONAL } from "../src/lib/usuarios";

async function main() {
  await restablecer();
  console.log(`Datos de demostración cargados en ${rutaBD()}`);
  console.log(`Cuentas de prueba (contraseña «${CONTRASENA_DEMO}»):`);
  for (const c of CUENTAS_PERSONAL) console.log(`  ${c.rol.padEnd(10)} ${c.email}`);
  console.log("  alumnos    su correo de la ficha, por ejemplo lucia.fernandez@correo.es");
}

main().catch((e) => {
  console.error("No se han podido cargar los datos:", e instanceof Error ? e.message : e);
  process.exit(1);
});
