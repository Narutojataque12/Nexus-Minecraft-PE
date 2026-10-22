# Revisión Anti-Slop adaptada a Nexus / Nexus-specific Anti-Slop review

## Alcance y decisión / Scope and decision

Esta revisión toma como referencia las reglas genéricas del proyecto [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop), pero las adapta al entorno real de Nexus: Minecraft PE 1.0.9, Toolbox 3.2.29, ModPE, Rhino y JavaScript ES5.

This review uses the generic rules from [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop) as a reference, adapted to Nexus's actual target: Minecraft PE 1.0.9, Toolbox 3.2.29, ModPE, Rhino, and JavaScript ES5.

**La versión estable `engine/Nexus_V0.3.0.js` no se modifica.** No se añaden dependencias al motor ni herramientas de lint como dependencia de ejecución. Esta revisión documenta qué reglas son pertinentes y qué debe revisarse en futuros cambios.

**The stable engine file `engine/Nexus_V0.3.0.js` is not modified.** No runtime dependencies or lint tooling are added to the engine. This document records which rules are relevant and what future changes should check.

## Comprobaciones estáticas / Static checks

Revisado el contenido completo del archivo estable del repositorio:

| Comprobación | Resultado observado |
| --- | --- |
| Funciones flecha `=>` | 0 |
| Declaraciones `const` o `let` | 0 |
| Backticks / template strings | 0 |
| Llamadas `.filter(`, `.map(` | 0 |
| Llamadas `.reduce(` | 0 |
| `Object.assign(` | 0 |
| `Reflect.apply` / `Reflect.get` | 0 |
| Texto `...` | 3 coincidencias dentro de mensajes de texto; no son sintaxis spread |

Estas comprobaciones son búsquedas estáticas, no una ejecución del motor. No demuestran por sí solas que el motor funcione en Android ni que esté libre de errores.

These are static source searches, not engine execution. They do not prove Android behavior or absence of defects.

## Reglas pertinentes para código Nexus / Rules relevant to Nexus code

1. **Compatibilidad ES5 obligatoria.** No introducir `let`, `const`, funciones flecha, clases, template strings, spread, módulos ni `async/await` en el motor o en mods dirigidos a Rhino ES5.
2. **Evitar recorridos redundantes.** En código nuevo, revisar si encadenar filtrado y transformación hace varias pasadas innecesarias. No sustituirlo mecánicamente: conservar el orden de callbacks, índices, huecos de arrays y semántica exacta. Los helpers modernos de iteradores no son una alternativa para este runtime.
3. **Evitar copias acumulativas en bucles.** No reconstruir repetidamente un array u objeto acumulador en cada iteración si se puede mutar de forma segura un acumulador local recién creado. No mutar objetos compartidos ni cambiar la semántica observable.
4. **Legibilidad de espacios y bloques.** Mantener sangría, separación y bloques fáciles de revisar. No aplicar un formateo masivo al motor estable solo para satisfacer una regla estilística.
5. **Comprobaciones de tipo y disponibilidad.** Las reglas de Anti-Slop dirigidas a aserciones de TypeScript, tipos `unknown`, alias de tipos, mocks de módulos y parámetros tipados no se trasladan directamente a este archivo JavaScript ES5. Las comprobaciones `typeof` existentes pueden ser detección legítima de APIs opcionales de Rhino/ModPE y no deben eliminarse de forma automática.
6. **Cambios pequeños y verificables.** Revisar el contexto y las llamadas relacionadas antes de cambiar una función; separar la validación estática de las pruebas dentro del juego.

## Límites de esta revisión / Review limits

- No se instaló ni se ejecutó el plugin Oxlint de Anti-Slop: el comando de instalación de la habilidad agotó el tiempo de espera en este entorno.
- No se añadieron dependencias ni configuración de lint. Por tanto, esta revisión **no** afirma que Anti-Slop esté instalado ni que se haya ejecutado una suite de lint.
- No se hizo una prueba en Minecraft PE 1.0.9/Toolbox 3.2.29 en un dispositivo.
- No se realizaron cambios en `engine/Nexus_V0.3.0.js`.

- The Anti-Slop Oxlint plugin was not installed or run; the skill installation command timed out in this environment.
- No dependencies or lint configuration were added. This review does **not** claim that Anti-Slop is installed or that a lint suite ran.
- No on-device Minecraft PE 1.0.9 / Toolbox 3.2.29 test was performed.
- `engine/Nexus_V0.3.0.js` was not changed.

## Procedimiento recomendado para futuros cambios / Recommended future-change procedure

Antes de aceptar una modificación al motor o a un mod:

- Verificar que la sintaxis y las APIs sean compatibles con Rhino ES5.
- Buscar recorridos redundantes, copias repetidas de acumuladores y bloques difíciles de leer.
- Confirmar que las optimizaciones preserven el comportamiento, las firmas de callbacks y el ciclo de vida de Nexus.
- Ejecutar las comprobaciones estáticas disponibles y registrar sus límites.
- Probar dentro del juego antes de afirmar compatibilidad funcional.

Before accepting engine or mod changes:

- Verify syntax and APIs against Rhino ES5.
- Look for redundant passes, repeated accumulator copies, and hard-to-read blocks.
- Confirm optimizations preserve behavior, callback signatures, and Nexus lifecycle.
- Run available static checks and record their limits.
- Test in-game before claiming functional compatibility.
