"use client";

import { useState } from "react";
import { iniciarSesion } from "@/app/acciones/perfil";
import { BotonEnviar } from "./BotonEnviar";
import { Icono } from "./ui";

export function FormLogin() {
  const [verClave, setVerClave] = useState(false);

  return (
    <div className="tarjeta p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-faro-600 text-white">
          <Icono nombre="lock" />
        </span>
        <div>
          <h2 className="text-lg font-bold">Iniciar sesión</h2>
          <p className="text-sm text-gris">Introduce tu correo electrónico y tu contraseña</p>
        </div>
      </div>

      <form action={iniciarSesion} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="login-email" className="etiqueta">
            Correo electrónico
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoFocus
            autoComplete="username"
            placeholder="tu@correo.es"
            className="campo"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium text-tinta">
              Contraseña
            </label>
            <button
              type="button"
              onClick={() => setVerClave((v) => !v)}
              className="text-xs font-semibold text-faro-600 hover:text-faro-800"
            >
              {verClave ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <input
            id="login-password"
            name="password"
            type={verClave ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="campo"
          />
        </div>

        <BotonEnviar className="btn-primario mt-2 w-full" pendiente="Accediendo…">
          <Icono nombre="login" />
          Entrar
        </BotonEnviar>
      </form>
    </div>
  );
}
