import { ABILITIES, SYSTEM_ID } from "./constants.mjs";
import { ADVANCED_EXPLORATION_TABLES, ALIEN_LIFE_COLUMNS } from "./data/advanced-exploration-tables.mjs";
import { ADVANCED_NARRATIVE_TABLES } from "./data/advanced-narrative-tables.mjs";
import { appendJournalEntry } from "./journal.mjs";
import { resolveRangedEntry } from "./workflow-rules.mjs";
import {
  aggregateCustomRewards,
  customEncounterRequirements,
  customFindReward,
  customKeywordFromD10,
  customKeywordsReady,
  resolvedCustomKeywords
} from "./custom-encounter-rules.mjs";

const FLAG = "customEncounterDraft";

const DEFAULT_DRAFT = {
  encounterId: "",
  type: "",
  anomaly: null,
  keywordRolls: [],
  findRolls: [],
  parts: [],
  alienLife: null
};

const OPTIONAL_TABLES = {
  incidents: ADVANCED_NARRATIVE_TABLES.incidents,
  actions: ADVANCED_NARRATIVE_TABLES.actions,
  themes: ADVANCED_NARRATIVE_TABLES.themes,
  objects: ADVANCED_NARRATIVE_TABLES.objects,
  information: ADVANCED_NARRATIVE_TABLES.information,
  materials: ADVANCED_NARRATIVE_TABLES.materials,
  descriptors: ADVANCED_EXPLORATION_TABLES.descriptors,
  terrainFeatures: ADVANCED_EXPLORATION_TABLES.terrainFeatures,
  structureFeatures: ADVANCED_EXPLORATION_TABLES.structureFeatures
};

function workflowCopy(actor) {
  return foundry.utils.deepClone(actor.getFlag(SYSTEM_ID, "workflow") || {});
}

function currentEncounter(actor) {
  return workflowCopy(actor).currentEncounter || null;
}

function freshDraft(encounter) {
  return {
    ...foundry.utils.deepClone(DEFAULT_DRAFT),
    encounterId: encounter?.id || "",
    type: encounter?.type || ""
  };
}

function draftCopy(actor) {
  const encounter = currentEncounter(actor);
  const raw = foundry.utils.deepClone(actor.getFlag(SYSTEM_ID, FLAG) || {});
  if (!encounter || raw.encounterId !== encounter.id || raw.type !== encounter.type) {
    return freshDraft(encounter);
  }
  return foundry.utils.mergeObject(foundry.utils.deepClone(DEFAULT_DRAFT), raw, { inplace: false });
}

async function saveDraft(actor, draft) {
  await actor.setFlag(SYSTEM_ID, FLAG, draft);
  const panel = foundry.applications.instances.get("entity-custom-encounter-panel");
  if (panel?.actor?.id === actor.id) panel.render({ force: true });
  return draft;
}

async function rollTable(table) {
  const roll = await new Roll(table.formula || "1d100").evaluate();
  const value = Number(roll.total);
  const entry = resolveRangedEntry(table.entries, value);
  return {
    id: foundry.utils.randomID(),
    tableKey: table.key,
    tableName: table.name,
    roll: value,
    text: entry?.text || ""
  };
}

function rewardText(rewards) {
  return rewards.map((reward) => {
    if (reward.resourceKey === "data") return reward.amount + " Donnée(s)";
    if (reward.resourceKey === "energy") return reward.amount + " Énergie";
    return reward.amount + " Ressource(s)";
  }).join(" + ");
}

function typeLabel(type) {
  if (type === "challenge") return "Défi";
  if (type === "opportunity") return "Opportunité";
  if (type === "find") return "Trouvaille";
  return type;
}

function canCustomize(encounter) {
  if (!encounter || !["challenge", "opportunity", "find"].includes(encounter.type)) return false;
  if (encounter.type === "challenge") return !(encounter.rolls || []).length && !encounter.challengeOutcome;
  if (encounter.type === "opportunity") return !encounter.opportunityResolved;
  if (encounter.type === "find") return !encounter.rewardApplied;
  return false;
}

export function getCustomEncounterDraft(actor) {
  return draftCopy(actor);
}

export function canCustomizeEncounter(actor) {
  return canCustomize(currentEncounter(actor));
}

export async function resetCustomEncounterDraft(actor) {
  const encounter = currentEncounter(actor);
  if (!encounter) return false;
  await saveDraft(actor, freshDraft(encounter));
  return true;
}

