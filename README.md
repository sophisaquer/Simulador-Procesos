# Simulador de Procesos

Proyecto académico desarrollado en TypeScript para simular la gestión de procesos de un sistema operativo.

El simulador implementa administración de memoria mediante First Fit, planificación de CPU con Round Robin, estados de procesos, eventos deterministas de entrada/salida, métricas y consulta del estado del sistema.

## Tecnologías

- TypeScript
- Node.js
- Vitest
- GitHub Actions

## Requisitos

- Node.js 24 o superior
- npm

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm ci
```

## Pruebas

Para ejecutar todos los tests:

```bash
npm test
```

## Verificación de TypeScript

Para comprobar que el proyecto no presenta errores de TypeScript:

```bash
npx tsc --noEmit
```

## Cobertura

Para ejecutar los tests y generar el reporte de cobertura:

```bash
npm run coverage
```

La cobertura global de líneas supera el 90% requerido para la actividad.

## Funcionalidades principales

El simulador permite:

- configurar la memoria total y el quantum;
- registrar procesos con PID, memoria requerida y tiempo total de CPU;
- administrar los estados de los procesos;
- asignar memoria mediante las políticas First Fit, Best Fit o Worst Fit, seleccionables al crear el simulador;
- dividir bloques de memoria cuando existe espacio sobrante;
- liberar memoria y fusionar bloques libres adyacentes;
- ejecutar la simulación de forma determinista por ticks;
- planificar la CPU mediante Round Robin;
- renovar el quantum cuando no existen otros procesos listos;
- rotar procesos cuando se agota el quantum y existen otros procesos listos;
- finalizar procesos y liberar su memoria;
- simular eventos deterministas de entrada/salida;
- bloquear procesos sin liberar su memoria;
- reincorporar procesos bloqueados a la cola de listos;
- calcular métricas de memoria y utilización de CPU;
- registrar cambios de contexto;
- calcular fragmentación externa;
- consultar el estado completo del sistema.

## Estados de los procesos

Los procesos pueden encontrarse en los siguientes estados:

- Nuevo
- Esperando Memoria
- Listo
- Ejecutando
- Bloqueado
- Terminado

## Administración de memoria

La memoria se administra mediante bloques.

Para la asignación se puede elegir entre tres políticas, que implementan la interfaz `IPoliticaAsignacion`:

- First Fit: elige el primer bloque libre suficiente.
- Best Fit: elige el bloque libre suficiente de menor tamaño.
- Worst Fit: elige el bloque libre suficiente de mayor tamaño.

Ante empates se elige el bloque de menor dirección. Si no se indica ninguna, el simulador usa First Fit.

Cuando un proceso termina, su memoria se libera. Los bloques libres adyacentes se fusionan para reducir la fragmentación externa.

## Planificación de CPU

La planificación se realiza mediante Round Robin.

Cada proceso ejecuta una cantidad limitada de ticks determinada por el quantum.

Si el quantum se agota y existen otros procesos listos, el proceso actual vuelve al final de la cola de listos.

Si no existen otros procesos listos, el proceso continúa ejecutándose con el quantum renovado.

La finalización de un proceso tiene prioridad sobre la rotación por quantum.

## Entrada y salida

Los procesos pueden tener eventos deterministas de entrada/salida configurados desde los tests.

Cuando se dispara un evento de entrada/salida:

- el proceso pasa al estado Bloqueado;
- libera la CPU;
- conserva la memoria asignada;
- no consume CPU mientras está bloqueado;
- vuelve al final de la cola de Listos cuando finaliza el tiempo de bloqueo.

## Métricas

El simulador permite consultar las siguientes métricas:

- ocupación de memoria;
- utilización de CPU;
- cambios de contexto;
- memoria libre total;
- mayor bloque libre;
- fragmentación externa.

## Consulta del estado del sistema

El estado del sistema permite consultar:

- tick actual;
- proceso que se encuentra en CPU;
- cola de procesos Listos;
- procesos en espera de memoria;
- procesos bloqueados;
- procesos terminados;
- mapa actual de memoria.

Las consultas utilizan vistas o copias para proteger el estado interno del simulador.

## Estructura del proyecto

```text
src/
├── interfaces/
└── modelos/

tests/

.github/
└── workflows/
    └── tests.yml
```

El código de producción se encuentra en `src/`.

Las interfaces se encuentran en `src/interfaces/`.

Las implementaciones se encuentran en `src/modelos/`.

Las pruebas automatizadas se encuentran en `tests/`.

## Integración continua

El proyecto utiliza GitHub Actions para ejecutar verificaciones automáticas.

En cada push o pull request sobre la rama `main` se ejecutan:

1. instalación de dependencias;
2. verificación de TypeScript;
3. tests automatizados;
4. generación del reporte de cobertura.

El workflow se encuentra en:

```text
.github/workflows/tests.yml
```

## Comandos principales

Instalar dependencias:

```bash
npm ci
```

Ejecutar tests:

```bash
npm test
```

Verificar TypeScript:

```bash
npx tsc --noEmit
```

Ejecutar cobertura:

```bash
npm run coverage
```

## Modalidad del proyecto

El proyecto funciona como una biblioteca de clases.

No utiliza interfaz gráfica ni menú de consola.

El comportamiento del simulador se verifica mediante tests automatizados.

## Documentación

- Informe técnico: `docs/AE2_Informe_Saquer.pdf`
- Bitácora: `docs/AE2_Bitácora_Saquer.pdf`
- Diagrama de clases (PNG y editable): `docs/diagramas/diagrama-clases.png` y `docs/diagramas/diagrama-clases.drawio`
- Diagramas de secuencia (PNG y editables) en `docs/diagramas/`:
  - Admisión y asignación de memoria (RF03/RF04): `secuencia-admision`
  - Tick de Round Robin (RF06/RF07): `secuencia-round-robin`
  - Bloqueo y retorno por Entrada/Salida (RF08): `secuencia-entrada-salida`
- Evidencias de tests, cobertura y CI: `docs/evidencias/`

Versión entregada: tag `v1.0-ae2`.