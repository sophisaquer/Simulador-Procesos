import { ISimulador } from "../interfaces/ISimulador";
import { IMemoria } from "../interfaces/IMemoria";
import { IProceso } from "../interfaces/IProceso";
import { Memoria } from "./Memoria";
import { Proceso } from "./Proceso";

export class Simulador implements ISimulador {
  public readonly memoria: IMemoria;
  public readonly tickActual: number = 0;

  private procesos: Proceso[] = [];

  constructor(
    tamanioMemoria: number,
    public readonly quantum: number
  ) {
    if (!Number.isInteger(quantum) || quantum <= 0) {
      throw new Error("el quantum debe ser un entero positivo");
    }

    this.memoria = new Memoria(tamanioMemoria);
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
}