# Nexus V0.2.1 — Parche / Patch

## Español
Parche dedicado a los comandos, formato y diagnóstico. Al entrar al mundo se muestra un informe inicial. `/Nexus info` revisa el acceso a archivos, la carpeta Mods, los estados del cargador y los registros conocidos. Verde = correcto; ámbar/naranja = advertencia; rojo = falla grave detectada. Se evita el encabezado duplicado. Los mensajes visibles usan `§l`; encabezado verde, texto normal blanco y diagnóstico con color dinámico. El resumen de carga muestra `Fallas: N`. No se añaden APIs nuevas.

## English
A focused command, formatting, and diagnostic patch. An initial report appears when entering a world. `/Nexus info` checks file access, the Mods folder, loader states, and known registrations. Green = healthy; amber/orange = warning; red = detected serious failure. Duplicate headers are prevented. Visible messages use `§l`; green header, white normal text, and dynamic diagnostic colors. Loader summary displays `Failures: N`. No new APIs are added.

**Limitación / Limitation:** Not yet validated in the target Minecraft PE 1.0.9 + Toolbox 3.2.29 runtime. A diagnostic can report only issues exposed to the engine; it cannot guarantee that every mod is crash-free.
