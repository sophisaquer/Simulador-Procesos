import { EstadoProceso } from "../modelos/EstadoProceso";

export interface IProceso {
  readonly pid: number;
  readonly memoriaRequerida: number;
  readonly tiempoCpuTotal: number;

  obtenerCpuRestante(): number;
  obtenerEstado(): EstadoProceso;
  obtenerQuantumConsumido(): number;
  obtenerTiempoBloqueoRestante(): number;
}