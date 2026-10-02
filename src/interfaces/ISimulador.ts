import { IMemoria } from "./IMemoria";

export interface ISimulador {
  readonly quantum: number;
  readonly tickActual: number;
  readonly memoria: IMemoria;
}