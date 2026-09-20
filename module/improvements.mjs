import { ABILITIES, SYSTEM_ID } from "./constants.mjs";

function isRollEffect(item) {
  return ["abilityBonus", "advantage", "reroll"].includes(item.system.effectType);
}

export async function activateImprovement(actor, item) {
  if (!actor || actor.type !== "pia" || !item || item.type !== "improvement") return false;

  const effectType = item.system.effectType;
  const cost = Number(item.system.energyCost || 0);

  if (effectType === "preventConstraint") {
    ui.notifications.info("Le bouclier s’active depuis le résultat d’un jet partiel.");
    return false;
  }

  if (effectType === "convertResource") {
    ui.notifications.info("La conversion Ressources → Donnée/Énergie sera automatisée avec le cycle de Rencontre.");
    return false;
  }

  if (!isRollEffect(item)) {
    ui.notifications.info("Cette Amélioration ne possède pas encore d’automatisation directe.");
    return false;
  }

  if ((actor.system.energy?.value ?? 0) < cost) {
    ui.notifications.warn("Énergie insuffisante pour activer cette Amélioration.");
    return false;
  }

  if (cost > 0) {
    await actor.update({ "system.energy.value": actor.system.energy.value - cost });
  }

  const pending = foundry.utils.deepClone(actor.getFlag(SYSTEM_ID, "pendingEffects") || []);
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
  ui.notifications.info(item.name + " activé" + (ability ? " pour " + ability : "") + ".");
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

  if (used.length) await actor.setFlag(SYSTEM_ID, "pendingEffects", remaining);
  return used;
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