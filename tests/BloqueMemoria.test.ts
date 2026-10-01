import { describe, expect, it } from "vitest";
import { BloqueMemoria } from "../src/modelos/BloqueMemoria";

describe("BloqueMemoria", () => {
  it("representa un bloque libre", () => {
    const bloque = new BloqueMemoria(0, 1024);

    expect(bloque.inicio).toBe(0);
    expect(bloque.tamanio).toBe(1024);
    expect(bloque.pid).toBeNull();
    expect(bloque.estaLibre()).toBe(true);
  });

  it("representa un bloque ocupado", () => {
    const bloque = new BloqueMemoria(0, 256, 1);

    expect(bloque.pid).toBe(1);
    expect(bloque.estaLibre()).toBe(false);
  });
});