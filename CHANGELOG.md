# Changelog / Registro de cambios

## [0.3.0] — 2026-10-15

### Añadido
- Incorporé al repositorio mi motor fuente en `engine/Nexus_V0.3.0.js), conservando intacta la lógica que desarrollé.
- Escribí una bienvenida bilingüe en el README para presentar V0.3.0 como mi versión estable y jugable.
- Preparé las notas de publicación bilingües en `releases/V0.3.0/README.md`.
- Añadí `docs/INSTRUCCIONES_IA_NEXUS.txt` con reglas para orientar asistentes de IA a crear mods compatibles con mi motor.
- Añadí `docs/PLANTILLA_MOD.js` como punto de partida para los creadores de mods.
- Añadí `docs/REGISTRO_MODS.md` para explicar los IDs, el registro único por archivo, los eventos y los conflictos.
- Actualicé la guía para el entorno Minecraft PE 1.0.9, Toolbox 3.2.29, ModPE, Rhino y JavaScript ES5.
- Organicé la documentación de comandos `/Nexus`, diagnóstico, API e instalación.

### Actualizado
- Reescribí el README para dar la bienvenida a V0.3.0 en primera persona y explicar las novedades que incorporé.
- Actualicé la guía de creación de mods para que corresponda a V0.3.0 y a las convenciones actuales del motor.
- Añadí enlaces a los materiales para creadores y asistentes de IA.

### Eliminado o corregido
- Retiré las referencias antiguas de la guía a `engine/Nexus_V0.2.js` y a los comandos `.nexus`.
- Retiré la plantilla antigua `MiMod`, que daba a entender que un objeto se cargaba sin el registro actual.
- Retiré documentación que no correspondía al alcance de esta actualización del motor.
- Corregí la presentación anterior que describía V0.3.0 como inestable o todavía en desarrollo.
- Todavía no he lanzado la GitHub Release; publicaré el lanzamiento por separado.

### Alcance de esta actualización
Preparé esta entrega para presentar V0.3.0 y organizar sus archivos públicos. Conservé intacta la lógica del motor fuente que desarrollé.

## [0.2.1] — 2026-10-10
- Añadí el informe inicial automático al entrar al mundo.
- Amplié `/Nexus info` para diagnosticar el acceso a archivos, la carpeta Mods, los estados de carga y los registros.
- Incorporé los estados verde para correcto, ámbar para advertencias y rojo para fallas graves detectadas.
- Evité que se duplicara el encabezado [Nexus] en los mensajes de estado.
- Configuré el encabezado en verde, los mensajes normales en blanco y los estados de diagnóstico con color dinámico.
- Añadí formato en negrita `§l` a las líneas visibles.
- Cambié la salida del cargador a `Fallas: N` en lugar de `omitidos/fallidos`.
- No cambié las APIs públicas en esa versión.
- Dejé pendiente la validación en Minecraft PE 1.0.9 + Toolbox 3.2.29.

### English
- I added the automatic first report when entering a world.
- I expanded `/Nexus info` to diagnose file access, the Mods folder, loader states, and logs.
- I added green, amber, and red status indicators for healthy states, warnings, and detected serious failures.
- I prevented duplicate [Nexus] status headers.
- I set the header to green, normal messages to white, and diagnostic states to dynamic colors.
- I added bold `§l` formatting to visible lines.
- I changed loader output to `Failures: N` instead of `skipped/failed`.
- I made no public API changes in that version.
- I left validation in Minecraft PE 1.0.9 + Toolbox 3.2.29 pending at that time.

## [0.2.0] — 2026-10-10
- Añadí el prefijo de comandos `.nexus` y mantuve la compatibilidad con el prefijo slash de aquella versión.
- Incorporé los alias `info` e `ids` y el formato de estado verde.
- Añadí documentación bilingüe, licencia y notas de publicación.
- Mantuve esa actualización conservadora; dejé pendientes el control exclusivo de IDs numéricos y la validación dentro del juego.

### English
- I added the `.nexus` command prefix while retaining slash-prefix compatibility in that version.
- I added the `info` and `ids` aliases and green status formatting.
- I added bilingual documentation, a license, and release notes.
- I kept that update conservative and left numeric-only ID enforcement and in-game validation pending.
