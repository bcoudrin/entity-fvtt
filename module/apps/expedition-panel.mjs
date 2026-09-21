import { ABILITIES, SYSTEM_ID } from "../constants.mjs";
import {
  addAspectAndAdvance,
  advanceEncounter,
  applyEncounterRewards,
  completeMission,
  convertEncounterResource,
  getMissionCatalog,
  getWorkflow,
  installImprovementAsSecondary,
  markPowerConstraint,
  rollEncounterAbility,
  rollLocation,
  rollLocationEncounter,
  rollSecondaryActivity,
  rollTravel,
  selfRepairAsSecondary,
  startExpedition,
  startMission
} from "../workflow.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

function formValue(root, selector, fallback = "") {
  return root.querySelector(selector)?.value ?? fallback;
}

function rewardLabel(reward) {
  if (reward.resourceKey === "data") return reward.amount + " Donnée(s)";
  if (reward.resourceKey === "energy") return reward.amount + " Énergie";
  return reward.amount + " Ressource(s)";
}

function currentEncounterView(workflow, actor) {
  const encounter = workflow.currentEncounter;
  if (!encounter) return null;

  const rewards = (encounter.rewards || []).map((reward, index) => ({
    ...reward,
    index,
    label: rewardLabel(reward)
  }));
  const converter = actor.items.find((item) =>
    item.type === "improvement" && item.system.effectType === "convertResource"
  );
  const converterCost = Number(converter?.system.effectValue || 2);
  const converterAvailable =
    encounter.context === "location" &&
    ["opportunity", "find"].includes(encounter.type) &&
    Boolean(converter) &&
    Number(actor.system.resources?.value || 0) >= converterCost;

  const challengeRolls = Array.from(encounter.rolls || []);
  const threat = Math.max(1, Number(encounter.threat || 1));
  const challengeOutcomeReady = encounter.type === "challenge" && challengeRolls.length >= threat && Boolean(encounter.challengeOutcome);

  return {
    ...encounter,
    rewards,
    hasRewards: rewards.length > 0,
    rewardChoice: encounter.rewardMode === "choice",
    rewardAll: encounter.rewardMode === "all",
    keywords: (encounter.keywords || []).map((key) => ({
      key,
      label: ABILITIES[key]?.label || key
    })),
    isChallenge: encounter.type === "challenge",
    isOpportunity: encounter.type === "opportunity",
    isFind: encounter.type === "find",
    isAspect: encounter.type === "aspect",
    multiThreat: Number(encounter.threat || 0) > 1,
    challengeRolls,
    challengeRollCount: challengeRolls.length,
    challengeRollRemaining: Math.max(0, threat - challengeRolls.length),
    challengeOutcomeReady,
    challengeSucceeded: encounter.challengeOutcome === "success",
    challengeFailed: encounter.challengeOutcome === "failed",
    canRollEncounterAction: encounter.type !== "challenge" || !challengeOutcomeReady,
    converterAvailable,
    converterCost,
    canConvertData: converterAvailable && Number(actor.system.data?.value || 0) < Number(actor.system.data?.max || 10),
    canConvertEnergy: converterAvailable && Number(actor.system.energy?.value || 0) < Number(actor.system.energy?.max || 10)
  };
}

