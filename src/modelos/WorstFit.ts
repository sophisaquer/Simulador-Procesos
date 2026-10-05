import { IPoliticaAsignacion } from "../interfaces/IPoliticaAsignacion";
import { IBloqueMemoria } from "../interfaces/IBloqueMemoria";

export class WorstFit implements IPoliticaAsignacion {
  buscarBloque(
    bloques: readonly IBloqueMemoria[],
    tamanioRequerido: number
  ): number {
    let elegido = -1;

    for (let i = 0; i < bloques.length; i++) {
      const bloque = bloques[i];

      if (!bloque.estaLibre() || bloque.tamanio < tamanioRequerido) {
        continue;
      }

      if (elegido === -1 || bloque.tamanio > bloques[elegido].tamanio) {
        elegido = i;
      }
    }

    return elegido;
  }
}