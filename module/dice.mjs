import { ABILITIES, ROLL_MODES, SYSTEM_ID, TRAITS } from "./constants.mjs";
import { renderTemplate } from "./foundry-compat.mjs";
import { consumePendingEffects } from "./improvements.mjs";

function matchingStructures(actor, effectType, abilityKey) {
  return actor.items.filter((item) =>
    item.type === "structure" &&
    item.system.effectType === effectType &&
    item.system.effectKey === abilityKey
  );
}

function structureBonus(actor, abilityKey) {
  return matchingStructures(actor, "abilityBonus", abilityKey)
    .reduce((sum, item) => sum + Number(item.system.effectValue || 0) * Number(item.system.ranks || 1), 0);
}

function hasStructureReroll(actor, abilityKey) {
  return Boolean(abilityKey) && matchingStructures(actor, "reroll", abilityKey).length > 0;
}

function computeKeptIndexes(dice, mode) {
  if (dice.length <= 2 || mode === "normal") return [0, 1];
  const indexed = dice.map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value || a.index - b.index);
  return mode === "advantage"
    ? indexed.slice(0, 2).map((entry) => entry.index)
    : indexed.slice(-2).map((entry) => entry.index);
}

function resultFromState(state) {
  const successes = state.keptIndexes.filter((index) => state.dice[index] <= state.target).length;
  if (successes === 2) return "full";
  if (successes === 1) return "partial";
  return "failure";
}

function resultLabel(result) {
  if (result === "full") return "Réussite totale";
  if (result === "partial") return "Réussite partielle";
  return "Échec";
}

function resolveMode(manualMode, effects) {
  let balance = ROLL_MODES[manualMode]?.modifier ?? 0;
  if (effects.some((effect) => effect.type === "advantage")) balance += 1;
  if (balance > 0) return "advantage";
  if (balance < 0) return "disadvantage";
  return "normal";
}

function recalculate(state) {
  state.keptIndexes = computeKeptIndexes(state.dice, state.mode);
  state.discardedIndexes = state.dice
    .map((_, index) => index)
    .filter((index) => !state.keptIndexes.includes(index));
  state.result = resultFromState(state);
  state.resultLabel = resultLabel(state.result);
  state.diceDisplay = state.dice.map((value, index) => ({
    index,
    value,
    kept: state.keptIndexes.includes(index),
    discarded: state.discardedIndexes.includes(index)
  }));
  return state;
}

function shieldItems(actor) {
  return actor.items
    .filter((item) => item.type === "improvement")
    .filter((item) => item.system.effectType === "preventConstraint")
    .filter((item) => (actor.system.energy?.value ?? 0) >= Number(item.system.energyCost || 0))
    .map((item) => ({ id: item.id, name: item.name, cost: Number(item.system.energyCost || 0) }));
}

function rerollImprovement(actor) {
  const item = actor.items
    .filter((candidate) => candidate.type === "improvement")
    .find((candidate) =>
      candidate.system.effectType === "reroll" &&
      (actor.system.energy?.value ?? 0) >= Number(candidate.system.energyCost || 0)
    );

  return item
    ? { id: item.id, name: item.name, cost: Number(item.system.energyCost || 0) }
    : null;
}

function actionDescriptor(state) {
  if (state.abilityKey && ABILITIES[state.abilityKey]) {
    const ability = ABILITIES[state.abilityKey];
    return {
      label: ability.label,
      trait: TRAITS[ability.trait]?.label || ability.trait
    };
  }
  return {
    label: state.actionLabel || "Jet d’Action",
    trait: state.traitLabel || "Activité"
  };
}

