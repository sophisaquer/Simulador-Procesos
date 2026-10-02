import { ISimulador } from "../interfaces/ISimulador";
import { IMemoria } from "../interfaces/IMemoria";
import { Memoria } from "./Memoria";

export class Simulador implements ISimulador {
  public readonly memoria: IMemoria;
  public readonly tickActual: number = 0;

  constructor(
    tamanioMemoria: number,
    public readonly quantum: number
  ) {
    if (!Number.isInteger(quantum) || quantum <= 0) {
      throw new Error("el quantum debe ser un entero positivo");
    }

    this.memoria = new Memoria(tamanioMemoria);
  }
}