export async function generateCustomEncounterBase(actor) {
  const encounter = currentEncounter(actor);
  if (!canCustomize(encounter)) {
    ui.notifications.warn("Cette Rencontre a déjà commencé à être résolue et ne peut plus être remplacée.");
    return false;
  }

  const draft = freshDraft(encounter);

  if (["challenge", "opportunity"].includes(encounter.type)) {
    draft.anomaly = await rollTable(ADVANCED_NARRATIVE_TABLES.anomalies);
    draft.keywordRolls = [];
    for (let i = 0; i < 3; i += 1) {
      const roll = await new Roll("1d10").evaluate();
      draft.keywordRolls.push(customKeywordFromD10(Number(roll.total)));
    }
  }

  const findRollCount = encounter.type === "opportunity" ? 2 : encounter.type === "find" ? 1 : 0;
  draft.findRolls = [];
  for (let i = 0; i < findRollCount; i += 1) {
    const roll = await new Roll("1d10").evaluate();
    draft.findRolls.push(customFindReward(Number(roll.total)));
  }

  await saveDraft(actor, draft);
  return true;
}

export async function rerollCustomAnomaly(actor) {
  const encounter = currentEncounter(actor);
  if (!canCustomize(encounter) || !["challenge", "opportunity"].includes(encounter.type)) return false;
  const draft = draftCopy(actor);
  draft.anomaly = await rollTable(ADVANCED_NARRATIVE_TABLES.anomalies);
  await saveDraft(actor, draft);
  return true;
}

export async function rerollCustomKeywords(actor) {
  const encounter = currentEncounter(actor);
  if (!canCustomize(encounter) || !["challenge", "opportunity"].includes(encounter.type)) return false;
  const draft = draftCopy(actor);
  draft.keywordRolls = [];
  for (let i = 0; i < 3; i += 1) {
    const roll = await new Roll("1d10").evaluate();
    draft.keywordRolls.push(customKeywordFromD10(Number(roll.total)));
  }
  await saveDraft(actor, draft);
  return true;
}

export async function chooseCustomKeyword(actor, index, abilityKey) {
  const draft = draftCopy(actor);
  const slot = Number(index);
  if (!draft.keywordRolls?.[slot] || !ABILITIES[abilityKey]) return false;
  draft.keywordRolls[slot].abilityKey = abilityKey;
  draft.keywordRolls[slot].label = ABILITIES[abilityKey].label;
  await saveDraft(actor, draft);
  return true;
}

export async function rerollCustomFindRewards(actor) {
  const encounter = currentEncounter(actor);
  if (!canCustomize(encounter) || !["opportunity", "find"].includes(encounter.type)) return false;
  const draft = draftCopy(actor);
  const count = encounter.type === "opportunity" ? 2 : 1;
  draft.findRolls = [];
  for (let i = 0; i < count; i += 1) {
    const roll = await new Roll("1d10").evaluate();
    draft.findRolls.push(customFindReward(Number(roll.total)));
  }
  await saveDraft(actor, draft);
  return true;
}

export async function rollCustomEncounterOracle(actor, tableKey) {
  const encounter = currentEncounter(actor);
  if (!canCustomize(encounter)) return false;
  const table = OPTIONAL_TABLES[tableKey];
  if (!table) return false;

  const draft = draftCopy(actor);
  draft.parts.push(await rollTable(table));
  await saveDraft(actor, draft);
  return true;
}

export async function removeCustomEncounterPart(actor, partId) {
  const draft = draftCopy(actor);
  draft.parts = (draft.parts || []).filter((part) => part.id !== partId);
  await saveDraft(actor, draft);
  return true;
}

export async function generateCustomEncounterAlienLife(actor) {
  const encounter = currentEncounter(actor);
  if (!canCustomize(encounter)) return false;

  const draft = draftCopy(actor);
  const columns = [
    ["form", "Forme"],
    ["trait", "Trait"],
    ["feature", "Caractéristique"],
    ["behavior", "Comportement"]
  ];
  draft.alienLife = [];
  for (const [key, label] of columns) {
    const roll = await new Roll("1d100").evaluate();
    const value = Number(roll.total);
    const entry = resolveRangedEntry(ALIEN_LIFE_COLUMNS[key], value);
    draft.alienLife.push({ key, label, roll: value, text: entry?.text || "" });
  }
  await saveDraft(actor, draft);
  return true;
}

function customSummary(draft) {
  const chunks = [];
  if (draft.anomaly) chunks.push("Anomalie : " + draft.anomaly.text);
  for (const part of draft.parts || []) chunks.push(part.tableName + " : " + part.text);
  if (draft.alienLife?.length) {
    chunks.push("Forme de Vie : " + draft.alienLife.map((part) => part.text).join(" · "));
  }
  const rewards = aggregateCustomRewards(draft.findRolls || []);
  if (rewards.length) chunks.push("Gain potentiel : " + rewardText(rewards));
  return chunks.join(" — ");
}

