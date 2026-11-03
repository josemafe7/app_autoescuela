import { describe, expect, it } from "vitest";
import { dniValido } from "./dni";

describe("DNI y NIE", () => {
  it("acepta un DNI o NIE con su letra, aunque venga con espacios, guiones o en minúsculas", () => {
    expect(dniValido("12345678Z")).toBe(true);
    expect(dniValido("12345678-z")).toBe(true);
    expect(dniValido("X1234567L")).toBe(true);
  });

  it("rechaza la letra equivocada o el formato incorrecto", () => {
    expect(dniValido("12345678A")).toBe(false);
    expect(dniValido("1234567Z")).toBe(false);
  });
});
