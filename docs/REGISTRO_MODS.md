# Cómo registrar un mod en Nexus V0.3.0

## Regla principal

El cargador de Nexus exige que **cada archivo JavaScript de mod registre exactamente un mod** mediante una llamada directa a `Nexus.registerMod({...})`. No basta con declarar un objeto JavaScript ni exportarlo con un nombre inventado.

Ejemplo mínimo:

```javascript
Nexus.registerMod({
    id: 41001,
    name: "Mi mod",
    version: "1.0.0",
    description: "Descripción breve",
    author: "Autor",
    onEnable: function (api) {
        api.message("Mod activo.");
    },
    events: {}
});
```

## Reglas del ID

- Debe ser un entero positivo, por ejemplo `41001`.
- Debe ser exclusivo entre los mods instalados.
- Evita IDs duplicados, cero o literales con cero inicial.
- Usa una ID fija y directa en `id`; no calcules la ID durante la carga.
- El nombre del archivo puede ser diferente de la ID. Lo que importa es el registro único y válido dentro del archivo.
- Cada archivo registra un mod: no pongas dos llamadas `Nexus.registerMod` en un solo archivo.

## Metadatos y funciones de ciclo de vida

- `id`: obligatorio; número entero positivo o texto numérico válido. Se recomienda un literal numérico.
- `name`: nombre legible del mod.
- `version`: versión propia del mod, por ejemplo `1.0.0`.
- `description`: descripción de hasta 500 caracteres.
- `author`: autor.
- `onLoad(api)`: inicialización/carga del mod según el ciclo del motor.
- `onEnable(api)`: llamada cuando el mod se habilita.
- `onDisable(api)`: limpieza al deshabilitar el mod.
- `events`: objeto con nombres de eventos y funciones callback.

Los campos informativos son recomendados; el único campo requerido para la validación básica es un ID válido. Los nombres de callbacks de ciclo de vida deben corresponder a funciones.

## Eventos

Los callbacks dentro de `events` reciben argumentos del hook nativo ya despachados por Nexus. No asumas que reciben el objeto `api`. Revisa `engine/Nexus_V0.3.0.js` antes de depender de una firma concreta.

Eventos que el motor despacha incluyen `worldEnter`, `worldLeave`, `tick`, `useItem`, `destroyBlock`, `startDestroyBlock`, `continueDestroyBlock`, `attack`, `death`, `entityHurt`, `eat`, `projectileHitEntity`, `projectileHitBlock`, `entityAdded`, `entityRemoved`, `chat`, `serverMessage` y `command`.

**No definas hooks globales de ModPE desde un mod**, como `modTick`, `newLevel`, `useItem` o `procCmd`; esos hooks los administra Nexus.

## Conflictos y verificación

Nexus valida definiciones, rechaza IDs de mod duplicadas y registra conflictos detectados. Un mod puede quedar registrado y, aun así, tener una operación nativa pendiente de verificación. Consulta `/Nexus info` y los registros, y confirma visualmente el comportamiento dentro de Minecraft PE 1.0.9.

## Ubicación

Los mods se colocan normalmente en:

```text
/sdcard/Nexus/Mods/
```

Para empezar, copia y modifica [PLANTILLA_MOD.js](PLANTILLA_MOD.js). Usa sintaxis JavaScript ES5 y prueba un mod a la vez.
