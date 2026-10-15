# Crear mods para Nexus V0.3.0 / Creating Nexus V0.3.0 Mods

## Español

Nexus V0.3.0 está orientado a Minecraft PE 1.0.9 + Toolbox 3.2.29, ModPE y Rhino con JavaScript ES5.

### Requisitos importantes
- Usa sintaxis ES5: `var`, funciones tradicionales, objetos y arrays.
- Evita `let`, `const`, funciones flecha, clases, plantillas literales, módulos, `async/await`, Node.js y APIs modernas de Bedrock que no estén presentes en el entorno.
- Los mods se colocan en `/sdcard/Nexus/Mods/`.
- Cada archivo registra **exactamente un** mod mediante una llamada estática a `Nexus.registerMod({...})`.
- El ID del mod debe ser un entero positivo y único. Usa un literal numérico directo en `id`.
- No declares hooks globales de ModPE desde un mod, por ejemplo `modTick`, `newLevel`, `useItem` o `procCmd`: Nexus ya los centraliza.
- No asumas que una llamada nativa está verificada solo porque no lanzó una excepción.
- El ámbito de mods comparte globales; no es un sandbox de seguridad.

### Instalación
1. Carga `engine/Nexus_V0.3.0.js` como script principal en Toolbox.
2. Copia el archivo del mod a `/sdcard/Nexus/Mods/`.
3. Inicia Minecraft, entra a un mundo de prueba y revisa `/Nexus info`.
4. Comprueba visualmente dentro del juego los comportamientos relevantes y revisa el registro si hay problemas.

### Plantilla
Consulta [PLANTILLA_MOD.js](PLANTILLA_MOD.js) para un archivo mínimo correcto y [REGISTRO_MODS.md](REGISTRO_MODS.md) para reglas y ejemplos de registro.

### Ciclo de vida y eventos
Un registro puede definir `onLoad(api)`, `onEnable(api)` y `onDisable(api)`. Los callbacks del objeto `events` reciben los argumentos crudos del evento; no asumas que reciben `api`. Usa la firma que documenta el motor y revisa su código cuando necesites detalles.

Eventos despachados por hooks del motor incluyen `worldEnter`, `worldLeave`, `tick`, `useItem`, `destroyBlock`, `startDestroyBlock`, `continueDestroyBlock`, `attack`, `death`, `entityHurt`, `eat`, `projectileHitEntity`, `projectileHitBlock`, `entityAdded`, `entityRemoved`, `chat`, `serverMessage` y `command`. Verifica en el código vigente los argumentos concretos antes de depender de ellos.

### Buenas prácticas
- Mantén los callbacks `tick` ligeros; no hagas búsquedas amplias ni escrituras cada tick sin necesidad.
- Usa IDs únicos, comprueba resultados de las APIs y maneja los errores con `try/catch` cuando corresponda.
- Para comandos propios usa `api.Commands.register(...)`; no registres un comando llamado `Nexus` ni generes conflictos con otros mods.
- Conserva el motor sin modificar mientras el problema pueda resolverse desde el mod.
- Distingue entre revisión estática, prueba simulada y prueba real en MCPE.

## English

Nexus V0.3.0 targets Minecraft PE 1.0.9 + Toolbox 3.2.29, ModPE, and Rhino running JavaScript ES5.

### Key requirements
- Use ES5 syntax: `var`, traditional functions, objects, and arrays.
- Avoid `let`, `const`, arrow functions, classes, template literals, modules, `async/await`, Node.js, and modern Bedrock APIs unavailable in the target environment.
- Put mods in `/sdcard/Nexus/Mods/`.
- Each file must contain **exactly one** static `Nexus.registerMod({...})` call.
- Mod IDs must be unique positive integers; use a direct numeric literal for `id`.
- Do not define ModPE global hooks such as `modTick`, `newLevel`, `useItem`, or `procCmd` in a mod; Nexus centralizes them.
- A native call is not verified merely because it did not throw.
- Mod code shares globals; this is not a security sandbox.

### Installation
1. Load `engine/Nexus_V0.3.0.js` as the main Toolbox script.
2. Copy the mod file into `/sdcard/Nexus/Mods/`.
3. Start Minecraft, enter a test world, and check `/Nexus info`.
4. Verify relevant behavior visually in-game and inspect logs if issues occur.

See [PLANTILLA_MOD.js](PLANTILLA_MOD.js) for a minimal template and [REGISTRO_MODS.md](REGISTRO_MODS.md) for registration rules.

Lifecycle methods are `onLoad(api)`, `onEnable(api)`, and `onDisable(api)`. Callbacks in `events` receive raw event arguments; do not assume they receive `api`. Check the current engine for exact argument signatures. Keep tick work lightweight, handle errors, avoid ID/command/resource conflicts, and distinguish static or simulated checks from actual MCPE testing.
