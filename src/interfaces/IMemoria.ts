import { IBloqueMemoria } from "./IBloqueMemoria";

export interface IMemoria {
  readonly tamanioTotal: number;
  obtenerBloques(): readonly IBloqueMemoria[];
}