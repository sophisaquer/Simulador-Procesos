import { IMemoria } from "../interfaces/IMemoria";
import { IBloqueMemoria } from "../interfaces/IBloqueMemoria";
import { BloqueMemoria } from "./BloqueMemoria";

export class Memoria implements IMemoria {
  private bloques: BloqueMemoria[];

  constructor(public readonly tamanioTotal: number) {
    if (!Number.isInteger(tamanioTotal) || tamanioTotal <= 0) {
      throw new Error("el tamaño de memoria debe ser un entero positivo");
    }

    this.bloques = [new BloqueMemoria(0, tamanioTotal)];
  }

  obtenerBloques(): readonly IBloqueMemoria[] {
    return [...this.bloques];
  }
}