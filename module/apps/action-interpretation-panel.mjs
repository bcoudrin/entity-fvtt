import { SYSTEM_ID } from "../constants.mjs";
import {
  getActionInterpretationState,
  journalActionInterpretation,
  rollActionInterpretationOracle,
  rollActionThemePair
} from "../action-interpretation.mjs";
import {
  actionInterpretationGuide,
  resultInterpretationGuide
} from "../data/action-interpretation.mjs";
import { applyRollConsequence } from "../dice.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

function fieldValue(root, selector) {
  return root.querySelector(selector)?.value ?? "";
}

export class ActionInterpretationPanel extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(message, options = {}) {
    super(options);
    this.message = message;
  }

  static DEFAULT_OPTIONS = {
    id: "entity-action-interpretation-panel",
    classes: ["entity", "action-interpretation-panel"],
    tag: "section",
    position: { width: 610, height: 700 },
    window: { title: "Entité — Interpréter l’Action", resizable: true },
    actions: {
      rollPair: ActionInterpretationPanel.#rollPair,
      rollAction: ActionInterpretationPanel.#rollAction,
      rollTheme: ActionInterpretationPanel.#rollTheme,
      applyNarratedConsequence: ActionInterpretationPanel.#applyNarratedConsequence,
      journal: ActionInterpretationPanel.#journal
    }
  };

  static PARTS = {
    main: { template: "systems/entity/templates/action-interpretation-panel.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const state = foundry.utils.deepClone(this.message.getFlag(SYSTEM_ID, "actionRoll") || {});
    const oracle = getActionInterpretationState(this.message);
    const secondary = Boolean(state.workflow?.secondary);

    context.state = state;
    context.oracle = oracle;
    context.abilityGuide = actionInterpretationGuide(state.abilityKey);
    context.resultGuide = resultInterpretationGuide(state.result, { secondary });
    context.hasAbilityGuide = Boolean(context.abilityGuide);
    context.isSecondary = secondary;
    context.canNameConstraint =
      !secondary &&
      state.result === "partial" &&
      !state.consequenceApplied;
    context.canNameFailure =
      !secondary &&
      state.result === "failure" &&
      !state.consequenceApplied;
    context.hasNarrativeConsequence = context.canNameConstraint || context.canNameFailure;
    context.consequenceLabel = context.canNameConstraint ? "Contrainte" : context.canNameFailure ? "Défaillance" : "";
    context.consequenceKind = context.canNameConstraint ? "constraint" : context.canNameFailure ? "failure" : "";
    context.hasOracle = Boolean(oracle.action || oracle.theme);
    return context;
  }

  static async #rollPair() {
    await rollActionThemePair(this.message);
    this.render({ force: true });
  }

  static async #rollAction() {
    await rollActionInterpretationOracle(this.message, "actions");
    this.render({ force: true });
  }

  static async #rollTheme() {
    await rollActionInterpretationOracle(this.message, "themes");
    this.render({ force: true });
  }

  static async #applyNarratedConsequence(event, target) {
    const label = fieldValue(this.element, "[name='narrativeConsequence']").trim();
    if (!label) {
      ui.notifications.warn("Décrivez d’abord la conséquence.");
      return;
    }
    await applyRollConsequence(this.message, target.dataset.kind, label);
    this.render({ force: true });
  }

  static async #journal() {
    const note = fieldValue(this.element, "[name='journalNote']");
    if (await journalActionInterpretation(this.message, note)) {
      this.element.querySelector("[name='journalNote']").value = "";
    }
  }
}

export function openActionInterpretationPanel(message) {
  const state = message?.getFlag?.(SYSTEM_ID, "actionRoll");
  if (!state) {
    ui.notifications.warn("Ce message ne contient pas de jet d’Action Entité.");
    return null;
  }

  const existing = foundry.applications.instances.get("entity-action-interpretation-panel");
  if (existing) existing.close();

  const panel = new ActionInterpretationPanel(message);
  panel.render({ force: true });
  return panel;
}
