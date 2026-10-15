# Registro de mods en Nexus V0.3.0

## Regla principal

Cada archivo JavaScript debe registrar exactamente un mod mediante una llamada directa a `Nexus.registerMod({...})`. Declarar un objeto JavaScript o exportarlo con un nombre propio no sustituye el registro.

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

- Utiliza un entero positivo, por ejemplo `41001`.
- El ID debe ser exclusivo entre los mods instalados.
- Evita IDs duplicados y el valor cero.
- Escribe un ID fijo y directo en `id`; no lo calcules durante la carga.
- El nombre del archivo puede ser diferente del ID. El contenido debe incluir un único registro válido.
- No incluyas dos llamadas a `Nexus.registerMod` en el mismo archivo.

## Metadatos y ciclo de vida

- `id`: identificador del mod.
- `name`: nombre legible.
- `version`: versión del mod, por ejemplo `1.0.0`.
- `description`: descripción breve.
- `author`: autor.
- `onLoad(api)`: inicialización y carga.
- `onEnable(api)`: se ejecuta al habilitar el mod.
- `onDisable(api)`: se ejecuta al deshabilitar el mod.
- `events`: objeto con nombres de eventos y funciones callback.

Los campos informativos son recomendables. La validación básica requiere un ID válido y que las funciones de ciclo de vida, si se incluyen, sean funciones.

## Eventos

Los callbacks de `events` reciben los argumentos del evento despachado; no se debe asumir que reciben el objeto `api`. Consulta `engine/Nexus_V0.3.0.js` antes de depender de una firma concreta.

Los eventos despachados incluyen `worldEnter`, `worldLeave`, `tick`, `useItem`, `destroyBlock`, `startDestroyBlock`, `continueDestroyBlock`, `attack`, `death`, `entityHurt`, `eat`, `projectileHitEntity`, `projectileHitBlock`, `entityAdded`, `entityRemoved`, `chat`, `serverMessage` y `command`.

No declares callbacks globales de ModPE dentro del mod; el motor centraliza esos eventos.

## Conflictos y verificación

El motor valida las definiciones, rechaza IDs de mod duplicados y registra conflictos detectados. Un mod puede registrarse aunque alguna operación nativa todavía no esté verificada. Consulta `/Nexus info` y los registros, y confirma el comportamiento dentro de Minecraft PE 1.0.9.

## Ubicación

Coloca los mods normalmente en:

```text
/sdcard/Nexus/Mods/
```

Para empezar, adapta [PLANTILLA_MOD.js](PLANTILLA_MOD.js). Utiliza JavaScript ES5 y prueba un mod a la vez.
