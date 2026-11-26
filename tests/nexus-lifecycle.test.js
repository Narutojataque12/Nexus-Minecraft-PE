/* Nexus V0.3.1 lifecycle regression tests. Run: node tests/nexus-lifecycle.test.js */
"use strict";
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var source = fs.readFileSync(path.join(__dirname, "../engine/Nexus_V0.3.1.js"), "utf8");
function engine() { var context = {}; vm.runInNewContext(source, context); return context.Nexus; }
function test(name, fn) { try { fn(); console.log("PASS " + name); } catch (e) { console.error("FAIL " + name + ": " + e.message); process.exitCode = 1; } }

test("global listener does not inherit nested mod ownership", function () {
  var n = engine(), id = 8101;
  n.registerMod({id:id,onEnable:function(api){api.Events.on("outer",function(){api.Events.emit("inner",[]);});}});
  n.Mods.enable(id);
  n.Events.on("inner",function(){n.Scheduler.after(1,function(){});});
  n._dispatch("outer",[]);
  assert.strictEqual(n.Scheduler.count(String(id)),0);
});

test("disable releases resource declarations and non-native registry claims", function () {
  var n = engine(), id = 8102;
  n.registerMod({id:id,onEnable:function(api){api.Resources.declare("r","textures/blocks/a","https://example.invalid/a.png");api.Registry.claim("block",240,"probe");}});
  n.Mods.enable(id); n.Mods.disable(id);
  assert.strictEqual(n.Resources.list(String(id)).length,0);
  assert.strictEqual(n.Registry.list(String(id)).length,0);
});

test("disabling in an event stops later callbacks in the same dispatch", function () {
  var n = engine(), id = 8103, calls = 0;
  n.registerMod({id:id,onEnable:function(api){api.Events.on("probe",function(){api.Mods.disable(id);});api.Events.on("probe",function(){calls++;});}});
  n.Mods.enable(id); n._dispatch("probe",[]);
  assert.strictEqual(calls,0);
});

test("recursive enable from onLoad is rejected without repeating onLoad", function () {
  var n = engine(), id = 8104, calls = 0, nested;
  n.registerMod({id:id,onLoad:function(api){calls++;nested=api.Mods.enable(id);}});
  n.Mods.enable(id);
  assert.strictEqual(calls,1);
  assert.strictEqual(nested,false);
});

test("disable requested during enable is rejected cleanly", function () {
  var n = engine(), id = 8105, result;
  n.registerMod({id:id,onEnable:function(api){result=api.Mods.disable(id);}});
  n.Mods.enable(id);
  assert.strictEqual(result,false);
  assert.strictEqual(n.Mods.get(id).state,"active");
});
