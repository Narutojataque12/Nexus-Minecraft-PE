# Nexus V0.3.0 — estable y jugable

## Español

¡Bienvenidos a Nexus V0.3.0! Esta versión del motor está presentada por su creador como estable y jugable para Minecraft Pocket Edition 1.0.9 con Toolbox 3.2.29, ModPE y Rhino/JavaScript ES5. Es la versión de trabajo definitiva por el momento.

### Novedades
- Registro obligatorio y validado: un mod por archivo mediante `Nexus.registerMod({...})`, con ID numérica positiva y única.
- Diagnóstico ampliado mediante `/Nexus info`, con estado del motor, archivos, mods, errores, advertencias y registros conocidos.
- Comandos oficiales unificados bajo `/Nexus`: `help`, `info`, `log`, `load`, `on ID`, `off ID`, `IDS` y `resources`.
- API modular para eventos, tareas programadas, logs, mods, comandos, objetos, jugador, mundo, entidades, bloques, efectos, UI, recursos, registro, compatibilidad, almacenamiento, configuración y datos.
- Validación y detección de IDs duplicadas y conflictos de registro compatibles.
- Nuevas guías públicas para creadores y asistentes de IA: instrucciones de IA, plantilla ES5 y reglas de registro.

### Cambios documentales
- README reescrito como bienvenida a V0.3.0 estable y jugable.
- Reemplazadas instrucciones antiguas referidas al motor V0.2 y a comandos con punto.
- Eliminado el ejemplo de mod antiguo que no seguía el contrato actual del cargador.
- Añadidos `docs/INSTRUCCIONES_IA_NEXUS.txt`, `docs/PLANTILLA_MOD.js` y `docs/REGISTRO_MODS.md`.
- Añadido `releases/V0.3.0/README.md` con notas bilingües.
- Eliminada la página no relacionada `docs/NUCLEO_TERRESTRE.md`; no forma parte de esta versión del motor.
- Se publica en el repositorio el archivo del motor `engine/Nexus_V0.3.0.js`, conservado desde el archivo fuente proporcionado por el creador.

Esta actualización no crea la GitHub Release automáticamente. La publicación oficial queda a cargo del mantenedor.

## English

Welcome to Nexus V0.3.0! The creator presents this engine as stable and playable for Minecraft Pocket Edition 1.0.9 with Toolbox 3.2.29, ModPE, and Rhino/JavaScript ES5. It is the definitive working engine for now.

### Highlights
- Required, validated registration: one mod per file via `Nexus.registerMod({...})`, with a unique positive numeric ID.
- Expanded diagnostics through `/Nexus info`, reporting engine status, files, mods, errors, warnings, and known registrations.
- Unified engine commands under `/Nexus`: `help`, `info`, `log`, `load`, `on ID`, `off ID`, `IDS`, and `resources`.
- Modular APIs for events, scheduling, logs, mods, commands, items, player, world, entities, blocks, effects, UI, resources, registry, compatibility, storage, configuration, and data.
- Validation and detection for duplicate mod IDs and supported registry conflicts.
- New public guidance for creators and AI assistants: AI instructions, an ES5 template, and registration rules.

### Documentation changes
- Rewrote the README as a welcome to stable, playable V0.3.0.
- Replaced stale instructions that referenced the V0.2 engine and dot-prefixed commands.
- Removed the outdated example mod that did not follow the current loader contract.
- Added `docs/INSTRUCCIONES_IA_NEXUS.txt`, `docs/PLANTILLA_MOD.js`, and `docs/REGISTRO_MODS.md`.
- Added these bilingual release notes at `releases/V0.3.0/README.md`.
- Removed the unrelated `docs/NUCLEO_TERRESTRE.md`; it is not part of this engine version.
- Added `engine/Nexus_V0.3.0.js` from the exact engine source provided by the creator.

This repository update does not create the GitHub Release automatically. The maintainer will publish it.
