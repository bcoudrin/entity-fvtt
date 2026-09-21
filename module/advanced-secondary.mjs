import { SYSTEM_ID } from "./constants.mjs";
import { CORE_TABLES } from "./data/tables.mjs";
import { ADVANCED_EXPLORATION_TABLES, ALIEN_LIFE_COLUMNS } from "./data/advanced-exploration-tables.mjs";
import { ADVANCED_NARRATIVE_TABLES } from "./data/advanced-narrative-tables.mjs";
import { appendJournalEntry } from "./journal.mjs";
import { resolveRangedEntry } from "./workflow-rules.mjs";

const DEFAULT_STATE = {
  expeditionNumber: 0,
  kind: "",
  outcome: "",
  setting: null,
  latest: {},
  alienLife: null
};

export const SECONDARY_ADVANCED_DEFINITIONS = {
  data: {
    label: "Collecte de Données",
    full: ["information", "themes", "actions", "objects", "anomalies", "alienLife"],
    partial: ["incidents", "contextFeature", "objects", "anomalies", "alienLife", "actions"]
  },
  resources: {
    label: "Collecte de Ressources",
    full: ["materials", "objects", "actions"],
    partial: ["incidents", "contextFeature", "objects", "anomalies", "alienLife", "actions"]
  },
  energy: {
    label: "Recharge d’Énergie",
    full: ["materials", "objects", "alienLife", "descriptors", "actions"],
    partial: ["incidents", "contextFeature", "objects", "anomalies", "alienLife", "actions"]
  }
};

const TABLES = {
  ...ADVANCED_NARRATIVE_TABLES,
  descriptors: ADVANCED_EXPLORATION_TABLES.descriptors,
  terrainFeatures: ADVANCED_EXPLORATION_TABLES.terrainFeatures,
  structureFeatures: ADVANCED_EXPLORATION_TABLES.structureFeatures,
  structures: ADVANCED_EXPLORATION_TABLES.structures
};

function workflowLocation(actor) {
  return actor.getFlag(SYSTEM_ID, "workflow")?.location || null;
}

function currentExpedition(actor) {
  return Number(actor.system.expeditionNumber || 0);
}

function stateCopy(actor) {
  const raw = foundry.utils.deepClone(actor.getFlag(SYSTEM_ID, "advancedSecondary") || {});
  const merged = foundry.utils.mergeObject(foundry.utils.deepClone(DEFAULT_STATE), raw, { inplace: false });
  if (Number(merged.expeditionNumber || 0) !== currentExpedition(actor)) {
    return { ...foundry.utils.deepClone(DEFAULT_STATE), expeditionNumber: currentExpedition(actor) };
  }
  return merged;
}

async function saveState(actor, state) {
  await actor.setFlag(SYSTEM_ID, "advancedSecondary", state);
  const panel = foundry.applications.instances.get("entity-advanced-secondary-panel");
  if (panel?.actor?.id === actor.id) panel.render({ force: true });
  return state;
}

function coreTable(key) {
  return CORE_TABLES.find((table) => table.key === key);
}

async function rollEntry(table) {
  if (!table) return null;
  const roll = await new Roll(table.formula || "1d100").evaluate();
  const entry = resolveRangedEntry(table.entries, Number(roll.total));
  return {
    tableKey: table.key,
    tableName: table.name,
    roll: Number(roll.total),
    text: entry?.text || ""
  };
}

async function postSecondaryOracle(actor, title, body) {
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content:
      "<div class=\"entity-chat entity-oracle-card entity-secondary-oracle-card\">" +
      "<span class=\"entity-kicker\">ORACLE — ACTIVITÉ SECONDAIRE</span>" +
      "<h3>" + title + "</h3>" +
      body +
      "</div>",
    sound: CONFIG.sounds?.dice || "sounds/dice.wav"
  });
}

function settingSummary(setting) {
  if (!setting) return "";
  let body = "<p><strong>Lieu :</strong> " + setting.location.text + "</p>";
  body += "<p><strong>d10 " + setting.structureRoll + "</strong> — " +
    (setting.insideStructure ? "dans une Structure" : "terrain ouvert") + ".</p>";
  if (setting.structure) {
    body += "<p><strong>Structure — d100 " + setting.structure.roll + "</strong> : " + setting.structure.text + "</p>";
  }
  if (setting.contextFeature) {
    body += "<p><strong>" + setting.contextFeature.tableName + " — d100 " + setting.contextFeature.roll +
      "</strong> : " + setting.contextFeature.text + "</p>";
  }
  return body;
}

export function getAdvancedSecondaryState(actor) {
  return stateCopy(actor);
}

