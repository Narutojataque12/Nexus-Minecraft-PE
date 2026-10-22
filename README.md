# Nexus V0.3.0

**Nexus V0.3.0 es la versión estable y jugable del motor para Minecraft: Pocket Edition 1.0.9.** Está orientado a Toolbox 3.2.29, ModPE, Rhino y JavaScript ES5. Esta es la versión de referencia del proyecto por el momento.

Nexus proporciona una estructura para cargar, registrar, administrar y diagnosticar mods JavaScript en el entorno clásico de Minecraft PE.

**English:** **Nexus V0.3.0 is the stable and playable engine version for Minecraft: Pocket Edition 1.0.9.** It targets Toolbox 3.2.29, ModPE, Rhino, and JavaScript ES5. This is the project's current reference version.

Nexus provides a structure for loading, registering, managing, and diagnosing JavaScript mods in the classic Minecraft PE environment.

## Novedades de V0.3.0 / V0.3.0 highlights

- **Registro de mods:** cada archivo registra un único mod mediante `Nexus.registerMod({...})`, con un ID numérico positivo y único.
- **Diagnóstico:** `/Nexus info` presenta información sobre el estado del motor, los archivos, los mods, los errores, las advertencias y los registros conocidos.
- **Administración:** los comandos documentados bajo `/Nexus` permiten consultar la ayuda, revisar el estado, guardar registros, cargar mods, habilitarlos o deshabilitarlos y consultar recursos.
- **Validación y conflictos:** el motor valida definiciones y detecta determinados conflictos de registro, incluidos los relacionados con IDs duplicados.
- **API modular:** incluye módulos para eventos, tareas programadas, registros, mods, comandos, objetos, jugador, mundo, entidades, bloques, efectos, interfaz, recursos, registro, compatibilidad, almacenamiento, configuración y datos.
- **Herramientas para creadores:** la documentación incluye una guía de creación, instrucciones de referencia para asistentes de IA, una plantilla ES5 y las reglas de registro de mods.

### V0.3.0 highlights

- **Mod registration:** each file registers one mod through `Nexus.registerMod({...})`, with a unique positive numeric ID.
- **Diagnostics:** `/Nexus info` reports engine status, files, mods, errors, warnings, and known registrations.
- **Management:** the documented `/Nexus` commands provide help, status checks, log output, mod loading, enabling/disabling, and resource inspection.
- **Validation and conflicts:** the engine validates definitions and detects selected registration conflicts, including duplicate IDs.
- **Modular API:** modules cover events, scheduling, logging, mods, commands, items, player, world, entities, blocks, effects, UI, resources, registry, compatibility, storage, configuration, and data.
- **Creator resources:** the documentation includes a mod creation guide, reference instructions for AI assistants, an ES5 template, and mod registration rules.

## Primeros pasos / Getting started

1. Descarga `engine/Nexus_V0.3.0.js` desde el repositorio. La GitHub Release se publicará por separado.
2. Carga `Nexus_V0.3.0.js` como script principal en Toolbox 3.2.29.
3. Coloca cada archivo de mod compatible en `/sdcard/Nexus/Mods/`.
4. Entra en un mundo y ejecuta `/Nexus info` para consultar el estado del motor y de los mods.
5. Prueba los mods en un mundo de prueba antes de usarlos en partidas importantes.

1. Obtain `engine/Nexus_V0.3.0.js` from this repository. The GitHub Release will be published separately.
2. Load `Nexus_V0.3.0.js` as the main script in Toolbox 3.2.29.
3. Place each compatible mod file in `/sdcard/Nexus/Mods/`.
4. Enter a world and run `/Nexus info` to inspect engine and mod status.
5. Test mods in a test world before using them in important worlds.

## Documentación / Documentation

- [Guía para crear mods / Mod creation guide](docs/INSTRUCCIONES_CREAR_MODS.md)
- [Instrucciones de referencia para asistentes de IA / AI assistant reference](docs/INSTRUCCIONES_IA_NEXUS.txt)
- [Plantilla básica JavaScript / Basic JavaScript template](docs/PLANTILLA_MOD.js)
- [Registro de mods / Mod registration](docs/REGISTRO_MODS.md)
- [Notas de V0.3.0 / V0.3.0 notes](releases/V0.3.0/README.md)
- [Revisión Anti-Slop para Rhino ES5 / Anti-Slop review](docs/ANTI_SLOP_ES5.md)
- [Historial de cambios / Changelog](CHANGELOG.md)

## Asistentes de IA / AI assistants

Los archivos de documentación pueden utilizarse como contexto de proyecto o material de referencia para orientar asistentes de IA en la creación de mods compatibles. También pueden formar parte de un conjunto de datos para ajuste fino cuando la plataforma lo permita. Añadir instrucciones a una conversación no entrena automáticamente un modelo ni modifica sus parámetros.

The documentation can be used as project context or reference material to guide AI assistants in creating compatible mods. It may also be included in a fine-tuning dataset when the platform supports it. Adding instructions to a conversation does not automatically train a model or change its parameters.

## Compatibilidad / Compatibility

- Minecraft: Pocket Edition 1.0.9
- Toolbox 3.2.29
- ModPE + Rhino
- JavaScript ES5

La compatibilidad se dirige a este entorno heredado. Las operaciones que dependen de funciones nativas pueden variar entre compilaciones de Toolbox; cada comportamiento debe comprobarse dentro del juego.

The target is this legacy environment. Operations that depend on native functions may vary across Toolbox builds; behavior should be checked in-game.

## Comandos / Commands

- `/Nexus help` — ayuda / help.
- `/Nexus info` — diagnóstico / diagnostics.
- `/Nexus log` — guarda el registro reciente / saves recent logs.
- `/Nexus load` — intenta cargar los mods encontrados / attempts to load discovered mods.
- `/Nexus on ID` y `/Nexus off ID` — habilita o deshabilita un mod / enables or disables a mod.
- `/Nexus IDS` — consulta archivos, IDs y estados / lists files, IDs, and states.
- `/Nexus resources` — consulta declaraciones de recursos / inspects resource declarations.

## Créditos y licencia / Credits and license

Nexus fue creado por Sebastián C. Minecraft pertenece a Mojang/Microsoft; Toolbox y Rhino pertenecen a sus respectivos autores y mantenedores. Nexus no es un producto oficial de Mojang. Consulta [LICENSE](LICENSE) para conocer las condiciones de uso.

Nexus was created by Sebastián C. Minecraft belongs to Mojang/Microsoft; Toolbox and Rhino belong to their respective authors and maintainers. Nexus is not an official Mojang product. See [LICENSE](LICENSE) for the project's terms.
