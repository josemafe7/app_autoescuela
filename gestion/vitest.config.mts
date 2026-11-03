import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // «server-only» protege el código del servidor en Next.js; en las pruebas no hace falta.
      "server-only": path.resolve(import.meta.dirname, "../compartido/src/pruebas/vacio.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
  },
});
