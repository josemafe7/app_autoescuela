import { leer } from "@/lib/db";
import { exigirSecretaria } from "@/lib/perfil";
import { estadoClave } from "@/lib/ia";
import { MODELO_IA_POR_DEFECTO } from "@/lib/tipos";
import { Cabecera, Icono, Insignia } from "@/components/ui";
import { SelectorModelo } from "@/components/SelectorModelo";

export default async function Ajustes() {
  await exigirSecretaria();
  const db = await leer();
  const clave = estadoClave();

  return (
    <div className="max-w-[1100px]">
      <Cabecera titulo="Ajustes" subtitulo="Configuración de la inteligencia artificial que convierte en evaluación las notas que dictan los profesores." />

      <div className="flex flex-col divide-y divide-linea">
        <Fila
          titulo="Clave de OpenRouter"
          descripcion="Vive solo en el servidor, en el archivo .env.local del proyecto: nunca llega al navegador ni a GitHub. Aquí solo se ven sus cuatro últimos caracteres."
        >
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {clave.configurada ? (
              <>
                <Insignia tono="verde"><Icono nombre="lock" className="!text-[14px]" /> Configurada</Insignia>
                <span className="cifra text-gris">sk-or-••••••••{clave.final}</span>
              </>
            ) : (
              <Insignia tono="ambar">Sin clave: la evaluación se rellena a mano</Insignia>
            )}
          </div>
          <p className="ayuda mt-3">
            {clave.configurada ? "Para cambiarla" : "Para activarla"}, escribe <span className="cifra">OPENROUTER_API_KEY=sk-or-…</span> en
            el archivo <span className="cifra">.env.local</span> de la carpeta del proyecto y vuelve a arrancar la app. La clave se
            consigue en openrouter.ai, en el apartado «Keys».
          </p>
        </Fila>

        <Fila
          titulo="Modelo de IA"
          descripcion={`Busca cualquier modelo de OpenRouter y compara su precio. Por defecto: ${MODELO_IA_POR_DEFECTO}, rápido y barato para esta tarea.`}
        >
          <SelectorModelo actual={db.ajustes.modeloIA} />
        </Fila>
      </div>
    </div>
  );
}

function Fila({ titulo, descripcion, children }: { titulo: string; descripcion: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 py-8 first:pt-0 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-10">
      <div>
        <h2 className="text-base font-semibold">{titulo}</h2>
        <p className="mt-1 break-words text-sm text-gris">{descripcion}</p>
      </div>
      <div className="min-w-0 rounded-2xl bg-hundido p-4 sm:p-5">{children}</div>
    </section>
  );
}
