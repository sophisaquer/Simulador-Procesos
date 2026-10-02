import { describe, expect, it } from "vitest";
import { PlanificadorRoundRobin } from "../src/modelos/PlanificadorRoundRobin";
import { Proceso } from "../src/modelos/Proceso";

describe("PlanificadorRoundRobin", () => {
  it("encola y desencola procesos en orden FIFO", () => {
    const planificador = new PlanificadorRoundRobin();
    const proceso1 = new Proceso(1, 100, 5);
    const proceso2 = new Proceso(2, 100, 5);

    planificador.encolar(proceso1);
    planificador.encolar(proceso2);

    expect(planificador.desencolar()?.pid).toBe(1);
    expect(planificador.desencolar()?.pid).toBe(2);
  });

  it("informa si la cola está vacía", () => {
    const planificador = new PlanificadorRoundRobin();

    expect(planificador.estaVacia()).toBe(true);

    planificador.encolar(new Proceso(1, 100, 5));

    expect(planificador.estaVacia()).toBe(false);
  });

  it("permite consultar la cola", () => {
    const planificador = new PlanificadorRoundRobin();
    const proceso = new Proceso(1, 100, 5);

    planificador.encolar(proceso);

    const cola = planificador.obtenerCola();

    expect(cola).toHaveLength(1);
    expect(cola[0].pid).toBe(1);
  });
});