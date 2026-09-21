import assert from "node:assert/strict";
import { CORE_DISCOVERIES, CORE_IMPROVEMENTS, CORE_MISSIONS, CORE_STRUCTURES } from "../module/data/core-items.mjs";
import { CORE_TABLES } from "../module/data/tables.mjs";
import { clampDataSpend, locationEncounterPlan, opportunityOutcome, parseEncounterRewards, resolveChallengeOutcome, secondaryGain, travelEncounterType } from "../module/workflow-rules.mjs";
import { isExactDistribution, validateCreationState } from "../module/creation-rules.mjs";
import { isDestroyedByDamage, successorResetUpdate } from "../module/destruction-rules.mjs";
import { installEffectPlan } from "../module/improvement-rules.mjs";
import { askOracleOutcome } from "../module/oracle-rules.mjs";
import { ADVANCED_EXPLORATION_TABLES, ALIEN_LIFE_COLUMNS } from "../module/data/advanced-exploration-tables.mjs";

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

const extractionTools = CORE_IMPROVEMENTS.find((entry) => entry.key === "advanced-extraction-tools");
const dataAlgorithms = CORE_IMPROVEMENTS.find((entry) => entry.key === "data-exploration-algorithms");
assert.equal(extractionTools.energyCost, 2, "Les Outils d’extraction portent bien le coût imprimé 2E");
assert.equal(dataAlgorithms.energyCost, 2, "Les Algorithmes d’exploration de Données portent bien le coût imprimé 2E");

assert.deepEqual(
  installEffectPlan(extractionTools, {
    energy: { value: 5 },
    resources: { value: 4, max: 10 },
    data: { value: 0, max: 10 }
  }),
  {
    resourceKey: "resources",
    energyCost: 2,
    gain: 1,
    enoughEnergy: true,
    nextEnergy: 3,
    nextValue: 5
  },
  "L’effet d’installation des Outils coûte 2E et accorde +1 Ressource"
);
assert.equal(
  installEffectPlan(dataAlgorithms, {
    energy: { value: 1 },
    resources: { value: 10, max: 10 },
    data: { value: 4, max: 10 }
  }).enoughEnergy,
  false,
  "L’effet d’installation 2E est impossible avec seulement 1 Énergie"
);

assert.equal(CORE_TABLES.length, 6, "6 RollTables de base attendues");

for (const table of Object.values(ADVANCED_EXPLORATION_TABLES)) {
  validateCoverage(table, 1, 100);
}
assert.equal(ADVANCED_EXPLORATION_TABLES.terrainFeatures.entries.length, 100, "100 Caractéristiques de Terrain attendues");
assert.equal(ADVANCED_EXPLORATION_TABLES.structureFeatures.entries.length, 100, "100 Caractéristiques de Structure attendues");
assert.equal(ADVANCED_EXPLORATION_TABLES.structures.entries.length, 50, "50 plages de Structures d100 attendues");
assert.equal(ADVANCED_EXPLORATION_TABLES.descriptors.entries.length, 50, "50 plages de Descripteurs d100 attendues");
assert.equal(ADVANCED_EXPLORATION_TABLES.sky.entries.length, 50, "50 plages de résultats du Ciel attendues");
assert.equal(ADVANCED_EXPLORATION_TABLES.distance.entries.length, 50, "50 plages de résultats À distance attendues");

for (const [column, entries] of Object.entries(ALIEN_LIFE_COLUMNS)) {
  validateCoverage({ name: "Formes de Vie — " + column, entries }, 1, 100);
  assert.equal(entries.length, 50, "50 plages attendues pour la colonne " + column);
}
for (const table of CORE_TABLES) {
  if (table.formula === "1d100") {
    assert.equal(table.entries.length, 50, table.name + " doit avoir 50 entrées d100");
    validateCoverage(table, 1, 100);
  } else if (table.formula === "1d10") {
    validateCoverage(table, 1, 10);
  }
}

