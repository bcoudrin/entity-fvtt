import { TRAITS } from "./constants.mjs";

export const TRAIT_VALUES = [3, 4, 5];
export const ABILITY_VALUES = [1, 2, 3];

function normalized(values) {
  return values.map((value) => Number(value)).sort((a, b) => a - b);
}

export function isExactDistribution(values, expected) {
  const actual = normalized(values);
  const target = normalized(expected);
  return actual.length === target.length && actual.every((value, index) => value === target[index]);
}

export function validateCreationState(state) {
  const errors = [];

  const traitValues = Object.keys(TRAITS).map((traitKey) => Number(state.traits?.[traitKey]?.value || 0));
  if (!isExactDistribution(traitValues, TRAIT_VALUES)) {
    errors.push("Les Traits doivent recevoir une fois chacun les valeurs 3, 4 et 5.");
  }

  for (const [traitKey, trait] of Object.entries(TRAITS)) {
    const values = trait.abilities.map((abilityKey) => Number(state.traits?.[traitKey]?.abilities?.[abilityKey] || 0));
    if (!isExactDistribution(values, ABILITY_VALUES)) {
      errors.push("Les Capacités de " + trait.label + " doivent recevoir une fois chacune les valeurs 1, 2 et 3.");
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function isActorCreationValid(actor) {
  if (!actor || actor.type !== "pia") return false;

  const state = {
    traits: Object.fromEntries(
      Object.entries(TRAITS).map(([traitKey, trait]) => [
        traitKey,
        {
          value: Number(actor.system.traits?.[traitKey]?.value || 0),
          abilities: Object.fromEntries(
            trait.abilities.map((abilityKey) => [
              abilityKey,
              Number(actor.system.traits?.[traitKey]?.abilities?.[abilityKey]?.value || 0)
            ])
          )
        }
      ])
    )
  };

  return validateCreationState(state).valid;
}
