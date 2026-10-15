/*
 * Plantilla básica para mods de Nexus V0.3.0.
 * Entorno: Minecraft PE 1.0.9 + Toolbox 3.2.29 + ModPE/Rhino + JavaScript ES5.
 *
 * Copia este archivo a /sdcard/Nexus/Mods/ y personaliza el ID y los metadatos.
 * Cada archivo debe contener exactamente una llamada a Nexus.registerMod({...}).
 */

Nexus.registerMod({
    id: 41001,
    name: "Mi primer mod",
    version: "1.0.0",
    description: "Plantilla básica para un mod de Nexus.",
    author: "Tu nombre",

    onLoad: function (api) {
        api.Logger.info("El mod ha sido cargado.");
    },

    onEnable: function (api) {
        api.message("El mod está activo.");
    },

    onDisable: function (api) {
        api.Logger.info("El mod ha sido desactivado.");
    },

    events: {
        // Agrega solo los eventos necesarios.
        // Los callbacks reciben los argumentos del evento, no api automáticamente.
        // Ejemplo:
        // worldEnter: function () {
        //     // Se ejecuta cuando el motor informa la entrada a un mundo.
        // },
        // tick: function (tickCount) {
        //     // Mantén este callback ligero porque puede ejecutarse frecuentemente.
        // }
    }
});
