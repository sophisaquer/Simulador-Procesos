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

expect(proceso.obtenerEstado()).toBe(EstadoProceso.EJECUTANDO);
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
expect(procesos[1].obtenerEstado()).toBe(EstadoProceso.EJECUTANDO);});

it("despacha y ejecuta un proceso durante un tick", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 5);
  simulador.avanzarTick();

  const proceso = simulador.obtenerProcesos()[0];

  expect(proceso.obtenerEstado()).toBe(EstadoProceso.EJECUTANDO);
  expect(proceso.obtenerCpuRestante()).toBe(4);
  expect(proceso.obtenerQuantumConsumido()).toBe(1);
});

it("permite que solo un proceso consuma CPU por tick", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 5);
  simulador.registrarProceso(2, 256, 5);

  simulador.avanzarTick();

  const procesos = simulador.obtenerProcesos();

  expect(procesos[0].obtenerCpuRestante()).toBe(4);
  expect(procesos[1].obtenerCpuRestante()).toBe(5);
  expect(procesos[1].obtenerEstado()).toBe(EstadoProceso.LISTO);
});

it("finaliza un proceso y libera su memoria en el mismo tick", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 1);
  simulador.avanzarTick();

  const proceso = simulador.obtenerProcesos()[0];
  const bloques = simulador.memoria.obtenerBloques();

  expect(proceso.obtenerEstado()).toBe(EstadoProceso.TERMINADO);
  expect(proceso.obtenerCpuRestante()).toBe(0);
  expect(bloques).toHaveLength(1);
  expect(bloques[0].estaLibre()).toBe(true);
  expect(bloques[0].tamanio).toBe(1024);
});

it("rota al proceso cuando agota el quantum y hay otro listo", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 5);
  simulador.registrarProceso(2, 256, 5);

  simulador.avanzarTick();
  simulador.avanzarTick();

  let procesos = simulador.obtenerProcesos();

  expect(procesos[0].obtenerEstado()).toBe(EstadoProceso.LISTO);
  expect(procesos[0].obtenerCpuRestante()).toBe(3);

  simulador.avanzarTick();

  procesos = simulador.obtenerProcesos();

  expect(procesos[1].obtenerEstado()).toBe(EstadoProceso.EJECUTANDO);
  expect(procesos[1].obtenerCpuRestante()).toBe(4);
});

it("renueva el quantum si no hay otro proceso listo", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 5);

  simulador.avanzarTick();
  simulador.avanzarTick();

  const proceso = simulador.obtenerProcesos()[0];

  expect(proceso.obtenerEstado()).toBe(EstadoProceso.EJECUTANDO);
  expect(proceso.obtenerCpuRestante()).toBe(3);
  expect(proceso.obtenerQuantumConsumido()).toBe(0);
});

it("bloquea un proceso por entrada y salida sin liberar su memoria", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 5);

  const proceso = simulador.obtenerProcesos()[0];
  proceso.configurarEntradaSalida(1, 2);

  simulador.avanzarTick();

  expect(proceso.obtenerEstado()).toBe(EstadoProceso.BLOQUEADO);
  expect(proceso.obtenerCpuRestante()).toBe(4);
  expect(proceso.obtenerTiempoBloqueoRestante()).toBe(2);

  const bloques = simulador.memoria.obtenerBloques();
  expect(bloques.some((bloque) => bloque.pid === 1)).toBe(true);
});

it("retorna a listo después del bloqueo y puede volver a ejecutar", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 5);

  const proceso = simulador.obtenerProcesos()[0];
  proceso.configurarEntradaSalida(1, 2);

  simulador.avanzarTick();

  expect(proceso.obtenerEstado()).toBe(EstadoProceso.BLOQUEADO);
  expect(proceso.obtenerCpuRestante()).toBe(4);

  simulador.avanzarTick();

  expect(proceso.obtenerEstado()).toBe(EstadoProceso.BLOQUEADO);
  expect(proceso.obtenerCpuRestante()).toBe(4);

  simulador.avanzarTick();

  expect(proceso.obtenerEstado()).toBe(EstadoProceso.EJECUTANDO);
  expect(proceso.obtenerCpuRestante()).toBe(3);
});

it("inicia las métricas con los valores correctos", () => {
  const simulador = new Simulador(1000, 2);

  const metricas = simulador.obtenerMetricas();

  expect(metricas.ocupacionMemoria).toBe(0);
  expect(metricas.utilizacionCpu).toBe(0);
  expect(metricas.cambiosContexto).toBe(0);
  expect(metricas.memoriaLibreTotal).toBe(1000);
  expect(metricas.mayorBloqueLibre).toBe(1000);
  expect(metricas.fragmentacionExterna).toBe(0);
});

it("calcula la fragmentación externa de la memoria", () => {
  const simulador = new Simulador(600, 2);

  simulador.memoria.asignarMemoria(1, 100);
  simulador.memoria.asignarMemoria(2, 100);
  simulador.memoria.asignarMemoria(3, 100);
  simulador.memoria.asignarMemoria(4, 300);

  simulador.memoria.liberarMemoria(2);
  simulador.memoria.liberarMemoria(4);

  const metricas = simulador.obtenerMetricas();

  expect(metricas.memoriaLibreTotal).toBe(400);
  expect(metricas.mayorBloqueLibre).toBe(300);
  expect(metricas.fragmentacionExterna).toBe(25);
});

it("calcula la utilización de cpu con ticks ocupados y ociosos", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 1);

  simulador.avanzarTick();
  simulador.avanzarTick();

  const metricas = simulador.obtenerMetricas();

  expect(metricas.utilizacionCpu).toBe(50);
});

