import { IProceso } from "./IProceso";

export interface IPlanificador {
  encolar(proceso: IProceso): void;
  desencolar(): IProceso | undefined;
  obtenerCola(): readonly IProceso[];
  estaVacia(): boolean;
}