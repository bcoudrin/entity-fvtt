import {
  generateAdvancedSecondaryAlienLife,
  getAdvancedSecondaryState,
  prepareAdvancedSecondarySetting,
  rollAdvancedSecondaryOracle,
  SECONDARY_ADVANCED_DEFINITIONS,
  selectAdvancedSecondaryKind,
  setAdvancedSecondaryOutcome,
  suggestedSecondaryOracles
} from "../advanced-secondary.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const ORACLE_META = {
  information: { label: "Informations", icon: "fa-solid fa-file-lines" },
  themes: { label: "Thèmes", icon: "fa-solid fa-lightbulb" },
  actions: { label: "Actions", icon: "fa-solid fa-person-running" },
  objects: { label: "Objets", icon: "fa-solid fa-cube" },
  anomalies: { label: "Anomalies", icon: "fa-solid fa-wave-square" },
  incidents: { label: "Incidents", icon: "fa-solid fa-triangle-exclamation" },
  materials: { label: "Matériaux", icon: "fa-solid fa-gem" },
  descriptors: { label: "Descripteurs", icon: "fa-solid fa-wand-magic-sparkles" },
  contextFeature: { label: "Caractéristique du lieu", icon: "fa-solid fa-mountain-sun" },
  alienLife: { label: "Forme de Vie", icon: "fa-solid fa-dna" }
};

function outcomeLabel(outcome) {
  if (outcome === "full") return "Réussite totale";
  if (outcome === "partial") return "Réussite partielle";
  if (outcome === "failure") return "Échec — le Défi reste la conséquence mécanique";
  return "Résultat du jet non encore connu";
}

function tableResult(state, key) {
  if (key === "contextFeature") {
    return state.latest.structureFeatures || state.latest.terrainFeatures || null;
  }
  return state.latest[key] || null;
}

export class AdvancedSecondaryPanel extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(actor, { kind = "", outcome = "", ...options } = {}) {
    super(options);
    this.actor = actor;
    this.initialKind = kind;
    this.initialOutcome = outcome;
  }

  static DEFAULT_OPTIONS = {
    id: "entity-advanced-secondary-panel",
    classes: ["entity", "advanced-secondary-panel"],
    tag: "section",
    position: { width: 620, height: 720 },
    window: { title: "Entité — Activité Secondaire avancée", resizable: true },
    actions: {
      selectKind: AdvancedSecondaryPanel.#selectKind,
      prepareCurrent: AdvancedSecondaryPanel.#prepareCurrent,
      prepareElsewhere: AdvancedSecondaryPanel.#prepareElsewhere,
      rollOracle: AdvancedSecondaryPanel.#rollOracle,
      alienLife: AdvancedSecondaryPanel.#alienLife
    }
  };

  static PARTS = {
    main: { template: "systems/entity/templates/advanced-secondary-panel.hbs" }
  };

  async _prepareContext(options) {
    if (this.initialKind) {
      const state = getAdvancedSecondaryState(this.actor);
      if (state.kind !== this.initialKind) await selectAdvancedSecondaryKind(this.actor, this.initialKind);
      if (this.initialOutcome) await setAdvancedSecondaryOutcome(this.actor, this.initialKind, this.initialOutcome);
      this.initialKind = "";
      this.initialOutcome = "";
    }

    const context = await super._prepareContext(options);
    const state = getAdvancedSecondaryState(this.actor);
    const definition = SECONDARY_ADVANCED_DEFINITIONS[state.kind] || null;
    const suggested = suggestedSecondaryOracles(state.kind, state.outcome).map((key) => ({
      key,
      ...ORACLE_META[key],
      result: tableResult(state, key)
    }));

    context.actor = this.actor;
    context.state = state;
    context.definition = definition;
    context.hasKind = Boolean(definition);
    context.outcomeLabel = outcomeLabel(state.outcome);
    context.isFailure = state.outcome === "failure";
    context.hasSuggested = suggested.length > 0;
    context.suggested = suggested;
    context.kinds = Object.entries(SECONDARY_ADVANCED_DEFINITIONS).map(([key, value]) => ({
      key,
      label: value.label,
      selected: key === state.kind
    }));
    return context;
  }

  static async #selectKind(event, target) {
    await selectAdvancedSecondaryKind(this.actor, target.dataset.kind);
  }

  static async #prepareCurrent() {
    const state = getAdvancedSecondaryState(this.actor);
    await prepareAdvancedSecondarySetting(this.actor, state.kind, "current");
  }

  static async #prepareElsewhere() {
    const state = getAdvancedSecondaryState(this.actor);
    await prepareAdvancedSecondarySetting(this.actor, state.kind, "elsewhere");
  }

  static async #rollOracle(event, target) {
    await rollAdvancedSecondaryOracle(this.actor, target.dataset.table);
  }

  static async #alienLife() {
    await generateAdvancedSecondaryAlienLife(this.actor);
  }
}

export async function openAdvancedSecondaryPanel(actor, { kind = "", outcome = "" } = {}) {
  if (!actor || actor.type !== "pia") {
    ui.notifications.warn("Sélectionnez un PIA.");
    return null;
  }

  if (kind) {
    const state = getAdvancedSecondaryState(actor);
    if (state.kind !== kind) await selectAdvancedSecondaryKind(actor, kind);
    if (outcome) await setAdvancedSecondaryOutcome(actor, kind, outcome);
  }

  const existing = foundry.applications.instances.get("entity-advanced-secondary-panel");
  if (existing) existing.close();

  const panel = new AdvancedSecondaryPanel(actor);
  panel.render({ force: true });
  return panel;
}
