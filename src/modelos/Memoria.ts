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
  if (!Number.isInteger(pid) || pid <= 0) {
    throw new Error("el PID debe ser un entero positivo");
  }

  if (
    !Number.isInteger(tamanioRequerido) ||
    tamanioRequerido <= 0
  ) {
    throw new Error(
      "el tamaño requerido debe ser un entero positivo"
    );
  }

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

  liberarMemoria(pid: number): boolean {
  const indice = this.bloques.findIndex(
    (bloque) => bloque.pid === pid
  );

  if (indice === -1) {
    return false;
  }

  const bloque = this.bloques[indice];

  this.bloques.splice(
    indice,
    1,
    new BloqueMemoria(bloque.inicio, bloque.tamanio)
  );

  this.fusionarBloquesLibres();
  return true;
}

private fusionarBloquesLibres(): void {
  const fusionados: BloqueMemoria[] = [];

  for (const bloque of this.bloques) {
    const ultimo = fusionados[fusionados.length - 1];

    if (ultimo?.estaLibre() && bloque.estaLibre()) {
      fusionados[fusionados.length - 1] = new BloqueMemoria(
        ultimo.inicio,
        ultimo.tamanio + bloque.tamanio
      );
    } else {
      fusionados.push(bloque);
    }
  }

  this.bloques = fusionados;
}
}