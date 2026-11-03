import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Las imágenes del diseño se sirven sin optimizar (images.unoptimized en next.config.ts);
      // pasarlas a <Image> cambiaría su maquetación, y el diseño no se toca.
      "@next/next/no-img-element": "off",
      // Regla del antiguo enrutador «pages»: en el layout raíz de «app» la fuente de iconos carga en todas las páginas.
      "@next/next/no-page-custom-font": "off",
    },
  },
];

export default config;
