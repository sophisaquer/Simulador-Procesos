import { EstadoProceso } from "../modelos/EstadoProceso";

export interface IVistaProceso {
  readonly pid: number;
  readonly estado: EstadoProceso;
  readonly cpuRestante: number;
  readonly quantumConsumido: number;
  readonly tiempoBloqueoRestante: number;
}

export interface IVistaBloqueMemoria {
  readonly inicio: number;
  readonly tamanio: number;
  readonly pid: number | null;
  readonly libre: boolean;
}

export interface IEstadoSistema {
  readonly tick: number;
  readonly procesoEnCpu: IVistaProceso | null;
  readonly listos: readonly IVistaProceso[];
  readonly esperandoMemoria: readonly IVistaProceso[];
  readonly bloqueados: readonly IVistaProceso[];
  readonly terminados: readonly IVistaProceso[];
  readonly mapaMemoria: readonly IVistaBloqueMemoria[];
}