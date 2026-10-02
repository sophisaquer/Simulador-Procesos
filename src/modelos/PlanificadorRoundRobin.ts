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

 obtenerPids(): readonly number[] {
   return this.cola.map((proceso) => proceso.pid);
  }

  estaVacia(): boolean {
    return this.cola.length === 0;
  }
}