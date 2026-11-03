import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// La clave de la IA vive en un único .env.local, en la raíz del proyecto, para la web y la gestión.
const envRaiz = path.resolve(process.cwd(), "..", ".env.local");
if (fs.existsSync(envRaiz)) process.loadEnvFile(envRaiz);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // La base de datos compartida está escrita en TypeScript dentro del propio proyecto.
  transpilePackages: ["@faro/compartido"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          // El micrófono hace falta para que el profesor dicte la evaluación.
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
