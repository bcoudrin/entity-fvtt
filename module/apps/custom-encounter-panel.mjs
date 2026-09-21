import { ABILITIES, SYSTEM_ID } from "../constants.mjs";
import {
  applyCustomEncounter,
  canCustomizeEncounter,
  chooseCustomKeyword,
  generateCustomEncounterAlienLife,
  generateCustomEncounterBase,
  getCustomEncounterDraft,
  removeCustomEncounterPart,
  rerollCustomAnomaly,
  rerollCustomFindRewards,
  rerollCustomKeywords,
  resetCustomEncounterDraft,
  rollCustomEncounterOracle
} from "../custom-encounter.mjs";
import { aggregateCustomRewards, customEncounterRequirements } from "../custom-encounter-rules.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

function currentEncounter(actor) {
  return foundry.utils.deepClone(actor.getFlag(SYSTEM_ID, "workflow")?.currentEncounter || null);
}

function typeLabel(type) {
  if (type === "challenge") return "Défi";
  if (type === "opportunity") return "Opportunité";
  if (type === "find") return "Trouvaille";
  return type;
}

function rewardLabel(reward) {
  if (reward.resourceKey === "data") return reward.amount + " Donnée(s)";
  if (reward.resourceKey === "energy") return reward.amount + " Énergie";
  return reward.amount + " Ressource(s)";
}

function findView(result, index) {
  return {
    ...result,
    index,
    label: rewardLabelList(result.rewards || [])
  };
}

function rewardLabelList(rewards) {
  return rewards.map(rewardLabel).join(" + ");
}

const ORACLE_META = {
  incidents: { label: "Incidents", icon: "fa-solid fa-triangle-exclamation" },
  actions: { label: "Actions", icon: "fa-solid fa-person-running" },
  themes: { label: "Thèmes", icon: "fa-solid fa-lightbulb" },
  objects: { label: "Objets", icon: "fa-solid fa-cube" },
  information: { label: "Informations", icon: "fa-solid fa-file-lines" },
  materials: { label: "Matériaux", icon: "fa-solid fa-gem" },
  descriptors: { label: "Descripteurs", icon: "fa-solid fa-wand-magic-sparkles" },
  terrainFeatures: { label: "Terrain", icon: "fa-solid fa-mountain-sun" },
  structureFeatures: { label: "Structure", icon: "fa-solid fa-building" },
  alienLife: { label: "Forme de Vie", icon: "fa-solid fa-dna" }
};

function oracleKeys(type) {
  if (type === "challenge") {
    return ["incidents", "terrainFeatures", "structureFeatures", "objects", "themes", "descriptors", "actions", "alienLife"];
  }
  if (type === "find") {
    return ["information", "themes", "actions", "materials", "objects", "descriptors", "terrainFeatures", "structureFeatures", "alienLife"];
  }
  if (type === "opportunity") {
    return ["incidents", "actions", "themes", "objects", "information", "materials", "descriptors", "terrainFeatures", "structureFeatures", "alienLife"];
  }
  return [];
}

export class CustomEncounterPanel extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
  }

  static DEFAULT_OPTIONS = {
    id: "entity-custom-encounter-panel",
    classes: ["entity", "custom-encounter-panel"],
    tag: "section",
    position: { width: 650, height: 760 },
    window: { title: "Entité — Rencontre personnalisée", resizable: true },
    actions: {
      generateBase: CustomEncounterPanel.#generateBase,
      rerollAnomaly: CustomEncounterPanel.#rerollAnomaly,
      rerollKeywords: CustomEncounterPanel.#rerollKeywords,
      chooseKeyword: CustomEncounterPanel.#chooseKeyword,
      rerollFind: CustomEncounterPanel.#rerollFind,
      rollOracle: CustomEncounterPanel.#rollOracle,
      alienLife: CustomEncounterPanel.#alienLife,
      removePart: CustomEncounterPanel.#removePart,
      reset: CustomEncounterPanel.#reset,
      apply: CustomEncounterPanel.#apply
    }
  };

  static PARTS = {
    main: { template: "systems/entity/templates/custom-encounter-panel.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const encounter = currentEncounter(this.actor);
    const draft = getCustomEncounterDraft(this.actor);
    const requirements = customEncounterRequirements(encounter?.type, draft);

    context.actor = this.actor;
    context.encounter = encounter;
    context.hasEncounter = Boolean(encounter);
    context.canCustomize = canCustomizeEncounter(this.actor);
    context.typeLabel = typeLabel(encounter?.type);
    context.isChallenge = encounter?.type === "challenge";
    context.isOpportunity = encounter?.type === "opportunity";
    context.isFind = encounter?.type === "find";
    context.needsChallenge = ["challenge", "opportunity"].includes(encounter?.type);
    context.needsFind = ["find", "opportunity"].includes(encounter?.type);
    context.findRollCount = encounter?.type === "opportunity" ? 2 : encounter?.type === "find" ? 1 : 0;
    context.draft = draft;
    context.keywordRolls = (draft.keywordRolls || []).map((entry, index) => ({
      ...entry,
      index,
      resolved: Boolean(entry.abilityKey)
    }));
    context.findRolls = (draft.findRolls || []).map(findView);
    context.aggregateRewards = aggregateCustomRewards(draft.findRolls || []).map((reward) => ({
      ...reward,
      label: rewardLabel(reward)
    }));
    context.requirements = requirements;
    context.canApply = Boolean(context.canCustomize && requirements.ready);
    context.abilities = Object.entries(ABILITIES).map(([key, value]) => ({ key, label: value.label }));
    context.oracles = oracleKeys(encounter?.type).map((key) => ({ key, ...ORACLE_META[key] }));
    context.hasBase = Boolean(draft.anomaly || draft.findRolls?.length || draft.keywordRolls?.length);
    return context;
  }

  static async #generateBase() {
    await generateCustomEncounterBase(this.actor);
  }

  static async #rerollAnomaly() {
    await rerollCustomAnomaly(this.actor);
  }

  static async #rerollKeywords() {
    await rerollCustomKeywords(this.actor);
  }

  static async #chooseKeyword(event, target) {
    const index = Number(target.dataset.index);
    const select = this.element.querySelector("[name='customKeyword-" + index + "']");
    const abilityKey = select?.value || "";
    if (!abilityKey) {
      ui.notifications.warn("Choisissez une Capacité.");
      return;
    }
    await chooseCustomKeyword(this.actor, index, abilityKey);
  }

  static async #rerollFind() {
    await rerollCustomFindRewards(this.actor);
  }

  static async #rollOracle(event, target) {
    await rollCustomEncounterOracle(this.actor, target.dataset.table);
  }

  static async #alienLife() {
    await generateCustomEncounterAlienLife(this.actor);
  }

  static async #removePart(event, target) {
    await removeCustomEncounterPart(this.actor, target.dataset.partId);
  }

  static async #reset() {
    await resetCustomEncounterDraft(this.actor);
  }

  static async #apply() {
    await applyCustomEncounter(this.actor);
  }
}

export function openCustomEncounterPanel(actor) {
  if (!actor || actor.type !== "pia") {
    ui.notifications.warn("Sélectionnez un PIA.");
    return null;
  }
  if (!canCustomizeEncounter(actor)) {
    ui.notifications.warn("La Rencontre actuelle a déjà commencé à être résolue ou ne peut pas être personnalisée.");
    return null;
  }

  const existing = foundry.applications.instances.get("entity-custom-encounter-panel");
  if (existing) existing.close();

  const panel = new CustomEncounterPanel(actor);
  panel.render({ force: true });
  return panel;
}
