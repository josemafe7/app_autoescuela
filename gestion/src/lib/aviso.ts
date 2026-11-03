// El aviso que se enseña al volver de una acción. Lo escribe el servidor en una
// cookie de un solo uso y lo lee el navegador (components/Toast.tsx).

export const COOKIE_AVISO = "faro_aviso";

export interface Aviso {
  tipo: "ok" | "error";
  texto: string;
}
