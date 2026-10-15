# Changelog / Registro de cambios

## [0.3.0] — 2026-10-15

### Añadido
- Publicación del motor fuente `engine/Nexus_V0.3.0.js`, copiado de la versión proporcionada por el creador sin cambios funcionales.
- Bienvenida bilingüe en README para la nueva versión estable y jugable.
- Notas de publicación bilingües en `releases/V0.3.0/README.md`.
- `docs/INSTRUCCIONES_IA_NEXUS.txt`: reglas para orientar asistentes de IA al desarrollo de mods para Nexus.
- `docs/PLANTILLA_MOD.js`: plantilla mínima con el registro esperado por el cargador.
- `docs/REGISTRO_MODS.md`: explicación de IDs, registro único por archivo, eventos y conflictos.
- Guía actualizada para Minecraft PE 1.0.9, Toolbox 3.2.29, ModPE, Rhino y JavaScript ES5.
- Documentación de comandos `/Nexus`, diagnóstico, APIs y flujo de instalación.

### Actualizado
- README: Nexus V0.3.0 se presenta como estable y jugable y se explica qué aporta el motor.
- Guía de creación de mods: ahora corresponde a V0.3.0 y a las firmas/convenciones del motor actual.
- Enlaces de la documentación para creadores e IA.

### Eliminado o corregido
- Eliminadas referencias obsoletas de la guía a `engine/Nexus_V0.2.js` y a comandos `.nexus`.
- Eliminada la plantilla antigua `MiMod` que suponía autocarga sin registro.
- Eliminada `docs/NUCLEO_TERRESTRE.md`, una página sobre un mod ajeno a esta actualización del motor.
- Corregida la presentación general que describía V0.3.0 como inestable/en desarrollo.
- No se ha publicado una GitHub Release desde este cambio; el mantenedor la lanzará por separado.

### Nota de alcance
Los cambios de esta sección documentan la entrega de V0.3.0 y reorganizan archivos públicos. El código del motor se sube desde la fuente del creador sin modificar la lógica del motor.

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
- `/Nexus info` checks file access, Mods folder, loader states, and logs.
- Green for healthy, amber for warnings, red for detected serious failures.
- Prevents duplicate [Nexus] status headers.
- Green header, white normal messages, dynamic diagnostic colors.
- Visible messages use bold `§l` formatting.
- Loader output uses `Failures: N`.
- No public API changes.
- In-game validation was pending at that time.

## [0.2.0] — 2026-10-10
- Added `.nexus` command prefix while retaining slash-prefix compatibility.
- Added `info` and `ids` aliases and green status formatting.
- Added bilingual documentation, license, and release notes.
- Conservative update; numeric-only ID enforcement and in-game validation remained pending.