async function renderCard(state, actor) {
  const rerollsLocked = Boolean(state.consequenceApplied || state.secondaryApplied || state.encounterRecorded);
  const isSecondary = Boolean(state.workflow?.secondary);
  const isChallenge = Boolean(state.workflow?.encounter);
  const isOpportunity = Boolean(state.workflow?.opportunity);
  const challengeNeedsConsequence =
    isChallenge &&
    ["partial", "failure"].includes(state.result) &&
    !state.consequenceApplied;
  const challengeCanRecord =
    isChallenge &&
    !state.encounterRecorded &&
    (state.result === "full" || state.consequenceApplied);
  const opportunityNeedsConsequence =
    isOpportunity &&
    ["partial", "failure"].includes(state.result) &&
    !state.consequenceApplied;
  const opportunityCanRecord =
    isOpportunity &&
    !state.encounterRecorded &&
    (state.result === "full" || state.consequenceApplied);

  return renderTemplate("systems/entity/templates/chat/action-roll.hbs", {
    state,
    actor,
    ability: actionDescriptor(state),
    isSecondary,
    isChallenge,
    challengeNeedsConsequence,
    challengeCanRecord,
    isOpportunity,
    opportunityNeedsConsequence,
    opportunityCanRecord,
    shields: !isSecondary && state.result === "partial" && !state.consequenceApplied ? shieldItems(actor) : [],
    rerollItem: rerollsLocked ? null : rerollImprovement(actor),
    rerollsLocked
  });
}

export async function refreshActionRollMessage(message, state, actor) {
  await message.update({
    content: await renderCard(state, actor),
    ["flags." + SYSTEM_ID + ".actionRoll"]: state
  });
}

async function rerollDieAndRefresh(message, state, actor, dieIndex) {
  if (dieIndex < 0 || dieIndex >= state.dice.length) return;

  const reroll = await new Roll("1d10").evaluate();
  state.dice[dieIndex] = reroll.dice[0]?.results?.[0]?.result ?? state.dice[dieIndex];
  recalculate(state);
  await refreshActionRollMessage(message, state, actor);
}

async function createActionRoll(actor, state, formula) {
  const roll = await new Roll(formula).evaluate();
  state.dice = roll.dice[0]?.results?.map((result) => result.result) || [];
  recalculate(state);

  const content = await renderCard(state, actor);
  const diceSound = CONFIG.sounds?.dice || "sounds/dice.wav";
  const message = await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
    sound: diceSound,
    flags: { [SYSTEM_ID]: { actionRoll: state } }
  });

  return { message, state, roll };
}

export async function rollAction(actor, abilityKey, { mode = "normal", workflow = null } = {}) {
  const ability = ABILITIES[abilityKey];
  if (!ability) throw new Error("Capacité inconnue : " + abilityKey);

  const trait = actor.system.traits?.[ability.trait];
  const traitValue = Number(trait?.value || 0);
  const abilityValue = Number(trait?.abilities?.[abilityKey]?.value || 0);
  const passiveBonus = structureBonus(actor, abilityKey);
  const effects = await consumePendingEffects(actor, abilityKey);
  const improvementBonus = effects
    .filter((effect) => effect.type === "abilityBonus")
    .reduce((sum, effect) => sum + Number(effect.value || 0), 0);

  const finalMode = resolveMode(mode, effects);
  const state = {
    actorUuid: actor.uuid,
    abilityKey,
    actionLabel: ability.label,
    traitKey: ability.trait,
    traitLabel: TRAITS[ability.trait]?.label || ability.trait,
    target: traitValue + abilityValue + passiveBonus + improvementBonus,
    traitValue,
    abilityValue,
    passiveBonus,
    improvementBonus,
    mode: finalMode,
    manualMode: mode,
    customAction: false,
    targetBreakdown: "",
    workflow,
    encounterRecorded: false,
    dice: [],
    keptIndexes: [],
    discardedIndexes: [],
    diceDisplay: [],
    result: "",
    resultLabel: "",
    structureRerollAvailable: hasStructureReroll(actor, abilityKey),
    structureRerollUsed: false,
    consequenceApplied: false,
    secondaryApplied: false,
    shieldUsed: false,
    activatedImprovements: effects.map((effect) => effect.name)
  };

  return createActionRoll(actor, state, finalMode === "normal" ? "2d10" : "3d10");
}

