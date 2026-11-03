export const PRECIOS = {
  matricula: 150.0,
  practicaSuelta: 30.0,
  bono10: 260.0,
  bono20: 500.0,
  derechoExamen: 50.0,
  tasaDgt: 94.05,
  psicotecnico: 35.0,
} as const;

export interface CombinacionPracticas {
  bonos20: number;
  bonos10: number;
  sueltas: number;
  practicasCubiertas: number;
  costeOptimal: number;
  costeSinBonos: number;
  ahorroBonos: number;
  descripcionCombinacion: string;
}

/**
 * Calcula la combinación de bonos (20, 10) y prácticas sueltas que sale más barata
 * para cubrir al menos `numPracticas` prácticas.
 */
export function calcularMejorCombinacionPracticas(numPracticas: number) {
  if (numPracticas <= 0) {
    return {
      bonos20: 0,
      bonos10: 0,
      sueltas: 0,
      practicasCubiertas: 0,
      costeOptimal: 0,
      costeSinBonos: 0,
      ahorroBonos: 0,
      descripcionCombinacion: "0 prácticas",
    };
  }

  let mejorCoste = Infinity;
  let mejorCombo = { bonos20: 0, bonos10: 0, sueltas: numPracticas, practicasCubiertas: numPracticas };

  const maxB20 = Math.ceil(numPracticas / 20) + 1;
  const maxB10 = Math.ceil(numPracticas / 10) + 1;

  for (let b20 = 0; b20 <= maxB20; b20++) {
    for (let b10 = 0; b10 <= maxB10; b10++) {
      const cubiertasConBonos = b20 * 20 + b10 * 10;
      const faltan = Math.max(0, numPracticas - cubiertasConBonos);
      const coste = b20 * PRECIOS.bono20 + b10 * PRECIOS.bono10 + faltan * PRECIOS.practicaSuelta;
      const totalCubiertas = cubiertasConBonos + faltan;

      // Preferimos menor coste; a igual coste, preferimos cubrir exactamente el número pedido o usar bonos más grandes
      if (
        coste < mejorCoste ||
        (coste === mejorCoste && totalCubiertas === numPracticas && mejorCombo.practicasCubiertas !== numPracticas)
      ) {
        mejorCoste = coste;
        mejorCombo = {
          bonos20: b20,
          bonos10: b10,
          sueltas: faltan,
          practicasCubiertas: totalCubiertas,
        };
      }
    }
  }

  const costeSinBonos = numPracticas * PRECIOS.practicaSuelta;
  const ahorroBonos = Math.max(0, costeSinBonos - mejorCoste);

  const partes: string[] = [];
  if (mejorCombo.bonos20 > 0) {
    partes.push(
      `${mejorCombo.bonos20} ${mejorCombo.bonos20 === 1 ? "bono de 20" : "bonos de 20"} (${mejorCombo.bonos20 * PRECIOS.bono20} €)`
    );
  }
  if (mejorCombo.bonos10 > 0) {
    partes.push(
      `${mejorCombo.bonos10} ${mejorCombo.bonos10 === 1 ? "bono de 10" : "bonos de 10"} (${mejorCombo.bonos10 * PRECIOS.bono10} €)`
    );
  }
  if (mejorCombo.sueltas > 0) {
    partes.push(
      `${mejorCombo.sueltas} ${mejorCombo.sueltas === 1 ? "práctica suelta" : "prácticas sueltas"} (${mejorCombo.sueltas * PRECIOS.practicaSuelta} €)`
    );
  }

  return {
    ...mejorCombo,
    costeOptimal: mejorCoste,
    costeSinBonos,
    ahorroBonos,
    descripcionCombinacion: partes.join(" + "),
  };
}

export interface ResultadoPresupuesto {
  numPracticas: number;
  matricula: number;
  tasaDgt: number;
  derechoExamen: number;
  psicotecnico: number;
  practicasDetalle: ReturnType<typeof calcularMejorCombinacionPracticas>;
  totalPrimeraConvocatoria: number;
  suspenderUnaVezActivo: boolean;
  practicasRepaso: number;
  costePracticasRepaso: number;
  nuevoDerechoExamen: number;
  costeExtraSuspenderUnaVez: number;
  totalConSuspenso: number;
  totalFinalMostrado: number;
}

export function calcularPresupuestoCompleto(
  numPracticas: number,
  suspenderUnaVezActivo: boolean = false,
  practicasRepaso: number = 3
): ResultadoPresupuesto {
  const practicasDetalle = calcularMejorCombinacionPracticas(numPracticas);

  const fijos =
    PRECIOS.matricula + PRECIOS.tasaDgt + PRECIOS.derechoExamen + PRECIOS.psicotecnico;

  const totalPrimeraConvocatoria = Number((fijos + practicasDetalle.costeOptimal).toFixed(2));

  // Si se suspende el práctico una vez:
  // - Nuevo derecho de examen práctico (50 €)
  // - Las prácticas de repaso que hagan falta (calculadas también de forma óptima o sueltas)
  // - La tasa DGT (94,05 €) sigue valiendo porque cubre 2 convocatorias y no cobramos gestión por renovar.
  const comboRepaso = calcularMejorCombinacionPracticas(practicasRepaso);
  const costePracticasRepaso = comboRepaso.costeOptimal;
  const nuevoDerechoExamen = PRECIOS.derechoExamen;
  const costeExtraSuspenderUnaVez = Number((nuevoDerechoExamen + costePracticasRepaso).toFixed(2));
  const totalConSuspenso = Number((totalPrimeraConvocatoria + costeExtraSuspenderUnaVez).toFixed(2));

  return {
    numPracticas,
    matricula: PRECIOS.matricula,
    tasaDgt: PRECIOS.tasaDgt,
    derechoExamen: PRECIOS.derechoExamen,
    psicotecnico: PRECIOS.psicotecnico,
    practicasDetalle,
    totalPrimeraConvocatoria,
    suspenderUnaVezActivo,
    practicasRepaso,
    costePracticasRepaso,
    nuevoDerechoExamen,
    costeExtraSuspenderUnaVez,
    totalConSuspenso,
    totalFinalMostrado: suspenderUnaVezActivo ? totalConSuspenso : totalPrimeraConvocatoria,
  };
}

export function formatearEuros(cantidad: number): string {
  const tieneDecimales = Math.round(cantidad * 100) % 100 !== 0;
  return (
    cantidad
      .toFixed(tieneDecimales ? 2 : 0)
      .replace(".", ",")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €"
  );
}
