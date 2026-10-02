import {
  IEstadoSistema,
  IVistaProceso,
} from "./IEstadoSistema";
import { IMetricas } from "./IMetricas";

export interface ISimulador {
  readonly quantum: number;
  readonly tickActual: number;

  registrarProceso(
    pid: number,
    memoriaRequerida: number,
    tiempoCpuTotal: number
  ): void;

  configurarEntradaSalida(
    pid: number,
    despuesDeTicksCpu: number,
    duracion: number
  ): void;

  obtenerProcesos(): readonly IVistaProceso[];

  obtenerMetricas(): IMetricas;

  obtenerEstado(): IEstadoSistema;

  avanzarTick(): void;
}