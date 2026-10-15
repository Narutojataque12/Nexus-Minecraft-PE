# Changelog / Registro de cambios

## [0.3.0] — 2026-10-15

### Motor y herramientas
- Se incorpora el código fuente de Nexus V0.3.0 al repositorio en `engine/Nexus_V0.3.0.js`.
- Se establece V0.3.0 como la versión estable y jugable de referencia para Minecraft PE 1.0.9, Toolbox 3.2.29, ModPE, Rhino y JavaScript ES5.
- Se documenta el registro de un único mod por archivo mediante `Nexus.registerMod({...})), con ID numérico positivo y único.
- Se documentan los diagnósticos disponibles mediante `/Nexus info`.
- Se unifican los comandos documentados de administración bajo `/Nexus`: `help`, `info`, `log`, `load`, `on ID`, `off ID`, `IDS` y `resources`.
- Se documentan los módulos de API para eventos, tareas programadas, registros, mods, comandos, objetos, jugador, mundo, entidades, bloques, efectos, interfaz, recursos, registro, compatibilidad, almacenamiento, configuración y datos.
- Se incluyen referencias técnicas para la creación de mods, asistentes de IA, plantilla JavaScript ES5 y registro.

### Documentación retirada o sustituida
- Se sustituyen las instrucciones obsoletas que hacían referencia al archivo `engine/Nexus_V0.2.js).
- Se retira el ejemplo antiguo `MiMod` que no utiliza el registro actual.
- La documentación de comandos de V0.3.0 deja de presentar `.nexus` como interfaz vigente y utiliza `/Nexus`.

### Estado de publicación
- La documentación y el código fuente están disponibles en la rama principal.
- La GitHub Release de V0.3.0 no se ha publicado todavía.

## [0.2.1] — 2026-10-10
- Se añade el informe inicial automático al entrar al mundo.
- Se amplía `/Nexus info` para diagnosticar el acceso a archivos, la carpeta Mods, los estados de carga y los registros.
- Se incorporan estados de color para distinguir el funcionamiento correcto, las advertencias y los fallos graves detectados.
- Se evita duplicar el encabezado [Nexus] en los mensajes de estado.
- Se configura el encabezado en verde, los mensajes normales en blanco y los estados de diagnóstico con color dinámico.
- Se añade formato en negrita `§l` a las líneas visibles.
- Se cambia la salida del cargador a `Fallas: N` en lugar de `omitidos/fallidos`.
- No se cambian las API públicas en esa versión.
- La validación en Minecraft PE 1.0.9 + Toolbox 3.2.29 queda pendiente en ese momento.

## [0.2.0] — 2026-10-10
- Se añade el prefijo de comandos `.nexus` y se mantiene la compatibilidad con el prefijo slash de aquella versión.
- Se incorporan los alias `info` e `ids` y el formato de estado verde.
- Se añade documentación bilingüe, licencia y notas de publicación.
- Quedan pendientes el control exclusivo de IDs numéricos y la validación dentro del juego.
