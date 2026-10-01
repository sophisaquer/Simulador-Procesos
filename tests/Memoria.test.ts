import { describe, expect, it } from "vitest";
import { Memoria } from "../src/modelos/Memoria";

describe("Memoria", () => {
  it("inicia con un único bloque libre del tamaño total", () => {
    const memoria = new Memoria(1024);
    const bloques = memoria.obtenerBloques();

    expect(memoria.tamanioTotal).toBe(1024);
    expect(bloques).toHaveLength(1);
    expect(bloques[0].inicio).toBe(0);
    expect(bloques[0].tamanio).toBe(1024);
    expect(bloques[0].estaLibre()).toBe(true);
  });

  it("rechaza un tamaño de memoria inválido", () => {
    expect(() => new Memoria(0)).toThrow();
    expect(() => new Memoria(-1)).toThrow();
    expect(() => new Memoria(10.5)).toThrow();
  });
});