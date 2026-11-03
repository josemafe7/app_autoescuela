import Image from "next/image";
import { redirect } from "next/navigation";
import { perfilActual } from "@/lib/perfil";
import { FormLogin } from "@/components/FormLogin";

const DESTINO = {
  secretaria: "/secretaria",
  profesor: "/profesor",
  alumno: "/alumno",
} as const;

export default async function PaginaAcceso() {
  const perfil = await perfilActual();
  if (perfil) {
    redirect(DESTINO[perfil.rol]);
  }

  return (
    <main className=" flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <header className="mb-8 text-center">
          <Image
            src="/logo-faro-oscuro.png"
            alt="Autoescuela Faro"
            width={168}
            height={48}
            className="mx-auto h-11 w-auto"
            priority
          />
          <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">Faro Gestión</h1>
          <p className="mt-1.5 text-[0.9375rem] text-gris">
            Portal de alumnos, profesores y secretaría de Autoescuela Faro
          </p>
        </header>

        <FormLogin />
      </div>
    </main>
  );
}
