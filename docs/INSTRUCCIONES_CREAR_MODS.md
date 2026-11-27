# Guía para crear mods de Nexus V0.3.0 / Nexus V0.3.0 Mod Creation Guide

## Español

Nexus V0.3.0 está diseñado para Minecraft PE 1.0.9, Toolbox 3.2.29, ModPE, Rhino y JavaScript ES5.

### Requisitos
- Escribe el mod en ES5: usa `var`, funciones tradicionales, objetos y arrays.
- No uses `let`, `const`, funciones flecha, clases, plantillas literales, módulos, `async/await`, Node.js ni APIs modernas de Bedrock que no estén disponibles en este entorno.
- Guarda los mods en `/sdcard/Nexus/Mods/`.
- Registra exactamente un mod por archivo con una llamada directa a `Nexus.registerMod({...})`.
- Asigna un ID numérico positivo y único, escrito como literal.
- No declares hooks globales de ModPE dentro del mod, como `modTick`, `newLevel`, `useItem` o `procCmd`. El motor centraliza esos hooks.
- No des por verificada una llamada nativa solo porque no haya producido una excepción.
- Los mods comparten el espacio global; el motor no ofrece un sandbox de seguridad real.

### Instalación
1. Carga `engine/Nexus_V0.3.0.js` como script principal en Toolbox.
2. Copia el archivo del mod en `/sdcard/Nexus/Mods/`.
3. Inicia Minecraft, entra en un mundo de prueba y consulta `/Nexus info`.
4. Comprueba dentro del juego los comportamientos pertinentes. Si hay problemas, revisa los registros.

Usa [PLANTILLA_MOD.js](PLANTILLA_MOD.js) como ejemplo mínimo y consulta [REGISTRO_MODS.md](REGISTRO_MODS.md) para conocer las reglas de registro.

### Ciclo de vida y eventos
El registro permite definir `onLoad(api)`, `onEnable(api)` y `onDisable(api)`. Los callbacks de `events` reciben los argumentos sin procesar del evento; no asumas que también reciben `api`. Antes de depender de argumentos concretos, consulta las firmas que aparecen en el código actual del motor.

El motor despacha estos eventos: `worldEnter`, `worldLeave`, `tick`, `useItem`, `destroyBlock`, `startDestroyBlock`, `continueDestroyBlock`, `attack`, `death`, `entityHurt`, `eat`, `projectileHitEntity`, `projectileHitBlock`, `entityAdded`, `entityRemoved`, `chat`, `serverMessage` y `command`. Comprueba sus argumentos en el código vigente antes de usarlos.

### Buenas prácticas
- Mantén ligeros los callbacks `tick`. Evita las búsquedas amplias y las escrituras innecesarias en cada tick.
- Usa IDs únicos, comprueba los resultados de la API y, cuando corresponda, maneja los errores con `try/catch`.
- Registra tus propios comandos con `api.Commands.register(...)`. No registres un comando llamado `Nexus` ni provoques conflictos con otros mods.
- Si puedes resolver un problema desde el mod, no hace falta modificar el motor.
- Distingue entre una revisión estática, una prueba simulada y una prueba real dentro de Minecraft PE.

## English

Nexus V0.3.0 is designed for Minecraft PE 1.0.9, Toolbox 3.2.29, ModPE, Rhino, and JavaScript ES5.

### Requirements
- Write mods in ES5: use `var`, traditional functions, objects, and arrays.
- Do not use `let`, `const`, arrow functions, classes, template literals, modules, `async/await`, Node.js, or modern Bedrock APIs unavailable in this environment.
- Save mods in `/sdcard/Nexus/Mods/`.
- Register exactly one mod per file with a direct call to `Nexus.registerMod({...})`.
- Assign a unique positive numeric ID, written as a literal.
- Do not define global ModPE hooks inside a mod, such as `modTick`, `newLevel`, `useItem`, or `procCmd`. The engine centralizes those hooks.
- Do not treat a native call as verified just because it did not throw an exception.
- Mods share the global namespace; the engine does not provide a real security sandbox.

### Installation
1. Load `engine/Nexus_V0.3.0.js` as the main Toolbox script.
2. Copy the mod file into `/sdcard/Nexus/Mods/`.
3. Start Minecraft, enter a test world, and check `/Nexus info`.
4. Check relevant behavior in-game. If problems occur, inspect the logs.

Use [PLANTILLA_MOD.js](PLANTILLA_MOD.js) as a minimal example and see [REGISTRO_MODS.md](REGISTRO_MODS.md) for the registration rules.

### Lifecycle and events
The registration supports `onLoad(api)`, `onEnable(api)`, and `onDisable(api)`. Callbacks under `events` receive the event’s raw arguments; do not assume they also receive `api`. Before relying on specific arguments, check the signatures in the engine’s current source.

The engine dispatches these events: `worldEnter`, `worldLeave`, `tick`, `useItem`, `destroyBlock`, `startDestroyBlock`, `continueDestroyBlock`, `attack`, `death`, `entityHurt`, `eat`, `projectileHitEntity`, `projectileHitBlock`, `entityAdded`, `entityRemoved`, `chat`, `serverMessage`, and `command`. Check their arguments in the current source before using them.

### Good practices
- Keep `tick` callbacks lightweight. Avoid broad searches and unnecessary writes on every tick.
- Use unique IDs, check API results, and handle errors with `try/catch` when appropriate.
- Register your own commands with `api.Commands.register(...)`. Do not register a command named `Nexus` or create conflicts with other mods.
- If you can solve a problem in the mod, you do not need to modify the engine.
- Distinguish static review and simulated tests from actual in-game testing.
