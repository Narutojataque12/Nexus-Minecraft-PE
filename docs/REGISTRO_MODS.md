# Registro de mods en Nexus V0.3.0

## Regla principal

Registra exactamente un mod en cada archivo JavaScript mediante una llamada directa a `Nexus.registerMod({...})`. Declarar un objeto JavaScript o exportarlo con un nombre propio no cuenta como registro.

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

- Usa un entero positivo, por ejemplo `41001`.
- Cada mod instalado debe tener un ID exclusivo.
- No uses IDs duplicados ni el valor cero.
- Escribe un ID fijo directamente en `id`; no lo calcules durante la carga.
- El nombre del archivo puede ser distinto del ID. El archivo debe contener un único registro válido.
- No incluyas dos llamadas a `Nexus.registerMod` en el mismo archivo.

## Metadatos y ciclo de vida

- `id`: identificador del mod.
- `name`: nombre legible.
- `version`: versión del mod, por ejemplo `1.0.0`.
- `description`: descripción breve.
- `author`: autor.
- `onLoad(api)`: inicializa y carga el mod.
- `onEnable(api)`: se ejecuta al habilitar el mod.
- `onDisable(api)`: se ejecuta al deshabilitar el mod.
- `events`: objeto con nombres de eventos y funciones callback.

Se recomienda incluir los campos informativos. La validación básica requiere un ID válido y, si se incluyen funciones de ciclo de vida, que sean funciones.

## Eventos

Los callbacks de `events` reciben los argumentos del evento despachado; no asumas que también reciben el objeto `api`. Antes de depender de una firma concreta, consulta `engine/Nexus_V0.3.0.js`.

El motor despacha estos eventos: `worldEnter`, `worldLeave`, `tick`, `useItem`, `destroyBlock`, `startDestroyBlock`, `continueDestroyBlock`, `attack`, `death`, `entityHurt`, `eat`, `projectileHitEntity`, `projectileHitBlock`, `entityAdded`, `entityRemoved`, `chat`, `serverMessage` y `command`.

No declares callbacks globales de ModPE dentro del mod; el motor centraliza esos eventos.

## Conflictos y verificación

El motor valida las definiciones, rechaza los IDs de mod duplicados y registra los conflictos que detecta. Un mod puede registrarse aunque alguna operación nativa aún no se haya verificado. Consulta `/Nexus info` y los registros, y confirma el comportamiento dentro de Minecraft PE 1.0.9.

## Ubicación

Guarda normalmente los mods en:

```text
/sdcard/Nexus/Mods/
```

Para empezar, adapta [PLANTILLA_MOD.js](PLANTILLA_MOD.js). Usa JavaScript ES5 y prueba un mod a la vez.
