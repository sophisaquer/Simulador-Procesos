export interface IMetricas {
  readonly ocupacionMemoria: number;
  readonly utilizacionCpu: number;
  readonly cambiosContexto: number;
  readonly memoriaLibreTotal: number;
  readonly mayorBloqueLibre: number;
  readonly fragmentacionExterna: number;
}