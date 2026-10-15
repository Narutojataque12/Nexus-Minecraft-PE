# Cómo registrar mods en mi motor Nexus V0.3.0

## Regla principal

Para que mi cargador acepte un mod, registra **exactamente un mod por archivo JavaScript** mediante una llamada directa a `Nexus.registerMod({...})). No basta con declarar un objeto JavaScript ni exportarlo con un nombre inventado.

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
- El ID debe ser exclusivo entre los mods instalados.
- Evita IDs duplicados, cero o literales con cero inicial.
- Escribe una ID fija y directa en `id`; no calcules la ID durante la carga.
- El nombre del archivo puede ser diferente de la ID. Lo importante es que el archivo contenga un único registro válido.
- No pongas dos llamadas `Nexus.registerMod` en el mismo archivo.

## Metadatos y funciones de ciclo de vida

- `id`: obligatorio; usa un entero positivo o texto numérico válido. Recomiendo un literal numérico.
- `name`: nombre legible del mod.
- `version`: versión propia del mod, por ejemplo `1.0.0`.
- `description`: descripción de hasta 500 caracteres.
- `author`: autor.
- `onLoad(api)`: función de inicialización/carga.
- `onEnable(api)`: función que ejecuto cuando se habilita el mod.
- `onDisable(api)`: función que ejecuto al deshabilitar el mod.
- `events`: objeto con nombres de eventos y funciones callback.

Recomiendo añadir los campos informativos. Para la validación básica requiero un ID válido y que las funciones de ciclo de vida, si se incluyen, sean funciones.

## Eventos

Configuré los callbacks de `events` para recibir los argumentos crudos del hook que despacho; no asumas que reciben el objeto `api). Consulta `engine/Nexus_V0.3.0.js` antes de depender de una firma concreta.

Mi motor despacha eventos como `worldEnter`, `worldLeave`, `tick`, `useItem`, `destroyBlock`, `startDestroyBlock`, `continueDestroyBlock`, `attack`, `death`, `entityHurt`, `eat`, `projectileHitEntity`, `projectileHitBlock`, `entityAdded`, `entityRemoved`, `chat`, `serverMessage` y `command`.

**No definas hooks globales de ModPE dentro del mod**, como `modTick`, `newLevel`, `useItem` o `procCmd); centralicé esos hooks en mi motor.

## Conflictos y verificación

Programé mi motor para validar las definiciones, rechazar IDs de mod duplicadas y registrar conflictos detectados. Un mod puede registrarse aunque alguna operación nativa todavía no esté verificada. Consulta `/Nexus info) y los registros, y confirma visualmente su comportamiento dentro de Minecraft PE 1.0.9.

## Ubicación

Coloca los mods normalmente en:

```text
/sdcard/Nexus/Mods/
```

Para empezar, copia y adapta [PLANTILLA_MOD.js](PLANTILLA_MOD.js). Usa JavaScript ES5 y prueba un mod a la vez.