it("cuenta un cambio de contexto al rotar por quantum", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 5);
  simulador.registrarProceso(2, 256, 5);

  simulador.avanzarTick();
  simulador.avanzarTick();

  const metricas = simulador.obtenerMetricas();

  expect(metricas.cambiosContexto).toBe(1);
});

it("cuenta un cambio de contexto cuando un proceso se bloquea", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 5);

  const proceso = simulador.obtenerProcesos()[0];
  proceso.configurarEntradaSalida(1, 2);

  simulador.avanzarTick();

  const metricas = simulador.obtenerMetricas();

  expect(metricas.cambiosContexto).toBe(1);
});

it("consulta el proceso en cpu la cola de listos y el mapa de memoria", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 5);
  simulador.registrarProceso(2, 256, 5);

  simulador.avanzarTick();

  const estado = simulador.obtenerEstado();

  expect(estado.tick).toBe(1);
  expect(estado.procesoEnCpu?.pid).toBe(1);
  expect(estado.listos.map((proceso) => proceso.pid)).toEqual([2]);

  expect(
    estado.mapaMemoria.map((bloque) => bloque.pid)
  ).toEqual([1, 2, null]);
});

it("consulta procesos bloqueados esperando memoria y terminados", () => {
  const bloqueado = new Simulador(1024, 2);
  bloqueado.registrarProceso(1, 256, 5);

  bloqueado
    .obtenerProcesos()[0]
    .configurarEntradaSalida(1, 2);

  bloqueado.avanzarTick();

  expect(
    bloqueado.obtenerEstado().bloqueados.map((proceso) => proceso.pid)
  ).toEqual([1]);

  const esperando = new Simulador(1024, 2);
  esperando.memoria.asignarMemoria(99, 1024);
  esperando.registrarProceso(2, 256, 5);
  esperando.avanzarTick();

  expect(
    esperando.obtenerEstado().esperandoMemoria.map(
      (proceso) => proceso.pid
    )
  ).toEqual([2]);

  const terminado = new Simulador(1024, 2);
  terminado.registrarProceso(3, 256, 1);
  terminado.avanzarTick();

  expect(
    terminado.obtenerEstado().terminados.map((proceso) => proceso.pid)
  ).toEqual([3]);
});

it("respeta la secuencia completa de round robin", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 3);
  simulador.registrarProceso(2, 256, 2);

  const procesos = simulador.obtenerProcesos();

  simulador.avanzarTick();
  expect(procesos[0].obtenerCpuRestante()).toBe(2);
  expect(procesos[1].obtenerCpuRestante()).toBe(2);

  simulador.avanzarTick();
  expect(procesos[0].obtenerCpuRestante()).toBe(1);
  expect(procesos[1].obtenerCpuRestante()).toBe(2);

  simulador.avanzarTick();
  expect(procesos[1].obtenerCpuRestante()).toBe(1);

  simulador.avanzarTick();
  expect(procesos[1].obtenerCpuRestante()).toBe(0);

  simulador.avanzarTick();
  expect(procesos[0].obtenerCpuRestante()).toBe(0);

  expect(simulador.obtenerMetricas().cambiosContexto).toBe(1);
});

it("admite en el siguiente tick después de liberar memoria", () => {
  const simulador = new Simulador(1000, 2);

  simulador.registrarProceso(1, 700, 1);
  simulador.registrarProceso(2, 500, 5);

  simulador.avanzarTick();

  let procesos = simulador.obtenerProcesos();

  expect(procesos[0].obtenerEstado()).toBe(EstadoProceso.TERMINADO);
  expect(procesos[1].obtenerEstado()).toBe(
    EstadoProceso.ESPERANDO_MEMORIA
  );

  simulador.avanzarTick();

  procesos = simulador.obtenerProcesos();

  expect(procesos[1].obtenerEstado()).toBe(EstadoProceso.EJECUTANDO);
});

it("no duplica procesos entre los estados del sistema", () => {
  const simulador = new Simulador(1024, 2);

  simulador.registrarProceso(1, 256, 5);
  simulador.registrarProceso(2, 256, 5);
  simulador.registrarProceso(3, 256, 5);

  simulador.avanzarTick();

  const estado = simulador.obtenerEstado();

  const pids = [
    ...(estado.procesoEnCpu ? [estado.procesoEnCpu.pid] : []),
    ...estado.listos.map((proceso) => proceso.pid),
    ...estado.esperandoMemoria.map((proceso) => proceso.pid),
    ...estado.bloqueados.map((proceso) => proceso.pid),
    ...estado.terminados.map((proceso) => proceso.pid),
  ];

  expect(new Set(pids).size).toBe(pids.length);
  expect(pids).toHaveLength(3);
});

it("mantiene los bloques de memoria sin solapamientos", () => {
  const simulador = new Simulador(1000, 2);

  simulador.memoria.asignarMemoria(1, 200);
  simulador.memoria.asignarMemoria(2, 300);
  simulador.memoria.asignarMemoria(3, 100);

  const bloques = simulador.memoria.obtenerBloques();

  for (let i = 0; i < bloques.length - 1; i++) {
    const finBloqueActual =
      bloques[i].inicio + bloques[i].tamanio;

    expect(finBloqueActual).toBeLessThanOrEqual(
      bloques[i + 1].inicio
    );
  }

  const tamanioTotal = bloques.reduce(
    (total, bloque) => total + bloque.tamanio,
    0
  );

  expect(tamanioTotal).toBe(1000);
});
});