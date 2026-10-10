/* =====================================================================
   NEXUS v0.1.0 - Motor base de mods para ModPE / Toolbox
   Objetivo previsto: Minecraft PE 1.0.9 + Toolbox 3.2.29
   Dialecto: JavaScript ES5 (Rhino)

   IMPORTANTE:
   - Instala ESTE archivo como script principal en Toolbox.
   - Los mods Nexus van en /sdcard/Nexus/Mods/*.js
   - Los mods se ejecutan en el mismo entorno global; no existe sandbox.
   - La compatibilidad real debe comprobarse en el dispositivo objetivo.
   ===================================================================== */

var Nexus = (function () {
    var VERSION = "0.2.0";
    var ROOT_NAME = "Nexus";
    var rootPath = "/sdcard/Nexus/";
    var dirsReady = false;
    var started = false;
    var tickCount = 0;
    var worldActive = false;
    var currentOwner = null;
    var currentLoadingFile = null;
    var mods = {};
    var modOrder = [];
    var eventListeners = {};
    var listenerSequence = 1;
    var tasks = [];
    var taskSequence = 1;
    var commands = {};
    var fileStates = {};
    var resourceDeclarations = {};
    var configCache = {};
    var logBuffer = [];
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

    function lower(value) {
        return String(value || "").toLowerCase();
    }

    function nativeMessage(text) {
        try {
            if (typeof clientMessage === "function") {
                clientMessage("§b[Nexus] §f" + String(text));
                return;
            }
        } catch (ignoreMessage) {}
        try {
            if (typeof print === "function") print("[Nexus] " + String(text));
        } catch (ignorePrint) {}
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
        if (logBuffer.length > maxLogBuffer) logBuffer.shift();
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
        return {
            version: VERSION,
            id: ownerId,
            Events: Nexus.Events,
            Scheduler: Nexus.Scheduler,
            Logger: Nexus.Logger,
            Mods: Nexus.Mods,
            Config: Nexus.Config,
            Data: Nexus.Data,
            Commands: Nexus.Commands,
            Resources: Nexus.Resources,
            Compat: Nexus.Compat,
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

    function fire(eventName, args) {
        var list = eventListeners[eventName];
        if (!list || list.length === 0) return true;
        list = list.slice(0);
        var i, result, allowed = true;
        for (i = 0; i < list.length; i++) {
            if (list[i].active !== true) continue;
            result = callAsOwner(list[i].ownerId, list[i].fn, args || [], eventName);
            if (result === false) allowed = false;
        }
        return allowed;
    }

    function addListener(eventName, fn, ownerId) {
        eventName = trim(eventName);
        if (!eventName || typeof fn !== "function") return null;
        ownerId = ownerId || currentOwner || null;
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
        if (!tokenOrName) return false;
        for (name in eventListeners) {
            if (!own(eventListeners, name)) continue;
            list = eventListeners[name];
            for (i = list.length - 1; i >= 0; i--) {
                if (list[i].token === tokenOrName ||
                    (name === tokenOrName && (!fn || list[i].fn === fn) && (!ownerId || list[i].ownerId === ownerId))) {
                    list.splice(i, 1);
                    changed = true;
                }
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
            emit: function (eventName, args) { return fire(eventName, args || []); },
            count: function (eventName) { return eventListeners[eventName] ? eventListeners[eventName].length : 0; },
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
                tasks.push({ id: id, ownerId: currentOwner || null, due: tickCount + ticks, interval: 0, fn: fn });
                return id;
            },
            every: function (interval, fn) {
                interval = Math.max(1, parseInt(interval, 10) || 1);
                if (typeof fn !== "function") return null;
                var id = "task_" + taskSequence++;
                tasks.push({ id: id, ownerId: currentOwner || null, due: tickCount + interval, interval: interval, fn: fn });
                return id;
            },
            cancel: function (id) {
                var i;
                for (i = tasks.length - 1; i >= 0; i--) {
                    if (tasks[i].id === id) { tasks.splice(i, 1); return true; }
                }
                return false;
            },
            tick: function () {
                var snapshot = tasks.slice(0);
                var i, task, stillExists, j;
                for (i = 0; i < snapshot.length; i++) {
                    task = snapshot[i];
                    if (task.due > tickCount) continue;
                    stillExists = false;
                    for (j = 0; j < tasks.length; j++) if (tasks[j].id === task.id) stillExists = true;
                    if (!stillExists) continue;
                    callAsOwner(task.ownerId, task.fn, [tickCount], "scheduled task");
                    for (j = tasks.length - 1; j >= 0; j--) {
                        if (tasks[j].id === task.id) {
                            if (task.interval > 0) tasks[j].due = tickCount + task.interval;
                            else tasks.splice(j, 1);
                            break;
                        }
                    }
                }
            },
            cancelOwner: function (ownerId) { removeOwnedTasks(ownerId); },
            count: function () { return tasks.length; }
        },

        Mods: {
            register: function (definition) { return publicApi.registerMod(definition); },
            get: function (id) { return mods[id] || null; },
            list: function () {
                var out = [], i, rec;
                for (i = 0; i < modOrder.length; i++) {
                    rec = mods[modOrder[i]];
                    if (rec) out.push({ id: rec.id, name: rec.name, version: rec.version, state: rec.state, errors: rec.errors, file: rec.sourceFile });
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
                var i;
                for (i = modOrder.length - 1; i >= 0; i--) disableMod(modOrder[i]);
                return true;
            }
        },

        Commands: {
            register: function (name, handler, description) {
                name = lower(trim(name)).replace(/^\/+/, "");
                if (!/^[a-z0-9._-]{1,40}$/.test(name) || typeof handler !== "function") return false;
                if (name === "nexus") return false;
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
                var caps = {};
                function present(path) {
                    var parts = path.split("."), value, i;
                    try {
                        value = (function () { return this; }());
                        if (parts[0] === "global") parts.shift();
                        for (i = 0; i < parts.length; i++) {
                            if (value === null || value === undefined) return false;
                            value = value[parts[i]];
                        }
                        /* Rhino may expose Java classes as host objects, not JS functions. */
                        return value !== null && value !== undefined;
                    } catch (e) { return false; }
                }
                var names = ["Player.getEntity", "Player.getX", "Player.getY", "Player.getZ", "Entity.getX", "Entity.getY", "Entity.getZ", "Level.getTile", "Level.setTile", "Level.addParticle", "ModPE.setItem", "ModPE.overrideTexture", "ModPE.readData", "ModPE.saveData", "preventDefault", "clientMessage", "java.io.File"];
                var i;
                for (i = 0; i < names.length; i++) caps[names[i]] = present(names[i]);
                return {
                    runtime: canUseJavaFiles() ? "Rhino/Java interop detectable" : "Java interop unavailable in this context",
                    capabilities: caps,
                    note: "La presencia de una función no prueba que funcione en MCPE 1.0.9; requiere prueba real."
                };
            },
            has: function (path) {
                var parts = String(path || "").split("."), value, i;
                try {
                    if (!parts.length || !parts[0]) return false;
                    value = (function () { return this; }());
                    for (i = 0; i < parts.length; i++) {
                        if (value === null || value === undefined) return false;
                        value = value[parts[i]];
                    }
                    return value !== null && value !== undefined;
                } catch (e) { return false; }
            }
        },

        Resources: {
            /* Declaración lógica. No descubre ni combina automáticamente paquetes de Toolbox. */
            declare: function (resourceId, targetTexture, sourceUrl, notes) {
                resourceId = trim(resourceId);
                if (!safeId(resourceId)) return false;
                var bucket = ownerResourceBucket(currentOwner);
                bucket[resourceId] = {
                    id: resourceId,
                    target: String(targetTexture || ""),
                    source: String(sourceUrl || ""),
                    notes: String(notes || ""),
                    ownerId: currentOwner || "_global",
                    state: "declared-only"
                };
                log("INFO", "Recurso declarado (sin aplicar): " + resourceId);
                return true;
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
                try {
                    if (typeof ModPE === "undefined" || !ModPE || typeof ModPE.overrideTexture !== "function") {
                        log("WARN", "ModPE.overrideTexture no está disponible.");
                        return false;
                    }
                    if (!targetTexture || !sourceUrl) return false;
                    ModPE.overrideTexture(String(targetTexture), String(sourceUrl));
                    log("INFO", "Se solicitó overrideTexture para " + String(targetTexture) + ". Verifica el resultado en el juego.");
                    return true;
                } catch (e) {
                    log("ERROR", "overrideTexture falló: " + String(e));
                    return false;
                }
            },
            status: function () {
                return {
                    automaticToolboxPackDiscovery: false,
                    automaticPackMerging: false,
                    modPEOverrideTextureAvailable: (typeof ModPE !== "undefined" && ModPE && typeof ModPE.overrideTexture === "function"),
                    note: "La API ModPE.overrideTexture no equivale a controlar la sección de texturas de Toolbox."
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
            if (!definition || typeof definition !== "object") return false;
            var id = trim(definition.id);
            if (!safeId(id)) {
                log("ERROR", "Mod rechazado: ID ausente o inválido.");
                return false;
            }
            if (currentLoadingFile && id !== currentLoadingFile) {
                log("ERROR", "El ID '" + id + "' debe coincidir con el nombre del archivo '" + currentLoadingFile + ".js'.");
                return false;
            }
            if (mods[id]) {
                log("ERROR", "ID de mod duplicado: " + id);
                return false;
            }
            var rec = {
                id: id,
                name: String(definition.name || id),
                version: String(definition.version || "0.1.0"),
                description: String(definition.description || ""),
                author: String(definition.author || ""),
                definition: definition,
                sourceFile: currentLoadingFile ? currentLoadingFile + ".js" : null,
                state: "registered",
                loadedOnce: false,
                errors: 0,
                lastError: null,
                registeredAt: timestamp()
            };
            mods[id] = rec;
            modOrder.push(id);
            log("INFO", "Mod registrado: " + id + " v" + rec.version);
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
                var stem = fileName.substring(0, fileName.length - 3);
                if (!safeId(stem)) return false;
                if (fileStates[fileName] && fileStates[fileName].state === "active") {
                    nativeMessage(fileName + " ya está activo.");
                    return false;
                }
                if (fileStates[fileName] && fileStates[fileName].state === "disabled") {
                    nativeMessage(fileName + " ya fue cargado. Usa /nexus enable " + stem + ".");
                    return false;
                }
                var code = readText(rootPath + "Mods/" + fileName);
                if (code === null || trim(code) === "") {
                    fileStates[fileName] = { state: "failed", error: "Archivo vacío o inaccesible" };
                    log("ERROR", "Archivo vacío o inaccesible: " + fileName);
                    return false;
                }
                var before = mods[stem] ? true : false;
                currentLoadingFile = stem;
                try {
                    /* eval es necesario para este prototipo Rhino; no ofrece aislamiento. */
                    eval(code);
                    if (!mods[stem] || before) {
                        throw new Error("El archivo debe registrar exactamente un mod con ID '" + stem + "'.");
                    }
                    mods[stem].sourceFile = fileName;
                    fileStates[fileName] = { state: "registered", error: null };
                    var enabled = enableMod(stem);
                    fileStates[fileName].state = enabled ? "active" : "failed";
                    if (enabled) nativeMessage("Mod activo: " + stem);
                    else nativeMessage("No se pudo activar " + stem + "; revisa Nexus.log.");
                    return enabled;
                } catch (e) {
                    if (mods[stem] && !before) {
                        removeOwnedListeners(stem);
                        removeOwnedTasks(stem);
                        removeOwnedCommands(stem);
                        delete mods[stem];
                        var idx = modOrder.indexOf ? modOrder.indexOf(stem) : -1;
                        if (idx >= 0) modOrder.splice(idx, 1);
                    }
                    fileStates[fileName] = { state: "failed", error: String(e) };
                    log("ERROR", "Carga fallida " + fileName + ": " + String(e));
                    nativeMessage("Error al cargar " + fileName + ": " + String(e));
                    return false;
                } finally {
                    currentLoadingFile = null;
                }
            },
            loadAll: function () {
                var list = this.listFiles();
                var loaded = 0, failed = 0, i;
                for (i = 0; i < list.length; i++) {
                    if (this.load(list[i])) loaded++;
                    else failed++;
                }
                log("INFO", "Carga finalizada; activos nuevos=" + loaded + ", omisiones/fallos=" + failed);
                if (list.length > 0) nativeMessage("Carga terminada: " + loaded + " activos, " + failed + " omitidos/fallidos.");
                return { found: list.length, loaded: loaded, failed: failed };
            },
            status: function () {
                var out = [], key;
                for (key in fileStates) if (own(fileStates, key)) out.push({ file: key, state: fileStates[key].state, error: fileStates[key].error || null });
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
        var rec = mods[id];
        if (!rec) return false;
        if (rec.state === "active") return true;
        var def = rec.definition;
        rec.state = "enabling";
        if (!rec.loadedOnce && typeof def.onLoad === "function") {
            var errorsBeforeLoad = rec.errors;
            callAsOwner(id, def.onLoad, [apiFor(id)], "onLoad");
            /* Un error de onLoad impide activar el mod, pero no revierte efectos externos. */
            if (rec.errors > errorsBeforeLoad) {
                removeOwnedListeners(id);
                removeOwnedTasks(id);
                removeOwnedCommands(id);
                removeOwnedResources(id);
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
            var beforeErrors = rec.errors;
            callAsOwner(id, def.onEnable, [apiFor(id)], "onEnable");
            if (rec.errors > beforeErrors) {
                removeOwnedListeners(id);
                removeOwnedTasks(id);
                removeOwnedCommands(id);
                removeOwnedResources(id);
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
        var rec = mods[id];
        if (!rec) return false;
        if (rec.state !== "active" && rec.state !== "failed" && rec.state !== "enabling") return true;
        if (typeof rec.definition.onDisable === "function") callAsOwner(id, rec.definition.onDisable, [apiFor(id)], "onDisable");
        removeOwnedListeners(id);
        removeOwnedTasks(id);
        removeOwnedCommands(id);
        rec.state = "disabled";
        if (rec.sourceFile && fileStates[rec.sourceFile]) fileStates[rec.sourceFile].state = "disabled";
        log("INFO", "Mod desactivado (limpieza best-effort): " + id);
        return true;
    }

    function processNexusCommand(args) {
        var action = lower(args[0] || "help");
        if (action === "info") action = "status";
        if (action === "ids") action = "list";
        var id;
        if (action === "help") {
            nativeMessage("Comandos: .nexus help | info | ids | load all | load <archivo.js> | enable <id> | disable <id> | resources");
            return true;
        }
        if (action === "status") {
            nativeMessage("§l§a[Nexus] V" + VERSION + " |§l§6 Mods:" + modOrder.length + " |§l§2 Ticks:" + tickCount + " |§l§aEstado:" + publicApi.status);
            nativeMessage("Carpeta Mods: " + rootPath + "Mods/");
            return true;
        }
        if (action === "list") {
            var list = publicApi.Mods.list(), i;
            if (!list.length) nativeMessage("No hay mods registrados.");
            for (i = 0; i < list.length; i++) nativeMessage(list[i].id + " v" + list[i].version + " - " + list[i].state + " - errores=" + list[i].errors);
            return true;
        }
        if (action === "load") {
            if (!args[1] || lower(args[1]) === "all") {
                var summary = publicApi.Loader.loadAll();
                nativeMessage("Encontrados=" + summary.found + ", activos nuevos=" + summary.loaded + ", omitidos/fallos=" + summary.failed);
            } else publicApi.Loader.load(args[1]);
            return true;
        }
        if (action === "enable") {
            id = args[1];
            nativeMessage(id && enableMod(id) ? "Activado: " + id : "No se pudo activar: " + id);
            return true;
        }
        if (action === "disable") {
            id = args[1];
            nativeMessage(id && disableMod(id) ? "Desactivado: " + id : "No se pudo desactivar: " + id);
            return true;
        }
        if (action === "resources") {
            var resources = publicApi.Resources.list(), j;
            nativeMessage("Declaraciones de recursos: " + resources.length + ". No equivale a detectar paquetes de Toolbox.");
            for (j = 0; j < resources.length; j++) nativeMessage(resources[j].ownerId + ": " + resources[j].id + " [" + resources[j].state + "]");
            return true;
        }
        nativeMessage("Acción desconocida. Usa /nexus help");
        return true;
    }

    function processCommand(commandLine) {
        var text = trim(commandLine);
        if (!text) return false;
        text = text.replace(/^[/\.]+/, "");
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
        return { version: VERSION, status: publicApi.status, rootPath: rootPath, mods: publicApi.Mods.list(), files: publicApi.Loader.status(), events: publicApi.Events.names(), tasks: tasks.length, commands: publicApi.Commands.list(), resources: publicApi.Resources.list(), capabilities: publicApi.Compat.detect() };
    };

    /* Para comandos ModPE registrados por los mods. */
    publicApi._processCommand = processCommand;
    publicApi._safeId = safeId;

    /* La API pública mantiene nombres consistentes para los mods. */
    publicApi.register = publicApi.registerMod;

    return publicApi;
}());

/* Callbacks centralizados de ModPE. Los mods Nexus no deben redefinirlos. */
function newLevel() {
    try { Nexus._dispatch("worldEnter", []); }
    catch (e) { Nexus.Logger.error("newLevel: " + String(e)); }
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