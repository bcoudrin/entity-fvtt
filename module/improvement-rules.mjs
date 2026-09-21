export function isInstallTriggeredEffect(effectType) {
  return ["installResource", "installData"].includes(effectType);
}

export function installEffectPlan(itemSystem, actorSystem) {
  if (!isInstallTriggeredEffect(itemSystem?.effectType)) return null;

  const resourceKey = itemSystem.effectType === "installResource" ? "resources" : "data";
  const energyCost = Number(itemSystem.energyCost || 0);
  const gain = Number(itemSystem.effectValue || 0);
  const energy = Number(actorSystem?.energy?.value || 0);
  const current = Number(actorSystem?.[resourceKey]?.value || 0);
  const max = Number(actorSystem?.[resourceKey]?.max || 10);

  return {
    resourceKey,
    energyCost,
    gain,
    enoughEnergy: energy >= energyCost,
    nextEnergy: Math.max(0, energy - energyCost),
    nextValue: Math.min(max, current + gain)
  };
}
