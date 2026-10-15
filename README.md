# Nexus V0.3.0 — ¡bienvenida la nueva versión!

**Nexus V0.3.0 ya está aquí: una versión estable y jugable del motor para Minecraft Pocket Edition 1.0.9.**  
La versión se presenta como la base definitiva de trabajo por ahora: su código se conserva tal como fue entregado por el creador; esta actualización organiza la publicación y la documentación para la comunidad.

Nexus permite cargar y organizar mods escritos en JavaScript ES5 mediante Toolbox 3.2.29, ModPE y Rhino.

**English:** Nexus V0.3.0 is here: a stable and playable mod engine for Minecraft Pocket Edition 1.0.9. It is the definitive working engine for now, preserved as provided by its creator. This repository update organizes the public release information and community documentation.

## ¡Bienvenidos a Nexus V0.3.0! / Welcome to Nexus V0.3.0!

### Qué hay de nuevo / What's new

- **Registro coherente de mods:** cada archivo debe registrar exactamente un mod con `Nexus.registerMod({...})`; se exige un ID numérico positivo y único.
- **Diagnóstico del motor:** `/Nexus info` muestra estado, archivos, mods, errores, avisos, registros de objetos y recursos.
- **Herramientas de administración:** ayuda, consulta de IDs, carga de mods, activación/desactivación y vista de recursos mediante comandos `/Nexus`.
- **Detección de conflictos:** el registro valida IDs y detecta conflictos de mods, comandos, recursos y otros registros compatibles.
- **API organizada:** incluye módulos como `Events`, `Scheduler`, `Logger`, `Mods`, `Commands`, `Items`, `Player`, `World`, `Entities`, `Blocks`, `Effects`, `UI`, `Resources`, `Registry`, `Compat`, `Storage`, `Config` y `Data`.
- **Comandos unificados:** la administración del motor usa `/Nexus`; los comandos antiguos con prefijo de punto, como `.nexus`, ya no son la interfaz documentada.
- **Documentación para creadores e IA:** nuevas instrucciones para asistentes de IA, una plantilla básica de mod y una guía dedicada al registro.

### What this version brings

- **Consistent mod registration:** each file must register exactly one mod with `Nexus.registerMod({...})`, using a unique positive numeric ID.
- **Engine diagnostics:** `/Nexus info` reports status, files, mods, errors, warnings, item registrations, and resources.
- **Management commands:** help, ID listing, mod loading, enabling/disabling, and resource inspection through `/Nexus` commands.
- **Conflict detection:** validation and conflict reporting for supported mod, command, resource, and registry entries.
- **Organized API:** `Events`, `Scheduler`, `Logger`, `Mods`, `Commands`, `Items`, `Player`, `World`, `Entities`, `Blocks`, `Effects`, `UI`, `Resources`, `Registry`, `Compat`, `Storage`, `Config`, and `Data`.
- **Unified commands:** the engine's command interface uses `/Nexus`; old dot-prefixed commands such as `.nexus` are no longer documented.
- **Creator and AI documentation:** new instructions for AI assistants, a basic mod template, and a dedicated registration guide.

## Primeros pasos / Getting started

1. Descarga `engine/Nexus_V0.3.0.js` desde este repositorio o desde [Releases](https://github.com/Narutojataque12/Nexus-Minecraft-PE/releases) cuando la publicación esté disponible.
2. Carga `Nexus_V0.3.0.js` como script principal en Toolbox 3.2.29.
3. Coloca cada mod JavaScript compatible en `/sdcard/Nexus/Mods/`.
4. Entra a un mundo y usa `/Nexus info` para revisar el estado del motor y los mods.
5. Prueba los mods en un mundo de prueba antes de usarlos en tus mundos importantes.

## Documentación / Documentation

- [Guía para crear mods / Mod creation guide](docs/INSTRUCCIONES_CREAR_MODS.md)
- [Instrucciones para IAs / AI assistant instructions](docs/INSTRUCCIONES_IA_NEXUS.txt)
- [Plantilla básica JavaScript / Basic JavaScript template](docs/PLANTILLA_MOD.js)
- [Cómo registrar mods / Mod registration guide](docs/REGISTRO_MODS.md)
- [Notas de la versión V0.3.0 / V0.3.0 release notes](releases/V0.3.0/README.md)

## Entrenar u orientar IAs / Training or guiding AI assistants

Nexus incluye material para **orientar o especializar asistentes de IA** en la creación de mods compatibles: contexto del motor, restricciones de Rhino/ES5, plantilla, reglas de registro y guía de validación. Puedes usar estos materiales como instrucciones de proyecto o como datos de referencia para un flujo de ajuste fino cuando la plataforma de IA lo admita. Añadir instrucciones a un chat, por sí solo, no cambia los pesos ni entrena automáticamente un modelo.

Nexus provides material to **guide or specialize AI assistants** for Nexus mod development: engine context, Rhino/ES5 constraints, a template, registration rules, and validation guidance. These materials can be used as project instructions or as reference data in a fine-tuning workflow where the AI platform supports it. Adding instructions to a chat by itself does not change a model's weights or automatically train it.

## Compatibilidad / Compatibility

- Minecraft Pocket Edition 1.0.9
- Toolbox 3.2.29
- ModPE + Rhino
- JavaScript ES5

El motor está presentado como estable y jugable en su entorno objetivo. Algunas operaciones que dependen de APIs nativas antiguas pueden variar según la compilación de Toolbox; valida dentro del juego los comportamientos concretos de los mods.

The engine is presented as stable and playable in its target environment. Some operations that depend on older native APIs may vary by Toolbox build, so verify specific mod behavior in-game.

## Comandos del motor / Engine commands

- `/Nexus help` — ayuda.
- `/Nexus info` — diagnóstico.
- `/Nexus log` — guarda el registro reciente.
- `/Nexus load` — intenta cargar los mods encontrados.
- `/Nexus on ID` y `/Nexus off ID` — activa o desactiva un mod.
- `/Nexus IDS` — lista archivos/IDs detectadas y estados.
- `/Nexus resources` — inspecciona declaraciones de recursos.

## Créditos y licencia / Credits and license

**Sebastián C.** — creador de Nexus. Minecraft es propiedad de Mojang/Microsoft; Toolbox y Rhino pertenecen a sus respectivos autores y mantenedores. Nexus no es un producto oficial de Mojang. Consulta [LICENSE](LICENSE) para conocer las condiciones del proyecto.
