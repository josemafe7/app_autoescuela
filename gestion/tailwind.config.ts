import type { Config } from "tailwindcss";

/**
 * Colores de «Luz y Asfalto» (los mismos tonos que la web pública), en el estilo de hoja sobre marco:
 * el menú y la barra de arriba son un marco gris azulado, el asfalto, y el trabajo va en una hoja
 * blanca. El naranja del faro va solo en los datos y en la acción principal, nunca en el marco.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        marco: "#eef1f6",
        fondo: "#f8f9ff",
        superficie: "#ffffff",
        hundido: "#f3f5f9",
        activo: "#e1e6ee",
        tinta: "#0b1c30",
        gris: "#4f5b6e",
        tenue: "#5f6b7f",
        linea: "#e5e9f0",
        control: "#cfd6e0",
        faro: {
          50: "#fff6f1",
          100: "#ffeadf",
          200: "#ffdbce",
          500: "#cc4900",
          600: "#a33900",
          800: "#6e2600",
        },
        verde: { 50: "#e6f6ee", 600: "#006947", 800: "#004a32" },
        ambar: { 50: "#fdf2d9", 600: "#8f5a00", 800: "#6a4200" },
        rojo: { 50: "#ffe4e0", 600: "#ba1a1a", 800: "#8a0f0f" },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        lg: "0.5rem",
        xl: "0.625rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
