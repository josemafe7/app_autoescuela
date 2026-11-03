import type { Config } from "tailwindcss";

/**
 * Colores del sistema «Luz y Asfalto» (el mismo de la web pública).
 * Regla de la app: el naranja de la marca, a tope solo en marcas pequeñas
 * (botón principal, dato principal, icono activo); sus tintes pálidos hacen
 * el trabajo de las áreas (fila activa del menú, insignias, barras de progreso).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fondo: "#f8f9ff",
        superficie: "#ffffff",
        hundido: "#eff4ff",
        tinta: "#0b1c30",
        gris: "#4f5b6e",
        tenue: "#7a8597",
        linea: "#e3e8f2",
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
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
