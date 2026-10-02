import { IProceso } from "./IProceso";

export interface IPlanificador {
  encolar(proceso: IProceso): void;
  desencolar(): IProceso | undefined;
  obtenerPids(): readonly number[];
  estaVacia(): boolean;
}