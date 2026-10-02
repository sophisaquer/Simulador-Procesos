import { IMemoria } from "../interfaces/IMemoria";
import { IBloqueMemoria } from "../interfaces/IBloqueMemoria";
import { IPoliticaAsignacion } from "../interfaces/IPoliticaAsignacion";
import { BloqueMemoria } from "./BloqueMemoria";
import { FirstFit } from "./FirstFit";

export class Memoria implements IMemoria {
  private bloques: BloqueMemoria[];
  private readonly politica: IPoliticaAsignacion;

  constructor(
    public readonly tamanioTotal: number,
    politica: IPoliticaAsignacion = new FirstFit()
  ) {
    if (!Number.isInteger(tamanioTotal) || tamanioTotal <= 0) {
      throw new Error("el tamaño de memoria debe ser un entero positivo");
    }

    this.politica = politica;
    this.bloques = [new BloqueMemoria(0, tamanioTotal)];
  }

  obtenerBloques(): readonly IBloqueMemoria[] {
    return [...this.bloques];
  }

  asignarMemoria(pid: number, tamanioRequerido: number): boolean {
    const indice = this.politica.buscarBloque(
      this.bloques,
      tamanioRequerido
    );

    if (indice === -1) {
      return false;
    }

    const bloque = this.bloques[indice];
    const sobrante = bloque.tamanio - tamanioRequerido;

    const ocupado = new BloqueMemoria(
      bloque.inicio,
      tamanioRequerido,
      pid
    );

    if (sobrante === 0) {
      this.bloques.splice(indice, 1, ocupado);
      return true;
    }

    const libre = new BloqueMemoria(
      bloque.inicio + tamanioRequerido,
      sobrante
    );

    this.bloques.splice(indice, 1, ocupado, libre);
    return true;
  }
}