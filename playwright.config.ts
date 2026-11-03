import os from "node:os";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { GESTION, WEB } from "./e2e/direcciones";

// Las pruebas compilan las dos apps y las arrancan en otros puertos, con su propia
// base de datos (nueva en cada pasada): nunca tocan datos/faro.db.
const FARO_DB = path.join(os.tmpdir(), "faro-e2e", String(Date.now()), "faro.db");

const servidor = (app: string, url: string) => ({
  command: `pnpm --dir ${app} build && pnpm --dir ${app} exec next start --hostname localhost --port ${new URL(url).port}`,
  url,
  env: { FARO_DB, OPENROUTER_API_KEY: "" },
  reuseExistingServer: false,
  timeout: 240_000,
});

export default defineConfig({
  testDir: "e2e",
  workers: 1,
  reporter: [["list"]],
  use: { trace: "retain-on-failure", locale: "es-ES" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [servidor("web", WEB), servidor("gestion", GESTION)],
});
