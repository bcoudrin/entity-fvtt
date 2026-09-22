import { ABILITIES, SYSTEM_ID } from "./constants.mjs";

function isPreRollEffect(item) {
  return ["abilityBonus", "advantage"].includes(item.system.effectType);
}

export async function activateImprovement(actor, item) {
  if (!actor || actor.type !== "pia" || !item || item.type !== "improvement") return false;

  const effectType = item.system.effectType;
  const cost = Number(item.system.energyCost || 0);

  if (effectType === "reroll") {
    ui.notifications.info("Cette Amélioration est proposée directement sur le résultat d’un jet.");
    return false;
  }

  if (effectType === "preventConstraint") {
    ui.notifications.info("Le bouclier est proposé directement après une Réussite partielle.");
    return false;
  }

  if (effectType === "convertResource") {
    ui.notifications.info("La conversion Ressources → Donnée/Énergie sera automatisée avec le cycle de Rencontre.");
    return false;
  }

  if (["installResource", "installData"].includes(effectType)) {
    ui.notifications.info("L’effet de cette Amélioration s’applique automatiquement lors de son installation.");
    return false;
  }

  if (!isPreRollEffect(item)) {
    ui.notifications.info("Cette Amélioration ne possède pas encore d’automatisation directe.");
    return false;
  }

  const pending = foundry.utils.deepClone(actor.getFlag(SYSTEM_ID, "pendingEffects") || []);

  if ((actor.system.energy?.value ?? 0) < cost) {
    ui.notifications.warn("Énergie insuffisante pour activer cette Amélioration.");
    return false;
  }

  if (cost > 0) {
    await actor.update({ "system.energy.value": actor.system.energy.value - cost });
  }

  const activationCount = pending.filter((effect) => effect.itemId === item.id).length + 1;

  pending.push({
    itemId: item.id,
    name: item.name,
    type: effectType,
    key: item.system.effectKey || "any",
    value: Number(item.system.effectValue || 0),
    cost
  });
  await actor.setFlag(SYSTEM_ID, "pendingEffects", pending);

  const ability = ABILITIES[item.system.effectKey]?.label;
  const effect = effectType === "abilityBonus"
    ? "+" + Number(item.system.effectValue || 0)
    : "Avantage";
  ui.notifications.info(
    item.name + " armé" + (activationCount > 1 ? " ×" + activationCount : "") +
    (ability ? " pour " + ability : "") + " (" + effect + ")."
  );
  actor.sheet?.render({ force: true });
  return true;
}

export function getPendingEffects(actor) {
  return foundry.utils.deepClone(actor.getFlag(SYSTEM_ID, "pendingEffects") || []);
}

export async function consumePendingEffects(actor, abilityKey) {
  const pending = getPendingEffects(actor);
  const used = [];
  const remaining = [];

  for (const effect of pending) {
    if (effect.key === "any" || effect.key === abilityKey) used.push(effect);
    else remaining.push(effect);
  }

  if (used.length) {
    if (remaining.length) await actor.setFlag(SYSTEM_ID, "pendingEffects", remaining);
    else await actor.unsetFlag(SYSTEM_ID, "pendingEffects");
  }
  return used;
}

export async function removePendingEffectsForItem(actor, itemId) {
  const pending = getPendingEffects(actor);
  const removed = pending.filter((effect) => effect.itemId === itemId);
  const remaining = pending.filter((effect) => effect.itemId !== itemId);
  if (!removed.length) return;

  const refund = removed.reduce((sum, effect) => sum + Number(effect.cost || 0), 0);
  if (refund > 0) {
    const max = Number(actor.system.energy?.max || 10);
    await actor.update({
      "system.energy.value": Math.min(max, Number(actor.system.energy?.value || 0) + refund)
    });
  }

  if (remaining.length) await actor.setFlag(SYSTEM_ID, "pendingEffects", remaining);
  else await actor.unsetFlag(SYSTEM_ID, "pendingEffects");
}

export async function clearPendingEffects(actor, { refund = false } = {}) {
  const pending = getPendingEffects(actor);
  if (refund && pending.length) {
    const refundAmount = pending.reduce((sum, effect) => sum + Number(effect.cost || 0), 0);
    const max = actor.system.energy?.max ?? 10;
    await actor.update({
      "system.energy.value": Math.min(max, (actor.system.energy?.value ?? 0) + refundAmount)
    });
  }
  await actor.unsetFlag(SYSTEM_ID, "pendingEffects");
}
