import { IPoliticaAsignacion } from "../interfaces/IPoliticaAsignacion";
import { IBloqueMemoria } from "../interfaces/IBloqueMemoria";

export class FirstFit implements IPoliticaAsignacion {
  buscarBloque(
    bloques: readonly IBloqueMemoria[],
    tamanioRequerido: number
  ): number {
    return bloques.findIndex(
      (bloque) => bloque.estaLibre() && bloque.tamanio >= tamanioRequerido
    );
  }
}