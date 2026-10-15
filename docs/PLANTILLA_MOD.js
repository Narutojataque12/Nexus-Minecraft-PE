/*
 * Plantilla básica para Nexus V0.3.0
 * Entorno: Minecraft PE 1.0.9 + Toolbox 3.2.29 + ModPE/Rhino + JavaScript ES5
 *
 * Copia este archivo a /sdcard/Nexus/Mods/ y cambia el ID y los metadatos.
 * Cada archivo debe registrar EXACTAMENTE un mod con Nexus.registerMod({...}).
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
        // Agrega solo eventos que necesites.
        // Estos callbacks reciben los argumentos crudos del evento; no reciben api automáticamente.
        // Ejemplo:
        // worldEnter: function () {
        //     // Se ejecuta cuando el motor informa entrada a un mundo.
        // },
        // tick: function (tickCount) {
        //     // Mantén este callback ligero; se llama frecuentemente.
        // }
    }
});
