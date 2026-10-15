# Guía de creación de mods para Nexus V0.3.0 / Nexus V0.3.0 Mod Creation Guide

## Español

Nexus V0.3.0 está orientado a Minecraft PE 1.0.9, Toolbox 3.2.29, ModPE, Rhino y JavaScript ES5.

### Requisitos
- Utiliza sintaxis ES5: `var`, funciones tradicionales, objetos y arrays.
- Evita `let`, `const`, funciones flecha, clases, plantillas literales, módulos, `async/await`, Node.js y APIs modernas de Bedrock que no estén disponibles en el entorno.
- Coloca los mods en `/sdcard/Nexus/Mods/`.
- Registra exactamente un mod por archivo mediante una llamada directa a `Nexus.registerMod({...})`.
- Utiliza un ID numérico positivo, único y escrito como literal.
- No declares hooks globales de ModPE dentro de un mod, como `modTick`, `newLevel`, `useItem` o `procCmd`; el motor centraliza esos hooks.
- No consideres verificada una llamada nativa solo porque no haya producido una excepción.
- Los mods comparten el espacio global; el motor no proporciona un sandbox de seguridad real.

### Instalación
1. Carga `engine/Nexus_V0.3.0.js` como script principal en Toolbox.
2. Copia el archivo del mod a `/sdcard/Nexus/Mods/`.
3. Inicia Minecraft, entra en un mundo de prueba y consulta `/Nexus info`.
4. Comprueba visualmente los comportamientos relevantes dentro del juego y revisa los registros si hay problemas.

### Plantilla
Utiliza [PLANTILLA_MOD.js](PLANTILLA_MOD.js) como ejemplo mínimo y [REGISTRO_MODS.md](REGISTRO_MODS.md) para consultar las reglas de registro.

### Ciclo de vida y eventos
El registro permite definir `onLoad(api)`, `onEnable(api)` y `onDisable(api)`. Los callbacks de `events` reciben los argumentos crudos del evento; no se debe asumir que reciben `api`. Consulta las firmas del código del motor antes de depender de argumentos concretos.

Los eventos despachados incluyen `worldEnter`, `worldLeave`, `tick`, `useItem`, `destroyBlock`, `startDestroyBlock`, `continueDestroyBlock`, `attack`, `death`, `entityHurt`, `eat`, `projectileHitEntity`, `projectileHitBlock`, `entityAdded`, `entityRemoved`, `chat`, `serverMessage` y `command`. Comprueba sus argumentos en el código vigente antes de utilizarlos.

### Buenas prácticas
- Mantén ligeros los callbacks `tick`; evita búsquedas amplias o escrituras innecesarias en cada tick.
- Utiliza IDs únicos, comprueba los resultados de la API y maneja los errores con `try/catch` cuando corresponda.
- Registra comandos propios mediante `api.Commands.register(...)`; evita registrar un comando llamado `Nexus` o crear conflictos con otros mods.
- Resuelve los problemas desde el mod cuando no sea necesario modificar el motor.
- Distingue entre revisión estática, prueba simulada y prueba real dentro de Minecraft PE.

## English

Nexus V0.3.0 targets Minecraft PE 1.0.9, Toolbox 3.2.29, ModPE, Rhino, and JavaScript ES5.

### Requirements
- Use ES5 syntax: `var`, traditional functions, objects, and arrays.
- Avoid `let`, `const`, arrow functions, classes, template literals, modules, `async/await`, Node.js, and modern Bedrock APIs unavailable in the target environment.
- Place mods in `/sdcard/Nexus/Mods/`.
- Register exactly one mod per file through a direct `Nexus.registerMod({...})` call.
- Use a unique positive numeric ID written as a literal.
- Do not define global ModPE hooks such as `modTick`, `newLevel`, `useItem`, or `procCmd` inside a mod; the engine centralizes those hooks.
- Do not treat a native call as verified merely because it did not throw an exception.
- Mods share the global namespace; the engine does not provide a real security sandbox.

### Installation
1. Load `engine/Nexus_V0.3.0.js` as the main Toolbox script.
2. Copy the mod file to `/sdcard/Nexus/Mods/`.
3. Start Minecraft, enter a test world, and check `/Nexus info`.
4. Verify relevant behavior in-game and inspect logs if problems occur.

Use [PLANTILLA_MOD.js](PLANTILLA_MOD.js) as a minimal example and [REGISTRO_MODS.md](REGISTRO_MODS.md) for registration rules.

The registration supports `onLoad(api)`, `onEnable(api)`, and `onDisable(api)`. Callbacks under `events` receive raw event arguments; do not assume they receive `api`. Check the engine's current signatures before relying on specific arguments.

Dispatched events include `worldEnter`, `worldLeave`, `tick`, `useItem`, `destroyBlock`, `startDestroyBlock`, `continueDestroyBlock`, `attack`, `death`, `entityHurt`, `eat`, `projectileHitEntity`, `projectileHitBlock`, `entityAdded`, `entityRemoved`, `chat`, `serverMessage`, and `command`. Check their arguments in the current source before using them. Keep tick work lightweight, check API results, handle errors, avoid conflicts, and distinguish static or simulated checks from actual in-game testing.
