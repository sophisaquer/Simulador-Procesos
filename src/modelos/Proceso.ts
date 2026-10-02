import { IProceso } from "../interfaces/IProceso";
import { EstadoProceso } from "./EstadoProceso";

export class Proceso implements IProceso {
  private cpuRestante: number;
  private estado: EstadoProceso;
  private quantumConsumido: number;
  private tiempoBloqueoRestante: number;

  constructor(
    public readonly pid: number,
    public readonly memoriaRequerida: number,
    public readonly tiempoCpuTotal: number
  ) {
    if (!Number.isInteger(pid) || pid <= 0) {
      throw new Error("el PID debe ser un entero positivo");
    }

    if (!Number.isInteger(memoriaRequerida) || memoriaRequerida <= 0) {
      throw new Error("la memoria requerida debe ser un entero positivo");
    }

    if (!Number.isInteger(tiempoCpuTotal) || tiempoCpuTotal <= 0) {
      throw new Error("el tiempo de CPU debe ser un entero positivo");
    }

    this.cpuRestante = tiempoCpuTotal;
    this.estado = EstadoProceso.NUEVO;
    this.quantumConsumido = 0;
    this.tiempoBloqueoRestante = 0;
  }

  obtenerCpuRestante(): number {
    return this.cpuRestante;
  }

  obtenerEstado(): EstadoProceso {
    return this.estado;
  }

  obtenerQuantumConsumido(): number {
    return this.quantumConsumido;
  }

  obtenerTiempoBloqueoRestante(): number {
    return this.tiempoBloqueoRestante;
  }
  marcarEsperandoMemoria(): void {
  this.estado = EstadoProceso.ESPERANDO_MEMORIA;
}

marcarListo(): void {
  this.estado = EstadoProceso.LISTO;
}
}