import assert from "node:assert/strict";
import { CORE_DISCOVERIES, CORE_IMPROVEMENTS, CORE_MISSIONS, CORE_STRUCTURES } from "../module/data/core-items.mjs";
import { CORE_TABLES } from "../module/data/tables.mjs";

function coveredValues(entries) {
  const values = [];
  for (const entry of entries) {
    const [min, max] = entry.range;
    for (let value = min; value <= max; value += 1) values.push(value);
  }
  return values;
}

function validateCoverage(table, min, max) {
  const values = coveredValues(table.entries);
  const expected = Array.from({ length: max - min + 1 }, (_, index) => min + index);
  assert.deepEqual(values, expected, table.name + " doit couvrir exactement " + min + "–" + max);
}

assert.equal(CORE_IMPROVEMENTS.length, 23, "23 Améliorations attendues, dont les 3 de départ");
assert.equal(CORE_IMPROVEMENTS.filter((entry) => entry.starting).length, 3, "3 Améliorations de départ attendues");
assert.equal(new Set(CORE_IMPROVEMENTS.map((entry) => entry.key)).size, CORE_IMPROVEMENTS.length, "Clés d’Améliorations uniques");

assert.equal(CORE_STRUCTURES.length, 21, "21 Structures attendues");
assert.equal(CORE_STRUCTURES.filter((entry) => entry.repeatable).length, 3, "3 Structures répétables attendues");
assert.ok(CORE_STRUCTURES.filter((entry) => entry.repeatable).every((entry) => entry.maxRanks === 5), "Structures répétables limitées à 5 rangs");
assert.equal(new Set(CORE_STRUCTURES.map((entry) => entry.key)).size, CORE_STRUCTURES.length, "Clés de Structures uniques");

assert.equal(CORE_MISSIONS.length, 21, "21 Missions attendues");
assert.equal(CORE_MISSIONS.filter((entry) => entry.repeatable).length, 3, "3 Missions répétables attendues");
assert.equal(new Set(CORE_MISSIONS.map((entry) => entry.key)).size, CORE_MISSIONS.length, "Clés de Missions uniques");

const structureNames = new Set(CORE_STRUCTURES.map((entry) => entry.name));
for (const mission of CORE_MISSIONS) {
  assert.ok(structureNames.has(mission.structureName), "Structure de Mission inconnue : " + mission.structureName);
}

assert.equal(CORE_DISCOVERIES.length, 10, "10 Découvertes attendues");

assert.equal(CORE_TABLES.length, 6, "6 RollTables de base attendues");
for (const table of CORE_TABLES) {
  if (table.formula === "1d100") {
    assert.equal(table.entries.length, 50, table.name + " doit avoir 50 entrées d100");
    validateCoverage(table, 1, 100);
  } else if (table.formula === "1d10") {
    validateCoverage(table, 1, 10);
  }
}

console.log("Validation Entité OK");
