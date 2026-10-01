export interface IBloqueMemoria {
  readonly inicio: number;
  readonly tamanio: number;
  readonly pid: number | null;
  estaLibre(): boolean;
}