export async function rollThresholdAction(actor, {
  label,
  traitLabel = "",
  target,
  mode = "normal",
  workflow = null
} = {}) {
  const effects = await consumePendingEffects(actor, null);
  const finalMode = resolveMode(mode, effects);
  const state = {
    actorUuid: actor.uuid,
    abilityKey: null,
    actionLabel: label || "Jet d’Action",
    traitKey: null,
    traitLabel,
    target: Number(target || 0),
    traitValue: 0,
    abilityValue: 0,
    passiveBonus: 0,
    improvementBonus: 0,
    mode: finalMode,
    manualMode: mode,
    customAction: true,
    targetBreakdown: "Niveau de Difficulté fixé à " + Number(target || 0),
    workflow,
    encounterRecorded: false,
    dice: [],
    keptIndexes: [],
    discardedIndexes: [],
    diceDisplay: [],
    result: "",
    resultLabel: "",
    structureRerollAvailable: false,
    structureRerollUsed: false,
    consequenceApplied: false,
    secondaryApplied: false,
    shieldUsed: false,
    activatedImprovements: effects.map((effect) => effect.name)
  };

  return createActionRoll(actor, state, finalMode === "normal" ? "2d10" : "3d10");
}

export async function rerollWithStructure(message, dieIndex) {
  const state = foundry.utils.deepClone(message.getFlag(SYSTEM_ID, "actionRoll"));
  if (!state || state.consequenceApplied || state.secondaryApplied || state.encounterRecorded) return;
  if (!state.structureRerollAvailable || state.structureRerollUsed) return;

  const actor = await fromUuid(state.actorUuid);
  if (!actor || !hasStructureReroll(actor, state.abilityKey)) return;

  state.structureRerollUsed = true;
  await rerollDieAndRefresh(message, state, actor, dieIndex);
}

export async function rerollWithImprovement(message, dieIndex, itemId) {
  const state = foundry.utils.deepClone(message.getFlag(SYSTEM_ID, "actionRoll"));
  if (!state || state.consequenceApplied || state.secondaryApplied || state.encounterRecorded) return;

  const actor = await fromUuid(state.actorUuid);
  if (!actor) return;

  const item = actor.items.get(itemId);
  if (!item || item.type !== "improvement" || item.system.effectType !== "reroll") return;

  const cost = Number(item.system.energyCost || 0);
  if ((actor.system.energy?.value ?? 0) < cost) {
    ui.notifications.warn("Énergie insuffisante pour cette relance.");
    return;
  }

  if (cost > 0) {
    await actor.update({ "system.energy.value": actor.system.energy.value - cost });
  }

  await rerollDieAndRefresh(message, state, actor, dieIndex);
}

export async function applyRollConsequence(message, kind) {
  const state = foundry.utils.deepClone(message.getFlag(SYSTEM_ID, "actionRoll"));
  if (!state || state.consequenceApplied || state.workflow?.secondary) return;

  const actor = await fromUuid(state.actorUuid);
  if (!actor) return;

  const label = state.actionLabel || ABILITIES[state.abilityKey]?.label || "Jet d’Action";
  let applied = false;
  if (kind === "constraint" && state.result === "partial") {
    applied = await actor.addConstraint("Contrainte — " + label);
  } else if (kind === "failure" && state.result === "failure") {
    applied = await actor.addFailure("Défaillance — " + label);
  }
  if (!applied) return;

  state.consequenceApplied = true;
  await refreshActionRollMessage(message, state, actor);
}

export async function useShieldForRoll(message, itemId) {
  const state = foundry.utils.deepClone(message.getFlag(SYSTEM_ID, "actionRoll"));
  if (!state || state.result !== "partial" || state.consequenceApplied || state.workflow?.secondary) return;

  const actor = await fromUuid(state.actorUuid);
  if (!actor) return;
  const item = actor.items.get(itemId);
  if (!item || item.type !== "improvement" || item.system.effectType !== "preventConstraint") return;

  const cost = Number(item.system.energyCost || 0);
  if ((actor.system.energy?.value ?? 0) < cost) {
    ui.notifications.warn("Énergie insuffisante.");
    return;
  }
  if (cost > 0) {
    await actor.update({ "system.energy.value": actor.system.energy.value - cost });
  }

  state.consequenceApplied = true;
  state.shieldUsed = true;
  state.shieldName = item.name;
  await refreshActionRollMessage(message, state, actor);
}
