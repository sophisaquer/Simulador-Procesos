import { describe, expect, it } from "vitest";
import { Simulador } from "../src/modelos/Simulador";

describe("Simulador", () => {
  it("inicia con la configuración indicada", () => {
    const simulador = new Simulador(1024, 2);

    expect(simulador.memoria.tamanioTotal).toBe(1024);
    expect(simulador.quantum).toBe(2);
    expect(simulador.tickActual).toBe(0);
  });

  it("rechaza un quantum inválido", () => {
    expect(() => new Simulador(1024, 0)).toThrow();
    expect(() => new Simulador(1024, -1)).toThrow();
    expect(() => new Simulador(1024, 1.5)).toThrow();
  });

  it("rechaza una memoria inválida", () => {
    expect(() => new Simulador(0, 2)).toThrow();
  });
});