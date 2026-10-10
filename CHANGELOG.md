# Changelog / Registro de cambios

## [0.2.0] — 2026-10-10
- Añadido soporte de comandos con prefijo `.nexus`, conservando el prefijo slash.
- `.nexus info` funciona como alias de estado; `.nexus ids` como alias de lista.
- Formato de estado verde con versión, mods, ticks y estado.
- README, guía, licencia y notas de versión bilingües.
- Actualización conservadora, sin reescribir la arquitectura.
- **Pendiente:** forzar IDs numéricos y validar el motor en el juego real.

## English
- Added `.nexus` command prefix while retaining slash-prefix compatibility.
- Added `info` and `ids` aliases and green status formatting.
- Added bilingual documentation, license and release notes.
- Conservative update; numeric-only ID enforcement and in-game validation remain pending.


## [0.2.1] — 2026-10-10
- Informe inicial automático al entrar al mundo.
- `/Nexus info` ejecuta diagnóstico de acceso a archivos, carpeta Mods, estados de carga y registros.
- Estado verde para correcto, ámbar para advertencias y rojo para fallas graves detectadas.
- Evita duplicar el encabezado [Nexus] en mensajes de estado.
- El encabezado siempre es verde; los mensajes normales son blancos; los estados del diagnóstico usan color dinámico.
- Las líneas visibles usan formato en negrita `§l`.
- La salida del cargador usa `Fallas: N` en lugar de `omitidos/fallidos`.
- Sin cambios en APIs públicas.
- La validación en Minecraft PE 1.0.9 + Toolbox 3.2.29 queda pendiente.

## English
- Automatic first report when entering a world.
- `/Nexus info` checks file access, Mods folder, loader states, and registrations.
- Green for healthy, amber for warnings, red for detected serious failures.
- Prevents duplicate [Nexus] status header.
- Green header, white normal messages, dynamic diagnostic colors.
- Visible messages use bold `§l` formatting.
- Loader output uses `Failures: N`.
- No public API changes.
- In-game validation remains pending.
