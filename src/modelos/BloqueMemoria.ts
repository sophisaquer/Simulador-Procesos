import { IBloqueMemoria } from "../interfaces/IBloqueMemoria";

export class BloqueMemoria implements IBloqueMemoria {
  constructor(
    public readonly inicio: number,
    public readonly tamanio: number,
    public readonly pid: number | null = null
  ) {}

  estaLibre(): boolean {
    return this.pid === null;
  }
}