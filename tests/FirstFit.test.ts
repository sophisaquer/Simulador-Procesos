import { describe, expect, it } from "vitest";
import { FirstFit } from "../src/modelos/FirstFit";
import { BloqueMemoria } from "../src/modelos/BloqueMemoria";

describe("FirstFit", () => {
  it("elige el primer bloque libre suficiente", () => {
    const politica = new FirstFit();

    const bloques = [
      new BloqueMemoria(0, 100, 1),
      new BloqueMemoria(100, 200),
      new BloqueMemoria(300, 300)
    ];

    expect(politica.buscarBloque(bloques, 150)).toBe(1);
  });

  it("devuelve -1 si no encuentra un bloque suficiente", () => {
    const politica = new FirstFit();

    const bloques = [
      new BloqueMemoria(0, 100),
      new BloqueMemoria(100, 150)
    ];

    expect(politica.buscarBloque(bloques, 200)).toBe(-1);
  });
});