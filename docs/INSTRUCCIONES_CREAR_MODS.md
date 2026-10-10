# Crear mods para Nexus / Creating Nexus Mods

## Español
Nexus está orientado a Minecraft PE 1.0.9 + Toolbox 3.2.29 con Rhino y JavaScript ES5. Evita `let`, `const`, funciones flecha, clases, plantillas literales, módulos y `async/await`.

### Instalación
Carga `engine/Nexus_V0.2.js` como script principal en Toolbox. Coloca mods compatibles en `/sdcard/Nexus/Mods/`. Haz una copia de seguridad y prueba un mod a la vez.

### Ejemplo ilustrativo
```javascript
var MiMod = {
    id: "ejemplo_01",
    name: "Mi primer mod",
    version: "1.0.0",
    init: function () {
        clientMessage("§a[MiMod] Activado");
    },
    tick: function () {
        // Mantén este código ligero.
    },
    leave: function () {
        // Limpieza opcional.
    }
};
```
Este ejemplo es orientativo: verifica en el motor el formato exacto que acepta el cargador antes de publicar. No presupongas que cualquier objeto se carga automáticamente.

### Comandos
- `.nexus help`: ayuda.
- `.nexus info`: estado, versión, mods y ticks.
- `.nexus ids`: lista de mods registrados (alias de list).
- `.nexus load all`: intenta cargar todos los mods detectados.
- `.nexus load archivo.js`: intenta cargar un archivo.
- `.nexus enable <id>` / `.nexus disable <id>`: activar/desactivar.
- `.nexus resources`: muestra declaraciones de recursos; no garantiza detectar paquetes automáticamente.

### Buenas prácticas y API
Usa IDs únicos y estables; en v0.2.0 no se fuerza que todos los IDs sean numéricos. Evita trabajo pesado en `tick`, comprueba que cada API existe antes de llamarla, usa `try/catch` para operaciones riesgosas, no sobrescribas globales y no ejecutes código remoto sin revisarlo. El objeto global `Nexus` ofrece APIs que dependen de la implementación; consulta `engine/Nexus_V0.2.js` para sus firmas reales. `ModPE.overrideTexture` depende de la build instalada.

## English
Nexus targets Minecraft PE 1.0.9 + Toolbox 3.2.29 with Rhino and ES5 JavaScript. Avoid modern syntax such as `let`, `const`, arrow functions, classes, template literals, modules, and `async/await`.

Load `engine/Nexus_V0.2.js` as the main Toolbox script and place compatible mods in `/sdcard/Nexus/Mods/`. Back up your files and test one mod at a time.

The illustrative structure above is not a guarantee that the loader accepts every export format. Check the exact loader contract in the engine source. Use unique stable IDs; numeric-only ID enforcement is not implemented in v0.2.0. Keep tick handlers lightweight, check APIs before use, handle risky calls with `try/catch`, avoid overwriting globals, and never execute unreviewed remote code.

Commands: `.nexus help`, `.nexus info`, `.nexus ids`, `.nexus load all`, `.nexus load <file.js>`, `.nexus enable <id>`, `.nexus disable <id>`, and `.nexus resources`. Resource declarations do not guarantee automatic pack discovery.
