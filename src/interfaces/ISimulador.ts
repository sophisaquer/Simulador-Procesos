import { IMemoria } from "./IMemoria";
import { IProceso } from "./IProceso";

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

  avanzarTick(): void;
}