function customDetails(draft) {
  return {
    anomaly: draft.anomaly,
    keywordRolls: foundry.utils.deepClone(draft.keywordRolls || []),
    parts: foundry.utils.deepClone(draft.parts || []),
    alienLife: foundry.utils.deepClone(draft.alienLife || []),
    findRolls: foundry.utils.deepClone(draft.findRolls || [])
  };
}

function appliedEncounter(encounter, draft) {
  const rewards = aggregateCustomRewards(draft.findRolls || []);
  const keywords = resolvedCustomKeywords(draft.keywordRolls || []);

  return {
    ...encounter,
    custom: true,
    originalDetailRoll: encounter.originalDetailRoll ?? encounter.detailRoll ?? null,
    originalText: encounter.originalText ?? encounter.text ?? "",
    detailRoll: null,
    text: customSummary(draft) || (encounter.type === "find" ? "Trouvaille personnalisée." : "Rencontre personnalisée."),
    keywords: ["challenge", "opportunity"].includes(encounter.type) ? keywords : [],
    rewardMode: rewards.length ? "all" : "none",
    rewards,
    rewardApplied: false,
    rolls: [],
    challengeOutcome: null,
    opportunityResolved: false,
    opportunityOutcome: null,
    opportunityRoll: null,
    customDetails: customDetails(draft)
  };
}

function journalBody(encounter) {
  let body = "<p><strong>Rencontre personnalisée — " + typeLabel(encounter.type) + "</strong></p>";
  if (encounter.customDetails?.anomaly) {
    body += "<p><strong>Anomalie — d100 " + encounter.customDetails.anomaly.roll + "</strong> : " +
      encounter.customDetails.anomaly.text + "</p>";
  }
  if (encounter.keywords?.length) {
    body += "<p><strong>Mots-clés :</strong> " +
      encounter.keywords.map((key) => ABILITIES[key]?.label || key).join(", ") + "</p>";
  }
  for (const part of encounter.customDetails?.parts || []) {
    body += "<p><strong>" + part.tableName + " — d100 " + part.roll + "</strong> : " + part.text + "</p>";
  }
  if (encounter.customDetails?.alienLife?.length) {
    body += "<p><strong>Forme de Vie Extraterrestre :</strong> " +
      encounter.customDetails.alienLife.map((part) => part.text).join(" · ") + "</p>";
  }
  if (encounter.rewards?.length) {
    body += "<p><strong>Gain potentiel :</strong> " + rewardText(encounter.rewards) + "</p>";
  }
  if (Number(encounter.threat || 0) > 1) {
    body += "<p><strong>Valeur de Menace : " + encounter.threat + "</strong></p>";
  }
  if (encounter.disadvantage) body += "<p><strong>Désavantage (D)</strong></p>";
  return body;
}

export async function applyCustomEncounter(actor) {
  const workflow = workflowCopy(actor);
  const encounter = workflow.currentEncounter;
  if (!canCustomize(encounter)) {
    ui.notifications.warn("Cette Rencontre ne peut plus être remplacée.");
    return false;
  }

  const draft = draftCopy(actor);
  if (draft.encounterId !== encounter.id || draft.type !== encounter.type) return false;

  const requirements = customEncounterRequirements(encounter.type, draft);
  if (!requirements.ready) {
    if (["challenge", "opportunity"].includes(encounter.type) && !customKeywordsReady(draft.keywordRolls || [])) {
      ui.notifications.warn("Résolvez les trois jets de mot-clé, y compris les résultats « Choisissez-en un ».");
    } else {
      ui.notifications.warn("Générez d’abord les éléments obligatoires de cette Rencontre personnalisée.");
    }
    return false;
  }

  const next = appliedEncounter(encounter, draft);
  workflow.currentEncounter = next;
  await actor.setFlag(SYSTEM_ID, "workflow", workflow);

  const body = journalBody(next);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content:
      "<div class=\"entity-chat entity-custom-encounter-card\">" +
      "<span class=\"entity-kicker\">RENCONTRE PERSONNALISÉE</span>" +
      "<h3>" + typeLabel(next.type) + "</h3>" +
      body +
      "</div>"
  });
  await appendJournalEntry(actor, "Rencontre personnalisée — " + typeLabel(next.type), body);

  const panel = foundry.applications.instances.get("entity-custom-encounter-panel");
  if (panel?.actor?.id === actor.id) panel.close();
  return true;
}
