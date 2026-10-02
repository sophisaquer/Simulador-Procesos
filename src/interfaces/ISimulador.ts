import { IMemoria } from "./IMemoria";
import { IProceso } from "./IProceso";
import { IMetricas } from "./IMetricas";
import { IEstadoSistema } from "./IEstadoSistema";

export interface ISimulador {
  readonly quantum: number;
  readonly tickActual: number;
  readonly memoria: IMemoria;

  registrarProceso(
    pid: number,
    memoriaRequerida: number,
    tiempoCpuTotal: number
  ): void;

  obtenerProcesos(): readonly IProceso[];
  
  obtenerMetricas(): IMetricas
  
  obtenerEstado(): IEstadoSistema;

  avanzarTick(): void;
}