import { describe, expect, it } from "vitest";
import { Simulador } from "../src/modelos/Simulador";
import { EstadoProceso } from "../src/modelos/EstadoProceso";

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

  it("registra y consulta procesos", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 5);

  const procesos = simulador.obtenerProcesos();

  expect(procesos).toHaveLength(1);
  expect(procesos[0].pid).toBe(1);
  expect(procesos[0].memoriaRequerida).toBe(256);
  expect(procesos[0].tiempoCpuTotal).toBe(5);
});

it("rechaza un PID duplicado", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 5);

  expect(() => simulador.registrarProceso(1, 128, 3)).toThrow();
});

it("rechaza un proceso mayor que la memoria total", () => {
  const simulador = new Simulador(1024, 2);

  expect(() => simulador.registrarProceso(1, 2048, 5)).toThrow();
});

it("pasa un proceso a listo cuando consigue memoria", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 5);
  simulador.avanzarTick();

  const proceso = simulador.obtenerProcesos()[0];

  expect(proceso.obtenerEstado()).toBe(EstadoProceso.LISTO);
  expect(simulador.tickActual).toBe(1);
});

it("deja esperando memoria a un proceso que no encuentra espacio", () => {
  const simulador = new Simulador(1024, 2);

  simulador.memoria.asignarMemoria(99, 1024);
  simulador.registrarProceso(1, 256, 5);

  simulador.avanzarTick();

  const proceso = simulador.obtenerProcesos()[0];

  expect(proceso.obtenerEstado()).toBe(
    EstadoProceso.ESPERANDO_MEMORIA
  );
});

it("admite otro proceso aunque uno anterior no entre en memoria", () => {
  const simulador = new Simulador(1024, 2);

  simulador.memoria.asignarMemoria(99, 800);

  simulador.registrarProceso(1, 300, 5);
  simulador.registrarProceso(2, 200, 5);

  simulador.avanzarTick();

  const procesos = simulador.obtenerProcesos();

  expect(procesos[0].obtenerEstado()).toBe(
    EstadoProceso.ESPERANDO_MEMORIA
  );
  expect(procesos[1].obtenerEstado()).toBe(EstadoProceso.LISTO);
});
});