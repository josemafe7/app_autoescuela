// Formatos para mostrar cifras.

const euros = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: "always",
} as Intl.NumberFormatOptions);

export function eur(n: number): string {
  return euros.format(n);
}

/** Sin decimales cuando el importe es redondo: «150 €», «94,05 €». */
export function eurCorto(n: number): string {
  return Number.isInteger(n) ? `${n.toLocaleString("es-ES")} €` : eur(n);
}

export function plural(n: number, singular: string, pluralTexto?: string): string {
  return `${n} ${n === 1 ? singular : (pluralTexto ?? `${singular}s`)}`;
}

export function decimal(n: number | null, dec = 1): string {
  if (n === null || Number.isNaN(n)) return "—";
  return n.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
