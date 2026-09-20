import { CORE_DATA_VERSION, SYSTEM_ID } from "./constants.mjs";
import { PiaData } from "./data/actor-data.mjs";
import { ImprovementData, MissionData, StructureData } from "./data/item-data.mjs";
import { CORE_IMPROVEMENTS } from "./data/core-items.mjs";
import { EntityActor } from "./documents/actor.mjs";
import { EntityItem } from "./documents/item.mjs";
import { PiaSheet } from "./sheets/actor-sheet.mjs";
import { EntityItemSheet } from "./sheets/item-sheet.mjs";
import { ExpeditionPanel } from "./apps/expedition-panel.mjs";
import { ensurePiaJournal } from "./journal.mjs";
import { applyRollConsequence, rerollWithImprovement, rerollWithStructure, useShieldForRoll } from "./dice.mjs";
import { clearPendingEffects, removePendingEffectsForItem } from "./improvements.mjs";
import { createCoreRollTables } from "./roll-tables.mjs";
import { seedCoreContent } from "./content-seed.mjs";
import { applySecondaryGain, resolveSecondaryFailure } from "./workflow.mjs";

function embeddedImprovementData(definition) {
  const { key, name, ...system } = definition;
  return {
    name,
    type: "improvement",
    system,
    flags: { entity: { coreKey: key } }
  };
}

async function ensureStartingImprovements(actor) {
  if (!actor || actor.type !== "pia") return;
  const existingKeys = new Set(
    actor.items
      .filter((item) => item.type === "improvement")
      .map((item) => item.getFlag(SYSTEM_ID, "coreKey"))
      .filter(Boolean)
  );
  const existingNames = new Set(actor.items.filter((item) => item.type === "improvement").map((item) => item.name));

  const missing = CORE_IMPROVEMENTS
    .filter((definition) => definition.starting)
    .filter((definition) => !existingKeys.has(definition.key) && !existingNames.has(definition.name))
    .map(embeddedImprovementData);

  if (missing.length) await actor.createEmbeddedDocuments("Item", missing);
}

async function applyInstallEffect(item) {
  const actor = item.parent;
  if (!actor || actor.documentName !== "Actor" || actor.type !== "pia" || item.type !== "improvement") return;
  if (item.getFlag(SYSTEM_ID, "installApplied")) return;

  const type = item.system.effectType;
  if (!["installResource", "installData"].includes(type)) return;

  const resourceKey = type === "installResource" ? "resources" : "data";
  const current = Number(actor.system[resourceKey]?.value || 0);
  const max = Number(actor.system[resourceKey]?.max || 10);
  const gain = Number(item.system.effectValue || 0);

  await actor.update({ ["system." + resourceKey + ".value"]: Math.min(max, current + gain) });
  await item.setFlag(SYSTEM_ID, "installApplied", true);
  ui.notifications.info(item.name + " : +" + gain + (resourceKey === "resources" ? " Ressource" : " Donnée") + ".");
}

