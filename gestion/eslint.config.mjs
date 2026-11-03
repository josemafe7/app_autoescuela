import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Regla del antiguo enrutador «pages»: en el layout raíz de «app» la fuente de iconos carga en todas las páginas.
      "@next/next/no-page-custom-font": "off",
      // La fuente de iconos usa display=block a propósito: así no se ve el nombre del icono mientras carga.
      "@next/next/google-font-display": "off",
    },
  },
];

export default config;
