# Nexus V0.3.1 — candidata de estabilidad

## Estado

V0.3.1 es una candidata de mantenimiento para Minecraft PE 1.0.9, Toolbox 3.2.29, ModPE, Rhino y JavaScript ES5. Corrige problemas del ciclo de vida de los mods y añade pruebas automatizadas. La validación dentro del juego sigue pendiente; hasta completarla, no se considera estable ni jugable.

## Cambios

- Nexus restablece correctamente al propietario actual durante callbacks globales anidados.
- Al desactivar un mod, Nexus limpia sus declaraciones de recursos y las reservas de IDs no nativas. Las IDs de ítems registrados de forma nativa se conservan durante la sesión.
- Si un mod se desactiva durante el despacho de un evento, sus listeners pendientes no se ejecutan.
- Nexus rechaza los intentos reentrantes de activar o desactivar mods durante la transición de activación.
- Si falla una reactivación, el archivo correspondiente queda marcado como fallido.

## Instalación de prueba

Carga `engine/Nexus_V0.3.1.js` como script principal y prueba los mods de uno en uno en un mundo de prueba. Ejecuta `/Nexus info` y revisa la activación, desactivación y reactivación, además de los comandos, recursos y registros.

## Validación pendiente

La CI y las pruebas simuladas no sustituyen las pruebas con Rhino y Toolbox. Antes de publicar una versión estable, hay que verificar el arranque, el acceso a las carpetas, la carga de un mod, los eventos, los comandos y las operaciones nativas en Minecraft PE 1.0.9 + Toolbox 3.2.29.