export class ExpeditionPanel extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
  }

  static DEFAULT_OPTIONS = {
    id: "entity-expedition-panel",
    classes: ["entity", "expedition-panel"],
    tag: "section",
    position: { width: 520, height: 720 },
    window: { title: "Entité — Mission & Expédition", resizable: true },
    actions: {
      startMission: ExpeditionPanel.#startMission,
      completeMission: ExpeditionPanel.#completeMission,
      startExpedition: ExpeditionPanel.#startExpedition,
      markPowerConstraint: ExpeditionPanel.#markPowerConstraint,
      rollLocation: ExpeditionPanel.#rollLocation,
      rollTravel: ExpeditionPanel.#rollTravel,
      rollLocationEncounter: ExpeditionPanel.#rollLocationEncounter,
      rollEncounterAbility: ExpeditionPanel.#rollEncounterAbility,
      encounterSuccess: ExpeditionPanel.#encounterSuccess,
      encounterFailure: ExpeditionPanel.#encounterFailure,
      encounterResolved: ExpeditionPanel.#encounterResolved,
      applyEncounterReward: ExpeditionPanel.#applyEncounterReward,
      convertEncounter: ExpeditionPanel.#convertEncounter,
      addAspect: ExpeditionPanel.#addAspect,
      secondaryRoll: ExpeditionPanel.#secondaryRoll,
      installImprovement: ExpeditionPanel.#installImprovement,
      selfRepair: ExpeditionPanel.#selfRepair
    }
  };

  static PARTS = {
    main: { template: "systems/entity/templates/expedition-panel.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.actor;
    const workflow = getWorkflow(actor);
    const missions = getMissionCatalog(actor);
    const activeKey = actor.system.mission?.activeKey || "";

    context.actor = actor;
    context.system = actor.system;
    context.workflow = workflow;
    context.currentEncounter = currentEncounterView(workflow, actor);
    context.missions = missions;
    context.hasMission = Boolean(activeKey);
    context.missionReady =
      Boolean(activeKey) &&
      Number(actor.system.mission.aspectsCurrent || 0) >= Number(actor.system.mission.aspectsRequired || 0);

    context.availableImprovements = game.items
      .filter((item) => item.type === "improvement" && item.getFlag(SYSTEM_ID, "coreKey"))
      .filter((source) => !actor.items.some((item) =>
        item.type === "improvement" &&
        (
          item.getFlag(SYSTEM_ID, "coreKey") === source.getFlag(SYSTEM_ID, "coreKey") ||
          item.name === source.name
        )
      ))
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));

    context.constraints = Array.from(actor.system.constraints || []).map((label, index) => ({ label, index }));
    context.canInstall = Number(actor.system.resources?.value || 0) >= 10 && actor.suitState.free > 0;
    context.canRepair = Number(actor.system.resources?.value || 0) >= 5 && context.constraints.length > 0;
    return context;
  }

  static async #startMission() {
    const key = formValue(this.element, "[name='missionKey']");
    if (await startMission(this.actor, key)) this.render({ force: true });
  }

  static async #completeMission() {
    if (await completeMission(this.actor)) this.render({ force: true });
  }

  static async #startExpedition() {
    if (await startExpedition(this.actor)) this.render({ force: true });
  }

  static async #markPowerConstraint() {
    if (await markPowerConstraint(this.actor)) this.render({ force: true });
  }

  static async #rollLocation() {
    if (await rollLocation(this.actor)) this.render({ force: true });
  }

  static async #rollTravel() {
    const data = Number(formValue(this.element, "[name='travelData']", 0));
    if (await rollTravel(this.actor, data)) this.render({ force: true });
  }

  static async #rollLocationEncounter() {
    const data = Number(formValue(this.element, "[name='locationData']", 0));
    if (await rollLocationEncounter(this.actor, data)) this.render({ force: true });
  }

  static async #rollEncounterAbility(event, target) {
    await rollEncounterAbility(this.actor, target.dataset.ability);
  }

  static async #encounterSuccess() {
    if (await advanceEncounter(this.actor, "success")) this.render({ force: true });
  }

  static async #encounterFailure() {
    if (await advanceEncounter(this.actor, "failed")) this.render({ force: true });
  }

  static async #encounterResolved() {
    if (await advanceEncounter(this.actor, "resolved")) this.render({ force: true });
  }

  static async #applyEncounterReward(event, target) {
    const choice = target.dataset.rewardIndex === undefined ? null : Number(target.dataset.rewardIndex);
    if (await applyEncounterRewards(this.actor, choice)) this.render({ force: true });
  }

  static async #convertEncounter(event, target) {
    if (await convertEncounterResource(this.actor, target.dataset.resource)) this.render({ force: true });
  }

  static async #addAspect() {
    if (await addAspectAndAdvance(this.actor)) this.render({ force: true });
  }

  static async #secondaryRoll(event, target) {
    await rollSecondaryActivity(this.actor, target.dataset.kind);
  }

  static async #installImprovement() {
    const itemId = formValue(this.element, "[name='improvementId']");
    if (await installImprovementAsSecondary(this.actor, itemId)) this.render({ force: true });
  }

  static async #selfRepair(event, target) {
    if (await selfRepairAsSecondary(this.actor, Number(target.dataset.index))) this.render({ force: true });
  }
}
