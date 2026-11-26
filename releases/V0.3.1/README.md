# Nexus V0.3.1 — candidata de estabilidad

## Estado

Esta es una candidata de mantenimiento para Minecraft PE 1.0.9, Toolbox 3.2.29, ModPE, Rhino y JavaScript ES5. Corrige defectos de ciclo de vida de mods y añade pruebas automatizadas. No se considera estable/jugable hasta completar la validación dentro del juego.

## Cambios

- El propietario actual se restablece correctamente durante callbacks globales anidados.
- Al apagar un mod se limpian sus declaraciones de recursos y reservas de IDs no nativas. Las IDs de ítems ya registrados nativamente se conservan durante la sesión.
- Si un mod se desactiva durante el despacho de un evento, sus callbacks restantes no se ejecutan.
- Las transiciones reentrantes de activación y desactivación se rechazan.
- Los archivos se marcan como fallidos cuando falla una reactivación.

## Instalación de prueba

Carga `engine/Nexus_V0.3.1.js` como script principal y prueba mods de uno en uno en un mundo de prueba. Ejecuta `/Nexus info`; revisa activación, desactivación, reactivación, comandos, recursos y registros.

## Validación pendiente

La CI y las pruebas simuladas no sustituyen Rhino/Toolbox. Antes de publicar una Release estable hay que verificar arranque, acceso a carpetas, carga de un mod, eventos, comandos y operaciones nativas en Minecraft PE 1.0.9 + Toolbox 3.2.29.

