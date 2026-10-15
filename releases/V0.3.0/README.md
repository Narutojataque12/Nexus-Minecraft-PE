# Nexus V0.3.0 — versión estable y jugable

## Descripción

Nexus V0.3.0 es la versión estable y jugable del motor para Minecraft Pocket Edition 1.0.9, orientada a Toolbox 3.2.29, ModPE, Rhino y JavaScript ES5. Es la versión de referencia del proyecto por el momento.

Nexus proporciona herramientas para registrar, cargar, administrar y diagnosticar mods JavaScript en el entorno objetivo.

## Novedades

- **Registro de mods:** una llamada a `Nexus.registerMod({...})) por archivo, con un ID numérico positivo y único.
- **Diagnóstico:** el comando `/Nexus info` presenta información sobre el estado del motor, los archivos, los mods, los errores, las advertencias y los registros conocidos.
- **Administración:** los comandos documentados incluyen `/Nexus help`, `info`, `log`, `load`, `on ID`, `off ID`, `IDS` y `resources`.
- **API modular:** módulos para eventos, tareas programadas, registros, mods, comandos, objetos, jugador, mundo, entidades, bloques, efectos, interfaz, recursos, registro, compatibilidad, almacenamiento, configuración y datos.
- **Validación:** comprobaciones de definiciones y detección de determinados conflictos, incluidos los IDs duplicados.
- **Documentación técnica:** guía de creación de mods, instrucciones de referencia para asistentes de IA, plantilla JavaScript ES5 y reglas de registro.

## Compatibilidad

- Minecraft Pocket Edition 1.0.9
- Toolbox 3.2.29
- ModPE + Rhino
- JavaScript ES5

Las operaciones que dependen de funciones nativas pueden variar según la compilación de Toolbox. Es necesario comprobar el comportamiento concreto dentro del juego.

## Instalación

1. Descarga `engine/Nexus_V0.3.0.js` desde el repositorio o desde la sección Releases cuando la publicación esté disponible.
2. Carga el archivo como script principal en Toolbox 3.2.29.
3. Coloca los mods compatibles en `/sdcard/Nexus/Mods/`.
4. Entra en un mundo de prueba y ejecuta `/Nexus info`.
5. Comprueba el funcionamiento de los mods antes de utilizarlos en mundos importantes.

## Documentación

- [Guía para crear mods](../../docs/INSTRUCCIONES_CREAR_MODS.md)
- [Instrucciones para asistentes de IA](../../docs/INSTRUCCIONES_IA_NEXUS.txt)
- [Plantilla básica](../../docs/PLANTILLA_MOD.js)
- [Registro de mods](../../docs/REGISTRO_MODS.md)
- [Historial de cambios](../../CHANGELOG.md)

## Estado de publicación

Los archivos fuente y la documentación de V0.3.0 están disponibles en el repositorio. La GitHub Release se publicará por separado.

---

# Nexus V0.3.0 — stable and playable version

## Overview

Nexus V0.3.0 is the stable and playable engine version for Minecraft Pocket Edition 1.0.9, targeting Toolbox 3.2.29, ModPE, Rhino, and JavaScript ES5. It is the project's current reference version.

Nexus provides tools for registering, loading, managing, and diagnosing JavaScript mods in the target environment.

## Highlights

- **Mod registration:** one `Nexus.registerMod({...})` call per file, with a unique positive numeric ID.
- **Diagnostics:** `/Nexus info` reports engine status, files, mods, errors, warnings, and known registrations.
- **Management:** documented commands include `/Nexus help`, `info`, `log`, `load`, `on ID`, `off ID`, `IDS`, and `resources`.
- **Modular API:** modules for events, scheduling, logging, mods, commands, items, player, world, entities, blocks, effects, UI, resources, registry, compatibility, storage, configuration, and data.
- **Validation:** definition checks and detection of selected conflicts, including duplicate IDs.
- **Technical documentation:** mod creation guide, AI assistant reference instructions, JavaScript ES5 template, and registration rules.

## Compatibility

- Minecraft Pocket Edition 1.0.9
- Toolbox 3.2.29
- ModPE + Rhino
- JavaScript ES5

Operations that depend on native functions may vary by Toolbox build. Specific behavior must be checked in-game.

## Installation

1. Download `engine/Nexus_V0.3.0.js` from this repository or from Releases once the publication is available.
2. Load the file as the main script in Toolbox 3.2.29.
3. Place compatible mods in `/sdcard/Nexus/Mods/`.
4. Enter a test world and run `/Nexus info`.
5. Verify mod behavior before using it in important worlds.

## Documentation

- [Mod creation guide](../../docs/INSTRUCCIONES_CREAR_MODS.md)
- [AI assistant reference](../../docs/INSTRUCCIONES_IA_NEXUS.txt)
- [Basic template](../../docs/PLANTILLA_MOD.js)
- [Mod registration](../../docs/REGISTRO_MODS.md)
- [Changelog](../../CHANGELOG.md)

## Publication status

The V0.3.0 source files and documentation are available in the repository. The GitHub Release will be published separately.
