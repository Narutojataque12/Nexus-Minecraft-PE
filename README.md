# Nexus V0.3.1 (candidata)

**Nexus V0.3.1 es una candidata de mantenimiento** para Minecraft: Pocket Edition 1.0.9, Toolbox 3.2.29, ModPE, Rhino y JavaScript ES5. Corrige problemas del ciclo de vida de los mods e incluye pruebas automatizadas. La validación dentro del juego sigue pendiente, así que todavía no se considera estable ni jugable.

Nexus ofrece una estructura para cargar, registrar, administrar y diagnosticar mods JavaScript en el entorno clásico de Minecraft PE.

**English:** **Nexus V0.3.1 is a maintenance candidate** for Minecraft: Pocket Edition 1.0.9, Toolbox 3.2.29, ModPE, Rhino, and JavaScript ES5. It fixes mod lifecycle issues and includes automated tests. In-game validation is still pending, so it is not considered stable or playable yet.

Nexus provides a structure for loading, registering, managing, and diagnosing JavaScript mods in the classic Minecraft PE environment.

## Novedades de V0.3.0 / V0.3.0 highlights

- **Registro de mods:** cada archivo registra un solo mod mediante `Nexus.registerMod({...})`, con un ID numérico positivo y único.
- **Diagnóstico:** `/Nexus info` muestra información sobre el estado del motor, los archivos, los mods, los errores, las advertencias y los registros conocidos.
- **Administración:** los comandos documentados bajo `/Nexus` permiten consultar la ayuda y el estado, guardar registros, cargar mods, habilitarlos o deshabilitarlos y consultar recursos.
- **Validación y conflictos:** el motor valida las definiciones y detecta ciertos conflictos de registro, incluidos los IDs duplicados.
- **API modular:** incluye módulos para eventos, tareas programadas, registros, mods, comandos, objetos, jugador, mundo, entidades, bloques, efectos, interfaz, recursos, registro, compatibilidad, almacenamiento, configuración y datos.
- **Recursos para creadores:** la documentación incluye una guía para crear mods, instrucciones de referencia para asistentes de IA, una plantilla ES5 y las reglas de registro de mods.

### V0.3.0 highlights

- **Mod registration:** each file registers one mod through `Nexus.registerMod({...})`, with a unique positive numeric ID.
- **Diagnostics:** `/Nexus info` reports engine status, files, mods, errors, warnings, and known registrations.
- **Management:** the documented `/Nexus` commands provide help and status checks, log output, mod loading, enable/disable controls, and resource inspection.
- **Validation and conflicts:** the engine validates definitions and detects selected registration conflicts, including duplicate IDs.
- **Modular API:** modules cover events, scheduling, logging, mods, commands, items, player, world, entities, blocks, effects, UI, resources, registry, compatibility, storage, configuration, and data.
- **Creator resources:** the documentation includes a mod creation guide, reference instructions for AI assistants, an ES5 template, and mod registration rules.

## Primeros pasos / Getting started

1. Descarga `engine/Nexus_V0.3.1.js` desde esta rama candidata o desde la [pre-release V0.3.1 en GitHub](https://github.com/Narutojataque12/Nexus-Minecraft-PE/releases/tag/v0.3.1). La publicación estable sigue pendiente de la validación dentro del juego.
2. Carga `Nexus_V0.3.1.js` como script principal en Toolbox 3.2.29.
3. Coloca cada archivo de mod compatible en `/sdcard/Nexus/Mods/`.
4. Entra en un mundo y ejecuta `/Nexus info` para revisar el estado del motor y de los mods.
5. Prueba los mods en un mundo de prueba antes de usarlos en partidas importantes.

1. Download `engine/Nexus_V0.3.1.js` from this candidate branch or from the [V0.3.1 GitHub prerelease](https://github.com/Narutojataque12/Nexus-Minecraft-PE/releases/tag/v0.3.1). The stable release is still pending in-game validation.
2. Load `Nexus_V0.3.1.js` as the main script in Toolbox 3.2.29.
3. Place each compatible mod file in `/sdcard/Nexus/Mods/`.
4. Enter a world and run `/Nexus info` to check engine and mod status.
5. Test mods in a test world before using them in important worlds.

## Documentación / Documentation

- [Guía para crear mods / Mod creation guide](docs/INSTRUCCIONES_CREAR_MODS.md)
- [Instrucciones de referencia para asistentes de IA / AI assistant reference](docs/INSTRUCCIONES_IA_NEXUS.txt)
- [Plantilla básica JavaScript / Basic JavaScript template](docs/PLANTILLA_MOD.js)
- [Registro de mods / Mod registration](docs/REGISTRO_MODS.md)
- [Notas de V0.3.0 / V0.3.0 notes](releases/V0.3.0/README.md)
- [Historial de cambios / Changelog](CHANGELOG.md)

## Asistentes de IA / AI assistants

Puedes usar la documentación como contexto del proyecto o como material de referencia para ayudar a asistentes de IA a crear mods compatibles. Si la plataforma lo permite, también puedes incluirla en un conjunto de datos para ajuste fino. Añadir instrucciones a una conversación no entrena automáticamente un modelo ni cambia sus parámetros.

You can use the documentation as project context or as reference material to guide AI assistants in creating compatible mods. If the platform supports it, you can also include the documentation in a fine-tuning dataset. Adding instructions to a conversation does not automatically train a model or change its parameters.

## Compatibilidad / Compatibility

- Minecraft: Pocket Edition 1.0.9
- Toolbox 3.2.29
- ModPE + Rhino
- JavaScript ES5

Nexus está dirigido a este entorno heredado. Las operaciones que dependen de funciones nativas pueden variar entre versiones de Toolbox; comprueba cada comportamiento dentro del juego.

Nexus targets this legacy environment. Operations that depend on native functions may vary across Toolbox builds; check each behavior in-game.

## Comandos / Commands

- `/Nexus help` — muestra la ayuda / shows help.
- `/Nexus info` — muestra el diagnóstico / shows diagnostics.
- `/Nexus log` — guarda los registros recientes / saves recent logs.
- `/Nexus load` — intenta cargar los mods encontrados / attempts to load discovered mods.
- `/Nexus on ID` y `/Nexus off ID` — habilitan o deshabilitan un mod / enable or disable a mod.
- `/Nexus IDS` — muestra archivos, IDs y estados / lists files, IDs, and states.
- `/Nexus resources` — consulta las declaraciones de recursos / inspects resource declarations.

## Créditos y licencia / Credits and license

Nexus fue creado por Sebastián C. Minecraft pertenece a Mojang/Microsoft; Toolbox y Rhino pertenecen a sus respectivos autores y mantenedores. Nexus no es un producto oficial de Mojang. Consulta [LICENSE](LICENSE) para conocer las condiciones de uso del proyecto.

Nexus was created by Sebastián C. Minecraft belongs to Mojang/Microsoft; Toolbox and Rhino belong to their respective authors and maintainers. Nexus is not an official Mojang product. See [LICENSE](LICENSE) for the project's terms.
