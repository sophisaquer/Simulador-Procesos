import { IBloqueMemoria } from "./IBloqueMemoria";

export interface IMemoria {
  readonly tamanioTotal: number;

  obtenerBloques(): readonly IBloqueMemoria[];
  asignarMemoria(pid: number, tamanioRequerido: number): boolean;
  liberarMemoria(pid: number): boolean;
}