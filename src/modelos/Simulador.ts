import { ISimulador } from "../interfaces/ISimulador";
import { IMemoria } from "../interfaces/IMemoria";
import { IProceso } from "../interfaces/IProceso";
import { Memoria } from "./Memoria";
import { Proceso } from "./Proceso";
import { EstadoProceso } from "./EstadoProceso";
import { IPlanificador } from "../interfaces/IPlanificador";
import { PlanificadorRoundRobin } from "./PlanificadorRoundRobin";
import { IMetricas } from "../interfaces/IMetricas";
import {
  IEstadoSistema,
  IVistaProceso,
} from "../interfaces/IEstadoSistema";
import { IPoliticaAsignacion } from "../interfaces/IPoliticaAsignacion";
import { FirstFit } from "./FirstFit";

export class Simulador implements ISimulador {
  private readonly memoria: IMemoria;
  private tick: number = 0;

  private procesos: Proceso[] = [];
  private readonly planificador: IPlanificador;
  private procesoEnCpu: IProceso | null = null;
  private ticksCpuOcupada: number = 0;
private cambiosContexto: number = 0;

  constructor(
    tamanioMemoria: number,
    public readonly quantum: number,
    politica: IPoliticaAsignacion = new FirstFit()
  ) {
    if (!Number.isInteger(quantum) || quantum <= 0) {
      throw new Error("el quantum debe ser un entero positivo");
    }

        this.memoria = new Memoria(tamanioMemoria, politica);
    this.planificador = new PlanificadorRoundRobin();
  }

  registrarProceso(
    pid: number,
    memoriaRequerida: number,
    tiempoCpuTotal: number
  ): void {
    if (this.procesos.some((proceso) => proceso.pid === pid)) {
      throw new Error("el PID ya está registrado");
    }

    if (memoriaRequerida > this.memoria.tamanioTotal) {
      throw new Error("el proceso requiere más memoria que la disponible");
    }

    const proceso = new Proceso(pid, memoriaRequerida, tiempoCpuTotal);
    this.procesos.push(proceso);
  }

  configurarEntradaSalida(
  pid: number,
  despuesDeTicksCpu: number,
  duracion: number
): void {
  const proceso = this.procesos.find(
    (proceso) => proceso.pid === pid
  );

  if (proceso === undefined) {
    throw new Error("el proceso no está registrado");
  }

  proceso.configurarEntradaSalida(
    despuesDeTicksCpu,
    duracion
  );
}

obtenerProcesos(): readonly IVistaProceso[] {
  return this.procesos.map((proceso) =>
    this.crearVistaProceso(proceso)
  );
}

  get tickActual(): number {
    return this.tick;
  }

