# Cómo crear mods para mi motor Nexus V0.3.0 / Creating Mods for My Nexus V0.3.0 Engine

## Español

Preparé mi motor Nexus V0.3.0 para Minecraft PE 1.0.9 + Toolbox 3.2.29, ModPE y Rhino con JavaScript ES5.

### Requisitos importantes
- Usa sintaxis ES5: `var`, funciones tradicionales, objetos y arrays.
- Evita `let`, `const`, funciones flecha, clases, plantillas literales, módulos, `async/await`, Node.js y APIs modernas de Bedrock que no estén presentes en el entorno.
- Coloca los mods en `/sdcard/Nexus/Mods/`.
- Registra **exactamente un** mod por archivo mediante una llamada estática a `Nexus.registerMod({...})`.
- Usa un ID numérico positivo, único y escrito directamente como literal.
- No declares hooks globales de ModPE dentro del mod, por ejemplo `modTick`, `newLevel`, `useItem` o `procCmd`: centralicé esos hooks en mi motor.
- No des por verificada una llamada nativa solo porque no haya lanzado una excepción.
- Ten presente que el código de los mods comparte el espacio global; no hay un sandbox de seguridad real.

### Instalación
1. Carga `engine/Nexus_V0.3.0.js` como script principal en Toolbox.
2. Copia el archivo del mod a `/sdcard/Nexus/Mods/`.
3. Inicia Minecraft, entra a un mundo de prueba y revisa `/Nexus info`.
4. Comprueba visualmente dentro del juego los comportamientos relevantes y revisa el registro si encuentras problemas.

### Plantilla
Te dejo [PLANTILLA_MOD.js](PLANTILLA_MOD.js) como archivo mínimo de ejemplo y [REGISTRO_MODS.md](REGISTRO_MODS.md) para consultar las reglas de registro.

### Ciclo de vida y eventos
Mi registro permite definir `onLoad(api)`, `onEnable(api)` y `onDisable(api)`. Configuré los callbacks de `events` para recibir los argumentos crudos del evento; no esperes que reciban `api`. Consulta las firmas del código del motor antes de depender de argumentos concretos.

Mi motor despacha eventos como `worldEnter`, `worldLeave`, `tick`, `useItem`, `destroyBlock`, `startDestroyBlock`, `continueDestroyBlock`, `attack`, `death`, `entityHurt`, `eat`, `projectileHitEntity`, `projectileHitBlock`, `entityAdded`, `entityRemoved`, `chat`, `serverMessage` y `command`. Comprueba sus argumentos en el código vigente antes de usarlos.

### Buenas prácticas
- Mantén ligeros los callbacks `tick`; evita búsquedas amplias o escrituras innecesarias cada tick.
- Usa IDs únicos, comprueba los resultados de las API y maneja los errores con `try/catch` cuando corresponda.
- Registra los comandos propios con `api.Commands.register(...)`; no registres un comando llamado `Nexus` ni generes conflictos con otros mods.
- No modifiques mi motor si puedes resolver el problema desde el mod.
- Distingue entre revisión estática, prueba simulada y prueba real dentro de Minecraft PE.

## English

I prepared my Nexus V0.3.0 engine for Minecraft PE 1.0.9 + Toolbox 3.2.29, ModPE, and Rhino running JavaScript ES5.

### Key requirements
- Use ES5 syntax: `var`, traditional functions, objects, and arrays.
- Avoid `let`, `const`, arrow functions, classes, template literals, modules, `async/await`, Node.js, and modern Bedrock APIs unavailable in the target environment.
- Put mods in `/sdcard/Nexus/Mods/`.
- Register **exactly one** mod per file through a static `Nexus.registerMod({...})` call.
- Use a unique positive numeric ID written directly as a literal.
- Do not define global ModPE hooks such as `modTick`, `newLevel`, `useItem`, or `procCmd` inside a mod; I centralized those hooks in my engine.
- Do not treat a native call as verified merely because it did not throw an exception.
- Keep in mind that mod code shares the global namespace; this is not a real security sandbox.

### Installation
1. Load `engine/Nexus_V0.3.0.js` as the main Toolbox script.
2. Copy the mod file to `/sdcard/Nexus/Mods/`.
3. Start Minecraft, enter a test world, and check `/Nexus info`.
4. Verify relevant behavior visually in-game and inspect the logs if you encounter issues.

I provide [PLANTILLA_MOD.js](PLANTILLA_MOD.js) as a minimal example and [REGISTRO_MODS.md](REGISTRO_MODS.md) for registration rules.

My registration supports `onLoad(api)`, `onEnable(api)`, and `onDisable(api)`. I configured callbacks under `events` to receive raw event arguments; do not assume they receive `api`. Check the engine's exact signatures before relying on specific arguments.

My engine dispatches events such as `worldEnter`, `worldLeave`, `tick`, `useItem`, `destroyBlock`, `startDestroyBlock`, `continueDestroyBlock`, `attack`, `death`, `entityHurt`, `eat`, `projectileHitEntity`, `projectileHitBlock`, `entityAdded`, `entityRemoved`, `chat`, `serverMessage`, and `command`. Check their arguments in the current code before using them. Keep tick work lightweight, check API results, handle errors, avoid conflicts, and distinguish static or simulated checks from actual MCPE testing.
