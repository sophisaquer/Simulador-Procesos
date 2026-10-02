import { IProceso } from "../interfaces/IProceso";
import { EstadoProceso } from "./EstadoProceso";

export class Proceso implements IProceso {
  private cpuRestante: number;
  private estado: EstadoProceso;
  private quantumConsumido: number;
  private tiempoBloqueoRestante: number;
  private disparoEntradaSalida: number | null = null;
private duracionEntradaSalida: number = 0;
private eventoEntradaSalidaDisparado: boolean = false;

  constructor(
    public readonly pid: number,
    public readonly memoriaRequerida: number,
    public readonly tiempoCpuTotal: number
  ) {
    if (!Number.isInteger(pid) || pid <= 0) {
      throw new Error("el PID debe ser un entero positivo");
    }

    if (!Number.isInteger(memoriaRequerida) || memoriaRequerida <= 0) {
      throw new Error("la memoria requerida debe ser un entero positivo");
    }

    if (!Number.isInteger(tiempoCpuTotal) || tiempoCpuTotal <= 0) {
      throw new Error("el tiempo de CPU debe ser un entero positivo");
    }

    this.cpuRestante = tiempoCpuTotal;
    this.estado = EstadoProceso.NUEVO;
    this.quantumConsumido = 0;
    this.tiempoBloqueoRestante = 0;
  }

  obtenerCpuRestante(): number {
    return this.cpuRestante;
  }

  obtenerEstado(): EstadoProceso {
    return this.estado;
  }

  obtenerQuantumConsumido(): number {
    return this.quantumConsumido;
  }

  obtenerTiempoBloqueoRestante(): number {
    return this.tiempoBloqueoRestante;
  }
  marcarEsperandoMemoria(): void {
  this.estado = EstadoProceso.ESPERANDO_MEMORIA;
}

marcarListo(): void {
  this.estado = EstadoProceso.LISTO;
}

marcarEjecutando(): void {
  this.estado = EstadoProceso.EJECUTANDO;
}

ejecutarTick(): void {
  if (this.cpuRestante > 0) {
    this.cpuRestante--;
    this.quantumConsumido++;
  }
}

reiniciarQuantum(): void {
  this.quantumConsumido = 0;
}

marcarTerminado(): void {
  this.estado = EstadoProceso.TERMINADO;
}

configurarEntradaSalida(
  despuesDeTicksCpu: number,
  duracion: number
): void {
  if (
    !Number.isInteger(despuesDeTicksCpu) ||
    despuesDeTicksCpu <= 0
  ) {
    throw new Error(
      "el momento de entrada y salida debe ser un entero positivo"
    );
  }

  if (!Number.isInteger(duracion) || duracion <= 0) {
    throw new Error(
      "la duración de entrada y salida debe ser un entero positivo"
    );
  }

  this.disparoEntradaSalida = despuesDeTicksCpu;
  this.duracionEntradaSalida = duracion;
  this.eventoEntradaSalidaDisparado = false;
}

debeBloquearsePorEntradaSalida(): boolean {
  const cpuConsumida =
    this.tiempoCpuTotal - this.cpuRestante;

  return (
    !this.eventoEntradaSalidaDisparado &&
    this.disparoEntradaSalida !== null &&
    cpuConsumida === this.disparoEntradaSalida &&
    this.cpuRestante > 0
  );
}

bloquearPorEntradaSalida(): void {
  if (!this.debeBloquearsePorEntradaSalida()) {
    return;
  }

  this.estado = EstadoProceso.BLOQUEADO;
  this.tiempoBloqueoRestante = this.duracionEntradaSalida;
  this.eventoEntradaSalidaDisparado = true;
}

actualizarBloqueo(): boolean {
  if (
    this.estado !== EstadoProceso.BLOQUEADO ||
    this.tiempoBloqueoRestante <= 0
  ) {
    return false;
  }

  this.tiempoBloqueoRestante--;

  if (this.tiempoBloqueoRestante === 0) {
    this.estado = EstadoProceso.LISTO;
    return true;
  }

  return false;
}
}