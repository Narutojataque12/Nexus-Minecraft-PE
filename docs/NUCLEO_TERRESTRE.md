# Núcleo Terrestre / Terrestrial Core

## Español

### Resumen
Núcleo Terrestre es un mod defensivo para Minecraft Pocket Edition 1.0.9 pensado para trabajar con Nexus V0.3.0, Toolbox 3.2.29, ModPE y Rhino JavaScript ES5. Su idea es convertir el Beacon en un núcleo de defensa terrestre: detectar mobs hostiles que se aproximan, informar cuando hay amenazas cerca y aplicar daño según la distancia.

### Comportamiento previsto
- Usa el Beacon vanilla (bloque ID 138); no añade un nuevo bloque.
- La lógica descrita considera una zona de activación cercana al Beacon y un radio de detección de hasta 32 bloques.
- Daño escalonado descrito: hasta 8 bloques, 6 puntos; hasta 16 bloques, 4 puntos; hasta 24 bloques, 2 puntos; hasta 32 bloques, 1 punto.
- Muestra un aviso/estado sobre la presencia de mobs hostiles cercanos.
- Está diseñado para no atacar jugadores ni animales pasivos.

Las distancias y el daño anteriores describen el diseño del mod entregado para prueba; no son una promesa de equilibrio ni una garantía para todas las instalaciones.

### Compatibilidad
- Minecraft PE 1.0.9
- Toolbox 3.2.29
- ModPE / Rhino
- Nexus V0.3.0

### Instalación
1. Haz una copia de seguridad de tu mundo y conserva una copia de tu motor Nexus.
2. Coloca el archivo JavaScript del mod en la carpeta Mods que use tu instalación de Nexus (normalmente `/storage/emulated/0/Nexus/Mods/`).
3. Inicia Minecraft mediante Toolbox y revisa los registros de Nexus.
4. Entra a un mundo de prueba, coloca/usa un Beacon y comprueba los avisos y el daño con mobs hostiles.
5. Revisa que no se dañen jugadores ni animales pasivos y observa el comportamiento a varias distancias.

**Importante:** el archivo JavaScript ejecutable del mod debe acompañar esta documentación en la distribución del mod. No descargues ni ejecutes código de fuentes no confiables.

### Estado de pruebas
El creador informó el 15 de octubre de 2026 que probó el mod y que Nexus y el mod registraron cero errores. Esto confirma el resultado reportado en ese entorno de prueba, pero cero errores en el registro no demuestra por sí solo cada detalle del comportamiento ni garantiza resultados en otros dispositivos.

### Limitaciones conocidas
- La documentación no afirma que el mod compruebe la activación de la pirámide del Beacon.
- El comportamiento de salud, muerte, drops y efectos depende de las APIs nativas disponibles en la versión antigua de ModPE/Toolbox.
- El radio, el daño y la exclusión de entidades deben volver a probarse si se cambia de versión o entorno.
- Esta actualización no modifica el motor Nexus.

## English

### Overview
Núcleo Terrestre is a defensive mod for Minecraft Pocket Edition 1.0.9 intended for Nexus V0.3.0, Toolbox 3.2.29, ModPE, and Rhino ES5. It is designed to turn the vanilla Beacon into a terrestrial defensive core: detect approaching hostile mobs, report nearby threats, and apply damage based on distance.

### Intended behavior
- Uses the vanilla Beacon (block ID 138); it does not add a new block.
- The described logic uses a nearby activation area and a hostile-mob detection radius of up to 32 blocks.
- Described damage tiers: up to 8 blocks, 6 points; up to 16 blocks, 4 points; up to 24 blocks, 2 points; up to 32 blocks, 1 point.
- Displays a status/notice when hostile mobs are nearby.
- Designed not to attack players or passive animals.

These distances and damage values describe the mod's intended behavior for testing; they are not a balance guarantee or a universal compatibility claim.

### Compatibility
- Minecraft PE 1.0.9
- Toolbox 3.2.29
- ModPE / Rhino
- Nexus V0.3.0

### Installation
1. Back up your world and keep a copy of your Nexus engine.
2. Place the mod's JavaScript file in the Mods folder used by your Nexus installation (usually `/storage/emulated/0/Nexus/Mods/`).
3. Launch Minecraft through Toolbox and check the Nexus logs.
4. Enter a test world, place/use a Beacon, and check notices and damage against hostile mobs.
5. Verify that players and passive animals are not damaged and test at several distances.

**Important:** the executable JavaScript mod file must accompany this documentation in the mod distribution. Do not download or execute code from untrusted sources.

### Test status
On October 15, 2026, the creator reported testing the mod and seeing zero logged errors for both the mod and Nexus. This records the reported result in that test environment; zero log errors alone does not prove every behavior or guarantee results on other devices.

### Known limitations
- This documentation does not claim that Beacon pyramid activation is checked.
- Health, death, drops, and effects depend on native APIs available in the older ModPE/Toolbox version.
- Radius, damage, and entity exclusions should be retested if the game version or environment changes.
- This documentation update does not modify the Nexus engine.
