import { IBloqueMemoria } from "./IBloqueMemoria";

export interface IPoliticaAsignacion {
  buscarBloque(
    bloques: readonly IBloqueMemoria[],
    tamanioRequerido: number
  ): number;
}