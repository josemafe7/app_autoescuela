// Calculadora del coste real (docs/spec.md, «Web pública»).

import { describe, expect, it } from "vitest";
import { calcularPresupuestoCompleto, formatearEuros } from "./pricing";

describe("Calculadora", () => {
  it("con 20 prácticas y aprobando a la primera, el total es 829,05 € (como dice la ficha)", () => {
    // matrícula 150 + bono de 20 (500) + derecho de examen 50 + tasa 94,05 + psicotécnico 35
    const p = calcularPresupuestoCompleto(20);
    expect(p.totalPrimeraConvocatoria).toBe(829.05);
    expect(formatearEuros(p.totalPrimeraConvocatoria)).toBe("829,05 €");
  });

  it("elige la combinación de bonos más barata: 30 prácticas son un bono de 20 y uno de 10", () => {
    const p = calcularPresupuestoCompleto(30);
    expect(p.practicasDetalle).toMatchObject({ bonos20: 1, bonos10: 1, sueltas: 0 });
    expect(p.totalPrimeraConvocatoria).toBe(1089.05);
  });

  it("si suspende una vez, suma otro derecho de examen y las prácticas de repaso", () => {
    const p = calcularPresupuestoCompleto(20, true, 3);
    expect(p.costeExtraSuspenderUnaVez).toBe(50 + 90);
    expect(p.totalFinalMostrado).toBe(829.05 + 140);
  });
});
