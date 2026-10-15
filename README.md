# Nexus V0.3.0 — ¡bienvenida la nueva versión!

**¡Presento Nexus V0.3.0, la versión estable y jugable de mi motor para Minecraft Pocket Edition 1.0.9!** La considero mi versión de trabajo definitiva por el momento. En esta actualización organicé el repositorio y preparé la documentación para que la comunidad pueda empezar a utilizar el motor y crear sus propios mods.

Desarrollé Nexus para cargar y organizar mods escritos en JavaScript ES5 mediante Toolbox 3.2.29, ModPE y Rhino.

**English:** **I'm presenting Nexus V0.3.0, the stable and playable version of my engine for Minecraft Pocket Edition 1.0.9!** I consider it my definitive working version for now. In this update, I organized the repository and prepared the documentation so the community can get started and create their own mods.

I built Nexus to load and organize mods written in JavaScript ES5 through Toolbox 3.2.29, ModPE, and Rhino.

## ¡Bienvenidos a Nexus V0.3.0! / Welcome to Nexus V0.3.0!

### Qué incorporé / What I added

- **Registro coherente de mods:** definí un registro por archivo mediante `Nexus.registerMod({...})), con un ID numérico positivo y único.
- **Diagnóstico del motor:** preparé `/Nexus info` para mostrar el estado, los archivos, los mods, los errores, las advertencias y los registros de objetos y recursos.
- **Herramientas de administración:** reuní la ayuda, la consulta de IDs, la carga de mods, la activación/desactivación y la inspección de recursos bajo los comandos `/Nexus`.
- **Detección de conflictos:** incorporé validaciones para IDs y conflictos compatibles de mods, comandos, recursos y registros.
- **API organizada:** organicé módulos como `Events`, `Scheduler`, `Logger`, `Mods`, `Commands`, `Items`, `Player`, `World`, `Entities`, `Blocks`, `Effects`, `UI`, `Resources`, `Registry`, `Compat`, `Storage`, `Config` y `Data`.
- **Comandos unificados:** establecí `/Nexus` como la interfaz de administración documentada; ya no documento los comandos antiguos con prefijo de punto, como `.nexus`.
- **Documentación para creadores e IA:** preparé instrucciones para asistentes de IA, una plantilla básica de mod y una guía dedicada al registro.

### What I added

- **Consistent mod registration:** I defined one registration per file through `Nexus.registerMod({...})`, using a unique positive numeric ID.
- **Engine diagnostics:** I prepared `/Nexus info` to report engine status, files, mods, errors, warnings, item registrations, and resources.
- **Management tools:** I brought help, ID listing, mod loading, enabling/disabling, and resource inspection together under `/Nexus` commands.
- **Conflict detection:** I added validation for IDs and supported conflicts involving mods, commands, resources, and registry entries.
- **Organized API:** I organized modules such as `Events`, `Scheduler`, `Logger`, `Mods`, `Commands`, `Items`, `Player`, `World`, `Entities`, `Blocks`, `Effects`, `UI`, `Resources`, `Registry`, `Compat`, `Storage`, `Config`, and `Data`.
- **Unified commands:** I established `/Nexus` as the documented management interface; I no longer document the old dot-prefixed commands such as `.nexus`.
- **Creator and AI documentation:** I prepared instructions for AI assistants, a basic mod template, and a dedicated registration guide.

## Primeros pasos / Getting started

1. Descarga `engine/Nexus_V0.3.0.js` desde este repositorio o desde [Releases](https://github.com/Narutojataque12/Nexus-Minecraft-PE/releases) cuando publique la versión.
2. Carga `Nexus_V0.3.0.js` como script principal en Toolbox 3.2.29.
3. Coloca cada mod JavaScript compatible en `/sdcard/Nexus/Mods/`.
4. Entra a un mundo y usa `/Nexus info` para revisar el estado del motor y los mods.
5. Te recomiendo probar los mods en un mundo de prueba antes de usarlos en tus mundos importantes.

## Documentación / Documentation

- [Guía para crear mods / Mod creation guide](docs/INSTRUCCIONES_CREAR_MODS.md)
- [Instrucciones para IAs / AI assistant instructions](docs/INSTRUCCIONES_IA_NEXUS.txt)
- [Plantilla básica JavaScript / Basic JavaScript template](docs/PLANTILLA_MOD.js)
- [Cómo registrar mods / Mod registration guide](docs/REGISTRO_MODS.md)
- [Notas de la versión V0.3.0 / V0.3.0 release notes](releases/V0.3.0/README.md)

## Entrenar u orientar IAs / Training or guiding AI assistants

Preparé material para **orientar o especializar asistentes de IA** en la creación de mods compatibles: contexto del motor, restricciones de Rhino/ES5, plantilla, reglas de registro y guía de validación. Puedes usarlo como instrucciones de proyecto o como datos de referencia para un proceso de ajuste fino cuando la plataforma de IA lo admita. Añadir instrucciones a un chat, por sí solo, no cambia los pesos ni entrena automáticamente un modelo.

I prepared resources to **guide or specialize AI assistants** for compatible mod development: engine context, Rhino/ES5 constraints, a template, registration rules, and validation guidance. You can use them as project instructions or as reference data in a fine-tuning workflow when the AI platform supports it. Adding instructions to a chat by itself does not change a model's weights or automatically train it.

## Compatibilidad / Compatibility

Preparé mi motor para el siguiente entorno:
- Minecraft Pocket Edition 1.0.9
- Toolbox 3.2.29
- ModPE + Rhino
- JavaScript ES5

Presento V0.3.0 como una versión estable y jugable para este entorno objetivo. También dejo una precaución: algunas operaciones que dependen de APIs nativas antiguas pueden variar según la compilación de Toolbox, así que recomiendo comprobar dentro del juego los comportamientos concretos de cada mod.

I prepared my engine for this environment:
- Minecraft Pocket Edition 1.0.9
- Toolbox 3.2.29
- ModPE + Rhino
- JavaScript ES5

I present V0.3.0 as a stable and playable version for this target environment. I also want to note that operations relying on older native APIs may vary by Toolbox build, so I recommend checking each mod's behavior in-game.

## Comandos del motor / Engine commands

- `/Nexus help` — ayuda.
- `/Nexus info` — diagnóstico.
- `/Nexus log` — guarda el registro reciente.
- `/Nexus load` — intenta cargar los mods encontrados.
- `/Nexus on ID` y `/Nexus off ID` — activa o desactiva un mod.
- `/Nexus IDS` — lista archivos/IDs detectadas y estados.
- `/Nexus resources` — inspecciona declaraciones de recursos.

## Créditos y licencia / Credits and license

**Soy Sebastián C. y creé Nexus.** Minecraft pertenece a Mojang/Microsoft; Toolbox y Rhino pertenecen a sus respectivos autores y mantenedores. Mi proyecto no es un producto oficial de Mojang. Consulta [LICENSE](LICENSE) para conocer las condiciones del proyecto.

**I'm Sebastián C., and I created Nexus.** Minecraft belongs to Mojang/Microsoft; Toolbox and Rhino belong to their respective authors and maintainers. My project is not an official Mojang product. See [LICENSE](LICENSE) for the project's terms.
