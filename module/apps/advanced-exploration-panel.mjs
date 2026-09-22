import {
  generateAlienLife,
  getAdvancedExplorationState,
  rollAdvancedExplorationTable,
  rollContextFeature,
  scanDestinationStructure
} from "../advanced-exploration.mjs";
import { SYSTEM_ID } from "../constants.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

function locationContext(actor) {
  const workflow = actor.getFlag(SYSTEM_ID, "workflow") || {};
  return workflow.location || null;
}

function resultView(result) {
  if (!result) return null;
  return {
    ...result,
    label: result.tableName || result.tableKey
  };
}

export class AdvancedExplorationPanel extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
  }

  static DEFAULT_OPTIONS = {
    id: "entity-advanced-exploration-panel",
    classes: ["entity", "advanced-exploration-panel"],
    tag: "section",
    position: { width: 600, height: 690 },
    window: { title: "Entité — Exploration avancée", resizable: true },
    actions: {
      scanStructure: AdvancedExplorationPanel.#scanStructure,
      rollContextFeature: AdvancedExplorationPanel.#rollContextFeature,
      rollTable: AdvancedExplorationPanel.#rollTable,
      alienLife: AdvancedExplorationPanel.#alienLife
    }
  };

  static PARTS = {
    main: { template: "systems/entity/templates/advanced-exploration-panel.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const state = getAdvancedExplorationState(this.actor);
    const location = locationContext(this.actor);

    context.actor = this.actor;
    context.location = location;
    context.hasLocation = Boolean(location);
    context.state = state;
    context.hasStructureCheck = Boolean(state.structureCheck);
    context.insideStructure = Boolean(state.structureCheck?.inside);
    context.outsideStructure = Boolean(state.structureCheck && !state.structureCheck.inside);
    context.structure = state.structureCheck?.structure || null;
    context.contextFeature = state.structureCheck?.inside
      ? resultView(state.latest.structureFeatures)
      : resultView(state.latest.terrainFeatures);
    context.descriptor = resultView(state.latest.descriptors);
    context.sky = resultView(state.latest.sky);
    context.distance = resultView(state.latest.distance);
    context.wrecks = resultView(state.latest.wrecks);
    context.soundsLights = resultView(state.latest.soundsLights);
    context.alienLife = state.alienLife || null;
    return context;
  }

  static async #scanStructure() {
    await scanDestinationStructure(this.actor);
  }

  static async #rollContextFeature() {
    await rollContextFeature(this.actor);
  }

  static async #rollTable(event, target) {
    await rollAdvancedExplorationTable(this.actor, target.dataset.table);
  }

  static async #alienLife() {
    await generateAlienLife(this.actor);
  }
}

export function openAdvancedExplorationPanel(actor) {
  if (!actor || actor.type !== "pia") {
    ui.notifications.warn("Sélectionnez un PIA.");
    return null;
  }

  const existing = foundry.applications.instances.get("entity-advanced-exploration-panel");
  if (existing) existing.close();

  const panel = new AdvancedExplorationPanel(actor);
  panel.render({ force: true });
  return panel;
}
