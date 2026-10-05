import { describe, expect, it } from "vitest";
import { Memoria } from "../src/modelos/Memoria";
import { FirstFit } from "../src/modelos/FirstFit";
import { BestFit } from "../src/modelos/BestFit";
import { WorstFit } from "../src/modelos/WorstFit";
import { IPoliticaAsignacion } from "../src/interfaces/IPoliticaAsignacion";

describe("Memoria", () => {
  it("inicia con un único bloque libre del tamaño total", () => {
    const memoria = new Memoria(1024);
    const bloques = memoria.obtenerBloques();

    expect(memoria.tamanioTotal).toBe(1024);
    expect(bloques).toHaveLength(1);
    expect(bloques[0].inicio).toBe(0);
    expect(bloques[0].tamanio).toBe(1024);
    expect(bloques[0].estaLibre()).toBe(true);
  });

  it("rechaza un tamaño de memoria inválido", () => {
    expect(() => new Memoria(0)).toThrow();
    expect(() => new Memoria(-1)).toThrow();
    expect(() => new Memoria(10.5)).toThrow();
  });
  it("divide un bloque cuando sobra espacio", () => {
  const memoria = new Memoria(1024);

  const asignado = memoria.asignarMemoria(1, 256);
  const bloques = memoria.obtenerBloques();

  expect(asignado).toBe(true);
  expect(bloques).toHaveLength(2);

  expect(bloques[0].inicio).toBe(0);
  expect(bloques[0].tamanio).toBe(256);
  expect(bloques[0].pid).toBe(1);

  expect(bloques[1].inicio).toBe(256);
  expect(bloques[1].tamanio).toBe(768);
  expect(bloques[1].estaLibre()).toBe(true);
});

it("realiza una asignación exacta sin crear un bloque vacío", () => {
  const memoria = new Memoria(1024);

  const asignado = memoria.asignarMemoria(1, 1024);
  const bloques = memoria.obtenerBloques();

  expect(asignado).toBe(true);
  expect(bloques).toHaveLength(1);
  expect(bloques[0].tamanio).toBe(1024);
  expect(bloques[0].pid).toBe(1);
});

it("no modifica la memoria si no existe un bloque suficiente", () => {
  const memoria = new Memoria(1024);

  memoria.asignarMemoria(1, 800);
  const antes = memoria.obtenerBloques();

  const asignado = memoria.asignarMemoria(2, 300);
  const despues = memoria.obtenerBloques();

  expect(asignado).toBe(false);
  expect(despues).toEqual(antes);
});

it("fusiona con el bloque libre de la izquierda", () => {
  const memoria = new Memoria(1000);

  memoria.asignarMemoria(1, 200);
  memoria.asignarMemoria(2, 300);
  memoria.asignarMemoria(3, 500);

  memoria.liberarMemoria(1);
  memoria.liberarMemoria(2);

  const bloques = memoria.obtenerBloques();

  expect(bloques).toHaveLength(2);

  expect(bloques[0].inicio).toBe(0);
  expect(bloques[0].tamanio).toBe(500);
  expect(bloques[0].estaLibre()).toBe(true);

  expect(bloques[1].pid).toBe(3);
  expect(bloques[1].tamanio).toBe(500);
});

it("fusiona bloques libres a ambos lados", () => {
  const memoria = new Memoria(1000);

  memoria.asignarMemoria(1, 200);
  memoria.asignarMemoria(2, 300);
  memoria.asignarMemoria(3, 200);

  memoria.liberarMemoria(1);
  memoria.liberarMemoria(3);
  memoria.liberarMemoria(2);

  const bloques = memoria.obtenerBloques();

  expect(bloques).toHaveLength(1);
  expect(bloques[0].tamanio).toBe(1000);
  expect(bloques[0].estaLibre()).toBe(true);
});

it("devuelve false si el proceso no tiene memoria asignada", () => {
  const memoria = new Memoria(1024);

  expect(memoria.liberarMemoria(99)).toBe(false);
});

it("fusiona con el bloque libre de la derecha", () => {
  const memoria = new Memoria(1000);

  memoria.asignarMemoria(1, 200);
  memoria.asignarMemoria(2, 300);
  memoria.asignarMemoria(3, 200);

  memoria.liberarMemoria(3);
  memoria.liberarMemoria(2);

  const bloques = memoria.obtenerBloques();

  expect(bloques).toHaveLength(2);
  expect(bloques[0].pid).toBe(1);

  expect(bloques[1].inicio).toBe(200);
  expect(bloques[1].tamanio).toBe(800);
  expect(bloques[1].estaLibre()).toBe(true);
});

it("rechaza parámetros inválidos al asignar memoria", () => {
  const memoria = new Memoria(1024);

  expect(() => memoria.asignarMemoria(0, 100)).toThrow();
  expect(() => memoria.asignarMemoria(-1, 100)).toThrow();
  expect(() => memoria.asignarMemoria(1.5, 100)).toThrow();

  expect(() => memoria.asignarMemoria(1, 0)).toThrow();
  expect(() => memoria.asignarMemoria(1, -100)).toThrow();
  expect(() => memoria.asignarMemoria(1, 100.5)).toThrow();

  const bloques = memoria.obtenerBloques();

  expect(bloques).toHaveLength(1);
  expect(bloques[0].inicio).toBe(0);
  expect(bloques[0].tamanio).toBe(1024);
  expect(bloques[0].estaLibre()).toBe(true);
});

  it("asigna distinto según la política sin modificar Memoria", () => {
    const asignarConPolitica = (politica: IPoliticaAsignacion): number => {
      const memoria = new Memoria(1000, politica);

      memoria.asignarMemoria(1, 200);
      memoria.asignarMemoria(2, 50);
      memoria.asignarMemoria(3, 100);
      memoria.asignarMemoria(4, 50);
      memoria.liberarMemoria(1);
      memoria.liberarMemoria(3);
      // huecos libres: 0 (200), 250 (100) y 400 (600)

      memoria.asignarMemoria(5, 80);

      const bloque = memoria.obtenerBloques().find((b) => b.pid === 5);
      return bloque?.inicio ?? -1;
    };

    expect(asignarConPolitica(new FirstFit())).toBe(0);
    expect(asignarConPolitica(new BestFit())).toBe(250);
    expect(asignarConPolitica(new WorstFit())).toBe(400);
  });
});