assert.equal(clampDataSpend(3, 2), 2, "La dépense de Données est limitée au stock disponible");
assert.equal(clampDataSpend(-2, 10), 0, "La dépense de Données ne peut pas être négative");
assert.equal(travelEncounterType(4), "challenge");
assert.equal(travelEncounterType(5), "none");
assert.equal(travelEncounterType(9), "opportunity");
assert.equal(travelEncounterType(10), "find");
assert.deepEqual(locationEncounterPlan(2), [{ type: "challenge", threat: 3, disadvantage: false }]);
assert.equal(locationEncounterPlan(6).length, 2, "Un 6 génère Défi + Opportunité");
assert.ok(locationEncounterPlan(6).every((entry) => entry.disadvantage), "Le résultat 6 conserve le marqueur (D)");
assert.deepEqual(locationEncounterPlan(10).map((entry) => entry.type), ["challenge", "opportunity", "find", "aspect"]);
assert.equal(secondaryGain("full", 5), 5);
assert.equal(secondaryGain("partial", 5), 2);
assert.equal(secondaryGain("failure", 5), 0);
assert.equal(resolveChallengeOutcome([{ result: "full" }], 2), null, "Une VM 2 exige deux jets enregistrés");
assert.equal(resolveChallengeOutcome([{ result: "full" }, { result: "partial" }], 2), "success", "Une réussite partielle n’est pas un échec du Défi");
assert.equal(resolveChallengeOutcome([{ result: "failure" }, { result: "full" }, { result: "full" }], 3), "failed", "Un seul Échec fait échouer le Défi VM");
assert.equal(opportunityOutcome("full"), "success", "Une Réussite totale réussit l’Opportunité");
assert.equal(opportunityOutcome("partial"), "success", "Une Réussite partielle réussit l’Opportunité avec sa complication");
assert.equal(opportunityOutcome("failure"), "failed", "Un Échec fait échouer l’Opportunité");

assert.equal(askOracleOutcome(1).label, "Non, et aussi…");
assert.equal(askOracleOutcome(2).label, "Non, mais…");
assert.equal(askOracleOutcome(3).label, "Non");
assert.equal(askOracleOutcome(5).label, "Non");
assert.equal(askOracleOutcome(6).label, "Oui");
assert.equal(askOracleOutcome(8).label, "Oui");
assert.equal(askOracleOutcome(9).label, "Oui, mais…");
assert.equal(askOracleOutcome(10).label, "Oui, et aussi…");
assert.equal(askOracleOutcome(12).label, "Oui, et aussi…", "La borne 10+ reste ouverte");

assert.deepEqual(
  parseEncounterRewards("Gagnez 2 Données et 3 Ressources en cas de succès."),
  {
    mode: "all",
    rewards: [
      { resourceKey: "data", amount: 2 },
      { resourceKey: "resources", amount: 3 }
    ]
  },
  "Les gains multiples avec et sont tous appliqués"
);
assert.deepEqual(
  parseEncounterRewards("Gagnez 2 Données ou 3 Ressources en cas de succès."),
  {
    mode: "choice",
    rewards: [
      { resourceKey: "data", amount: 2 },
      { resourceKey: "resources", amount: 3 }
    ]
  },
  "Les gains séparés par ou demandent un choix"
);
assert.deepEqual(
  parseEncounterRewards("Gagnez 1 Énergie."),
  { mode: "all", rewards: [{ resourceKey: "energy", amount: 1 }] }
);

assert.ok(isExactDistribution([5, 3, 4], [3, 4, 5]), "La répartition des Traits est indépendante de l’ordre");
assert.equal(isExactDistribution([5, 5, 3], [3, 4, 5]), false, "Les valeurs de Traits ne peuvent pas être dupliquées");

const validCreation = {
  traits: {
    technology: { value: 5, abilities: { computing: 3, engineering: 2, robotics: 1 } },
    analysis: { value: 4, abilities: { biology: 1, chemistry: 3, physics: 2 } },
    adaptability: { value: 3, abilities: { communication: 2, navigation: 1, survival: 3 } }
  }
};
assert.equal(validateCreationState(validCreation).valid, true, "Une création 3/4/5 et 1/2/3 par Trait est valide");

const invalidCreation = structuredClone(validCreation);
invalidCreation.traits.analysis.abilities.physics = 3;
assert.equal(validateCreationState(invalidCreation).valid, false, "Un doublon de Capacité invalide la création");

assert.equal(isDestroyedByDamage(new Array(19).fill("C"), [], 20), false, "19 dommages ne détruisent pas le PIA");
assert.equal(isDestroyedByDamage(new Array(12).fill("C"), new Array(8).fill("D"), 20), true, "20 Contraintes/Défaillances détruisent le PIA");
assert.equal(isDestroyedByDamage([], new Array(20).fill("D"), 20), true, "20 Défaillances détruisent le PIA");

const successorReset = successorResetUpdate();
assert.equal(successorReset["system.creationCompleted"], false, "Le successeur doit repasser par la création");
assert.equal(successorReset["system.mission.aspectsCurrent"], 0, "Les Aspects de la Mission sont perdus");
assert.equal(successorReset["system.mission.activeKey"], "", "La progression de Mission active est perdue");
assert.deepEqual(successorReset["system.constraints"], [], "Les Contraintes du nouveau PIA repartent à zéro");
assert.deepEqual(successorReset["system.failures"], [], "Les Défaillances du nouveau PIA repartent à zéro");
assert.equal(Object.hasOwn(successorReset, "system.discoveriesUnlocked"), false, "La succession ne réinitialise pas l’historique des Découvertes");
assert.equal(Object.hasOwn(successorReset, "system.destroyed"), false, "Le PIA reste marqué détruit jusqu’à validation du successeur");

console.log("Validation Entité OK");
