/* =====================================================================
   NEXUS v0.3.0 - Motor de mods para ModPE / Toolbox (APIs ampliadas experimentales)
   Objetivo previsto: Minecraft PE 1.0.9 + Toolbox 3.2.29
   Dialecto: JavaScript ES5 (Rhino)

   IMPORTANTE:
   - Instala ESTE archivo como script principal en Toolbox.
   - Los mods Nexus van en /sdcard/Nexus/Mods/*.js
   - Los mods pueden usar el ámbito global; el loader los evalúa en un ámbito auxiliar
     para no exponer directamente las variables privadas de este IIFE.
   - Esto NO es un sandbox de seguridad: los globales y APIs públicas siguen compartidos.
   - La compatibilidad real debe comprobarse en el dispositivo objetivo.
   ===================================================================== */

var Nexus = (function () {
    var VERSION = "0.3.0";
    var ROOT_NAME = "Nexus";
    var rootPath = "/sdcard/Nexus/";
    var dirsReady = false;
    var started = false;
    var tickCount = 0;
    var worldActive = false;
    var currentOwner = null;
    var currentLoadingFile = null;
    var currentLoadRegisteredIds = null;
    var currentLoadRegistrationFailed = false;
    var idClaims = {};
    /* Los objetos nativos de BlockLauncher no se pueden desregistrar de forma fiable. */
    var itemRecords = {};
    var itemOrder = [];
    var mods = {};
    var modOrder = [];
    var eventListeners = {};
    var listenerSequence = 1;
    var tasks = [];
    var taskSequence = 1;
    var callbackErrorSequence = 0;
    var commands = {};
    var fileStates = {};
    var resourceDeclarations = {};
    var configCache = {};
    var logBuffer = [];
    /* Buffer rodante independiente: conserva los últimos registros aunque Nexus.log se vacíe al persistir. */
    var recentLogBuffer = [];
    var autoLoad = true;
    var maxLogBuffer = 100;

    function own(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }

    function trim(value) {
        return String(value === null || value === undefined ? "" : value).replace(/^\s+|\s+$/g, "");
    }

    function safeId(value) {
        return /^[A-Za-z0-9._-]{1,64}$/.test(String(value || "")) && String(value).indexOf("..") === -1;
    }

    /* La identidad del mod es numérica y se mantiene como cadena canónica en los registros. */
    function normalizeModId(value) {
        var id;
        if (typeof value === "number") {
            if (!isFinite(value) || Math.floor(value) !== value || value < 1 || value > 9007199254740991) return null;
            id = String(value);
        } else if (typeof value === "string") {
            id = trim(value);
            if (!/^\d+$/.test(id)) return null;
            id = id.replace(/^0+/, "");
            if (!id || id === "0" || id.length > 16 || Number(id) > 9007199254740991) return null;
        } else {
            return null;
        }
        return id && id !== "0" ? id : null;
    }

    function lower(value) {
        return String(value || "").toLowerCase();
    }

    function nativeMessage(text) {
        var message = String(text);
        /* El prefijo antiguo puede venir incluido en algunos mensajes internos; quítalo para no duplicarlo. */
        message = message.replace(/^§l§a\[Nexus\]\s*/, "");
        /* §l se reserva exclusivamente para el rótulo [Nexus], nunca para el contenido posterior. */
        message = message.replace(/§l/g, "");
        try {
            if (typeof clientMessage === "function") {
                clientMessage("§l§a[Nexus]§r §f" + message);
                return;
            }
        } catch (ignoreMessage) {}
        try {
            if (typeof print === "function") print("[Nexus] " + message.replace(/§[0-9a-fk-or]/gi, ""));
        } catch (ignorePrint) {}
    }

    function diagnosticReport() {
        var severity = "§l§a", label = "Correcto";
        var errors = [], warnings = [], notes = [];
        var folder, files, fileCount = 0, i, rec, stateList, active = 0, disabled = 0, failed = 0;
        var registeredIds = [], claims, claimConflicts = [], itemRec, propertyKey, resourceCheck;
        try {
            if (!canUseJavaFiles()) {
                errors.push("Acceso Java/archivos no disponible en este contexto");
            } else {
                folder = new java.io.File(rootPath + "Mods/");
                if (!folder.exists() || !folder.isDirectory()) {
                    warnings.push("La carpeta Mods no existe o no es un directorio");
                } else {
                    files = folder.listFiles();
                    if (files === null) errors.push("No se pudo leer la carpeta Mods");
                    else {
                        for (i = 0; i < files.length; i++) {
                            if (files[i] && files[i].isFile() && /\.js$/i.test(String(files[i].getName()))) fileCount++;
                        }
                    }
                }
                if (!dirsReady) warnings.push("Una o más carpetas de Nexus no están disponibles");
            }
            stateList = publicApi.Loader.status();
            if (typeof resolveGlobalPath("ModPE.setItem").value !== "function" && itemOrder.length === 0) warnings.push("Nexus.Items no detecta ModPE.setItem; no podrá solicitar nuevos ítems en este contexto");
            for (i = 0; i < stateList.length; i++) {
                if (stateList[i].state === "error" || stateList[i].state === "failed" || stateList[i].state === "conflict") {
                    errors.push("Archivo " + stateList[i].file + ": " + (stateList[i].error || stateList[i].state));
                } else if (stateList[i].state === "invalid" || stateList[i].state === "rejected") {
                    warnings.push("Registro inválido: " + stateList[i].file + (stateList[i].error ? " — " + stateList[i].error : ""));
                }
            }
            for (i = 0; i < modOrder.length; i++) {
                rec = mods[modOrder[i]];
                if (!rec) {
                    warnings.push("Registro incompleto para ID " + modOrder[i]);
                    continue;
                }
                registeredIds.push(rec.id);
                if (rec.state === "active") active++;
                else if (rec.state === "disabled") disabled++;
                else if (rec.state === "failed" || rec.state === "error" || rec.state === "conflict") failed++;
                if (rec.errors > 0 || rec.state === "error" || rec.state === "failed" || rec.state === "conflict") {
                    errors.push("Mod " + rec.id + " (" + rec.name + ") estado=" + rec.state + ", errores=" + rec.errors + (rec.lastError ? ", último error=" + rec.lastError : ""));
                } else if (rec.state !== "active" && rec.state !== "disabled") {
                    warnings.push("Mod " + rec.id + " (" + rec.name + ") no está activo: " + rec.state);
                }
            }
            claims = publicApi.Registry.list();
            for (i = 0; i < claims.length; i++) {
                if (claims[i].conflict === true) claimConflicts.push(claims[i].kind + " " + claims[i].id + " reclamado por " + claims[i].ownerId + " y en conflicto con " + (claims[i].conflictWith || "otro mod"));
            }
            if (claimConflicts.length) errors = errors.concat(claimConflicts);
            for (i = 0; i < itemOrder.length; i++) {
                itemRec = itemRecords[itemOrder[i]];
                if (!itemRec) continue;
                if (!itemRec.verifiedInGame) warnings.push("Ítem " + itemRec.id + " (" + itemRec.name + "): solicitud nativa sin verificación dentro del juego");
                for (propertyKey in itemRec.properties) {
                    if (own(itemRec.properties, propertyKey) && itemRec.properties[propertyKey] && itemRec.properties[propertyKey].applied === false) warnings.push("Ítem " + itemRec.id + ": propiedad " + propertyKey + " no aplicada (" + itemRec.properties[propertyKey].state + ")");
                }
            }
            resourceCheck = publicApi.Resources.validate();
            for (i = 0; i < resourceCheck.issues.length; i++) errors.push("Recurso: " + resourceCheck.issues[i]);
            for (i = 0; i < resourceCheck.warnings.length; i++) warnings.push("Recurso: " + resourceCheck.warnings[i]);
            if (errors.length) { severity = "§l§c"; label = "Falla crítica"; }
            else if (warnings.length) { severity = "§l§6"; label = "Advertencia"; }
            else notes.push("Motor, carpetas y registros sin problemas detectados");
        } catch (e) {
            errors.push("Error durante diagnóstico: " + String(e));
            severity = "§l§c"; label = "Falla crítica";
        }
        /* Panel compacto Nexus: jerarquía clara sin marcos enormes ni títulos repetidos. */
        nativeMessage("§a+------ NEXUS v" + VERSION + " ------+");
        nativeMessage(severity + "Estado: " + label + "§r §8|§f Mods " + modOrder.length + " §8(§a" + active + " activos§8, §6" + disabled + " apagados§8)");
        nativeMessage("§fArchivos: §a" + fileCount + " §8|§f Ticks: §a" + tickCount + " §8|§f Fallas: " + (errors.length ? "§c" : "§a") + errors.length + " §8|§f Avisos: §6" + warnings.length);
        nativeMessage("§fÍtems: §a" + itemOrder.length + " §8|§f IDs: §a" + publicApi.Registry.count() + " §8|§f Recursos: §a" + publicApi.Resources.list().length);
        nativeMessage("§8Ruta: §7" + rootPath + "Mods/");
        if (errors.length || warnings.length) nativeMessage("§a+------ DETALLES ------+");
        for (i = 0; i < errors.length; i++) nativeMessage("§c[ERROR] §f" + errors[i]);
        for (i = 0; i < warnings.length; i++) nativeMessage("§6[AVISO] §f" + warnings[i]);
        for (i = 0; i < notes.length; i++) nativeMessage("§a[OK] §f" + notes[i]);
        if (modOrder.length) nativeMessage("§a+------ MODS ------+");
        for (i = 0; i < modOrder.length; i++) {
            rec = mods[modOrder[i]];
            if (rec) nativeMessage("§a[" + rec.state + "] §f" + rec.id + " §8| §7" + rec.name + " v" + rec.version + " §8| errores: " + rec.errors);
        }
        return { severity: label, errors: errors, warnings: warnings, mods: registeredIds, fileCount: fileCount };
    }

    function canUseJavaFiles() {
        try {
            return typeof java !== "undefined" && java.io && java.io.File &&
                java.io.BufferedReader && java.io.FileReader && java.io.FileWriter;
        } catch (e) {
            return false;
        }
    }

    function getRootPath() {
        try {
            if (typeof android !== "undefined" && android.os && android.os.Environment) {
                return String(android.os.Environment.getExternalStorageDirectory().getAbsolutePath()) + "/Nexus/";
            }
        } catch (e) {}
        return "/sdcard/Nexus/";
    }

    function fileAt(path) {
        if (!canUseJavaFiles()) return null;
        try { return new java.io.File(String(path)); }
        catch (e) { return null; }
    }

    function ensureDirectories() {
        if (!canUseJavaFiles()) return false;
        rootPath = getRootPath();
        var names = ["", "Mods", "Config", "Data", "Logs"];
        var allOk = true;
        var i;
        for (i = 0; i < names.length; i++) {
            var path = rootPath + (names[i] ? names[i] + "/" : "");
            try {
                var f = new java.io.File(path);
                if (!f.exists() && !f.mkdirs() && !f.exists()) allOk = false;
                if (f.exists() && !f.isDirectory()) allOk = false;
            } catch (e) {
                allOk = false;
            }
        }
        dirsReady = allOk;
        return allOk;
    }

    function readText(path) {
        if (!canUseJavaFiles()) return null;
        var br = null;
        try {
            var f = new java.io.File(String(path));
            if (!f.exists() || !f.isFile()) return null;
            br = new java.io.BufferedReader(new java.io.FileReader(f));
            var lines = [];
            var line;
            while ((line = br.readLine()) !== null) lines.push(String(line));
            br.close();
            br = null;
            return lines.join("\n");
        } catch (e) {
            try { if (br !== null) br.close(); } catch (ignoreClose) {}
            return null;
        }
    }

    function writeText(path, content, append) {
        if (!canUseJavaFiles()) return false;
        var writer = null;
        try {
            var f = new java.io.File(String(path));
            var parent = f.getParentFile();
            if (parent && !parent.exists()) parent.mkdirs();
            writer = new java.io.FileWriter(f, append === true);
            writer.write(String(content));
            writer.flush();
            writer.close();
            writer = null;
            return true;
        } catch (e) {
            try { if (writer !== null) writer.close(); } catch (ignoreClose) {}
            return false;
        }
    }

    function timestamp() {
        try { return String(new java.util.Date().toString()); }
        catch (e) { return String(new Date().toISOString ? new Date().toISOString() : new Date()); }
    }

    function flushLogs() {
        if (!dirsReady || logBuffer.length === 0) return false;
        var content = logBuffer.join("\n") + "\n";
        if (writeText(rootPath + "Logs/Nexus.log", content, true)) {
            logBuffer = [];
            return true;
        }
        return false;
    }

    function log(level, message) {
        var line = "[" + timestamp() + "] [" + level + "] " + String(message);
        logBuffer.push(line);
        recentLogBuffer.push(line);
        if (logBuffer.length > maxLogBuffer) logBuffer.shift();
        if (recentLogBuffer.length > maxLogBuffer) recentLogBuffer.shift();
        try {
            if (dirsReady && logBuffer.length >= 8) flushLogs();
        } catch (ignoreLogFlush) {}
    }

    function callAsOwner(ownerId, fn, args, label) {
        var previous = currentOwner;
        if (ownerId) currentOwner = ownerId;
        try {
            return fn.apply(null, args || []);
        } catch (e) {
            callbackErrorSequence++;
            if (ownerId && mods[ownerId]) {
                mods[ownerId].errors++;
                mods[ownerId].lastError = String(e);
            }
            log("ERROR", (ownerId || "engine") + " / " + (label || "callback") + ": " + String(e));
            return null;
        } finally {
            currentOwner = previous;
        }
    }

    function apiFor(ownerId) {
        /* Logger por mod: cada entrada identificará claramente qué mod la generó. */
        var scopedLogger = {
            info: function (message) { log("INFO", "[mod " + ownerId + "] " + String(message)); },
            warn: function (message) { log("WARN", "[mod " + ownerId + "] " + String(message)); },
            error: function (message) { log("ERROR", "[mod " + ownerId + "] " + String(message)); },
            flush: function () { return flushLogs(); },
            message: function (text) { nativeMessage("[" + ownerId + "] " + text); }
        };
        return {
            version: VERSION,
            id: ownerId,
            Events: Nexus.Events,
            Scheduler: Nexus.Scheduler,
            Logger: scopedLogger,
            Mods: Nexus.Mods,
            Commands: Nexus.Commands,
            Items: Nexus.Items,
            Player: Nexus.Player,
            World: Nexus.World,
            Entities: Nexus.Entities,
            Blocks: Nexus.Blocks,
            Effects: Nexus.Effects,
            UI: Nexus.UI,
            Resources: Nexus.Resources,
            Registry: Nexus.Registry,
            Compat: Nexus.Compat,
            Storage: Nexus.Storage,
            Config: Nexus.Config,
            Data: Nexus.Data,
            message: function (text) { nativeMessage("[" + ownerId + "] " + text); }
        };
    }

    function removeOwnedListeners(ownerId) {
        var name, list, i;
        for (name in eventListeners) {
            if (!own(eventListeners, name)) continue;
            list = eventListeners[name];
            for (i = list.length - 1; i >= 0; i--) {
                if (list[i].ownerId === ownerId) list.splice(i, 1);
            }
            if (list.length === 0) delete eventListeners[name];
        }
    }

    function removeOwnedTasks(ownerId) {
        var i;
        for (i = tasks.length - 1; i >= 0; i--) {
            if (tasks[i].ownerId === ownerId) tasks.splice(i, 1);
        }
    }

    function removeOwnedCommands(ownerId) {
        var name;
        for (name in commands) {
            if (own(commands, name) && commands[name].ownerId === ownerId) delete commands[name];
        }
    }

    function removeOwnedResources(ownerId) {
        if (resourceDeclarations[ownerId]) delete resourceDeclarations[ownerId];
    }

    function removeOwnedClaims(ownerId) {
        var key, claim;
        for (key in idClaims) {
            if (!own(idClaims, key)) continue;
            claim = idClaims[key];
            /* Los ítems nativos quedan definidos durante la sesión aunque falle/desactive su mod. */
            if (claim.ownerId === ownerId && !(claim.kind === "item" && itemRecords[String(claim.id)])) delete idClaims[key];
        }
    }

    function currentCarriedItemId() {
        var result = callNativeVariants([
            { path: "Player.getCarriedItem", args: [] },
            { path: "getCarriedItem", args: [] }
        ]);
        if (!result.ok) return null;
        var value = result.value;
        if (value && typeof value === "object") {
            if (value.id !== undefined) value = value.id;
            else if (value.itemId !== undefined) value = value.itemId;
        }
        value = Number(value);
        return isFinite(value) && Math.floor(value) === value ? value : null;
    }

    function dispatchItemBehaviors(eventName, args) {
        var itemId = null, playerEntity = null, attacker = null, i, rec, ownerRec, callback, context, result, allowed = true;
        if (eventName === "useItem") {
            itemId = Number(args[3]);
        } else if (eventName === "attack") {
            attacker = args[0];
            var playerResult = callNativeVariants([{ path: "Player.getEntity", args: [] }, { path: "getPlayerEnt", args: [] }]);
            if (!playerResult.ok || playerResult.value === null || playerResult.value === undefined) return true;
            playerEntity = playerResult.value;
            if (String(attacker) !== String(playerEntity)) return true;
            itemId = currentCarriedItemId();
        } else return true;
        if (!isFinite(itemId)) return true;
        for (i = 0; i < itemOrder.length; i++) {
            rec = itemRecords[itemOrder[i]];
            if (!rec || rec.id !== itemId || !rec.behavior) continue;
            ownerRec = mods[rec.ownerId];
            if (!ownerRec || (ownerRec.state !== "active" && ownerRec.state !== "enabling")) continue;
            callback = eventName === "useItem" ? rec.behavior.onUse : rec.behavior.onAttack;
            if (typeof callback !== "function") continue;
            if (eventName === "useItem") {
                context = { x: args[0], y: args[1], z: args[2], itemId: itemId, blockId: args[4], side: args[5], itemDamage: args[6], blockDamage: args[7], ownerId: rec.ownerId };
            } else {
                context = { attacker: args[0], victim: args[1], itemId: itemId, ownerId: rec.ownerId };
            }
            result = callAsOwner(rec.ownerId, function () { return callback.call(null, context, apiFor(rec.ownerId)); }, [], "item behavior:" + eventName + ":" + itemId);
            if (result === false) allowed = false;
        }
        return allowed;
    }

    function fire(eventName, args) {
        var list = eventListeners[eventName] || [];
        list = list.slice(0);
        var i, result, allowed = true;
        for (i = 0; i < list.length; i++) {
            if (list[i].active !== true) continue;
            result = callAsOwner(list[i].ownerId, list[i].fn, args || [], eventName);
            if (result === false) allowed = false;
        }
        if ((eventName === "useItem" || eventName === "attack") && dispatchItemBehaviors(eventName, args || []) === false) allowed = false;
        return allowed;
    }

    function addListener(eventName, fn, ownerId) {
        eventName = trim(eventName);
        if (!eventName || typeof fn !== "function") return null;
        if (currentOwner && ownerId && currentOwner !== ownerId) {
            log("WARN", "Events.on rechazado: un mod no puede registrar listeners a nombre de otro propietario.");
            return null;
        }
        ownerId = currentOwner || ownerId || null;
        if (ownerId && !mods[ownerId]) {
            log("WARN", "Suscripción rechazada; mod no registrado: " + ownerId);
            return null;
        }
        if (!eventListeners[eventName]) eventListeners[eventName] = [];
        var token = "evt_" + listenerSequence++;
        eventListeners[eventName].push({ token: token, ownerId: ownerId, fn: fn, active: true });
        return token;
    }

    function removeListener(tokenOrName, fn, ownerId) {
        var name, list, i, changed = false;
        var requiredOwner = currentOwner || ownerId || null;
        if (!tokenOrName) return false;
        if (currentOwner && ownerId && currentOwner !== ownerId) {
            log("WARN", "Events.off rechazado: un mod no puede retirar listeners de otro mod.");
            return false;
        }
        for (name in eventListeners) {
            if (!own(eventListeners, name)) continue;
            list = eventListeners[name];
            for (i = list.length - 1; i >= 0; i--) {
                var matches = list[i].token === tokenOrName ||
                    (name === tokenOrName && (!fn || list[i].fn === fn));
                if (!matches) continue;
                if (requiredOwner && list[i].ownerId !== requiredOwner) continue;
                list.splice(i, 1);
                changed = true;
            }
            if (list.length === 0) delete eventListeners[name];
        }
        return changed;
    }

    function ownerResourceBucket(ownerId) {
        var id = ownerId || currentOwner || "_global";
        if (!resourceDeclarations[id]) resourceDeclarations[id] = {};
        return resourceDeclarations[id];
    }

    function resolveGlobalPath(path) {
        var root = (function () { return this; }());
        var parts = String(path || "").split("."), value = root, parent = null, i;
        if (parts[0] === "global") parts.shift();
        if (!parts.length) return { value: root, parent: null, key: null };
        for (i = 0; i < parts.length; i++) {
            if (value === null || value === undefined) return { value: null, parent: parent, key: parts[i] };
            parent = value;
            value = value[parts[i]];
        }
        return { value: value, parent: parent, key: parts[parts.length - 1] };
    }

    function callNativeVariants(variants) {
        var i, entry, resolved, lastError = null, result;
        for (i = 0; i < variants.length; i++) {
            entry = variants[i];
            resolved = resolveGlobalPath(entry.path);
            if (!resolved || typeof resolved.value !== "function") continue;
            try {
                result = resolved.value.apply(resolved.parent, entry.args || []);
                if (result === false) {
                    lastError = new Error(entry.path + " devolvió false");
                    continue;
                }
                return { ok: true, path: entry.path, value: result, error: null, variantIndex: i, argumentCount: (entry.args || []).length };
            } catch (e) {
                lastError = e;
            }
        }
        return { ok: false, path: null, value: null, error: lastError ? String(lastError) : "Ninguna variante nativa está disponible" };
    }



    /* Puentes ES5 para APIs nativas opcionales. "ok" significa llamada solicitada, no verificación en juego. */
    function nativeApiResult(paths, args, feature) {
        var variants = [], i, result;
        if (typeof paths === "string") paths = [paths];
        for (i = 0; i < paths.length; i++) variants.push({ path: paths[i], args: args || [] });
        result = callNativeVariants(variants);
        return {
            ok: result.ok,
            state: result.ok ? "native-call-requested" : "unsupported-or-failed",
            feature: feature || "native-operation",
            method: result.path,
            value: result.value,
            error: result.error,
            verifiedInGame: false
        };
    }

    function nativeApiRead(paths, args) {
        var variants = [], i, result;
        if (typeof paths === "string") paths = [paths];
        for (i = 0; i < paths.length; i++) variants.push({ path: paths[i], args: args || [] });
        result = callNativeVariants(variants);
        if (!result.ok || result.value === undefined) return null;
        return result.value;
    }

    function nativeApiReadVariants(variants) {
        var result = callNativeVariants(variants || []);
        if (!result.ok || result.value === undefined) return null;
        return result.value;
    }

    function playerEntity() {
        return nativeApiRead(["Player.getEntity", "getPlayerEnt"], []);
    }

    function copyItemRecord(rec) {
        var out = {}, key;
        if (!rec) return null;
        for (key in rec) if (own(rec, key) && key !== "behavior") out[key] = rec[key];
        out.hasOnUse = !!(rec.behavior && typeof rec.behavior.onUse === "function");
        out.hasOnAttack = !!(rec.behavior && typeof rec.behavior.onAttack === "function");
        if (rec.properties) {
            out.properties = {};
            for (key in rec.properties) if (own(rec.properties, key)) out.properties[key] = rec.properties[key];
        }
        return out;
    }

    function isArray(value) {
        return Object.prototype.toString.call(value) === "[object Array]";
    }

    function integerInRange(value, min, max) {
        var n = Number(value);
        return isFinite(n) && Math.floor(n) === n && n >= min && n <= max;
    }

    function reportModApiError(ownerId, message) {
        message = String(message);
        if (ownerId && mods[ownerId]) {
            mods[ownerId].errors++;
            mods[ownerId].lastError = message;
        }
        log("ERROR", (ownerId ? "[mod " + ownerId + "] " : "") + message);
    }

    function itemApiFailure(state, message, item) {
        reportModApiError(currentOwner, "Nexus.Items: " + message);
        var result = { ok: false, state: state || "rejected", error: String(message) };
        if (item) result.item = copyItemRecord(item);
        return result;
    }

    function itemOwnerIsValid() {
        if (currentOwner && mods[currentOwner]) return true;
        log("WARN", "Nexus.Items solo puede operar desde el ciclo de un mod Nexus registrado.");
        return false;
    }

    function flagClaimConflict(kind, numericId, requester, label) {
        var key = lower(trim(kind)) + ":" + parseInt(numericId, 10), claim = idClaims[key];
        if (!claim || claim.ownerId === requester) return false;
        claim.conflict = true;
        claim.conflictWith = requester;
        claim.conflictLabel = String(label || "");
        return true;
    }

    function itemPropertyCall(paths, args) {
        var variants = [], i;
        for (i = 0; i < paths.length; i++) variants.push({ path: paths[i], args: args });
        var result = callNativeVariants(variants);
        return { applied: result.ok, state: result.ok ? "requested-not-verified" : "unsupported-or-failed", method: result.path, error: result.error };
    }

    function applyItemProperties(rec, properties) {
        var out = {}, categoryMap = { internal: -1, material: 1, tool: 2, food: 4, decoration: 8 };
        var categoryValue, categoryName, result;
        properties = properties || {};
        if (own(properties, "maxDamage")) {
            if (!integerInRange(properties.maxDamage, 1, 32767)) {
                out.maxDamage = { applied: false, state: "invalid-value" };
            } else {
                out.maxDamage = itemPropertyCall(["Item.setMaxDamage"], [rec.id, Number(properties.maxDamage)]);
            }
        }
        if (own(properties, "category")) {
            categoryName = lower(trim(properties.category));
            if (integerInRange(properties.category, -1, 32767)) categoryValue = Number(properties.category);
            else if (own(categoryMap, categoryName)) categoryValue = categoryMap[categoryName];
            else categoryValue = null;
            if (categoryValue === null) out.category = { applied: false, state: "invalid-value" };
            else out.category = itemPropertyCall(["Item.setItemCategory", "Item.setCategory"], [rec.id, categoryValue]);
        }
        if (own(properties, "handEquipped")) {
            if (typeof properties.handEquipped !== "boolean") out.handEquipped = { applied: false, state: "invalid-value" };
            else out.handEquipped = itemPropertyCall(["Item.setHandEquipped"], [rec.id, properties.handEquipped]);
        }
        if (own(properties, "allowOffhand")) {
            if (typeof properties.allowOffhand !== "boolean") out.allowOffhand = { applied: false, state: "invalid-value" };
            else out.allowOffhand = itemPropertyCall(["Item.setAllowOffhand"], [rec.id, properties.allowOffhand]);
        }
        if (own(properties, "stackedByData")) {
            if (typeof properties.stackedByData !== "boolean") out.stackedByData = { applied: false, state: "invalid-value" };
            else out.stackedByData = itemPropertyCall(["Item.setStackedByData"], [rec.id, properties.stackedByData]);
        }
        if (own(properties, "useAnimation")) {
            if (!integerInRange(properties.useAnimation, 0, 32)) out.useAnimation = { applied: false, state: "invalid-value" };
            else out.useAnimation = itemPropertyCall(["Item.setUseAnimation"], [rec.id, Number(properties.useAnimation)]);
        }
        for (result in out) if (own(out, result) && !out[result].applied) log("WARN", "Ítem " + rec.id + ": propiedad " + result + " no aplicada (" + out[result].state + ").");
        return out;
    }

    function createNexusItem(definition, foodMode) {
        var id, name, texture, textureData, maxStack, ownerId, existingClaims, i, nativeCall, rec, halfHearts;
        if (!itemOwnerIsValid()) return { ok: false, state: "rejected", error: "No hay un mod propietario activo" };
        if (!definition || typeof definition !== "object") return itemApiFailure("rejected", "La definición debe ser un objeto");
        if (definition.onUse !== undefined && typeof definition.onUse !== "function") return itemApiFailure("rejected", "onUse debe ser una función");
        if (definition.onAttack !== undefined && typeof definition.onAttack !== "function") return itemApiFailure("rejected", "onAttack debe ser una función");
        id = Number(definition.id);
        name = trim(definition.name);
        texture = trim(definition.texture || definition.icon);
        textureData = definition.textureData === undefined ? 0 : Number(definition.textureData);
        maxStack = definition.maxStack === undefined ? (foodMode ? 64 : 64) : Number(definition.maxStack);
        ownerId = currentOwner;
        if (!integerInRange(id, 256, 32767)) return itemApiFailure("rejected", "El ID debe ser un entero entre 256 y 32767");
        if (!name || name.length > 80) return itemApiFailure("rejected", "name es obligatorio y admite hasta 80 caracteres");
        if (!/^[A-Za-z0-9_./-]{1,80}$/.test(texture) || texture.indexOf("..") !== -1) return itemApiFailure("rejected", "texture debe ser un nombre de textura nativo válido; no una ruta arbitraria");
        if (!integerInRange(textureData, 0, 255)) return itemApiFailure("rejected", "textureData debe ser un entero entre 0 y 255");
        if (!integerInRange(maxStack, 1, 64)) return itemApiFailure("rejected", "maxStack debe estar entre 1 y 64");
        if (foodMode) {
            halfHearts = Number(definition.halfHearts === undefined ? definition.heal : definition.halfHearts);
            if (!integerInRange(halfHearts, 0, 40)) return itemApiFailure("rejected", "halfHearts debe ser un entero entre 0 y 40");
        }
        if (itemRecords[String(id)]) {
            flagClaimConflict("item", id, ownerId, name);
            return itemApiFailure("conflict", "El ID ya está registrado por Nexus (propietario: " + itemRecords[String(id)].ownerId + ")", itemRecords[String(id)]);
        }
        existingClaims = publicApi.Registry.list();
        for (i = 0; i < existingClaims.length; i++) {
            if (existingClaims[i].kind === "item" && existingClaims[i].id === id) {
                flagClaimConflict("item", id, ownerId, name);
                return itemApiFailure("conflict", "El ID está reclamado en Registry por " + existingClaims[i].ownerId);
            }
        }
        if (!publicApi.Registry.claim("item", id, name)) return itemApiFailure("conflict", "Registry rechazó el ID");

        if (foodMode) {
            nativeCall = callNativeVariants([
                { path: "ModPE.setFoodItem", args: [id, texture, textureData, halfHearts, name, maxStack] },
                { path: "ModPE.setFoodItem", args: [id, texture, textureData, halfHearts, name] }
            ]);
        } else {
            nativeCall = callNativeVariants([
                { path: "ModPE.setItem", args: [id, texture, textureData, name, maxStack] },
                { path: "ModPE.setItem", args: [id, texture, textureData, name] }
            ]);
        }
        if (!nativeCall.ok) {
            publicApi.Registry.release("item", id);
            return itemApiFailure("unsupported-or-failed", "No se pudo solicitar la creación del ID " + id + ": " + nativeCall.error);
        }
        rec = {
            id: id,
            name: name,
            texture: texture,
            textureData: textureData,
            maxStack: maxStack,
            type: foodMode ? "food" : "item",
            halfHearts: foodMode ? halfHearts : null,
            ownerId: ownerId,
            nativeMethod: nativeCall.path,
            nativeArgumentCount: nativeCall.argumentCount,
            nativeFallbackUsed: nativeCall.variantIndex > 0,
            maxStackState: nativeCall.variantIndex === 0 ? "requested-not-verified" : "not-passed-in-fallback-signature",
            state: "native-call-requested",
            verifiedInGame: false,
            behavior: {
                onUse: typeof definition.onUse === "function" ? definition.onUse : null,
                onAttack: typeof definition.onAttack === "function" ? definition.onAttack : null
            },
            properties: {},
            createdAt: timestamp()
        };
        itemRecords[String(id)] = rec;
        itemOrder.push(String(id));
        rec.properties = applyItemProperties(rec, definition.properties || definition);
        log("INFO", "Items: solicitud nativa enviada para ID " + id + " (" + name + "); falta verificarla dentro del juego.");
        return { ok: true, state: rec.state, verifiedInGame: false, method: nativeCall.path, item: copyItemRecord(rec) };
    }

    function normalizeRecipeInputs(ingredients) {
        var out = [], i, entry, id, count, damage;
        if (!(isArray(ingredients)) || !ingredients.length) return null;
        if (typeof ingredients[0] === "number" || typeof ingredients[0] === "string") {
            if (ingredients.length % 3 !== 0) return null;
            for (i = 0; i < ingredients.length; i++) {
                if (!integerInRange(ingredients[i], 0, 32767)) return null;
                out.push(Number(ingredients[i]));
            }
            return out;
        }
        for (i = 0; i < ingredients.length; i++) {
            entry = ingredients[i];
            if (!entry || typeof entry !== "object") return null;
            id = Number(entry.id); count = Number(entry.count); damage = Number(entry.damage || 0);
            if (!integerInRange(id, 0, 32767) || !integerInRange(count, 1, 64) || !integerInRange(damage, 0, 32767)) return null;
            out.push(id, count, damage);
        }
        return out.length ? out : null;
    }

    function validateModDefinition(definition) {
        var errors = [], warnings = [], key, eventCount = 0;
        var normalizedId;
        if (!definition || typeof definition !== "object" || isArray(definition)) {
            return { valid: false, errors: ["La definición debe ser un objeto"], warnings: [] };
        }
        normalizedId = normalizeModId(definition.id);
        if (!normalizedId) errors.push("id ausente o inválido (debe ser un entero positivo; se acepta como número o texto numérico)");
        if (definition.name !== undefined && (typeof definition.name !== "string" || trim(definition.name).length > 80)) errors.push("name debe ser texto de hasta 80 caracteres");
        if (definition.version !== undefined && (typeof definition.version !== "string" || trim(definition.version).length > 32)) errors.push("version debe ser texto de hasta 32 caracteres");
        if (definition.description !== undefined && (typeof definition.description !== "string" || definition.description.length > 500)) errors.push("description debe ser texto de hasta 500 caracteres");
        if (definition.author !== undefined && (typeof definition.author !== "string" || definition.author.length > 80)) errors.push("author debe ser texto de hasta 80 caracteres");
        ["onLoad", "onEnable", "onDisable"].forEach(function (keyName) {
            if (definition[keyName] !== undefined && typeof definition[keyName] !== "function") errors.push(keyName + " debe ser una función");
        });
        if (definition.events !== undefined) {
            if (!definition.events || typeof definition.events !== "object" || isArray(definition.events)) errors.push("events debe ser un objeto con callbacks");
            else {
                for (key in definition.events) if (own(definition.events, key)) {
                    eventCount++;
                    if (!/^[A-Za-z][A-Za-z0-9._-]{0,63}$/.test(key)) errors.push("nombre de evento inválido: " + key);
                    if (typeof definition.events[key] !== "function") errors.push("el callback del evento '" + key + "' no es una función");
                }
            }
        }
        if (eventCount > 100) errors.push("events supera el límite defensivo de 100 callbacks");
        if (normalizedId && mods[normalizedId]) errors.push("ID de mod duplicada: " + normalizedId);
        return { valid: errors.length === 0, errors: errors, warnings: warnings, id: normalizedId, eventCount: eventCount };
    }

    var publicApi = {
        version: VERSION,
        name: "Nexus",
        status: "stopped",
        rootPath: rootPath,
        tick: 0,

        Logger: {
            info: function (message) { log("INFO", message); },
            warn: function (message) { log("WARN", message); },
            error: function (message) { log("ERROR", message); },
            flush: function () { return flushLogs(); },
            message: function (message) { nativeMessage(message); }
        },

        Events: {
            on: function (eventName, fn, ownerId) { return addListener(eventName, fn, ownerId); },
            off: function (tokenOrName, fn, ownerId) { return removeListener(tokenOrName, fn, ownerId); },
            once: function (eventName, fn, ownerId) {
                if (typeof fn !== "function") return null;
                var token = null;
                var wrapper = function () {
                    if (token) publicApi.Events.off(token);
                    return fn.apply(null, arguments);
                };
                token = addListener(eventName, wrapper, ownerId || currentOwner);
                return token;
            },
            offOwner: function (ownerId) {
                if (currentOwner && currentOwner !== ownerId) return false;
                removeOwnedListeners(ownerId);
                return true;
            },
            emit: function (eventName, args) { return fire(eventName, args || []); },
            count: function (eventName, ownerId) {
                var list = eventListeners[eventName] || [], count = 0, i;
                if (!ownerId) return list.length;
                for (i = 0; i < list.length; i++) if (list[i].ownerId === ownerId) count++;
                return count;
            },
            names: function () {
                var out = [], key;
                for (key in eventListeners) if (own(eventListeners, key)) out.push(key);
                return out;
            }
        },

        Scheduler: {
            after: function (ticks, fn) {
                ticks = Math.max(1, parseInt(ticks, 10) || 1);
                if (typeof fn !== "function") return null;
                var id = "task_" + taskSequence++;
                tasks.push({ id: id, ownerId: currentOwner || null, due: tickCount + ticks, interval: 0, fn: fn, failures: 0 });
                return id;
            },
            nextTick: function (fn) { return publicApi.Scheduler.after(1, fn); },
            every: function (interval, fn) {
                interval = Math.max(1, parseInt(interval, 10) || 1);
                if (typeof fn !== "function") return null;
                var id = "task_" + taskSequence++;
                tasks.push({ id: id, ownerId: currentOwner || null, due: tickCount + interval, interval: interval, fn: fn, failures: 0 });
                return id;
            },
            cancel: function (id) {
                var i;
                for (i = tasks.length - 1; i >= 0; i--) {
                    if (tasks[i].id === id) {
                        if (currentOwner && tasks[i].ownerId !== currentOwner) {
                            log("WARN", "Scheduler.cancel rechazado: un mod no puede cancelar tareas de otro propietario.");
                            return false;
                        }
                        tasks.splice(i, 1);
                        return true;
                    }
                }
                return false;
            },
            tick: function () {
                var snapshot = tasks.slice(0);
                var i, task, stillExists, j, errorsBefore, callbackFailed;
                for (i = 0; i < snapshot.length; i++) {
                    task = snapshot[i];
                    if (task.due > tickCount) continue;
                    stillExists = false;
                    for (j = 0; j < tasks.length; j++) if (tasks[j].id === task.id) stillExists = true;
                    if (!stillExists) continue;
                    errorsBefore = callbackErrorSequence;
                    callAsOwner(task.ownerId, task.fn, [tickCount], "scheduled task");
                    callbackFailed = callbackErrorSequence !== errorsBefore;
                    for (j = tasks.length - 1; j >= 0; j--) {
                        if (tasks[j].id === task.id) {
                            if (task.interval > 0) {
                                if (callbackFailed) tasks[j].failures = (tasks[j].failures || 0) + 1;
                                else tasks[j].failures = 0;
                                if (tasks[j].failures >= 3) {
                                    log("ERROR", "Tarea repetitiva " + task.id + " cancelada tras 3 fallos consecutivos.");
                                    tasks.splice(j, 1);
                                } else tasks[j].due = tickCount + task.interval;
                            } else tasks.splice(j, 1);
                            break;
                        }
                    }
                }
            },
            cancelOwner: function (ownerId) {
                if (currentOwner && currentOwner !== ownerId) return false;
                removeOwnedTasks(ownerId);
                return true;
            },
            count: function (ownerId) {
                var count = 0, i;
                if (!ownerId) return tasks.length;
                for (i = 0; i < tasks.length; i++) if (tasks[i].ownerId === ownerId) count++;
                return count;
            },
            list: function (ownerId) {
                var out = [], i;
                for (i = 0; i < tasks.length; i++) {
                    if (!ownerId || tasks[i].ownerId === ownerId) out.push({ id: tasks[i].id, ownerId: tasks[i].ownerId, due: tasks[i].due, interval: tasks[i].interval });
                }
                return out;
            }
        },

        Mods: {
            validate: function (definition) { return validateModDefinition(definition); },
            register: function (definition) { return publicApi.registerMod(definition); },
            get: function (id) { id = normalizeModId(id); return id ? (mods[id] || null) : null; },
            list: function () {
                var out = [], i, rec;
                for (i = 0; i < modOrder.length; i++) {
                    rec = mods[modOrder[i]];
                    if (rec) out.push({ id: rec.id, name: rec.name, version: rec.version, description: rec.description, author: rec.author, state: rec.state, errors: rec.errors, lastError: rec.lastError, validationWarnings: rec.validationWarnings.slice(0), file: rec.sourceFile });
                }
                return out;
            },
            enable: function (id) { return enableMod(id); },
            disable: function (id) { return disableMod(id); },
            enableAll: function () {
                var i, result = true;
                for (i = 0; i < modOrder.length; i++) if (!enableMod(modOrder[i])) result = false;
                return result;
            },
            disableAll: function () {
                var i, result = true, rec;
                for (i = modOrder.length - 1; i >= 0; i--) {
                    rec = mods[modOrder[i]];
                    if (!rec || rec.state === "registered" || rec.state === "disabled") continue;
                    if (!disableMod(modOrder[i])) result = false;
                }
                return result;
            }
        },

        Commands: {
            register: function (name, handler, description) {
                name = lower(trim(name)).replace(/^\/+/, "");
                if (!/^[a-z0-9._-]{1,40}$/.test(name) || typeof handler !== "function") return false;
                if (name === "nexus") return false;
                if (own(commands, name)) {
                    reportModApiError(currentOwner, "Conflicto de comando /" + name + ": ya está registrado por " + (commands[name].ownerId || "motor") + "; registro rechazado.");
                    return false;
                }
                commands[name] = { name: name, handler: handler, description: description || "", ownerId: currentOwner || null };
                return true;
            },
            unregister: function (name) {
                name = lower(trim(name)).replace(/^\/+/, "");
                if (!commands[name]) return false;
                if (currentOwner && commands[name].ownerId !== currentOwner) return false;
                delete commands[name];
                return true;
            },
            list: function () {
                var out = [], key;
                for (key in commands) if (own(commands, key)) out.push({ name: key, description: commands[key].description, ownerId: commands[key].ownerId });
                return out;
            }
        },

        Compat: {
            detect: function () {
                var caps = {}, details = {}, names = [
                    "Player.getEntity", "Player.getX", "Player.getY", "Player.getZ", "Player.getCarriedItem",
                    "Player.addItemInventory", "Player.addItemCreativeInv", "Player.setHealth", "getPlayerEnt", "getCarriedItem", "addItemInventory",
                    "Entity.getX", "Entity.getY", "Entity.getZ", "Entity.setHealth", "Entity.setFireTicks", "Level.getTile", "Level.setTile",
                    "Level.addParticle", "Level.explode", "Level.spawnMob", "explode", "ModPE.setItem", "ModPE.setFoodItem", "ModPE.overrideTexture",
                    "ModPE.readData", "ModPE.saveData", "Item.addCraftRecipe", "Item.addShapedRecipe",
                    "Item.addFurnaceRecipe", "Item.setMaxDamage", "Item.setItemCategory", "Item.setCategory", "Item.setHandEquipped", "Item.setAllowOffhand",
                    "preventDefault", "clientMessage", "java.io.File"
                ];
                var i, resolved;
                for (i = 0; i < names.length; i++) {
                    resolved = resolveGlobalPath(names[i]);
                    caps[names[i]] = resolved.value !== null && resolved.value !== undefined;
                    details[names[i]] = {
                        present: caps[names[i]],
                        callable: typeof resolved.value === "function",
                        state: caps[names[i]] ? "detected-not-tested" : "missing",
                        verified: false
                    };
                }
                return {
                    runtime: canUseJavaFiles() ? "Rhino/Java interop detectable" : "Java interop unavailable in this context",
                    capabilities: caps,
                    details: details,
                    verifiedInTargetGame: false,
                    note: "Detectada significa que el símbolo existe; no prueba que funcione en MCPE 1.0.9/Toolbox 3.2.29. Solo una prueba real puede marcarla como verificada."
                };
            },
            has: function (path) {
                var resolved = resolveGlobalPath(path);
                return resolved.value !== null && resolved.value !== undefined;
            },
            canCall: function (path) {
                return typeof resolveGlobalPath(path).value === "function";
            },
            invoke: function (path, args) {
                var resolved = resolveGlobalPath(path), value;
                if (typeof resolved.value !== "function") return { ok: false, path: String(path), error: "Función no disponible" };
                try {
                    value = resolved.value.apply(resolved.parent, isArray(args) ? args : []);
                    return { ok: value !== false, path: String(path), value: value, error: value === false ? "La función devolvió false" : null, verifiedInGame: false };
                } catch (e) {
                    log("ERROR", "Compat.invoke " + String(path) + ": " + String(e));
                    return { ok: false, path: String(path), error: String(e), verifiedInGame: false };
                }
            },
            invokeFirst: function (paths, args) {
                var variants = [], i;
                if (!(isArray(paths))) return { ok: false, error: "paths debe ser un array" };
                for (i = 0; i < paths.length; i++) variants.push({ path: String(paths[i]), args: args || [] });
                var result = callNativeVariants(variants);
                result.verifiedInGame = false;
                return result;
            }
        },

        Registry: {
            /* Reserva IDs numéricos entre mods Nexus que usan esta API. No detecta mods externos que no la usen. */
            claim: function (kind, numericId, label) {
                var ownerId = currentOwner;
                kind = lower(trim(kind));
                var rawId = trim(numericId);
                if (!ownerId || !mods[ownerId]) {
                    log("WARN", "Registry.claim requiere ejecutarse desde un callback de un mod registrado.");
                    return false;
                }
                if (!/^[a-z][a-z0-9_-]{0,23}$/.test(kind) || !/^\d+$/.test(rawId)) {
                    log("ERROR", ownerId + ": tipo o ID inválido en Registry.claim.");
                    return false;
                }
                var id = parseInt(rawId, 10);
                if (!(id > 0) || !isFinite(id)) {
                    log("ERROR", ownerId + ": el ID numérico debe ser mayor que cero.");
                    return false;
                }
                var key = kind + ":" + id;
                if (idClaims[key] && idClaims[key].ownerId !== ownerId) {
                    idClaims[key].conflict = true;
                    idClaims[key].conflictWith = ownerId;
                    idClaims[key].conflictLabel = String(label || "");
                    reportModApiError(ownerId, "Conflicto Registry " + key + ": ID ya reclamado por " + idClaims[key].ownerId + ".");
                    return false;
                }
                idClaims[key] = { kind: kind, id: id, label: String(label || ""), ownerId: ownerId, conflict: false, conflictWith: null, conflictLabel: "", claimedAt: timestamp() };
                log("INFO", ownerId + " reservó " + key + (label ? " (" + label + ")" : ""));
                return true;
            },
            release: function (kind, numericId) {
                var ownerId = currentOwner;
                var key = lower(trim(kind)) + ":" + parseInt(numericId, 10);
                if (!idClaims[key] || idClaims[key].ownerId !== ownerId) return false;
                delete idClaims[key];
                return true;
            },
            list: function (ownerId) {
                var out = [], key, rec;
                for (key in idClaims) {
                    if (!own(idClaims, key)) continue;
                    rec = idClaims[key];
                    if (!ownerId || rec.ownerId === ownerId) out.push({ kind: rec.kind, id: rec.id, label: rec.label, ownerId: rec.ownerId, conflict: rec.conflict, conflictWith: rec.conflictWith || null, conflictLabel: rec.conflictLabel || "", claimedAt: rec.claimedAt });
                }
                return out;
            },
            find: function (kind, numericId) {
                var key = lower(trim(kind)) + ":" + parseInt(numericId, 10), rec = idClaims[key];
                if (!rec) return null;
                return { kind: rec.kind, id: rec.id, label: rec.label, ownerId: rec.ownerId, conflict: rec.conflict, conflictWith: rec.conflictWith || null, claimedAt: rec.claimedAt };
            },
            isClaimed: function (kind, numericId, exceptOwner) {
                var rec = publicApi.Registry.find(kind, numericId);
                return !!(rec && (!exceptOwner || rec.ownerId !== exceptOwner));
            },
            count: function () {
                var count = 0, key;
                for (key in idClaims) if (own(idClaims, key)) count++;
                return count;
            }
        },

        /* APIs puente: las llamadas nativas nunca se etiquetan como verificadas automáticamente. */
        Player: {
            getEntity: function () { return playerEntity(); },
            getPosition: function () {
                var e = playerEntity();
                var args = e === null || e === undefined ? [] : [e];
                var x = nativeApiReadVariants([{ path: "Player.getX", args: [] }, { path: "getPlayerX", args: [] }, { path: "Entity.getX", args: args }]);
                var y = nativeApiReadVariants([{ path: "Player.getY", args: [] }, { path: "getPlayerY", args: [] }, { path: "Entity.getY", args: args }]);
                var z = nativeApiReadVariants([{ path: "Player.getZ", args: [] }, { path: "getPlayerZ", args: [] }, { path: "Entity.getZ", args: args }]);
                if (x === null || y === null || z === null) return null;
                return { x: Number(x), y: Number(y), z: Number(z) };
            },
            getRotation: function () {
                var e = playerEntity(), args = e === null || e === undefined ? [] : [e];
                var yaw = nativeApiReadVariants([{ path: "Player.getYaw", args: [] }, { path: "getYaw", args: [] }, { path: "getYaw", args: args }, { path: "Entity.getYaw", args: args }]);
                var pitch = nativeApiReadVariants([{ path: "Player.getPitch", args: [] }, { path: "getPitch", args: [] }, { path: "getPitch", args: args }, { path: "Entity.getPitch", args: args }]);
                if (yaw === null && pitch === null) return null;
                return { yaw: yaw === null ? null : Number(yaw), pitch: pitch === null ? null : Number(pitch) };
            },
            getHeldItem: function () {
                var id = nativeApiRead(["Player.getCarriedItem", "getCarriedItem"], []);
                var count = nativeApiRead(["Player.getCarriedItemCount"], []);
                var damage = nativeApiRead(["Player.getCarriedItemData"], []);
                if (id === null) return null;
                return { id: Number(id), count: count === null ? null : Number(count), damage: damage === null ? 0 : Number(damage) };
            },
            getHealth: function () {
                var e = playerEntity();
                var h = nativeApiRead(["Player.getHealth"], []);
                if (h === null && e !== null && e !== undefined) h = nativeApiRead(["Entity.getHealth"], [e]);
                return h === null ? null : Number(h);
            },
            setHealth: function (health) {
                var e = playerEntity(); health = Number(health);
                if (!integerInRange(health, 0, 32767)) return { ok: false, state: "rejected", error: "health debe ser un entero entre 0 y 32767 (medido en half-hearts por algunas builds)", verifiedInGame: false };
                if (e !== null && e !== undefined) {
                    var r = nativeApiResult(["Entity.setHealth"], [e, health], "player-health");
                    if (r.ok) return r;
                }
                return nativeApiResult(["Player.setHealth"], [health], "player-health");
            },
            getArmor: function () {
                var out = [], i, value;
                for (i = 0; i < 4; i++) {
                    value = nativeApiRead(["Player.getArmorSlot"], [i]);
                    out.push(value === null ? null : Number(value));
                }
                return out;
            },
            getInventorySlot: function (slot) {
                slot = Number(slot);
                if (!integerInRange(slot, 0, 255)) return null;
                var id = nativeApiRead(["Player.getInventorySlot"], [slot]);
                if (id === null) return null;
                var count = nativeApiRead(["Player.getInventorySlotCount"], [slot]);
                var damage = nativeApiRead(["Player.getInventorySlotData"], [slot]);
                return { id: Number(id), count: count === null ? null : Number(count), damage: damage === null ? null : Number(damage) };
            },
            giveItem: function (id, count, damage) { return publicApi.Items.give(id, count, damage); },
            getGameMode: function () { return nativeApiRead(["Level.getGameMode", "getGameMode", "Player.getGameMode"], []); },
            status: function () {
                var playerEntityAvailable = typeof resolveGlobalPath("Player.getEntity").value === "function" || typeof resolveGlobalPath("getPlayerEnt").value === "function";
                var playerCoordinates = typeof resolveGlobalPath("Player.getX").value === "function" && typeof resolveGlobalPath("Player.getY").value === "function" && typeof resolveGlobalPath("Player.getZ").value === "function";
                playerCoordinates = playerCoordinates || (typeof resolveGlobalPath("getPlayerX").value === "function" && typeof resolveGlobalPath("getPlayerY").value === "function" && typeof resolveGlobalPath("getPlayerZ").value === "function");
                var entityCoordinates = playerEntityAvailable && typeof resolveGlobalPath("Entity.getX").value === "function" && typeof resolveGlobalPath("Entity.getY").value === "function" && typeof resolveGlobalPath("Entity.getZ").value === "function";
                var rotationAvailable = (typeof resolveGlobalPath("Player.getYaw").value === "function" && typeof resolveGlobalPath("Player.getPitch").value === "function") || (typeof resolveGlobalPath("getYaw").value === "function" && typeof resolveGlobalPath("getPitch").value === "function") || (playerEntityAvailable && typeof resolveGlobalPath("Entity.getYaw").value === "function" && typeof resolveGlobalPath("Entity.getPitch").value === "function");
                return {
                    entity: playerEntityAvailable,
                    position: playerCoordinates || entityCoordinates,
                    rotation: rotationAvailable,
                    health: typeof resolveGlobalPath("Player.getHealth").value === "function" || typeof resolveGlobalPath("Entity.getHealth").value === "function",
                    verifiedInGame: false
                };
            }
        },

        World: {
            getBlock: function (x, y, z) {
                x = Math.floor(Number(x)); y = Math.floor(Number(y)); z = Math.floor(Number(z));
                if (!isFinite(x) || !isFinite(y) || !isFinite(z)) return null;
                var id = nativeApiRead(["Level.getTile", "getTile"], [x, y, z]);
                if (id === null) return null;
                var data = nativeApiRead(["Level.getData"], [x, y, z]);
                return { x: x, y: y, z: z, id: Number(id), data: data === null ? 0 : Number(data) };
            },
            setBlock: function (x, y, z, id, data) {
                x = Number(x); y = Number(y); z = Number(z); id = Number(id); data = Number(data === undefined ? 0 : data);
                if (![x,y,z,id,data].every(isFinite) || Math.floor(x)!==x || Math.floor(y)!==y || Math.floor(z)!==z || Math.floor(id)!==id || Math.floor(data)!==data || id<0 || id>32767 || data<0 || data>32767) return { ok:false, state:"rejected", error:"coordenadas, ID o data inválidos", verifiedInGame:false };
                var result;
                if (typeof resolveGlobalPath("setTile").value === "function") {
                    result = callNativeVariants([{ path: "setTile", args: [x,y,z,id,data] }]);
                    if (result.ok) return { ok:true, state:"native-call-requested", method:result.path, metadataRequested:true, verifiedInGame:false };
                }
                result = callNativeVariants([{ path: "Level.setTile", args: [x,y,z,id] }]);
                if (!result.ok) return { ok:false, state:"unsupported-or-failed", method:result.path, error:result.error, verifiedInGame:false };
                return { ok:true, state:data===0 ? "native-call-requested" : "partial-native-call-requested", method:result.path, metadataRequested:data===0, metadataApplied:false, note:data===0 ? null : "El backend Level.setTile clásico solo recibe ID; el metadato no se pudo solicitar.", verifiedInGame:false };
            },
            getTime: function () { return nativeApiRead(["Level.getTime"], []); },
            setTime: function (time) { time = Number(time); if (!isFinite(time)) return { ok:false, state:"rejected", error:"time inválido", verifiedInGame:false }; return nativeApiResult(["Level.setTime"], [time], "world-set-time"); },
            getName: function () { return nativeApiRead(["Level.getWorldName", "Level.getWorldDir"], []); },
            playSound: function (x, y, z, sound, volume, pitch) {
                x=Number(x); y=Number(y); z=Number(z); volume=Number(volume===undefined?1:volume); pitch=Number(pitch===undefined?1:pitch);
                if (![x,y,z,volume,pitch].every(isFinite)) return { ok:false, state:"rejected", error:"parámetros de sonido inválidos", verifiedInGame:false };
                return nativeApiResult(["Level.playSound"], [x,y,z,String(sound),volume,pitch], "world-sound");
            },
            dropItem: function (x, y, z, id, count, damage) {
                x=Number(x); y=Number(y); z=Number(z); id=Number(id); count=Number(count===undefined?1:count); damage=Number(damage===undefined?0:damage);
                if (![x,y,z,id,count,damage].every(isFinite) || Math.floor(id)!==id || Math.floor(count)!==count || Math.floor(damage)!==damage || id<1 || id>32767 || count<1 || damage<0) return { ok:false, state:"rejected", error:"parámetros de objeto inválidos", verifiedInGame:false };
                return nativeApiResult(["Level.dropItem"], [x,y,z,0,id,count,damage], "world-drop-item");
            },
            explode: function (x, y, z, power, fire) {
                x=Number(x); y=Number(y); z=Number(z); power=Number(power);
                if (![x,y,z,power].every(isFinite) || power<0) return { ok:false, state:"rejected", error:"coordenadas o potencia inválidas", verifiedInGame:false };
                var result = nativeApiResult(["Level.explode"], [x,y,z,power], "world-explosion");
                result.fireRequested = fire===true;
                result.fireSupported = false;
                if (fire===true) result.note = "La firma clásica Level.explode acepta cuatro argumentos; no se envió un parámetro de fuego.";
                return result;
            },
            status: function () { return { getTile:typeof resolveGlobalPath("Level.getTile").value==="function" || typeof resolveGlobalPath("getTile").value==="function", setTile:typeof resolveGlobalPath("setTile").value==="function" || typeof resolveGlobalPath("Level.setTile").value==="function", verifiedInGame:false }; }
        },

        Entities: {
            list: function () {
                var raw = nativeApiRead(["Entity.getAll", "Level.getEntities"], []), out = [], i;
                if (raw === null) return null;
                try { for (i=0; i<raw.length; i++) out.push(Number(raw[i])); } catch (e) { return null; }
                return out;
            },
            getPosition: function (entity) {
                entity=Number(entity); if (!isFinite(entity)) return null;
                var x=nativeApiRead(["Entity.getX"],[entity]), y=nativeApiRead(["Entity.getY"],[entity]), z=nativeApiRead(["Entity.getZ"],[entity]);
                if (x===null || y===null || z===null) return null;
                return { x:Number(x), y:Number(y), z:Number(z) };
            },
            getHealth: function (entity) { entity=Number(entity); if(!isFinite(entity)) return null; var v=nativeApiRead(["Entity.getHealth"],[entity]); return v===null?null:Number(v); },
            setHealth: function (entity, health) { entity=Number(entity); health=Number(health); if(!isFinite(entity)||!isFinite(health)||health<0) return {ok:false,state:"rejected",error:"entidad o salud inválida",verifiedInGame:false}; return nativeApiResult(["Entity.setHealth"],[entity,health],"entity-health"); },
            spawn: function (x, y, z, typeId, texture) {
                x=Number(x); y=Number(y); z=Number(z); typeId=Number(typeId);
                if (![x,y,z,typeId].every(isFinite) || Math.floor(typeId)!==typeId || typeId<1) return {ok:false,state:"rejected",error:"las coordenadas deben ser finitas y typeId un entero positivo",verifiedInGame:false};
                var result=callNativeVariants([{path:"Level.spawnMob",args:[x,y,z,typeId,texture||""]},{path:"Entity.spawnMob",args:[x,y,z,typeId,texture||""]}]);
                return {ok:result.ok,state:result.ok?"native-call-requested":"unsupported-or-failed",entity:result.ok?result.value:null,method:result.path,error:result.error,verifiedInGame:false};
            },
            setPosition: function (entity, x, y, z) {
                entity=Number(entity); x=Number(x); y=Number(y); z=Number(z);
                if (![entity,x,y,z].every(isFinite)) return {ok:false,state:"rejected",error:"parámetros inválidos",verifiedInGame:false};
                return nativeApiResult(["Entity.setPosition", "setPosition"],[entity,x,y,z],"entity-position");
            },
            setVelocity: function (entity, x, y, z) {
                entity=Number(entity); x=Number(x); y=Number(y); z=Number(z);
                if (![entity,x,y,z].every(isFinite)) return {ok:false,state:"rejected",error:"parámetros inválidos",verifiedInGame:false};
                var axes=[nativeApiResult(["Entity.setVelX", "setVelX"],[entity,x],"entity-velocity-x"),nativeApiResult(["Entity.setVelY", "setVelY"],[entity,y],"entity-velocity-y"),nativeApiResult(["Entity.setVelZ", "setVelZ"],[entity,z],"entity-velocity-z")];
                var good=0, i; for(i=0;i<axes.length;i++) if(axes[i].ok) good++;
                return {ok:good===3,state:good===3?"native-call-requested":(good>0?"partial":"unsupported-or-failed"),axes:axes,verifiedInGame:false};
            },
            remove: function (entity) { entity=Number(entity); if(!isFinite(entity)) return {ok:false,state:"rejected",error:"entidad inválida",verifiedInGame:false}; return nativeApiResult(["Entity.remove"],[entity],"entity-remove"); },
            addEffect: function (entity, effectId, duration, amplifier, ambient, showParticles) {
                entity=Number(entity); effectId=Number(effectId); duration=Number(duration); amplifier=Number(amplifier===undefined?0:amplifier);
                if (![entity,effectId,duration,amplifier].every(isFinite) || !integerInRange(effectId,0,32767) || !integerInRange(duration,0,2147483647) || !integerInRange(amplifier,0,255)) return {ok:false,state:"rejected",error:"entity debe ser finita; effectId, duration y amplifier deben ser enteros dentro de rango",verifiedInGame:false};
                return nativeApiResult(["Entity.addEffect"],[entity,effectId,duration,amplifier,ambient===true,showParticles!==false],"entity-effect");
            },
            status: function () { return {getAll:typeof resolveGlobalPath("Entity.getAll").value==="function"||typeof resolveGlobalPath("Level.getEntities").value==="function",spawn:typeof resolveGlobalPath("Level.spawnMob").value==="function"||typeof resolveGlobalPath("Entity.spawnMob").value==="function",verifiedInGame:false}; }
        },

        Blocks: {
            create: function (definition) {
                var id,name,texture,materialSourceId,opaque,renderType,result;
                if (!definition || typeof definition!=="object") return {ok:false,state:"rejected",error:"definition debe ser un objeto",verifiedInGame:false};
                id=Number(definition.id); name=trim(definition.name); texture=definition.texture===undefined?"stone":definition.texture;
                materialSourceId=Number(definition.materialSourceId===undefined?1:definition.materialSourceId);
                opaque=definition.opaque===undefined?true:definition.opaque; renderType=Number(definition.renderType===undefined?0:definition.renderType);
                var destroyTime=definition.destroyTime===undefined?null:Number(definition.destroyTime), resistance=definition.explosionResistance===undefined?null:Number(definition.explosionResistance);
                if (!integerInRange(id,1,255)||!name||!(typeof texture==="string"||isArray(texture))||!integerInRange(materialSourceId,0,255)||typeof opaque!=="boolean"||!integerInRange(renderType,0,255)||(destroyTime!==null&&(!isFinite(destroyTime)||destroyTime<0))||(resistance!==null&&(!isFinite(resistance)||resistance<0))) return {ok:false,state:"rejected",error:"ID 1-255, name, texture, materialSourceId 0-255, opaque boolean, renderType 0-255, destroyTime >=0 y explosionResistance >=0 deben ser válidos",verifiedInGame:false};
                if (!publicApi.Registry.claim("block",id,name)) return {ok:false,state:"conflict",error:"Registry rechazó el ID de bloque",verifiedInGame:false};
                result=callNativeVariants([{path:"Block.defineBlock",args:[id,name,texture,materialSourceId,opaque,renderType]}]);
                if (!result.ok) { publicApi.Registry.release("block",id); return {ok:false,state:"unsupported-or-failed",error:result.error,verifiedInGame:false}; }
                var settings=[];
                if (destroyTime!==null) settings.push(nativeApiResult(["Block.setDestroyTime"],[id,destroyTime],"block-destroy-time"));
                if (resistance!==null) settings.push(nativeApiResult(["Block.setExplosionResistance"],[id,resistance],"block-resistance"));
                return {ok:true,state:"native-call-requested",id:id,method:result.path,settings:settings,verifiedInGame:false};
            },
            setDestroyTime: function (id,time) { id=Number(id); time=Number(time); if(!integerInRange(id,1,255)||!isFinite(time)||time<0) return {ok:false,state:"rejected",error:"ID o tiempo inválidos",verifiedInGame:false}; return nativeApiResult(["Block.setDestroyTime"],[id,time],"block-destroy-time"); },
            setResistance: function (id,value) { id=Number(id); value=Number(value); if(!integerInRange(id,1,255)||!isFinite(value)||value<0) return {ok:false,state:"rejected",error:"ID o resistencia inválidos",verifiedInGame:false}; return nativeApiResult(["Block.setExplosionResistance"],[id,value],"block-resistance"); },
            status: function () { return {defineBlock:typeof resolveGlobalPath("Block.defineBlock").value==="function",verifiedInGame:false}; }
        },

        Effects: {
            particle: function (type,x,y,z,vx,vy,vz,size) {
                var t=type;
                if (typeof type==="string") {
                    var named=resolveGlobalPath("ParticleType."+type).value;
                    if(named!==null && named!==undefined) t=named;
                    else if (/^\d+$/.test(trim(type))) t=Number(type);
                    else return {ok:false,state:"rejected",error:"Usa un ID numérico o un nombre existente en ParticleType",verifiedInGame:false};
                }
                x=Number(x); y=Number(y); z=Number(z); vx=Number(vx===undefined?0:vx); vy=Number(vy===undefined?0:vy); vz=Number(vz===undefined?0:vz); size=Number(size===undefined?0:size);
                if (!integerInRange(t,0,32767)||![x,y,z,vx,vy,vz,size].every(isFinite)) return {ok:false,state:"rejected",error:"el tipo de partícula debe ser un entero 0-32767 y las coordenadas/velocidades finitas",verifiedInGame:false};
                t=Number(t);
                return nativeApiResult(["Level.addParticle"],[t,x,y,z,vx,vy,vz,size],"particle");
            },
            sound: function (name,x,y,z,volume,pitch) { return publicApi.World.playSound(x,y,z,name,volume,pitch); },
            explode: function (x,y,z,power,fire) { return publicApi.World.explode(x,y,z,power,fire); },
            addToEntity: function (entity,effectId,duration,amplifier,ambient,showParticles) { return publicApi.Entities.addEffect(entity,effectId,duration,amplifier,ambient,showParticles); },
            removeFromEntity: function (entity,effectId) { entity=Number(entity); effectId=Number(effectId); if(!isFinite(entity)||!isFinite(effectId)) return {ok:false,state:"rejected",error:"entidad o efecto inválidos",verifiedInGame:false}; return nativeApiResult(["Entity.removeEffect"],[entity,effectId],"entity-remove-effect"); },
            status: function () { return {particles:typeof resolveGlobalPath("Level.addParticle").value==="function",sounds:typeof resolveGlobalPath("Level.playSound").value==="function",verifiedInGame:false}; }
        },

        UI: {
            notify: function (message) { return nativeApiResult(["clientMessage","print"],[String(message)],"ui-notify"); },
            tip: function (message) { return nativeApiResult(["ModPE.showTipMessage"],[String(message)],"ui-tip"); },
            warning: function (message) { return nativeApiResult(["clientMessage","print"],["§6"+String(message)],"ui-warning"); },
            error: function (message) { return nativeApiResult(["clientMessage","print"],["§c"+String(message)],"ui-error"); },
            status: function () { return {chatMessage:typeof resolveGlobalPath("clientMessage").value==="function",printFallback:typeof resolveGlobalPath("print").value==="function",tip:typeof resolveGlobalPath("ModPE.showTipMessage").value==="function",customScreens:false,verifiedInGame:false,note:"Solo mensajes de chat, fallback print y tip; print no se considera un toast ni hay pantallas gráficas personalizadas."}; }
        },

        Items: {
            /* Native registration is irreversible in many BlockLauncher builds; state is never called "verified" automatically. */
            create: function (definition) { return createNexusItem(definition, false); },
            createFood: function (definition) { return createNexusItem(definition, true); },
            createArmor: function (definition) {
                var id,name,icon,iconIndex,armorTexture,damageReduction,maxDamage,armorType,result,ownerId=currentOwner;
                if (!itemOwnerIsValid()) return {ok:false,state:"rejected",error:"No hay un mod propietario activo",verifiedInGame:false};
                if (!definition || typeof definition!=="object") return {ok:false,state:"rejected",error:"definition debe ser un objeto",verifiedInGame:false};
                id=Number(definition.id); name=trim(definition.name); icon=trim(definition.texture||"iron_helmet"); iconIndex=Number(definition.textureData===undefined?0:definition.textureData);
                armorTexture=trim(definition.armorTexture); damageReduction=Number(definition.damageReduction===undefined?2:definition.damageReduction); maxDamage=Number(definition.maxDamage===undefined?100:definition.maxDamage); armorType=Number(definition.armorType);
                if (!integerInRange(id,256,32767)||!name||!icon||!armorTexture||!integerInRange(iconIndex,0,255)||!isFinite(damageReduction)||damageReduction<0||!integerInRange(maxDamage,1,32767)||!integerInRange(armorType,0,3)||!/^[A-Za-z0-9_./-]{1,100}$/.test(armorTexture)||armorTexture.indexOf("..")!==-1) return {ok:false,state:"rejected",error:"Requiere id 256-32767, name, texture, armorTexture válida, textureData 0-255, damageReduction >=0, maxDamage 1-32767 y armorType 0-3",verifiedInGame:false};
                if (itemRecords[String(id)]) return {ok:false,state:"conflict",error:"ID ya registrada por Nexus",verifiedInGame:false};
                if (!publicApi.Registry.claim("item",id,name)) return {ok:false,state:"conflict",error:"Registry rechazó el ID",verifiedInGame:false};
                result=callNativeVariants([{path:"Item.defineArmor",args:[id,icon,iconIndex,name,armorTexture,damageReduction,maxDamage,armorType]}]);
                if (!result.ok) { publicApi.Registry.release("item",id); return {ok:false,state:"unsupported-or-failed",error:result.error,verifiedInGame:false}; }
                itemRecords[String(id)]={id:id,name:name,texture:icon,textureData:iconIndex,maxStack:1,type:"armor",armorTexture:armorTexture,armorType:armorType,damageReduction:damageReduction,maxDamage:maxDamage,ownerId:ownerId,nativeMethod:result.path,state:"native-call-requested",verifiedInGame:false,behavior:{onUse:typeof definition.onUse==="function"?definition.onUse:null,onAttack:typeof definition.onAttack==="function"?definition.onAttack:null},properties:{},createdAt:timestamp()};
                itemOrder.push(String(id));
                return {ok:true,state:"native-call-requested",method:result.path,item:copyItemRecord(itemRecords[String(id)]),verifiedInGame:false};
            },
            createThrowable: function (definition) {
                var id,name,texture,textureData,maxStack,result,ownerId=currentOwner;
                if (!itemOwnerIsValid()) return {ok:false,state:"rejected",error:"No hay un mod propietario activo",verifiedInGame:false};
                if (!definition || typeof definition!=="object") return {ok:false,state:"rejected",error:"definition debe ser un objeto",verifiedInGame:false};
                id=Number(definition.id); name=trim(definition.name); texture=trim(definition.texture||"snowball"); textureData=Number(definition.textureData===undefined?0:definition.textureData); maxStack=Number(definition.maxStack===undefined?16:definition.maxStack);
                if (!integerInRange(id,256,32767)||!name||!texture||texture.indexOf("..")!==-1||!/^[A-Za-z0-9_./-]{1,100}$/.test(texture)||!integerInRange(textureData,0,255)||!integerInRange(maxStack,1,64)) return {ok:false,state:"rejected",error:"ID 256-32767, name, texture, textureData 0-255 y maxStack 1-64 inválidos",verifiedInGame:false};
                if (itemRecords[String(id)]) return {ok:false,state:"conflict",error:"ID ya registrada por Nexus",verifiedInGame:false};
                if (!publicApi.Registry.claim("item",id,name)) return {ok:false,state:"conflict",error:"Registry rechazó el ID",verifiedInGame:false};
                result=callNativeVariants([{path:"Item.defineThrowable",args:[id,texture,textureData,name,maxStack]}]);
                if (!result.ok) { publicApi.Registry.release("item",id); return {ok:false,state:"unsupported-or-failed",error:result.error,verifiedInGame:false}; }
                itemRecords[String(id)]={id:id,name:name,texture:texture,textureData:textureData,maxStack:maxStack,type:"throwable",ownerId:ownerId,nativeMethod:result.path,state:"native-call-requested",verifiedInGame:false,behavior:{onUse:typeof definition.onUse==="function"?definition.onUse:null,onAttack:typeof definition.onAttack==="function"?definition.onAttack:null},properties:{},createdAt:timestamp()};
                itemOrder.push(String(id));
                return {ok:true,state:"native-call-requested",method:result.path,item:copyItemRecord(itemRecords[String(id)]),verifiedInGame:false};
            },
            throwProjectile: function (entityType,x,y,z,velocityX,velocityY,velocityZ,texture) {
                var spawned=publicApi.Entities.spawn(x,y,z,entityType,texture);
                if (!spawned.ok || spawned.entity===null || spawned.entity===undefined) return spawned;
                var velocity=publicApi.Entities.setVelocity(spawned.entity,Number(velocityX||0),Number(velocityY||0),Number(velocityZ||0));
                return {ok:spawned.ok&&velocity.ok,state:velocity.ok?"projectile-spawn-requested":"partial",entity:spawned.entity,velocity:velocity,verifiedInGame:false,note:"Genera una entidad y solicita su velocidad; no equivale a crear un proyectil nativo lanzado desde el jugador."};
            },
            get: function (id) { return copyItemRecord(itemRecords[String(parseInt(id, 10))]); },
            has: function (id) { return !!itemRecords[String(parseInt(id, 10))]; },
            updateProperties: function (id, properties) {
                var rec = itemRecords[String(parseInt(id, 10))];
                if (!itemOwnerIsValid()) return { ok: false, state: "rejected", error: "No hay un mod propietario activo" };
                if (!rec) return { ok: false, state: "not-found", error: "ID no registrada por Nexus" };
                if (rec.ownerId !== currentOwner) return { ok: false, state: "owner-mismatch", error: "El mod no es propietario de este ítem" };
                if (!properties || typeof properties !== "object" || isArray(properties)) return { ok: false, state: "rejected", error: "properties debe ser un objeto" };
                var applied = applyItemProperties(rec, properties), key, attempted = 0, succeeded = 0;
                for (key in applied) if (own(applied, key)) {
                    attempted++;
                    if (applied[key].applied) succeeded++;
                    rec.properties[key] = applied[key];
                }
                return {
                    ok: attempted > 0 && succeeded === attempted,
                    state: attempted === 0 ? "no-properties" : (succeeded === attempted ? "requested-not-verified" : (succeeded > 0 ? "partial" : "unsupported-or-failed")),
                    properties: applied,
                    verifiedInGame: false
                };
            },
            setMaxDamage: function (id, durability) { return publicApi.Items.updateProperties(id, { maxDamage: durability }); },
            setCategory: function (id, category) { return publicApi.Items.updateProperties(id, { category: category }); },
            list: function (ownerId) {
                var out = [], i, rec;
                for (i = 0; i < itemOrder.length; i++) {
                    rec = itemRecords[itemOrder[i]];
                    if (rec && (!ownerId || rec.ownerId === ownerId)) out.push(copyItemRecord(rec));
                }
                return out;
            },
            give: function (id, count, damage) {
                if (!itemOwnerIsValid()) return { ok: false, state: "rejected", error: "No hay un mod propietario activo" };
                id = Number(id); count = count === undefined ? 1 : Number(count); damage = damage === undefined ? 0 : Number(damage);
                if (!integerInRange(id, 1, 32767) || !integerInRange(count, 1, 32767) || !integerInRange(damage, 0, 32767)) return itemApiFailure("rejected", "ID/cantidad/daño inválidos");
                var result = callNativeVariants([
                    { path: "Player.addItemInventory", args: [id, count, damage] },
                    { path: "addItemInventory", args: [id, count, damage] },
                    { path: "Player.addItemCreativeInv", args: [id, count, damage] }
                ]);
                if (!result.ok) reportModApiError(currentOwner, "Items.give falló para ID " + id + ": " + result.error);
                else log("INFO", "Items.give solicitó añadir ID " + id + " x" + count + "; verifica el inventario dentro del juego.");
                return { ok: result.ok, state: result.ok ? "inventory-call-requested" : "unsupported-or-failed", method: result.path, error: result.error, verifiedInGame: false };
            },
            addRecipe: function (outputId, count, damage, ingredients) {
                if (!itemOwnerIsValid()) return { ok: false, state: "rejected", error: "No hay un mod propietario activo" };
                outputId = Number(outputId); count = Number(count); damage = Number(damage || 0);
                var normalized = normalizeRecipeInputs(ingredients);
                if (!integerInRange(outputId, 1, 32767) || !integerInRange(count, 1, 64) || !integerInRange(damage, 0, 32767) || !normalized) return itemApiFailure("rejected", "Salida o ingredientes inválidos; ingredients acepta [id,cantidad,daño,...] o [{id,count,damage}]");
                var result = callNativeVariants([
                    { path: "Item.addCraftRecipe", args: [outputId, count, damage, normalized] },
                    { path: "ModPE.addCraftRecipe", args: [outputId, count, damage, normalized] }
                ]);
                if (result.ok) log("INFO", "Recipes: solicitud de receta shapeless para ID " + outputId + "; no verificada en juego.");
                else reportModApiError(currentOwner, "Recipes: API shapeless no disponible/falló: " + result.error);
                return { ok: result.ok, state: result.ok ? "recipe-call-requested" : "unsupported-or-failed", method: result.path, error: result.error, verifiedInGame: false };
            },
            addShapedRecipe: function (outputId, count, damage, pattern, key) {
                if (!itemOwnerIsValid()) return { ok: false, state: "rejected", error: "No hay un mod propietario activo" };
                outputId = Number(outputId); count = Number(count); damage = Number(damage || 0);
                var i, j, normalizedKey = [], symbols = {}, row, character, hasIngredient = false;
                if (!integerInRange(outputId, 1, 32767) || !integerInRange(count, 1, 64) || !integerInRange(damage, 0, 32767) || !isArray(pattern) || pattern.length !== 3) return itemApiFailure("rejected", "Salida inválida o pattern debe contener exactamente 3 filas");
                for (i = 0; i < 3; i++) {
                    if (typeof pattern[i] !== "string" || pattern[i].length > 3) return itemApiFailure("rejected", "Cada fila de pattern debe ser texto de hasta 3 caracteres");
                    for (j = 0; j < pattern[i].length; j++) if (pattern[i].charAt(j) !== " ") hasIngredient = true;
                }
                if (!hasIngredient) return itemApiFailure("rejected", "pattern no puede estar vacío");
                if (!isArray(key) || key.length === 0 || key.length % 3 !== 0) return itemApiFailure("rejected", "key debe ser [símbolo,id,daño,...]");
                for (i = 0; i < key.length; i += 3) {
                    if (typeof key[i] !== "string" || key[i].length !== 1 || key[i] === " " || !integerInRange(key[i + 1], 0, 32767) || !integerInRange(key[i + 2], 0, 32767)) return itemApiFailure("rejected", "Entrada key inválida");
                    if (own(symbols, key[i])) return itemApiFailure("rejected", "Símbolo duplicado en key: " + key[i]);
                    symbols[key[i]] = true;
                    normalizedKey.push(key[i], Number(key[i + 1]), Number(key[i + 2]));
                }
                for (i = 0; i < 3; i++) {
                    row = pattern[i];
                    for (j = 0; j < row.length; j++) {
                        character = row.charAt(j);
                        if (character !== " " && !own(symbols, character)) return itemApiFailure("rejected", "El símbolo '" + character + "' de pattern no tiene entrada en key");
                    }
                }
                var result = callNativeVariants([
                    { path: "Item.addShapedRecipe", args: [outputId, count, damage, pattern, normalizedKey] },
                    { path: "ModPE.addShapedRecipe", args: [outputId, count, damage, pattern, normalizedKey] }
                ]);
                if (result.ok) log("INFO", "Recipes: solicitud de receta shaped para ID " + outputId + "; no verificada en juego.");
                else reportModApiError(currentOwner, "Recipes: API shaped no disponible/falló: " + result.error);
                return { ok: result.ok, state: result.ok ? "recipe-call-requested" : "unsupported-or-failed", method: result.path, error: result.error, verifiedInGame: false };
            },
            addFurnaceRecipe: function (outputId, outputDamage, inputId) {
                if (!itemOwnerIsValid()) return { ok: false, state: "rejected", error: "No hay un mod propietario activo" };
                outputId = Number(outputId); outputDamage = Number(outputDamage || 0); inputId = Number(inputId);
                if (!integerInRange(outputId, 1, 32767) || !integerInRange(outputDamage, 0, 32767) || !integerInRange(inputId, 1, 32767)) return itemApiFailure("rejected", "ID/salida/daño inválidos");
                var result = callNativeVariants([
                    { path: "Item.addFurnaceRecipe", args: [outputId, outputDamage, inputId] },
                    { path: "ModPE.addFurnaceRecipe", args: [outputId, outputDamage, inputId] }
                ]);
                if (result.ok) log("INFO", "Recipes: solicitud de fundición para ID " + outputId + "; no verificada en juego.");
                else reportModApiError(currentOwner, "Recipes: API de fundición no disponible/falló: " + result.error);
                return { ok: result.ok, state: result.ok ? "recipe-call-requested" : "unsupported-or-failed", method: result.path, error: result.error, verifiedInGame: false };
            },
            status: function () {
                return {
                    nativeSetItem: typeof resolveGlobalPath("ModPE.setItem").value === "function",
                    nativeSetFoodItem: typeof resolveGlobalPath("ModPE.setFoodItem").value === "function",
                    shapelessRecipe: typeof resolveGlobalPath("Item.addCraftRecipe").value === "function" || typeof resolveGlobalPath("ModPE.addCraftRecipe").value === "function",
                    shapedRecipe: typeof resolveGlobalPath("Item.addShapedRecipe").value === "function" || typeof resolveGlobalPath("ModPE.addShapedRecipe").value === "function",
                    furnaceRecipe: typeof resolveGlobalPath("Item.addFurnaceRecipe").value === "function" || typeof resolveGlobalPath("ModPE.addFurnaceRecipe").value === "function",
                    registeredItems: itemOrder.length,
                    interpretedUseBehavior: true,
                    interpretedAttackBehavior: true,
                    verifiedInGame: false,
                    note: "onUse y onAttack se interpretan desde los hooks centralizados de Nexus. Una llamada nativa sin excepción solo confirma que se solicitó la operación; confirma visualmente el objeto, la receta y sus propiedades en MCPE 1.0.9."
                };
            }
        },

        Resources: {
            /* Declaración lógica. No descubre ni combina automáticamente paquetes de Toolbox. */
            declare: function (resourceId, targetTexture, sourceUrl, notes) {
                resourceId = trim(resourceId);
                targetTexture = trim(targetTexture);
                sourceUrl = trim(sourceUrl);
                var ownerId = currentOwner || "_global", bucket = ownerResourceBucket(ownerId), existingOwner, key, rec;
                if (!safeId(resourceId) || !targetTexture || !sourceUrl) {
                    log("ERROR", "Resources.declare necesita ID, targetTexture y sourceUrl válidos.");
                    return false;
                }
                if (targetTexture.length > 240 || sourceUrl.length > 1024) return false;
                for (existingOwner in resourceDeclarations) {
                    if (!own(resourceDeclarations, existingOwner)) continue;
                    for (key in resourceDeclarations[existingOwner]) {
                        if (!own(resourceDeclarations[existingOwner], key)) continue;
                        rec = resourceDeclarations[existingOwner][key];
                        if (rec.target === targetTexture && rec.ownerId !== ownerId) {
                            reportModApiError(ownerId, "Conflicto de recurso: target " + targetTexture + " ya fue declarado por " + rec.ownerId + ".");
                            return false;
                        }
                    }
                }
                if (bucket[resourceId] && (bucket[resourceId].target !== targetTexture || bucket[resourceId].source !== sourceUrl)) {
                    log("WARN", "Resources: se reemplaza la declaración " + resourceId + " del mismo mod.");
                }
                bucket[resourceId] = {
                    id: resourceId,
                    target: targetTexture,
                    source: sourceUrl,
                    notes: String(notes || ""),
                    ownerId: ownerId,
                    state: "declared-only",
                    verifiedInGame: false
                };
                log("INFO", "Recurso declarado (todavía sin aplicar): " + resourceId);
                return true;
            },
            remove: function (resourceId) {
                var ownerId = currentOwner || "_global", bucket = resourceDeclarations[ownerId];
                if (!bucket || !own(bucket, resourceId)) return false;
                delete bucket[resourceId];
                return true;
            },
            validate: function (ownerId) {
                var resources = publicApi.Resources.list(ownerId), issues = [], warnings = [], i, r;
                for (i = 0; i < resources.length; i++) {
                    r = resources[i];
                    if (!r.target || !r.source) issues.push(r.id + ": declaración incompleta");
                    if (r.state === "override-failed") issues.push(r.id + ": override falló");
                    else if (r.state === "declared-only") warnings.push(r.id + ": declarado pero todavía no aplicado");
                    else if (r.state === "override-requested") warnings.push(r.id + ": override solicitado, no verificado dentro del juego");
                }
                return { valid: issues.length === 0, count: resources.length, issues: issues, warnings: warnings, verifiedInGame: false };
            },
            list: function (ownerId) {
                var out = [], buckets = [], id, key;
                if (ownerId) buckets.push(resourceDeclarations[ownerId] || {});
                else for (id in resourceDeclarations) if (own(resourceDeclarations, id)) buckets.push(resourceDeclarations[id]);
                for (id = 0; id < buckets.length; id++) {
                    for (key in buckets[id]) if (own(buckets[id], key)) out.push(buckets[id][key]);
                }
                return out;
            },
            apply: function (ownerId) {
                ownerId = ownerId || currentOwner;
                if (currentOwner && ownerId !== currentOwner) {
                    log("WARN", "Resources.apply rechazado: un mod no puede aplicar recursos de otro mod.");
                    return { declared: 0, requested: 0, failed: 1, error: "owner mismatch" };
                }
                if (!ownerId || !resourceDeclarations[ownerId]) return { declared: 0, requested: 0, failed: 0 };
                var bucket = resourceDeclarations[ownerId];
                var key, resource, requested = 0, failed = 0, declared = 0;
                for (key in bucket) {
                    if (!own(bucket, key)) continue;
                    resource = bucket[key];
                    declared++;
                    if (!resource.target || !resource.source) {
                        resource.state = "incomplete-declaration";
                        failed++;
                    } else if (publicApi.Resources.overrideTexture(resource.target, resource.source)) {
                        resource.state = "override-requested";
                        requested++;
                    } else {
                        resource.state = "override-failed";
                        failed++;
                    }
                }
                return { declared: declared, requested: requested, failed: failed };
            },
            overrideTexture: function (targetTexture, sourceUrl) {
                if (!trim(targetTexture) || !trim(sourceUrl)) {
                    log("WARN", "Resources.overrideTexture necesita targetTexture y sourceUrl.");
                    return false;
                }
                var result = callNativeVariants([{ path: "ModPE.overrideTexture", args: [String(targetTexture), String(sourceUrl)] }]);
                if (!result.ok) {
                    log("ERROR", "overrideTexture no disponible o falló: " + result.error);
                    return false;
                }
                log("INFO", "Se solicitó overrideTexture para " + String(targetTexture) + ". Verifica el resultado en el juego.");
                return true;
            },
            status: function () {
                return {
                    automaticToolboxPackDiscovery: false,
                    automaticPackMerging: false,
                    modPEOverrideTextureAvailable: (typeof resolveGlobalPath("ModPE.overrideTexture").value === "function"),
                    verifiedInGame: false,
                    note: "La API ModPE.overrideTexture solicita un cambio de textura; no descubre ni controla automáticamente los paquetes de texturas de Toolbox."
                };
            }
        },

        Storage: {
            readText: function (relativePath) {
                if (!validRelativePath(relativePath)) return null;
                return readText(rootPath + relativePath);
            },
            writeText: function (relativePath, content) {
                if (!validRelativePath(relativePath)) return false;
                return writeText(rootPath + relativePath, content, false);
            },
            readJSON: function (relativePath, fallback) {
                var raw = publicApi.Storage.readText(relativePath);
                if (raw === null || raw === "") return fallback;
                try { return JSON.parse(raw); }
                catch (e) { log("WARN", "JSON inválido: " + relativePath); return fallback; }
            },
            writeJSON: function (relativePath, value) {
                try { return publicApi.Storage.writeText(relativePath, JSON.stringify(value, null, 2)); }
                catch (e) { log("ERROR", "No se pudo serializar JSON: " + String(e)); return false; }
            }
        },

        Config: {
            get: function (key, fallback) {
                var ownerId = currentOwner;
                if (!ownerId) return fallback;
                var conf = getConfig(ownerId);
                return own(conf, key) ? conf[key] : fallback;
            },
            set: function (key, value) {
                var ownerId = currentOwner;
                if (!ownerId || !safeId(ownerId)) return false;
                var conf = getConfig(ownerId);
                conf[String(key)] = value;
                configCache[ownerId] = conf;
                return publicApi.Storage.writeJSON("Config/" + ownerId + ".json", conf);
            },
            all: function () {
                return currentOwner ? getConfig(currentOwner) : {};
            }
        },

        Data: {
            read: function (namespace, fallback) {
                namespace = namespace || currentOwner;
                if (!safeId(namespace)) return fallback;
                return publicApi.Storage.readJSON("Data/" + namespace + ".json", fallback);
            },
            write: function (namespace, value) {
                namespace = namespace || currentOwner;
                if (!safeId(namespace)) return false;
                return publicApi.Storage.writeJSON("Data/" + namespace + ".json", value);
            }
        },

        registerMod: function (definition) {
            if (currentLoadingFile && currentLoadRegisteredIds && currentLoadRegisteredIds.length > 0) {
                currentLoadRegistrationFailed = true;
                log("ERROR", "Archivo " + currentLoadingFile + " rechazado: cada archivo debe registrar exactamente un mod.");
                return false;
            }
            var validation = validateModDefinition(definition);
            if (!validation.valid) {
                if (currentLoadingFile) currentLoadRegistrationFailed = true;
                log("ERROR", "Mod rechazado por validación: " + validation.errors.join("; "));
                return false;
            }
            var id = validation.id;
            if (mods[id]) {
                log("ERROR", "Conflicto de registro: ID de mod duplicado '" + id + "' al cargar " + (currentLoadingFile || "registro externo") + ". El ID ya pertenece al archivo " + (mods[id].sourceFile || "registro externo") + ".");
                return false;
            }
            var rec = {
                id: id,
                name: String(definition.name || id),
                version: String(definition.version || "0.1.0"),
                description: String(definition.description || ""),
                author: String(definition.author || ""),
                definition: definition,
                sourceFile: currentLoadingFile || null,
                state: "registered",
                loadedOnce: false,
                errors: 0,
                lastError: null,
                registeredAt: timestamp(),
                validationWarnings: validation.warnings.slice(0)
            };
            mods[id] = rec;
            modOrder.push(id);
            if (currentLoadRegisteredIds) currentLoadRegisteredIds.push(id);
            log("INFO", "Mod registrado: ID=" + id + ", nombre=" + rec.name + ", archivo=" + (currentLoadingFile || "registro externo") + ", v" + rec.version);
            var warningIndex;
            for (warningIndex = 0; warningIndex < validation.warnings.length; warningIndex++) log("WARN", id + ": " + validation.warnings[warningIndex]);
            return true;
        },

        init: function () {
            if (started) return true;
            started = true;
            publicApi.status = "starting";
            rootPath = getRootPath();
            publicApi.rootPath = rootPath;
            if (!canUseJavaFiles()) {
                publicApi.status = "limited";
                nativeMessage("v" + VERSION + " cargado, pero el acceso Java/archivos no está disponible en este contexto.");
                return false;
            }
            if (!ensureDirectories()) {
                publicApi.status = "limited";
                nativeMessage("No se pudieron crear todas las carpetas. Revisa el acceso al almacenamiento.");
                log("WARN", "No se pudieron crear todas las carpetas.");
            } else {
                publicApi.status = "running";
                log("INFO", "Nexus v" + VERSION + " iniciado en " + rootPath);
                nativeMessage("v" + VERSION + " iniciado. Mods: " + rootPath + "Mods/");
                if (autoLoad) publicApi.Loader.loadAll();
            }
            flushLogs();
            return dirsReady;
        },

        Loader: {
            listFiles: function () {
                if (!canUseJavaFiles()) return [];
                if (!dirsReady) ensureDirectories();
                try {
                    var folder = new java.io.File(rootPath + "Mods/");
                    var files = folder.listFiles();
                    var out = [], i, file, name;
                    if (!files) return out;
                    for (i = 0; i < files.length; i++) {
                        file = files[i];
                        if (!file || !file.isFile()) continue;
                        name = String(file.getName());
                        if (/^[A-Za-z0-9._-]+\.js$/i.test(name) && name.indexOf("..") === -1) out.push(name);
                    }
                    out.sort(function (a, b) { a = lower(a); b = lower(b); return a < b ? -1 : (a > b ? 1 : 0); });
                    return out;
                } catch (e) {
                    log("ERROR", "No se pudo enumerar Mods/: " + String(e));
                    return [];
                }
            },
            load: function (fileName) {
                if (!canUseJavaFiles()) return false;
                if (!dirsReady) ensureDirectories();
                fileName = trim(fileName);
                if (fileName.indexOf("/") !== -1 || fileName.indexOf("\\") !== -1 || fileName.indexOf("..") !== -1) return false;
                if (!/^[A-Za-z0-9._-]+\.js$/i.test(fileName)) fileName += ".js";
                if (!/^[A-Za-z0-9._-]+\.js$/i.test(fileName) || fileName.indexOf("..") !== -1) return false;
                if (fileStates[fileName] && fileStates[fileName].state === "active") {
                    nativeMessage(fileName + " ya está activo.");
                    return false;
                }
                if (fileStates[fileName] && fileStates[fileName].state === "disabled") {
                    nativeMessage(fileName + " ya se cargó. Usa /nexus on ID.");
                    return false;
                }
                if (fileStates[fileName] && fileStates[fileName].state === "failed" && fileStates[fileName].id && mods[fileStates[fileName].id] && mods[fileStates[fileName].id].sourceFile === fileName) {
                    var retryId = fileStates[fileName].id;
                    var retried = enableMod(retryId);
                    fileStates[fileName].state = retried ? "active" : "failed";
                    fileStates[fileName].error = retried ? null : ((mods[retryId] && mods[retryId].lastError) || "No se pudo reactivar; revisa Logs/Nexus.log");
                    nativeMessage(retried ? "Mod reactivado: " + retryId : "Sigue fallando el mod " + retryId + "; revisa Nexus.log.");
                    return retried;
                }
                var code = readText(rootPath + "Mods/" + fileName);
                if (code === null || trim(code) === "") {
                    fileStates[fileName] = { state: "failed", error: "Archivo vacío o inaccesible" };
                    log("ERROR", "Archivo vacío o inaccesible: " + fileName);
                    return false;
                }
                var createdIds = [], registeredId = null, enabled = false, i, rec;
                currentLoadingFile = fileName;
                currentLoadRegisteredIds = [];
                currentLoadRegistrationFailed = false;
                try {
                    /* Ejecutar fuera del cierre privado de Nexus evita exponer variables internas
                       como mods, idClaims o currentOwner por resolución léxica accidental.
                       No es un sandbox de seguridad; los mods siguen compartiendo los globales. */
                    __nexusEval(code);
                    createdIds = currentLoadRegisteredIds.slice(0);
                    if (currentLoadRegistrationFailed) throw new Error("El archivo intentó registrar más de un mod o presentó un registro inválido.");
                    if (createdIds.length !== 1) {
                        throw new Error("El archivo debe registrar exactamente un mod con Nexus.registerMod({id: ...}); registrados en este archivo: " + createdIds.length + ". El ID no necesita coincidir con el nombre del archivo.");
                    }
                    registeredId = createdIds[0];
                    rec = mods[registeredId];
                    if (!rec) throw new Error("El registro " + registeredId + " desapareció durante la carga.");
                    rec.sourceFile = fileName;
                    fileStates[fileName] = { state: "registered", error: null, id: registeredId };
                    enabled = enableMod(registeredId);
                    fileStates[fileName].state = enabled ? "active" : "failed";
                    if (!enabled) fileStates[fileName].error = (mods[registeredId] && mods[registeredId].lastError) || "No se pudo activar el mod; revisar Logs/Nexus.log";
                    if (enabled) nativeMessage("Mod activo: " + registeredId + " (" + fileName + ")");
                    else nativeMessage("No se pudo activar ID " + registeredId + "; revisa Nexus.log.");
                    return enabled;
                } catch (e) {
                    createdIds = currentLoadRegisteredIds ? currentLoadRegisteredIds.slice(0) : createdIds;
                    for (i = 0; i < createdIds.length; i++) {
                        rec = mods[createdIds[i]];
                        removeOwnedListeners(createdIds[i]);
                        removeOwnedTasks(createdIds[i]);
                        removeOwnedCommands(createdIds[i]);
                        removeOwnedResources(createdIds[i]);
                        removeOwnedClaims(createdIds[i]);
                        if (rec && rec.sourceFile === fileName) delete mods[createdIds[i]];
                        var idx = modOrder.indexOf ? modOrder.indexOf(createdIds[i]) : -1;
                        if (idx >= 0) modOrder.splice(idx, 1);
                    }
                    fileStates[fileName] = { state: "failed", error: String(e), id: registeredId };
                    log("ERROR", "Carga fallida " + fileName + " (ID " + (registeredId || "no registrado") + "): " + String(e));
                    nativeMessage("Error al cargar " + fileName + ": " + String(e));
                    return false;
                } finally {
                    currentLoadingFile = null;
                    currentLoadRegisteredIds = null;
                    currentLoadRegistrationFailed = false;
                }
            },
            loadAll: function () {
                var list = this.listFiles();
                var loaded = 0, failed = 0, skipped = 0, i, known;
                for (i = 0; i < list.length; i++) {
                    known = fileStates[list[i]];
                    if (known && (known.state === "active" || known.state === "disabled")) {
                        skipped++;
                        continue;
                    }
                    if (this.load(list[i])) loaded++;
                    else failed++;
                }
                log("INFO", "Carga finalizada; activos nuevos/reactivados=" + loaded + ", no intentados por estado activo/desactivado=" + skipped + ", fallas=" + failed);
                if (list.length > 0) nativeMessage("§l§fCarga terminada: " + loaded + " activos nuevos/reactivados | §l§fFallas: " + failed + ".");
                return { found: list.length, loaded: loaded, failed: failed, skipped: skipped };
            },
            status: function () {
                var out = [], key;
                for (key in fileStates) if (own(fileStates, key)) out.push({ file: key, state: fileStates[key].state, error: fileStates[key].error || null, id: fileStates[key].id || null });
                return out;
            },
            getFolder: function () { return rootPath + "Mods/"; }
        }
    };

    function getConfig(ownerId) {
        if (configCache[ownerId]) return configCache[ownerId];
        var path = "Config/" + ownerId + ".json";
        var conf = publicApi.Storage.readJSON(path, {});
        if (!conf || typeof conf !== "object") conf = {};
        configCache[ownerId] = conf;
        return conf;
    }

    function validRelativePath(path) {
        path = String(path || "");
        if (!path || path.charAt(0) === "/" || path.indexOf("\\") !== -1 || path.indexOf("..") !== -1 || path.indexOf(":") !== -1) return false;
        return /^[A-Za-z0-9._\/-]+$/.test(path);
    }

    function enableMod(id) {
        id = normalizeModId(id);
        if (!id) return false;
        var rec = mods[id];
        if (!rec) return false;
        if (rec.state === "active") return true;
        var def = rec.definition;
        rec.state = "enabling";
        if (!rec.loadedOnce && typeof def.onLoad === "function") {
            var errorsBeforeLoad = callbackErrorSequence;
            callAsOwner(id, def.onLoad, [apiFor(id)], "onLoad");
            /* Una excepción de onLoad impide activar el mod; errores de API registrados como diagnóstico no bloquean por sí solos el ciclo. */
            if (callbackErrorSequence > errorsBeforeLoad) {
                removeOwnedListeners(id);
                removeOwnedTasks(id);
                removeOwnedCommands(id);
                removeOwnedResources(id);
                removeOwnedClaims(id);
                rec.state = "failed";
                return false;
            }
            rec.loadedOnce = true;
        } else {
            rec.loadedOnce = true;
        }
        var eventMap = def.events || {};
        var eventName;
        for (eventName in eventMap) {
            if (own(eventMap, eventName) && typeof eventMap[eventName] === "function") {
                addListener(eventName, eventMap[eventName], id);
            }
        }
        if (typeof def.onEnable === "function") {
            var beforeErrors = callbackErrorSequence;
            callAsOwner(id, def.onEnable, [apiFor(id)], "onEnable");
            if (callbackErrorSequence > beforeErrors) {
                removeOwnedListeners(id);
                removeOwnedTasks(id);
                removeOwnedCommands(id);
                removeOwnedResources(id);
                removeOwnedClaims(id);
                rec.state = "failed";
                return false;
            }
        }
        rec.state = "active";
        if (rec.sourceFile && fileStates[rec.sourceFile]) fileStates[rec.sourceFile].state = "active";
        log("INFO", "Mod activado: " + id);
        return true;
    }

    function disableMod(id) {
        id = normalizeModId(id);
        if (!id) return false;
        var rec = mods[id], errorsBeforeDisable = callbackErrorSequence;
        if (!rec) return false;
        if (rec.state === "disabled") return true;
        if (rec.state !== "active" && rec.state !== "failed" && rec.state !== "enabling") return false;
        if (typeof rec.definition.onDisable === "function") callAsOwner(id, rec.definition.onDisable, [apiFor(id)], "onDisable");
        removeOwnedListeners(id);
        removeOwnedTasks(id);
        removeOwnedCommands(id);
        rec.state = "disabled";
        if (rec.sourceFile && fileStates[rec.sourceFile]) fileStates[rec.sourceFile].state = "disabled";
        var cleanDisable = callbackErrorSequence === errorsBeforeDisable;
        log(cleanDisable ? "INFO" : "WARN", cleanDisable ? "Mod desactivado y limpiado: " + id : "Mod desactivado, pero onDisable produjo un error: " + id);
        return cleanDisable;
    }

    function saveLatestLogSnapshot() {
        if (!canUseJavaFiles()) return false;
        if (!dirsReady) ensureDirectories();
        if (!dirsReady) return false;

        /* Persiste lo pendiente sin borrar recentLogBuffer, que es el snapshot de los últimos eventos. */
        flushLogs();
        var content = "Nexus v" + VERSION + " — registro capturado antes de /nexus log\n";
        content += "Corte: " + timestamp() + "\n\n";
        if (recentLogBuffer.length) content += recentLogBuffer.join("\n") + "\n";
        else content += "(No había registros previos en el buffer de la sesión.)\n";
        return writeText(rootPath + "Logs/Nexus_Ultimo.log", content, false);
    }

    function skipSourceString(source, index, end) {
        var quote = source.charAt(index), i = index + 1;
        while (i < end) {
            if (source.charAt(i) === "\\") { i += 2; continue; }
            if (source.charAt(i) === quote) return i + 1;
            i++;
        }
        return end;
    }

    function skipSourceTrivia(source, index, end) {
        var c, next, close;
        while (index < end) {
            c = source.charAt(index);
            if (/\s/.test(c)) { index++; continue; }
            next = source.charAt(index + 1);
            if (c === "/" && next === "/") {
                index += 2;
                while (index < end && source.charAt(index) !== "\n") index++;
                continue;
            }
            if (c === "/" && next === "*") {
                close = source.indexOf("*/", index + 2);
                index = close < 0 || close >= end ? end : close + 2;
                continue;
            }
            break;
        }
        return index;
    }

    function staticRegexCanStart(source, index) {
        var i = index - 1, ch, word = "";
        while (i >= 0 && /\s/.test(source.charAt(i))) i--;
        if (i < 0) return true;
        ch = source.charAt(i);
        if (/[({[=,:;!&|?+\-*%^~<>]/.test(ch)) return true;
        while (i >= 0 && /[A-Za-z_$]/.test(source.charAt(i))) { word = source.charAt(i) + word; i--; }
        return /^(return|throw|case|delete|void|typeof|instanceof|in|new|else|do)$/.test(word);
    }

    function skipSourceRegex(source, index, end) {
        var i = index + 1, inClass = false, ch;
        while (i < end) {
            ch = source.charAt(i);
            if (ch === "\\") { i += 2; continue; }
            if (ch === "\n" || ch === "\r") return index + 1;
            if (ch === "[") inClass = true;
            else if (ch === "]") inClass = false;
            else if (ch === "/" && !inClass) {
                i++;
                while (i < end && /[A-Za-z]/.test(source.charAt(i))) i++;
                return i;
            }
            i++;
        }
        return end;
    }

    function skipSourceCommentOrString(source, index, end) {
        var c = source.charAt(index), next = source.charAt(index + 1), close;
        if (c === "\"" || c === "'") return skipSourceString(source, index, end);
        if (c === "/" && next === "/") {
            index += 2;
            while (index < end && source.charAt(index) !== "\n") index++;
            return index;
        }
        if (c === "/" && next === "*") {
            close = source.indexOf("*/", index + 2);
            return close < 0 || close >= end ? end : close + 2;
        }
        if (c === "/" && staticRegexCanStart(source, index)) return skipSourceRegex(source, index, end);
        return index;
    }

    function findRegistrationObjectStarts(source) {
        var starts = [], i = 0, end = source.length, c, previous, match;
        var pattern = /^Nexus\s*\.\s*registerMod\s*\(\s*\{/;
        while (i < end) {
            c = source.charAt(i);
            if (c === "\"" || c === "'") { i = skipSourceString(source, i, end); continue; }
            if (c === "/" && (source.charAt(i + 1) === "/" || source.charAt(i + 1) === "*" || staticRegexCanStart(source, i))) {
                i = skipSourceCommentOrString(source, i, end);
                continue;
            }
            previous = i > 0 ? source.charAt(i - 1) : "";
            if (c === "N" && previous !== "." && !/[A-Za-z0-9_$]/.test(previous)) {
                match = pattern.exec(source.substring(i));
                if (match) {
                    starts.push(i + match[0].lastIndexOf("{"));
                    i += match[0].length;
                    continue;
                }
            }
            i++;
        }
        return starts;
    }

    function findMatchingSourceBrace(source, openIndex) {
        var depth = 0, i = openIndex, end = source.length, c;
        while (i < end) {
            c = source.charAt(i);
            if (c === "\"" || c === "'") { i = skipSourceString(source, i, end); continue; }
            if (c === "/" && (source.charAt(i + 1) === "/" || source.charAt(i + 1) === "*" || staticRegexCanStart(source, i))) {
                i = skipSourceCommentOrString(source, i, end);
                continue;
            }
            if (c === "{") depth++;
            else if (c === "}") {
                depth--;
                if (depth === 0) return i;
            }
            i++;
        }
        return -1;
    }

    function staticVariableId(source, variableName) {
        var i = 0, end = source.length, c, j, nameEnd, equalsIndex, valueIndex, valueEnd, raw;
        while (i < end) {
            c = source.charAt(i);
            if (c === "\"" || c === "'") { i = skipSourceString(source, i, end); continue; }
            if (c === "/" && (source.charAt(i + 1) === "/" || source.charAt(i + 1) === "*" || staticRegexCanStart(source, i))) {
                i = skipSourceCommentOrString(source, i, end);
                continue;
            }
            if (/[A-Za-z_$]/.test(c)) {
                j = i + 1;
                while (j < end && /[A-Za-z0-9_$]/.test(source.charAt(j))) j++;
                if (source.substring(i, j) === "var") {
                    valueIndex = skipSourceTrivia(source, j, end);
                    if (/[A-Za-z_$]/.test(source.charAt(valueIndex))) {
                        nameEnd = valueIndex + 1;
                        while (nameEnd < end && /[A-Za-z0-9_$]/.test(source.charAt(nameEnd))) nameEnd++;
                        if (source.substring(valueIndex, nameEnd) === variableName) {
                            equalsIndex = skipSourceTrivia(source, nameEnd, end);
                            if (source.charAt(equalsIndex) === "=") {
                                valueIndex = skipSourceTrivia(source, equalsIndex + 1, end);
                                c = source.charAt(valueIndex);
                                if (c === "\"" || c === "'") {
                                    valueEnd = skipSourceString(source, valueIndex, end);
                                    if (source.charAt(valueEnd - 1) !== c) return null;
                                    raw = source.substring(valueIndex + 1, valueEnd - 1);
                                    return /^\d+$/.test(raw) ? normalizeModId(raw) : null;
                                }
                                if (/[0-9]/.test(c)) {
                                    valueEnd = valueIndex + 1;
                                    while (valueEnd < end && /[0-9]/.test(source.charAt(valueEnd))) valueEnd++;
                                    raw = source.substring(valueIndex, valueEnd);
                                    if (raw.length > 1 && raw.charAt(0) === "0") return null;
                                    return normalizeModId(raw);
                                }
                            }
                        }
                    }
                }
                i = j;
                continue;
            }
            i++;
        }
        return null;
    }
    function rootModIdFromObject(source, openIndex, closeIndex) {
        var i = openIndex + 1, c, j, endKey, key, valueIndex;
        var braceDepth = 0, bracketDepth = 0, parenDepth = 0, end = closeIndex;
        while (i < end) {
            c = source.charAt(i);
            if (c === "\"" || c === "'") {
                if (braceDepth === 0 && bracketDepth === 0 && parenDepth === 0) {
                    endKey = skipSourceString(source, i, end);
                    key = source.substring(i + 1, endKey - 1);
                    j = skipSourceTrivia(source, endKey, end);
                    if (key === "id" && source.charAt(j) === ":") {
                        valueIndex = skipSourceTrivia(source, j + 1, end);
                        return staticIdValue(source, valueIndex, end);
                    }
                    i = endKey;
                    continue;
                }
                i = skipSourceString(source, i, end);
                continue;
            }
            if (c === "/" && (source.charAt(i + 1) === "/" || source.charAt(i + 1) === "*" || staticRegexCanStart(source, i))) {
                i = skipSourceCommentOrString(source, i, end);
                continue;
            }
            if (braceDepth === 0 && bracketDepth === 0 && parenDepth === 0 && /[A-Za-z_$]/.test(c)) {
                j = i + 1;
                while (j < end && /[A-Za-z0-9_$]/.test(source.charAt(j))) j++;
                key = source.substring(i, j);
                if (key === "id") {
                    valueIndex = skipSourceTrivia(source, j, end);
                    if (source.charAt(valueIndex) === ":") {
                        valueIndex = skipSourceTrivia(source, valueIndex + 1, end);
                        return staticIdValue(source, valueIndex, end);
                    }
                }
                i = j;
                continue;
            }
            if (c === "{") braceDepth++;
            else if (c === "}") { if (braceDepth > 0) braceDepth--; else break; }
            else if (c === "[") bracketDepth++;
            else if (c === "]") { if (bracketDepth > 0) bracketDepth--; }
            else if (c === "(") parenDepth++;
            else if (c === ")") { if (parenDepth > 0) parenDepth--; }
            i++;
        }
        return null;
    }

    function staticIdValue(source, valueIndex, end) {
        var c = source.charAt(valueIndex), valueEnd, raw, identifier;
        if (c === "\"" || c === "'") {
            valueEnd = skipSourceString(source, valueIndex, end);
            if (valueEnd <= valueIndex + 1 || source.charAt(valueEnd - 1) !== c) return null;
            raw = source.substring(valueIndex + 1, valueEnd - 1);
            return normalizeModId(raw);
        }
        if (/[0-9]/.test(c)) {
            valueEnd = valueIndex + 1;
            while (valueEnd < end && /[0-9]/.test(source.charAt(valueEnd))) valueEnd++;
            raw = source.substring(valueIndex, valueEnd);
            /* Un literal ES5 con cero inicial puede ser octal; no asumir que es decimal. */
            if (raw.length > 1 && raw.charAt(0) === "0") return null;
            return normalizeModId(raw);
        }
        if (/[A-Za-z_$]/.test(c)) {
            valueEnd = valueIndex + 1;
            while (valueEnd < end && /[A-Za-z0-9_$]/.test(source.charAt(valueEnd))) valueEnd++;
            identifier = source.substring(valueIndex, valueEnd);
            raw = staticVariableId(source, identifier);
            return normalizeModId(raw);
        }
        return null;
    }

    function staticIdsFromSource(source) {
        source = String(source || "");
        var starts = findRegistrationObjectStarts(source), ids = [], i, closeIndex, id;
        for (i = 0; i < starts.length; i++) {
            closeIndex = findMatchingSourceBrace(source, starts[i]);
            if (closeIndex < 0) continue;
            id = rootModIdFromObject(source, starts[i], closeIndex);
            if (id !== null) ids.push(id);
        }
        return ids;
    }

    function scanModFileIds() {
        var fileNames = publicApi.Loader.listFiles();
        var entries = [], i, j, source, ids, stateInfo, rec, counts = {};
        for (i = 0; i < fileNames.length; i++) {
            source = readText(rootPath + "Mods/" + fileNames[i]);
            ids = source === null ? [] : staticIdsFromSource(source);
            stateInfo = fileStates[fileNames[i]] || null;
            /* Si la expresión no es estática, usa el ID real del registro de ese archivo cuando ya cargó. */
            if (!ids.length) {
                for (j = 0; j < modOrder.length; j++) {
                    rec = mods[modOrder[j]];
                    if (rec && rec.sourceFile === fileNames[i]) ids.push(rec.id);
                }
            }
            if (!ids.length) {
                entries.push({ file: fileNames[i], id: null, state: stateInfo ? stateInfo.state : "ID no detectada", error: stateInfo ? stateInfo.error : null });
                continue;
            }
            for (j = 0; j < ids.length; j++) {
                rec = mods[ids[j]];
                entries.push({
                    file: fileNames[i],
                    id: ids[j],
                    state: rec ? rec.state : (stateInfo && stateInfo.state === "failed" ? "fallo de carga" : "no cargado"),
                    error: rec ? rec.lastError : (stateInfo ? stateInfo.error : null)
                });
                counts[ids[j]] = (counts[ids[j]] || 0) + 1;
            }
        }
        for (i = 0; i < entries.length; i++) {
            entries[i].duplicate = entries[i].id !== null && counts[entries[i].id] > 1;
        }
        return { files: fileNames, entries: entries };
    }

    function commandFrame(title, bodyLines) {
        var i;
        nativeMessage("§a+--- " + title + " ---+");
        for (i = 0; i < bodyLines.length; i++) nativeMessage(bodyLines[i]);
        nativeMessage("§a+------------------------------+");
    }

    function processNexusCommand(args) {
        var action = lower(args[0] || "help");
        var id, result, i, entry, resources, lines, statusColor;

        if (action === "help") {
            commandFrame("Comandos", [
                "§bComandos disponibles:",
                "§e/nexus info §f| §e/nexus log §f| §e/nexus load",
                "§e/nexus on §6ID §f| §e/nexus off §6ID",
                "§e/nexus IDS §f| §e/nexus help §f| §e/nexus resources",
                "§7IDS lee los archivos de Mods y muestra las IDs detectadas, estado y archivo."
            ]);
            return true;
        }

        if (action === "info") {
            /* La interfaz de info es la original y se conserva intacta. */
            diagnosticReport();
            nativeMessage("Carpeta Mods: " + rootPath + "Mods/");
            return true;
        }

        if (action === "log") {
            if (args.length > 1) {
                commandFrame("Nexus Log", ["§cUso incorrecto.", "§fSintaxis: §e/nexus log"]);
                return true;
            }
            if (saveLatestLogSnapshot()) {
                commandFrame("Nexus Log", [
                    "§aRegistro guardado correctamente.",
                    "§7Archivo: " + rootPath + "Logs/Nexus_Ultimo.log",
                    "§7El registro se captura antes de mostrar este mensaje."
                ]);
            } else {
                commandFrame("Nexus Log", [
                    "§cNo se pudo guardar el registro.",
                    "§7Comprueba el acceso al almacenamiento y la carpeta Logs/."
                ]);
            }
            return true;
        }

        if (action === "load") {
            if (args.length > 1) {
                commandFrame("Nexus Load", ["§cUso incorrecto.", "§fSintaxis: §e/nexus load"]);
                return true;
            }
            result = publicApi.Loader.loadAll();
            commandFrame("Nexus Load", [
                "§bResultado de carga de mods:",
                "§fArchivos encontrados: §e" + result.found,
                "§fCargas correctas: §a" + result.loaded,
                "§fFallos: " + (result.failed > 0 ? "§c" : "§a") + result.failed
            ]);
            return true;
        }

        if (action === "on" || action === "off") {
            if (!args[1] || args.length !== 2) {
                commandFrame(action === "on" ? "Nexus On" : "Nexus Off", [
                    "§cFalta la ID del mod.",
                    "§fSintaxis: §e/nexus " + action + " §6ID"
                ]);
                return true;
            }
            id = normalizeModId(args[1]);
            if (id === null) {
                commandFrame(action === "on" ? "Nexus On" : "Nexus Off", [
                    "§cLa ID del mod debe ser un entero numérico.",
                    "§fSintaxis: §e/nexus " + action + " §6ID",
                    "§7Ejemplo: §e/nexus " + action + " 5301"
                ]);
                return true;
            }
            if (!mods[id]) {
                commandFrame(action === "on" ? "Nexus On" : "Nexus Off", [
                    "§cLa ID §6" + id + "§c no está registrada en memoria.",
                    "§7Usa §e/nexus IDS§7 para revisar los archivos.",
                    "§7Si aparece como no cargado, ejecuta §e/nexus load§7."
                ]);
                return true;
            }
            if (action === "on") {
                result = enableMod(id);
                commandFrame("Nexus On", [
                    result ? "§aMod activado correctamente." : "§cNo se pudo activar el mod.",
                    "§fID: §e" + id,
                    result ? "§7La activación no garantiza que los recursos nativos funcionen en el juego." : "§7Revisa §e/nexus info §7y §e/nexus log§7."
                ]);
            } else {
                result = disableMod(id);
                if (result) {
                    commandFrame("Nexus Off", [
                        "§aMod desactivado correctamente.",
                        "§fID: §e" + id,
                        "§7La limpieza de recursos nativos puede requerir acciones aparte."
                    ]);
                } else if (mods[id] && mods[id].state === "disabled") {
                    commandFrame("Nexus Off", [
                        "§6El mod quedó desactivado, pero onDisable produjo un error.",
                        "§fID: §e" + id,
                        "§7Revisa §e/nexus log§7 para ver el error."
                    ]);
                } else {
                    commandFrame("Nexus Off", [
                        "§cEl mod no estaba activo o no se pudo desactivar.",
                        "§fID: §e" + id,
                        "§7Revisa §e/nexus info §7y §e/nexus log§7."
                    ]);
                }
            }
            return true;
        }

        if (action === "ids") {
            if (args.length > 1) {
                commandFrame("Nexus IDS", ["§cUso incorrecto.", "§fSintaxis: §e/nexus IDS"]);
                return true;
            }
            if (!canUseJavaFiles()) {
                commandFrame("Nexus IDS", [
                    "§cNo se pueden examinar los archivos de Mods/.",
                    "§7Acceso Java/archivos no disponible en este contexto."
                ]);
                return true;
            }
            result = scanModFileIds();
            lines = [
                "§bEscaneo de archivos de mods:",
                "§fArchivos .js examinados: §e" + result.files.length,
                "§fRegistros/IDs detectados: §e" + result.entries.length
            ];
            if (!result.files.length) lines.push("§6No hay archivos .js en " + rootPath + "Mods/");
            commandFrame("Nexus IDS", lines);
            for (i = 0; i < result.entries.length; i++) {
                entry = result.entries[i];
                lines = [];
                if (entry.id === null) {
                    lines.push("§6ID no detectada §f| §7Archivo: " + entry.file);
                    lines.push("§fEstado: §e" + entry.state + (entry.error ? " §f| §cDetalle: " + entry.error : ""));
                } else {
                    statusColor = (entry.state === "active") ? "§a" : ((entry.state === "failed" || entry.state === "fallo de carga" || entry.state === "error" || entry.state === "conflict") ? "§c" : "§e");
                    lines.push("§fID: §e" + entry.id + (entry.duplicate ? " §c| ID DUPLICADA EN ARCHIVOS" : ""));
                    lines.push("§fEstado: " + statusColor + entry.state + " §f| §7Archivo: " + entry.file);
                    if (entry.error) lines.push("§cDetalle: " + entry.error);
                }
                commandFrame("Nexus IDS", lines);
            }
            return true;
        }

        if (action === "resources") {
            if (args.length > 1) {
                commandFrame("Nexus Resources", ["§cUso incorrecto.", "§fSintaxis: §e/nexus resources"]);
                return true;
            }
            resources = publicApi.Resources.list();
            lines = [
                "§bRecursos declarados: §e" + resources.length,
                "§7Las declaraciones no confirman que Toolbox detecte o fusione los paquetes."
            ];
            if (!resources.length) lines.push("§7No hay declaraciones de recursos registradas.");
            commandFrame("Nexus Resources", lines);
            for (i = 0; i < resources.length; i++) {
                commandFrame("Recurso", [
                    "§fMod: §e" + resources[i].ownerId,
                    "§fID: §b" + resources[i].id,
                    "§fEstado: §7" + resources[i].state
                ]);
            }
            return true;
        }

        commandFrame("Nexus Error", [
            "§cAcción no reconocida.",
            "§fUsa §e/nexus help §fpara ver los comandos disponibles."
        ]);
        return true;
    }

    function processCommand(commandLine) {
        var text = trim(commandLine);
        if (!text) return false;
        text = text.replace(/^\/+/, "");
        var bits = text.split(/\s+/);
        var commandName = lower(bits.shift() || "");
        var args = bits;
        if (commandName === "nexus") return processNexusCommand(args);
        if (commands[commandName]) {
            var command = commands[commandName];
            callAsOwner(command.ownerId, command.handler, [args, text], "command:" + commandName);
            return true;
        }
        return false;
    }

    publicApi._worldReport = diagnosticReport;
    publicApi._dispatch = function (eventName, args) { return fire(eventName, args || []); };
    publicApi._tick = function () {
        tickCount++;
        publicApi.tick = tickCount;
        publicApi.Scheduler.tick();
        fire("tick", [tickCount]);
        if (tickCount % 100 === 0) flushLogs();
    };
    publicApi._command = processCommand;
    publicApi._inspect = function () {
        return { version: VERSION, status: publicApi.status, rootPath: rootPath, mods: publicApi.Mods.list(), files: publicApi.Loader.status(), events: publicApi.Events.names(), tasks: publicApi.Scheduler.list(), commands: publicApi.Commands.list(), items: publicApi.Items.list(), itemStatus: publicApi.Items.status(), resources: publicApi.Resources.list(), idClaims: publicApi.Registry.list(), capabilities: publicApi.Compat.detect() };
    };

    /* Para comandos ModPE registrados por los mods. */
    publicApi._processCommand = processCommand;
    publicApi._safeId = safeId;

    /* La API pública mantiene nombres consistentes para los mods. */
    publicApi.register = publicApi.registerMod;

    return publicApi;
}());

/*
 * Eval auxiliar global: el eval directo corre en el ámbito léxico de esta función,
 * no dentro del IIFE privado de Nexus. Nexus.registerMod sigue siendo accesible como global.
 * Las declaraciones var/función del archivo mod quedan en este ámbito auxiliar y no pisan
 * accidentalmente nombres privados del motor. Esto reduce colisiones, pero NO es sandbox:
 * el código de mods sigue siendo código JavaScript confiable que comparte globales y APIs.
 */
function __nexusEval(code) {
    return eval(String(code));
}

/* Callbacks centralizados de ModPE. Los mods Nexus no deben redefinirlos. */
function newLevel() {
    try {
        Nexus._worldReport();
        Nexus._dispatch("worldEnter", []);
    } catch (e) { Nexus.Logger.error("newLevel: " + String(e)); }
}

function leaveGame() {
    try {
        Nexus._dispatch("worldLeave", []);
        Nexus.Logger.flush();
    } catch (e) { Nexus.Logger.error("leaveGame: " + String(e)); }
}

function modTick() {
    try { Nexus._tick(); }
    catch (e) { Nexus.Logger.error("modTick: " + String(e)); }
}

function useItem(x, y, z, itemId, blockId, side, itemDamage, blockDamage) {
    try {
        if (Nexus._dispatch("useItem", [x, y, z, itemId, blockId, side, itemDamage, blockDamage]) === false && typeof preventDefault === "function") preventDefault();
    } catch (e) { Nexus.Logger.error("useItem: " + String(e)); }
}

function destroyBlock(x, y, z, side) {
    try {
        if (Nexus._dispatch("destroyBlock", [x, y, z, side]) === false && typeof preventDefault === "function") preventDefault();
    } catch (e) { Nexus.Logger.error("destroyBlock: " + String(e)); }
}

function startDestroyBlock(x, y, z, side) {
    try { if (Nexus._dispatch("startDestroyBlock", [x, y, z, side]) === false && typeof preventDefault === "function") preventDefault(); }
    catch (e) { Nexus.Logger.error("startDestroyBlock: " + String(e)); }
}

function continueDestroyBlock(x, y, z, side, progress) {
    try { if (Nexus._dispatch("continueDestroyBlock", [x, y, z, side, progress]) === false && typeof preventDefault === "function") preventDefault(); }
    catch (e) { Nexus.Logger.error("continueDestroyBlock: " + String(e)); }
}

function attackHook(attacker, victim) {
    try { if (Nexus._dispatch("attack", [attacker, victim]) === false && typeof preventDefault === "function") preventDefault(); }
    catch (e) { Nexus.Logger.error("attackHook: " + String(e)); }
}

function deathHook(attacker, victim) {
    try { if (Nexus._dispatch("death", [attacker, victim]) === false && typeof preventDefault === "function") preventDefault(); }
    catch (e) { Nexus.Logger.error("deathHook: " + String(e)); }
}

function entityHurtHook(attacker, victim, halfHearts) {
    try { Nexus._dispatch("entityHurt", [attacker, victim, halfHearts]); }
    catch (e) { Nexus.Logger.error("entityHurtHook: " + String(e)); }
}

function eatHook(hearts, saturationRatio) {
    try { Nexus._dispatch("eat", [hearts, saturationRatio]); }
    catch (e) { Nexus.Logger.error("eatHook: " + String(e)); }
}

function projectileHitEntityHook(projectile, targetEntity) {
    try { Nexus._dispatch("projectileHitEntity", [projectile, targetEntity]); }
    catch (e) { Nexus.Logger.error("projectileHitEntityHook: " + String(e)); }
}

function projectileHitBlockHook(projectile, blockX, blockY, blockZ, side) {
    try { Nexus._dispatch("projectileHitBlock", [projectile, blockX, blockY, blockZ, side]); }
    catch (e) { Nexus.Logger.error("projectileHitBlockHook: " + String(e)); }
}

function entityAddedHook(entity) {
    try { Nexus._dispatch("entityAdded", [entity]); }
    catch (e) { Nexus.Logger.error("entityAddedHook: " + String(e)); }
}

function entityRemovedHook(entity) {
    try { Nexus._dispatch("entityRemoved", [entity]); }
    catch (e) { Nexus.Logger.error("entityRemovedHook: " + String(e)); }
}

function chatHook(message) {
    try { if (Nexus._dispatch("chat", [message]) === false && typeof preventDefault === "function") preventDefault(); }
    catch (e) { Nexus.Logger.error("chatHook: " + String(e)); }
}

function serverMessageReceiveHook(message) {
    try { if (Nexus._dispatch("serverMessage", [message]) === false && typeof preventDefault === "function") preventDefault(); }
    catch (e) { Nexus.Logger.error("serverMessageReceiveHook: " + String(e)); }
}

function procCmd(command) {
    try {
        if (Nexus._processCommand(command)) {
            if (typeof preventDefault === "function") preventDefault();
            return;
        }
        Nexus._dispatch("command", [String(command)]);
    } catch (e) {
        Nexus.Logger.error("procCmd: " + String(e));
    }
}

/* No hace nada en un intérprete de pruebas sin interop Java. */
Nexus.init();