  obtenerMetricas(): IMetricas {
  const bloques = this.memoria.obtenerBloques();
  const bloquesLibres = bloques.filter((bloque) => bloque.estaLibre());

  const memoriaLibreTotal = bloquesLibres.reduce(
    (total, bloque) => total + bloque.tamanio,
    0
  );

  const mayorBloqueLibre = bloquesLibres.reduce(
    (mayor, bloque) => Math.max(mayor, bloque.tamanio),
    0
  );

  const memoriaOcupada =
    this.memoria.tamanioTotal - memoriaLibreTotal;

  const ocupacionMemoria =
    (memoriaOcupada / this.memoria.tamanioTotal) * 100;

  const utilizacionCpu =
    this.tick === 0
      ? 0
      : (this.ticksCpuOcupada / this.tick) * 100;

  const fragmentacionExterna =
    memoriaLibreTotal === 0
      ? 0
      : (1 - mayorBloqueLibre / memoriaLibreTotal) * 100;

  return {
    ocupacionMemoria,
    utilizacionCpu,
    cambiosContexto: this.cambiosContexto,
    memoriaLibreTotal,
    mayorBloqueLibre,
    fragmentacionExterna,
  };
}

private crearVistaProceso(proceso: IProceso): IVistaProceso {
  return {
    pid: proceso.pid,
    memoriaRequerida: proceso.memoriaRequerida,
    tiempoCpuTotal: proceso.tiempoCpuTotal,
    estado: proceso.obtenerEstado(),
    cpuRestante: proceso.obtenerCpuRestante(),
    quantumConsumido: proceso.obtenerQuantumConsumido(),
    tiempoBloqueoRestante: proceso.obtenerTiempoBloqueoRestante(),
  };
}

obtenerEstado(): IEstadoSistema {
  return {
    tick: this.tick,

    procesoEnCpu:
      this.procesoEnCpu === null
        ? null
        : this.crearVistaProceso(this.procesoEnCpu),

listos: this.planificador
  .obtenerPids()
  .map((pid) => {
    const proceso = this.procesos.find(
      (proceso) => proceso.pid === pid
    );

    if (proceso === undefined) {
      throw new Error("proceso listo no registrado");
    }

    return this.crearVistaProceso(proceso);
  }),
  
    esperandoMemoria: this.procesos
      .filter(
        (proceso) =>
          proceso.obtenerEstado() === EstadoProceso.ESPERANDO_MEMORIA
      )
      .map((proceso) => this.crearVistaProceso(proceso)),

    bloqueados: this.procesos
      .filter(
        (proceso) =>
          proceso.obtenerEstado() === EstadoProceso.BLOQUEADO
      )
      .map((proceso) => this.crearVistaProceso(proceso)),

    terminados: this.procesos
      .filter(
        (proceso) =>
          proceso.obtenerEstado() === EstadoProceso.TERMINADO
      )
      .map((proceso) => this.crearVistaProceso(proceso)),

    mapaMemoria: this.memoria.obtenerBloques().map((bloque) => ({
      inicio: bloque.inicio,
      tamanio: bloque.tamanio,
      pid: bloque.pid,
      libre: bloque.estaLibre(),
    })),
  };
}

avanzarTick(): void {
  for (const proceso of this.procesos) {
    if (
      proceso.obtenerEstado() !== EstadoProceso.NUEVO &&
      proceso.obtenerEstado() !== EstadoProceso.ESPERANDO_MEMORIA
    ) {
      continue;
    }

    const asignado = this.memoria.asignarMemoria(
      proceso.pid,
      proceso.memoriaRequerida
    );

    if (asignado) {
      proceso.marcarListo();
      this.planificador.encolar(proceso);
    } else {
      proceso.marcarEsperandoMemoria();
    }
  }

  for (const proceso of this.procesos) {
  if (proceso.obtenerEstado() !== EstadoProceso.BLOQUEADO) {
    continue;
  }

  const terminoBloqueo = proceso.actualizarBloqueo();

  if (terminoBloqueo) {
    this.planificador.encolar(proceso);
  }
}

  if (this.procesoEnCpu === null) {
    this.procesoEnCpu = this.planificador.desencolar() ?? null;

    if (this.procesoEnCpu !== null) {
      this.procesoEnCpu.marcarEjecutando();
      this.procesoEnCpu.reiniciarQuantum();
    }
  }

if (this.procesoEnCpu !== null) {
    this.ticksCpuOcupada++;
  this.procesoEnCpu.ejecutarTick();

  if (this.procesoEnCpu.obtenerCpuRestante() === 0) {
  this.procesoEnCpu.marcarTerminado();
  this.memoria.liberarMemoria(this.procesoEnCpu.pid);
  this.procesoEnCpu = null;
} else if (
  this.procesoEnCpu.debeBloquearsePorEntradaSalida()
) {
    this.cambiosContexto++;
  this.procesoEnCpu.bloquearPorEntradaSalida();
  this.procesoEnCpu = null;
} else if (
  this.procesoEnCpu.obtenerQuantumConsumido() === this.quantum
) {
  if (!this.planificador.estaVacia()) {
    this.cambiosContexto++;
    this.procesoEnCpu.marcarListo();
    this.planificador.encolar(this.procesoEnCpu);
    this.procesoEnCpu = null;
  } else {
    this.procesoEnCpu.reiniciarQuantum();
  }
}
}

  this.tick++;
}
}