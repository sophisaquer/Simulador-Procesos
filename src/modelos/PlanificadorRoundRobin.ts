import { IPlanificador } from "../interfaces/IPlanificador";
import { IProceso } from "../interfaces/IProceso";

export class PlanificadorRoundRobin implements IPlanificador {
  private cola: IProceso[] = [];

  encolar(proceso: IProceso): void {
    this.cola.push(proceso);
  }

  desencolar(): IProceso | undefined {
    return this.cola.shift();
  }

  obtenerCola(): readonly IProceso[] {
    return [...this.cola];
  }

  estaVacia(): boolean {
    return this.cola.length === 0;
  }
}