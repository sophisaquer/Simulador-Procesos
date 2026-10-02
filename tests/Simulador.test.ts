import { describe, expect, it } from "vitest";
import { Simulador } from "../src/modelos/Simulador";
import { EstadoProceso } from "../src/modelos/EstadoProceso";

describe("Simulador", () => {
  it("inicia con la configuración indicada", () => {
    const simulador = new Simulador(1024, 2);
    const estado = simulador.obtenerEstado();
    const metricas = simulador.obtenerMetricas();

    expect(simulador.quantum).toBe(2);
    expect(simulador.tickActual).toBe(0);

    expect(estado.tick).toBe(0);
    expect(estado.procesoEnCpu).toBeNull();
    expect(estado.listos).toHaveLength(0);
    expect(estado.esperandoMemoria).toHaveLength(0);
    expect(estado.bloqueados).toHaveLength(0);
    expect(estado.terminados).toHaveLength(0);

    expect(estado.mapaMemoria).toHaveLength(1);
    expect(estado.mapaMemoria[0].inicio).toBe(0);
    expect(estado.mapaMemoria[0].tamanio).toBe(1024);
    expect(estado.mapaMemoria[0].libre).toBe(true);

    expect(metricas.ocupacionMemoria).toBe(0);
    expect(metricas.utilizacionCpu).toBe(0);
    expect(metricas.cambiosContexto).toBe(0);
  });

  it("rechaza un quantum inválido", () => {
    expect(() => new Simulador(1024, 0)).toThrow();
    expect(() => new Simulador(1024, -1)).toThrow();
    expect(() => new Simulador(1024, 1.5)).toThrow();
  });

  it("rechaza una memoria inválida", () => {
    expect(() => new Simulador(0, 2)).toThrow();
    expect(() => new Simulador(-1, 2)).toThrow();
    expect(() => new Simulador(10.5, 2)).toThrow();
  });

  it("registra y consulta procesos", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 5);

    const procesos = simulador.obtenerProcesos();

    expect(procesos).toHaveLength(1);
    expect(procesos[0].pid).toBe(1);
    expect(procesos[0].memoriaRequerida).toBe(256);
    expect(procesos[0].tiempoCpuTotal).toBe(5);
    expect(procesos[0].cpuRestante).toBe(5);
    expect(procesos[0].estado).toBe(EstadoProceso.NUEVO);
    expect(procesos[0].quantumConsumido).toBe(0);
  });

  it("protege los procesos de modificaciones externas", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 5);

    const vista = simulador.obtenerProcesos()[0];

    (vista as { estado: EstadoProceso }).estado =
      EstadoProceso.TERMINADO;

    const procesoReal = simulador.obtenerProcesos()[0];

    expect(procesoReal.estado).toBe(EstadoProceso.NUEVO);
  });

  it("rechaza un PID duplicado", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 5);

    expect(() =>
      simulador.registrarProceso(1, 128, 3)
    ).toThrow();
  });

  it("rechaza datos inválidos al registrar procesos", () => {
    const simulador = new Simulador(1024, 2);

    expect(() =>
      simulador.registrarProceso(0, 256, 5)
    ).toThrow();

    expect(() =>
      simulador.registrarProceso(1, 0, 5)
    ).toThrow();

    expect(() =>
      simulador.registrarProceso(1, 256, 0)
    ).toThrow();
  });

  it("rechaza un proceso mayor que la memoria total", () => {
    const simulador = new Simulador(1024, 2);

    expect(() =>
      simulador.registrarProceso(1, 2048, 5)
    ).toThrow();
  });

  it("admite y ejecuta un proceso cuando consigue memoria", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 5);
    simulador.avanzarTick();

    const proceso = simulador.obtenerProcesos()[0];

    expect(proceso.estado).toBe(EstadoProceso.EJECUTANDO);
    expect(proceso.cpuRestante).toBe(4);
    expect(proceso.quantumConsumido).toBe(1);
    expect(simulador.tickActual).toBe(1);
  });

  it("deja esperando memoria a un proceso que no encuentra espacio", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 1024, 5);
    simulador.registrarProceso(2, 256, 5);

    simulador.avanzarTick();

    const procesos = simulador.obtenerProcesos();

    expect(procesos[0].estado).toBe(
      EstadoProceso.EJECUTANDO
    );

    expect(procesos[1].estado).toBe(
      EstadoProceso.ESPERANDO_MEMORIA
    );
  });

  it("admite otro proceso aunque uno anterior no entre en memoria", () => {
    const simulador = new Simulador(1000, 2);

    simulador.registrarProceso(1, 800, 5);
    simulador.registrarProceso(2, 300, 5);
    simulador.registrarProceso(3, 200, 5);

    simulador.avanzarTick();

    const procesos = simulador.obtenerProcesos();

    expect(procesos[0].estado).toBe(
      EstadoProceso.EJECUTANDO
    );

    expect(procesos[1].estado).toBe(
      EstadoProceso.ESPERANDO_MEMORIA
    );

    expect(procesos[2].estado).toBe(
      EstadoProceso.LISTO
    );
  });

  it("permite que solo un proceso consuma CPU por tick", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 5);
    simulador.registrarProceso(2, 256, 5);

    simulador.avanzarTick();

    const procesos = simulador.obtenerProcesos();

    expect(procesos[0].cpuRestante).toBe(4);
    expect(procesos[1].cpuRestante).toBe(5);

    expect(procesos[0].estado).toBe(
      EstadoProceso.EJECUTANDO
    );

    expect(procesos[1].estado).toBe(
      EstadoProceso.LISTO
    );
  });

  it("finaliza un proceso y libera su memoria en el mismo tick", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 1);
    simulador.avanzarTick();

    const proceso = simulador.obtenerProcesos()[0];
    const bloques = simulador.obtenerEstado().mapaMemoria;

    expect(proceso.estado).toBe(
      EstadoProceso.TERMINADO
    );

    expect(proceso.cpuRestante).toBe(0);

    expect(bloques).toHaveLength(1);
    expect(bloques[0].inicio).toBe(0);
    expect(bloques[0].tamanio).toBe(1024);
    expect(bloques[0].libre).toBe(true);
  });

  it("rota al proceso cuando agota el quantum y hay otro listo", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 5);
    simulador.registrarProceso(2, 256, 5);

    simulador.avanzarTick();
    simulador.avanzarTick();

    let procesos = simulador.obtenerProcesos();

    expect(procesos[0].estado).toBe(
      EstadoProceso.LISTO
    );

    expect(procesos[0].cpuRestante).toBe(3);

    simulador.avanzarTick();

    procesos = simulador.obtenerProcesos();

    expect(procesos[1].estado).toBe(
      EstadoProceso.EJECUTANDO
    );

    expect(procesos[1].cpuRestante).toBe(4);
  });

  it("renueva el quantum si no hay otro proceso listo", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 5);

    simulador.avanzarTick();
    simulador.avanzarTick();

    const proceso = simulador.obtenerProcesos()[0];

    expect(proceso.estado).toBe(
      EstadoProceso.EJECUTANDO
    );

    expect(proceso.cpuRestante).toBe(3);
    expect(proceso.quantumConsumido).toBe(0);
    expect(simulador.obtenerMetricas().cambiosContexto).toBe(0);
  });

  it("finaliza en el límite del quantum sin volver a la cola", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 2);
    simulador.registrarProceso(2, 256, 5);

    simulador.avanzarTick();
    simulador.avanzarTick();

    const procesos = simulador.obtenerProcesos();
    const estado = simulador.obtenerEstado();

    expect(procesos[0].estado).toBe(
      EstadoProceso.TERMINADO
    );

    expect(
      estado.listos.map((proceso) => proceso.pid)
    ).toEqual([2]);

    expect(simulador.obtenerMetricas().cambiosContexto).toBe(0);
  });

  it("bloquea un proceso por entrada y salida sin liberar su memoria", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 5);
    simulador.configurarEntradaSalida(1, 1, 2);

    simulador.avanzarTick();

    const proceso = simulador.obtenerProcesos()[0];
    const bloques = simulador.obtenerEstado().mapaMemoria;

    expect(proceso.estado).toBe(
      EstadoProceso.BLOQUEADO
    );

    expect(proceso.cpuRestante).toBe(4);
    expect(proceso.tiempoBloqueoRestante).toBe(2);

    expect(
      bloques.some((bloque) => bloque.pid === 1)
    ).toBe(true);
  });

  it("no consume CPU mientras está bloqueado y vuelve a ejecutar", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 5);
    simulador.configurarEntradaSalida(1, 1, 2);

    simulador.avanzarTick();

    let proceso = simulador.obtenerProcesos()[0];

    expect(proceso.estado).toBe(
      EstadoProceso.BLOQUEADO
    );

    expect(proceso.cpuRestante).toBe(4);

    simulador.avanzarTick();

    proceso = simulador.obtenerProcesos()[0];

    expect(proceso.estado).toBe(
      EstadoProceso.BLOQUEADO
    );

    expect(proceso.cpuRestante).toBe(4);
    expect(proceso.tiempoBloqueoRestante).toBe(1);

    simulador.avanzarTick();

    proceso = simulador.obtenerProcesos()[0];

    expect(proceso.estado).toBe(
      EstadoProceso.EJECUTANDO
    );

    expect(proceso.cpuRestante).toBe(3);
    expect(proceso.tiempoBloqueoRestante).toBe(0);
  });

  it("da prioridad al bloqueo sobre la rotación por quantum", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 5);
    simulador.registrarProceso(2, 256, 5);

    simulador.configurarEntradaSalida(1, 2, 2);

    simulador.avanzarTick();
    simulador.avanzarTick();

    const estado = simulador.obtenerEstado();

    expect(
      estado.bloqueados.map((proceso) => proceso.pid)
    ).toEqual([1]);

    expect(
      estado.listos.map((proceso) => proceso.pid)
    ).toEqual([2]);

    expect(simulador.obtenerMetricas().cambiosContexto).toBe(1);
  });

  it("rechaza configurar entrada y salida para un proceso inexistente", () => {
    const simulador = new Simulador(1024, 2);

    expect(() =>
      simulador.configurarEntradaSalida(99, 1, 2)
    ).toThrow();
  });

  it("rechaza eventos de entrada y salida inválidos", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 5);

    expect(() =>
      simulador.configurarEntradaSalida(1, 0, 2)
    ).toThrow();

    expect(() =>
      simulador.configurarEntradaSalida(1, 1, 0)
    ).toThrow();

    expect(() =>
      simulador.configurarEntradaSalida(1, 1.5, 2)
    ).toThrow();

    expect(() =>
      simulador.configurarEntradaSalida(1, 1, 2.5)
    ).toThrow();
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
    const simulador = new Simulador(600, 1);

    simulador.registrarProceso(1, 100, 10);
    simulador.registrarProceso(2, 100, 1);
    simulador.registrarProceso(3, 100, 10);
    simulador.registrarProceso(4, 300, 1);

    simulador.avanzarTick();
    simulador.avanzarTick();
    simulador.avanzarTick();
    simulador.avanzarTick();

    const metricas = simulador.obtenerMetricas();

    expect(metricas.memoriaLibreTotal).toBe(400);
    expect(metricas.mayorBloqueLibre).toBe(300);
    expect(metricas.fragmentacionExterna).toBe(25);
  });

  it("calcula las métricas cuando la memoria está completamente ocupada", () => {
    const simulador = new Simulador(600, 2);

    simulador.registrarProceso(1, 600, 5);
    simulador.avanzarTick();

    const metricas = simulador.obtenerMetricas();

    expect(metricas.ocupacionMemoria).toBe(100);
    expect(metricas.memoriaLibreTotal).toBe(0);
    expect(metricas.mayorBloqueLibre).toBe(0);
    expect(metricas.fragmentacionExterna).toBe(0);
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

    expect(
      simulador.obtenerMetricas().cambiosContexto
    ).toBe(1);
  });

  it("cuenta un cambio de contexto cuando un proceso se bloquea", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 5);
    simulador.configurarEntradaSalida(1, 1, 2);

    simulador.avanzarTick();

    expect(
      simulador.obtenerMetricas().cambiosContexto
    ).toBe(1);
  });

  it("consulta el proceso en cpu la cola de listos y el mapa de memoria", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 5);
    simulador.registrarProceso(2, 256, 5);

    simulador.avanzarTick();

    const estado = simulador.obtenerEstado();

    expect(estado.tick).toBe(1);
    expect(estado.procesoEnCpu?.pid).toBe(1);

    expect(
      estado.listos.map((proceso) => proceso.pid)
    ).toEqual([2]);

    expect(
      estado.mapaMemoria.map((bloque) => bloque.pid)
    ).toEqual([1, 2, null]);
  });

  it("consulta procesos bloqueados esperando memoria y terminados", () => {
    const bloqueado = new Simulador(1024, 2);

    bloqueado.registrarProceso(1, 256, 5);
    bloqueado.configurarEntradaSalida(1, 1, 2);
    bloqueado.avanzarTick();

    expect(
      bloqueado.obtenerEstado().bloqueados.map(
        (proceso) => proceso.pid
      )
    ).toEqual([1]);

    const esperando = new Simulador(1024, 2);

    esperando.registrarProceso(1, 1024, 5);
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
      terminado.obtenerEstado().terminados.map(
        (proceso) => proceso.pid
      )
    ).toEqual([3]);
  });

  it("respeta la secuencia completa de round robin", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 3);
    simulador.registrarProceso(2, 256, 2);

    simulador.avanzarTick();

    let procesos = simulador.obtenerProcesos();

    expect(procesos[0].cpuRestante).toBe(2);
    expect(procesos[1].cpuRestante).toBe(2);

    simulador.avanzarTick();

    procesos = simulador.obtenerProcesos();

    expect(procesos[0].cpuRestante).toBe(1);
    expect(procesos[1].cpuRestante).toBe(2);

    simulador.avanzarTick();

    procesos = simulador.obtenerProcesos();

    expect(procesos[1].cpuRestante).toBe(1);

    simulador.avanzarTick();

    procesos = simulador.obtenerProcesos();

    expect(procesos[1].cpuRestante).toBe(0);

    simulador.avanzarTick();

    procesos = simulador.obtenerProcesos();

    expect(procesos[0].cpuRestante).toBe(0);

    expect(
      simulador.obtenerMetricas().cambiosContexto
    ).toBe(1);
  });

  it("admite en el siguiente tick después de liberar memoria", () => {
    const simulador = new Simulador(1000, 2);

    simulador.registrarProceso(1, 700, 1);
    simulador.registrarProceso(2, 500, 5);

    simulador.avanzarTick();

    let procesos = simulador.obtenerProcesos();

    expect(procesos[0].estado).toBe(
      EstadoProceso.TERMINADO
    );

    expect(procesos[1].estado).toBe(
      EstadoProceso.ESPERANDO_MEMORIA
    );

    simulador.avanzarTick();

    procesos = simulador.obtenerProcesos();

    expect(procesos[1].estado).toBe(
      EstadoProceso.EJECUTANDO
    );
  });

  it("no duplica procesos entre los estados del sistema", () => {
    const simulador = new Simulador(1024, 2);

    simulador.registrarProceso(1, 256, 5);
    simulador.registrarProceso(2, 256, 5);
    simulador.registrarProceso(3, 256, 5);

    simulador.avanzarTick();

    const estado = simulador.obtenerEstado();

    const pids = [
      ...(estado.procesoEnCpu
        ? [estado.procesoEnCpu.pid]
        : []),
      ...estado.listos.map((proceso) => proceso.pid),
      ...estado.esperandoMemoria.map(
        (proceso) => proceso.pid
      ),
      ...estado.bloqueados.map((proceso) => proceso.pid),
      ...estado.terminados.map((proceso) => proceso.pid),
    ];

    expect(new Set(pids).size).toBe(pids.length);
    expect(pids).toHaveLength(3);
  });

  it("mantiene los bloques de memoria sin solapamientos", () => {
    const simulador = new Simulador(1000, 2);

    simulador.registrarProceso(1, 200, 5);
    simulador.registrarProceso(2, 300, 5);
    simulador.registrarProceso(3, 100, 5);

    simulador.avanzarTick();

    const bloques = simulador.obtenerEstado().mapaMemoria;

    for (let i = 0; i < bloques.length - 1; i++) {
      const finBloqueActual =
        bloques[i].inicio + bloques[i].tamanio;

      expect(finBloqueActual).toBe(
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