export async function resetAdvancedSecondary(actor, expeditionNumber = currentExpedition(actor)) {
  if (!actor || actor.type !== "pia") return null;
  return saveState(actor, {
    ...foundry.utils.deepClone(DEFAULT_STATE),
    expeditionNumber: Number(expeditionNumber || 0)
  });
}

export async function selectAdvancedSecondaryKind(actor, kind) {
  if (!SECONDARY_ADVANCED_DEFINITIONS[kind]) return false;
  const state = stateCopy(actor);
  state.kind = kind;
  state.outcome = "";
  state.latest = {};
  state.alienLife = null;
  await saveState(actor, state);
  return true;
}

export async function setAdvancedSecondaryOutcome(actor, kind, outcome) {
  if (!SECONDARY_ADVANCED_DEFINITIONS[kind]) return false;
  const state = stateCopy(actor);
  state.kind = kind;
  state.outcome = ["full", "partial", "failure"].includes(outcome) ? outcome : "";
  await saveState(actor, state);
  return true;
}

export async function prepareAdvancedSecondarySetting(actor, kind, locationMode = "current") {
  if (!SECONDARY_ADVANCED_DEFINITIONS[kind]) return false;

  const state = stateCopy(actor);
  state.kind = kind;

  let location;
  if (locationMode === "elsewhere") {
    location = await rollEntry(coreTable("locations"));
    if (location) {
      location = { roll: location.roll, text: location.text, source: "elsewhere" };
    }
  } else {
    const current = workflowLocation(actor);
    if (!current) {
      ui.notifications.warn("Aucun Lieu courant n’est disponible pour cette Expédition.");
      return false;
    }
    location = { roll: current.roll, text: current.text, source: "current" };
  }

  const structureRoll = await new Roll("1d10").evaluate();
  const insideStructure = Number(structureRoll.total) >= 6;
  const structure = insideStructure ? await rollEntry(TABLES.structures) : null;
  const contextFeature = await rollEntry(
    insideStructure ? TABLES.structureFeatures : TABLES.terrainFeatures
  );

  state.setting = {
    locationMode,
    location,
    structureRoll: Number(structureRoll.total),
    insideStructure,
    structure,
    contextFeature
  };
  await saveState(actor, state);

  const title = SECONDARY_ADVANCED_DEFINITIONS[kind].label + " — Préparer le Terrain";
  const body = settingSummary(state.setting);
  await postSecondaryOracle(actor, title, body);
  await appendJournalEntry(actor, "Oracle — " + title, body);
  return true;
}

export async function rollAdvancedSecondaryOracle(actor, tableKey) {
  const state = stateCopy(actor);
  if (!state.kind) {
    ui.notifications.warn("Choisissez d’abord l’Activité Secondaire à enrichir.");
    return false;
  }

  if (tableKey === "contextFeature") {
    const inside = Boolean(state.setting?.insideStructure);
    tableKey = inside ? "structureFeatures" : "terrainFeatures";
  }

  const table = TABLES[tableKey];
  if (!table) return false;
  const result = await rollEntry(table);
  state.latest[tableKey] = result;
  await saveState(actor, state);

  const body = "<p><strong>d100 " + result.roll + "</strong> — " + result.text + "</p>";
  await postSecondaryOracle(actor, result.tableName, body);
  await appendJournalEntry(actor, "Oracle — " + result.tableName, body);
  return true;
}

export async function generateAdvancedSecondaryAlienLife(actor) {
  const state = stateCopy(actor);
  if (!state.kind) {
    ui.notifications.warn("Choisissez d’abord l’Activité Secondaire à enrichir.");
    return false;
  }

  const values = [];
  const columns = [
    ["form", "Forme"],
    ["trait", "Trait"],
    ["feature", "Caractéristique"],
    ["behavior", "Comportement"]
  ];

  for (const [column, label] of columns) {
    const roll = await new Roll("1d100").evaluate();
    const entry = resolveRangedEntry(ALIEN_LIFE_COLUMNS[column], Number(roll.total));
    values.push({ key: column, label, roll: Number(roll.total), text: entry?.text || "" });
  }

  state.alienLife = values;
  await saveState(actor, state);

  const body = values.map((value) =>
    "<p><strong>" + value.label + " — d100 " + value.roll + "</strong> : " + value.text + "</p>"
  ).join("");
  await postSecondaryOracle(actor, "Forme de Vie Extraterrestre", body);
  await appendJournalEntry(actor, "Oracle — Forme de Vie Extraterrestre", body);
  return true;
}

export function suggestedSecondaryOracles(kind, outcome) {
  const definition = SECONDARY_ADVANCED_DEFINITIONS[kind];
  if (!definition) return [];
  if (outcome === "full") return definition.full;
  if (outcome === "partial") return definition.partial;
  return [];
}
