# Nexus V0.3.0 — estable y jugable

## Español

¡Bienvenidos a Nexus V0.3.0! Presento esta versión como la versión estable y jugable de mi motor para Minecraft Pocket Edition 1.0.9 con Toolbox 3.2.29, ModPE y Rhino/JavaScript ES5. Es mi versión de trabajo definitiva por el momento.

### Novedades que incorporé
- Consolidé el registro mediante `Nexus.registerMod({...})`: un mod por archivo con un ID numérico positivo y único.
- Preparé el diagnóstico de `/Nexus info` para mostrar estado del motor, archivos, mods, errores, advertencias y registros conocidos.
- Unifiqué los comandos documentados bajo `/Nexus`: `help`, `info`, `log`, `load`, `on ID`, `off ID`, `IDS` y `resources`.
- Organicé las API para eventos, tareas programadas, logs, mods, comandos, objetos, jugador, mundo, entidades, bloques, efectos, UI, recursos, registro, compatibilidad, almacenamiento, configuración y datos.
- Incorporé validaciones para IDs duplicadas y detección de conflictos de registro compatibles.
- Preparé nuevas guías para creadores y asistentes de IA: instrucciones para IA, plantilla ES5 y reglas de registro.

### Cambios documentales que hice
- Reescribí el README como bienvenida a mi versión V0.3.0 estable y jugable.
- Reemplacé instrucciones antiguas que hacían referencia al motor V0.2 y a comandos con punto.
- Retiré el ejemplo de mod antiguo que no seguía el formato actual de registro.
- Añadí `docs/INSTRUCCIONES_IA_NEXUS.txt`, `docs/PLANTILLA_MOD.js` y `docs/REGISTRO_MODS.md`.
- Preparé estas notas bilingües en `releases/V0.3.0/README.md`.
- Incorporé al repositorio `engine/Nexus_V0.3.0.js), usando la fuente de mi propio motor y conservando intacta su lógica.

Dejé los archivos preparados en el repositorio, pero todavía no he publicado la GitHub Release. Lanzaré esa publicación por separado.

## English

Welcome to Nexus V0.3.0! I'm presenting this as the stable and playable version of my engine for Minecraft Pocket Edition 1.0.9 with Toolbox 3.2.29, ModPE, and Rhino/JavaScript ES5. It is my definitive working version for now.

### Highlights I added
- I consolidated registration through `Nexus.registerMod({...})): one mod per file with a unique positive numeric ID.
- I prepared `/Nexus info` diagnostics to report engine status, files, mods, errors, warnings, and known registrations.
- I unified the documented commands under `/Nexus`: `help`, `info`, `log`, `load`, `on ID`, `off ID`, `IDS`, and `resources`.
- I organized the APIs for events, scheduling, logs, mods, commands, items, player, world, entities, blocks, effects, UI, resources, registry, compatibility, storage, configuration, and data.
- I added validation for duplicate IDs and detection for supported registry conflicts.
- I prepared new guidance for creators and AI assistants: AI instructions, an ES5 template, and registration rules.

### Documentation changes I made
- I rewrote the README to welcome users to my stable and playable V0.3.0.
- I replaced outdated instructions referring to the V0.2 engine and dot-prefixed commands.
- I removed the older mod example that did not follow the current registration format.
- I added `docs/INSTRUCCIONES_IA_NEXUS.txt`, `docs/PLANTILLA_MOD.js`, and `docs/REGISTRO_MODS.md`.
- I prepared these bilingual release notes at `releases/V0.3.0/README.md`.
- I added `engine/Nexus_V0.3.0.js` from my own engine source, preserving its logic.

I have prepared the files in the repository, but I have not published the GitHub Release yet. I will publish it separately.
