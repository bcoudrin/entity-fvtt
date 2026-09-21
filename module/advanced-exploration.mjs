import { SYSTEM_ID } from "./constants.mjs";
import { ADVANCED_EXPLORATION_TABLES, ALIEN_LIFE_COLUMNS } from "./data/advanced-exploration-tables.mjs";
import { appendJournalEntry } from "./journal.mjs";
import { resolveRangedEntry } from "./workflow-rules.mjs";

const DEFAULT_STATE = {
  expeditionNumber: 0,
  structureCheck: null,
  latest: {},
  alienLife: null
};

function stateCopy(actor) {
  return foundry.utils.mergeObject(
    foundry.utils.deepClone(DEFAULT_STATE),
    foundry.utils.deepClone(actor.getFlag(SYSTEM_ID, "advancedExploration") || {}),
    { inplace: false }
  );
}

async function saveState(actor, state) {
  await actor.setFlag(SYSTEM_ID, "advancedExploration", state);
  actor.sheet?.render({ force: true });
  const panel = foundry.applications.instances.get("entity-advanced-exploration-panel");
  if (panel?.actor?.id === actor.id) panel.render({ force: true });
  return state;
}

function currentExpedition(actor) {
  return Number(actor.system.expeditionNumber || 0);
}

function ensureCurrentState(actor) {
  const state = stateCopy(actor);
  if (Number(state.expeditionNumber || 0) !== currentExpedition(actor)) {
    return {
      ...foundry.utils.deepClone(DEFAULT_STATE),
      expeditionNumber: currentExpedition(actor)
    };
  }
  return state;
}

function latestLocation(actor) {
  const workflow = actor.getFlag(SYSTEM_ID, "workflow") || {};
  return workflow.location || null;
}

async function postOracle(actor, title, body) {
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content:
      "<div class=\"entity-chat entity-oracle-card entity-exploration-oracle-card\">" +
      "<span class=\"entity-kicker\">ORACLE D’EXPLORATION</span>" +
      "<h3>" + title + "</h3>" +
      body +
      "</div>",
    sound: CONFIG.sounds?.dice || "sounds/dice.wav"
  });
}

async function rollTableEntry(tableKey) {
  const table = ADVANCED_EXPLORATION_TABLES[tableKey];
  if (!table) return null;
  const roll = await new Roll(table.formula || "1d100").evaluate();
  const entry = resolveRangedEntry(table.entries, Number(roll.total));
  return {
    tableKey,
    tableName: table.name,
    roll: Number(roll.total),
    text: entry?.text || ""
  };
}

export function getAdvancedExplorationState(actor) {
  return ensureCurrentState(actor);
}

export async function resetAdvancedExploration(actor, expeditionNumber = currentExpedition(actor)) {
  if (!actor || actor.type !== "pia") return null;
  const state = {
    ...foundry.utils.deepClone(DEFAULT_STATE),
    expeditionNumber: Number(expeditionNumber || 0)
  };
  return saveState(actor, state);
}

export async function scanDestinationStructure(actor) {
  if (!actor || actor.type !== "pia") return false;
  const location = latestLocation(actor);
  if (!location) {
    ui.notifications.warn("Identifiez d’abord le Lieu de l’Expédition.");
    return false;
  }

  const state = ensureCurrentState(actor);
  const scan = await new Roll("1d10").evaluate();
  const inside = Number(scan.total) >= 6;
  let structure = null;

  if (inside) structure = await rollTableEntry("structures");

  state.structureCheck = {
    roll: Number(scan.total),
    inside,
    structure
  };
  await saveState(actor, state);

  let body =
    "<p><strong>d10 " + Number(scan.total) + "</strong> — " +
    (inside ? "le Lieu se trouve dans une Structure." : "le Lieu ne se trouve pas dans une Structure.") +
    "</p>";
  if (structure) {
    body +=
      "<p><strong>Structure — d100 " + structure.roll + "</strong> : " +
      structure.text + "</p>";
  }

  await postOracle(actor, "Scanner le Lieu", body);
  await appendJournalEntry(
    actor,
    "Oracle d’Exploration — Structure",
    "<p><strong>Lieu :</strong> " + location.text + "</p>" + body
  );
  return true;
}

export async function rollAdvancedExplorationTable(actor, tableKey) {
  if (!actor || actor.type !== "pia") return false;
  const table = ADVANCED_EXPLORATION_TABLES[tableKey];
  if (!table) return false;

  const result = await rollTableEntry(tableKey);
  const state = ensureCurrentState(actor);
  state.latest[tableKey] = result;
  await saveState(actor, state);

  const body =
    "<p><strong>d100 " + result.roll + "</strong> — " + result.text + "</p>";
  await postOracle(actor, result.tableName, body);
  await appendJournalEntry(
    actor,
    "Oracle d’Exploration — " + result.tableName,
    body
  );
  return true;
}

export async function rollContextFeature(actor) {
  const state = ensureCurrentState(actor);
  if (!state.structureCheck) {
    ui.notifications.warn("Déterminez d’abord si le Lieu se trouve dans une Structure.");
    return false;
  }
  return rollAdvancedExplorationTable(
    actor,
    state.structureCheck.inside ? "structureFeatures" : "terrainFeatures"
  );
}

export async function generateAlienLife(actor) {
  if (!actor || actor.type !== "pia") return false;

  const roll = await new Roll("4d100").evaluate();
  const results = roll.dice?.[0]?.results?.map((entry) => Number(entry.result)) || [];
  while (results.length < 4) {
    const fallback = await new Roll("1d100").evaluate();
    results.push(Number(fallback.total));
  }

  const columns = ["form", "trait", "feature", "behavior"];
  const labels = ["Forme", "Trait", "Caractéristique", "Comportement"];
  const values = columns.map((column, index) => {
    const entry = resolveRangedEntry(ALIEN_LIFE_COLUMNS[column], results[index]);
    return {
      key: column,
      label: labels[index],
      roll: results[index],
      text: entry?.text || ""
    };
  });

  const state = ensureCurrentState(actor);
  state.alienLife = values;
  await saveState(actor, state);

  const body =
    "<div class=\"entity-alien-life-result\">" +
    values.map((value) =>
      "<p><strong>" + value.label + " — d100 " + value.roll + "</strong> : " +
      value.text + "</p>"
    ).join("") +
    "</div>";

  await postOracle(actor, "Forme de Vie Extraterrestre", body);
  await appendJournalEntry(
    actor,
    "Oracle d’Exploration — Forme de Vie Extraterrestre",
    body
  );
  return true;
}
