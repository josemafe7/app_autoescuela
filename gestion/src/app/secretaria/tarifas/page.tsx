import { leer } from "@/lib/db";
import { exigirSecretaria } from "@/lib/perfil";
import { Cabecera } from "@/components/ui";
import { BotonEnviar } from "@/components/BotonEnviar";
import { guardarTarifas } from "@/app/acciones/gestion";
import { eurCorto } from "@/lib/formato";

const DESCRIPCION: Record<string, string> = {
  matricula: "Incluye el curso teórico y la app de test. Admite dos plazos.",
  suelta: "Una clase de 45 minutos. También es el precio de una práctica dada sin saldo.",
  bono: "Suma las prácticas al monedero en cuanto se paga el primer plazo. Admite dos plazos.",
  examen: "Coche y profesor el día del examen. Se paga por cada intento.",
  tasa: "Tasa oficial de la DGT: da 2 convocatorias. Sin gastos de gestión al renovarla.",
};

export default async function Tarifas() {
  await exigirSecretaria();
  const db = await leer();
  const bono10 = db.tarifas.find((t) => t.id === "t_bono10");
  const bono20 = db.tarifas.find((t) => t.id === "t_bono20");
  return (
    <div className="max-w-3xl">
      <Cabecera
        titulo="Tarifas"
        subtitulo="Los precios que se usan al registrar pagos. Cambiarlos no modifica los pagos que ya están apuntados."
      />
      <form action={guardarTarifas} className="flex flex-col gap-6">
        <div className="tarjeta divide-y divide-linea">
          {db.tarifas.map((t) => (
            <div key={t.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_140px] sm:items-start">
              <div>
                <label htmlFor={`concepto_${t.id}`} className="sr-only">Concepto</label>
                <input id={`concepto_${t.id}`} name={`concepto_${t.id}`} defaultValue={t.concepto} className="campo font-semibold" required />
                <p className="ayuda mt-1.5">
                  {DESCRIPCION[t.tipo]}
                  {t.practicas > 1 && ` Sale a ${eurCorto(Math.round((t.precio / t.practicas) * 100) / 100)} la práctica.`}
                </p>
              </div>
              <div className="relative">
                <label htmlFor={`precio_${t.id}`} className="sr-only">Precio de {t.concepto}</label>
                <input
                  id={`precio_${t.id}`}
                  name={`precio_${t.id}`}
                  defaultValue={String(t.precio).replace(".", ",")}
                  inputMode="decimal"
                  className="campo cifra pr-8 text-right font-semibold"
                  required
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gris">€</span>
              </div>
            </div>
          ))}
        </div>
        {bono10 && bono20 && (
          <p className="ayuda">
            Con 20 prácticas y aprobando a la primera, el carnet sale por{" "}
            {eurCorto(
              Math.round(
                (db.tarifas.find((t) => t.tipo === "matricula")!.precio + bono20.precio + db.tarifas.find((t) => t.tipo === "examen")!.precio + db.tarifas.find((t) => t.tipo === "tasa")!.precio) * 100,
              ) / 100,
            )}{" "}
            más el psicotécnico (unos 35 €, en un centro de reconocimiento).
          </p>
        )}
        <div>
          <BotonEnviar>Guardar tarifas</BotonEnviar>
        </div>
      </form>
    </div>
  );
}