async function normalizeEmbeddedItem(item) {
  const actor = item.parent;
  if (!actor || actor.documentName !== "Actor" || actor.type !== "pia") return;

  if (item.type === "improvement") {
    const duplicates = actor.items.filter((candidate) =>
      candidate.id !== item.id &&
      candidate.type === "improvement" &&
      (
        (item.getFlag(SYSTEM_ID, "coreKey") && candidate.getFlag(SYSTEM_ID, "coreKey") === item.getFlag(SYSTEM_ID, "coreKey")) ||
        candidate.name === item.name
      )
    );

    if (duplicates.length) {
      ui.notifications.warn("Cette Amélioration est déjà installée.");
      await item.delete();
      return;
    }

    if (actor.suitState.used > actor.suitState.max) {
      ui.notifications.warn("La Combinaison ne dispose d’aucun emplacement libre.");
      await item.delete();
      return;
    }

    await applyInstallEffect(item);
  }

  if (item.type === "structure") {
    const key = item.getFlag(SYSTEM_ID, "coreKey");
    const duplicate = actor.items.find((candidate) =>
      candidate.id !== item.id &&
      candidate.type === "structure" &&
      ((key && candidate.getFlag(SYSTEM_ID, "coreKey") === key) || candidate.name === item.name)
    );

    if (duplicate) {
      if (item.system.repeatable) {
        const maxRanks = Number(duplicate.system.maxRanks || 1);
        const ranks = Number(duplicate.system.ranks || 1);
        if (ranks < maxRanks) {
          await duplicate.update({ "system.ranks": ranks + 1 });
          ui.notifications.info(duplicate.name + " passe au rang " + (ranks + 1) + ".");
        } else {
          ui.notifications.warn(duplicate.name + " a déjà atteint son rang maximal.");
        }
        await item.delete();
        return;
      }

      ui.notifications.warn("Cette Structure ne peut être construite qu’une seule fois.");
      await item.delete();
      return;
    }
  }

  actor.sheet?.render({ force: true });
}

function chatRoot(html) {
  if (html instanceof HTMLElement) return html;
  if (html?.[0] instanceof HTMLElement) return html[0];
  return null;
}

function refreshExpeditionPanel(actor) {
  const panel = foundry.applications.instances.get("entity-expedition-panel");
  if (panel?.actor?.id === actor?.id) panel.render({ force: true });
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

  game.settings.register(SYSTEM_ID, "coreDataVersion", {
    name: "Version des données de base",
    scope: "world",
    config: false,
    type: Number,
    default: 0
  });
});

Hooks.on("createActor", async (actor, options, userId) => {
  if (actor.type !== "pia" || game.user.id !== userId) return;
  await ensureStartingImprovements(actor);
  await ensurePiaJournal(actor);
});

Hooks.on("updateActor", (actor) => {
  if (actor.type === "pia") refreshExpeditionPanel(actor);
});

Hooks.on("createItem", async (item) => {
  await normalizeEmbeddedItem(item);
});

Hooks.on("deleteItem", async (item) => {
  const actor = item.parent;
  if (!actor || actor.documentName !== "Actor" || actor.type !== "pia") return;
  await removePendingEffectsForItem(actor, item.id);
  actor.sheet?.render({ force: true });
  refreshExpeditionPanel(actor);
});

Hooks.on("updateItem", (item) => {
  const actor = item.parent;
  if (actor?.documentName === "Actor" && actor.type === "pia") {
    actor.sheet?.render({ force: true });
    refreshExpeditionPanel(actor);
  }
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
      if (action === "reroll-structure") await rerollWithStructure(message, Number(button.dataset.dieIndex));
      if (action === "reroll-improvement") await rerollWithImprovement(message, Number(button.dataset.dieIndex), button.dataset.itemId);
      if (action === "shield") await useShieldForRoll(message, button.dataset.itemId);
      if (action === "secondary-gain") await applySecondaryGain(message);
      if (action === "secondary-challenge") await resolveSecondaryFailure(message);
    });
  });
});

Hooks.once("ready", async () => {
  game.entity = {
    ensureStartingImprovements,
    ensureJournal: ensurePiaJournal,
    clearPendingEffects,
    createCoreRollTables,
    seedCoreContent,
    openExpedition: (actor) => {
      if (!actor || actor.type !== "pia") {
        ui.notifications.warn("Sélectionnez un PIA.");
        return null;
      }
      const existing = foundry.applications.instances.get("entity-expedition-panel");
      if (existing) existing.close();
      const panel = new ExpeditionPanel(actor);
      panel.render({ force: true });
      return panel;
    }
  };

  if (game.user?.isGM) {
    const version = game.settings.get(SYSTEM_ID, "coreDataVersion");
    if (version < CORE_DATA_VERSION) {
      await seedCoreContent();
      await game.settings.set(SYSTEM_ID, "coreDataVersion", CORE_DATA_VERSION);
    }
  }
});
