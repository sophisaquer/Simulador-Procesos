import { describe, expect, it } from "vitest";
import { BestFit } from "../src/modelos/BestFit";
import { BloqueMemoria } from "../src/modelos/BloqueMemoria";

describe("BestFit", () => {
  it("elige el bloque libre suficiente de menor tamaño", () => {
    const politica = new BestFit();

    const bloques = [
      new BloqueMemoria(0, 300),
      new BloqueMemoria(300, 100, 1),
      new BloqueMemoria(400, 150),
      new BloqueMemoria(550, 200)
    ];

    expect(politica.buscarBloque(bloques, 120)).toBe(2);
  });

  it("ante un empate elige el bloque de menor dirección", () => {
    const politica = new BestFit();

    const bloques = [
      new BloqueMemoria(0, 200),
      new BloqueMemoria(200, 50, 1),
      new BloqueMemoria(250, 200)
    ];

    expect(politica.buscarBloque(bloques, 150)).toBe(0);
  });

  it("devuelve -1 si no encuentra un bloque suficiente", () => {
    const politica = new BestFit();

    const bloques = [
      new BloqueMemoria(0, 100),
      new BloqueMemoria(100, 150)
    ];

    expect(politica.buscarBloque(bloques, 200)).toBe(-1);
  });
});