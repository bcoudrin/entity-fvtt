import { SYSTEM_ID, STARTING_IMPROVEMENTS } from "./constants.mjs";
import { PiaData } from "./data/actor-data.mjs";
import { ImprovementData, MissionData, StructureData } from "./data/item-data.mjs";
import { EntityActor } from "./documents/actor.mjs";
import { EntityItem } from "./documents/item.mjs";
import { PiaSheet } from "./sheets/actor-sheet.mjs";
import { EntityItemSheet } from "./sheets/item-sheet.mjs";
import { ensurePiaJournal } from "./journal.mjs";
import { applyRollConsequence, rerollActionDie, useShieldForRoll } from "./dice.mjs";
import { clearPendingEffects } from "./improvements.mjs";
import { createCoreRollTables } from "./roll-tables.mjs";

async function ensureStartingImprovements(actor) {
  if (!actor || actor.type !== "pia") return;
  const existing = new Set(actor.items.filter((item) => item.type === "improvement").map((item) => item.name));
  const missing = STARTING_IMPROVEMENTS.filter((item) => !existing.has(item.name));
  if (missing.length) await actor.createEmbeddedDocuments("Item", missing);
}

function chatRoot(html) {
  if (html instanceof HTMLElement) return html;
  if (html?.[0] instanceof HTMLElement) return html[0];
  return null;
}

Hooks.once("init", () => {
  console.log(SYSTEM_ID + " | Initialisation");

  CONFIG.Actor.documentClass = EntityActor;
  CONFIG.Item.documentClass = EntityItem;
  CONFIG.Actor.dataModels.pia = PiaData;
  CONFIG.Item.dataModels.improvement = ImprovementData;
  CONFIG.Item.dataModels.structure = StructureData;
  CONFIG.Item.dataModels.mission = MissionData;

  const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig;
  DocumentSheetConfig.registerSheet(foundry.documents.Actor, SYSTEM_ID, PiaSheet, {
    types: ["pia"],
    makeDefault: true
  });
  DocumentSheetConfig.registerSheet(foundry.documents.Item, SYSTEM_ID, EntityItemSheet, {
    types: ["improvement", "structure", "mission"],
    makeDefault: true
  });
});

Hooks.on("createActor", async (actor, options, userId) => {
  if (actor.type !== "pia" || game.user.id !== userId) return;
  await ensureStartingImprovements(actor);
  await ensurePiaJournal(actor);
});

Hooks.on("renderChatMessageHTML", (message, html) => {
  const root = chatRoot(html);
  if (!root) return;

  root.querySelectorAll("[data-entity-chat-action]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      const action = button.dataset.entityChatAction;
      if (action === "constraint") await applyRollConsequence(message, "constraint");
      if (action === "failure") await applyRollConsequence(message, "failure");
      if (action === "reroll") await rerollActionDie(message, Number(button.dataset.dieIndex));
      if (action === "shield") await useShieldForRoll(message, button.dataset.itemId);
    });
  });
});

Hooks.once("ready", () => {
  game.entity = {
    ensureStartingImprovements,
    ensureJournal: ensurePiaJournal,
    clearPendingEffects,
    createCoreRollTables
  };
});