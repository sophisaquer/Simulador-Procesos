import { ISimulador } from "../interfaces/ISimulador";
import { IMemoria } from "../interfaces/IMemoria";
import { IProceso } from "../interfaces/IProceso";
import { Memoria } from "./Memoria";
import { Proceso } from "./Proceso";
import { EstadoProceso } from "./EstadoProceso";
import { IPlanificador } from "../interfaces/IPlanificador";
import { PlanificadorRoundRobin } from "./PlanificadorRoundRobin";

export class Simulador implements ISimulador {
  public readonly memoria: IMemoria;
  private tick: number = 0;

  private procesos: Proceso[] = [];
  private readonly planificador: IPlanificador;
  private procesoEnCpu: IProceso | null = null;

  constructor(
    tamanioMemoria: number,
    public readonly quantum: number
  ) {
    if (!Number.isInteger(quantum) || quantum <= 0) {
      throw new Error("el quantum debe ser un entero positivo");
    }

    this.memoria = new Memoria(tamanioMemoria);
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

  obtenerProcesos(): readonly IProceso[] {
    return [...this.procesos];
  }

  get tickActual(): number {
    return this.tick;
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

  if (this.procesoEnCpu === null) {
    this.procesoEnCpu = this.planificador.desencolar() ?? null;

    if (this.procesoEnCpu !== null) {
      this.procesoEnCpu.marcarEjecutando();
      this.procesoEnCpu.reiniciarQuantum();
    }
  }

  if (this.procesoEnCpu !== null) {
    this.procesoEnCpu.ejecutarTick();
  }

  this.tick++;
}
}