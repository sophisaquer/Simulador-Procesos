import { describe, expect, it } from "vitest";
import { Proceso } from "../src/modelos/Proceso";
import { EstadoProceso } from "../src/modelos/EstadoProceso";

describe("Proceso", () => {
  it("inicia con los valores correctos", () => {
    const proceso = new Proceso(1, 256, 5);

    expect(proceso.pid).toBe(1);
    expect(proceso.memoriaRequerida).toBe(256);
    expect(proceso.tiempoCpuTotal).toBe(5);
    expect(proceso.obtenerCpuRestante()).toBe(5);
    expect(proceso.obtenerEstado()).toBe(EstadoProceso.NUEVO);
    expect(proceso.obtenerQuantumConsumido()).toBe(0);
    expect(proceso.obtenerTiempoBloqueoRestante()).toBe(0);
  });

  it("rechaza datos inválidos", () => {
    expect(() => new Proceso(0, 256, 5)).toThrow();
    expect(() => new Proceso(1, 0, 5)).toThrow();
    expect(() => new Proceso(1, 256, 0)).toThrow();
  });
  it("pasa al estado esperando memoria", () => {
  const proceso = new Proceso(1, 256, 5);

  proceso.marcarEsperandoMemoria();

  expect(proceso.obtenerEstado()).toBe(EstadoProceso.ESPERANDO_MEMORIA);
});

it("pasa al estado listo", () => {
  const proceso = new Proceso(1, 256, 5);

  proceso.marcarListo();

  expect(proceso.obtenerEstado()).toBe(EstadoProceso.LISTO);
});

it("ejecuta un tick de CPU", () => {
  const proceso = new Proceso(1, 256, 5);

  proceso.marcarEjecutando();
  proceso.ejecutarTick();

  expect(proceso.obtenerEstado()).toBe(EstadoProceso.EJECUTANDO);
  expect(proceso.obtenerCpuRestante()).toBe(4);
  expect(proceso.obtenerQuantumConsumido()).toBe(1);
});

it("reinicia el quantum consumido", () => {
  const proceso = new Proceso(1, 256, 5);

  proceso.ejecutarTick();
  proceso.ejecutarTick();
  proceso.reiniciarQuantum();

  expect(proceso.obtenerQuantumConsumido()).toBe(0);
});

it("pasa al estado terminado", () => {
  const proceso = new Proceso(1, 256, 5);

  proceso.marcarTerminado();

  expect(proceso.obtenerEstado()).toBe(EstadoProceso.TERMINADO);
});
});