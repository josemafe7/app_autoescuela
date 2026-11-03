"use client";

import { useFormStatus } from "react-dom";

/** Botón de envío que se desactiva mientras se guarda y, si se pide, confirma antes. */
export function BotonEnviar({
  children,
  className = "btn-primario",
  confirmar,
  pendiente = "Guardando…",
  name,
  value,
  disabled,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  confirmar?: string;
  pendiente?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  title?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      title={title}
      disabled={pending || disabled}
      className={className}
      onClick={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
    >
      {pending ? pendiente : children}
    </button>
  );
}
