import { ABILITIES } from "./constants.mjs";

export const CUSTOM_KEYWORD_TABLE = {
  1: "robotics",
  2: "computing",
  3: "engineering",
  4: "physics",
  5: "biology",
  6: "chemistry",
  7: "survival",
  8: "communication",
  9: "navigation",
  10: null
};

export function customKeywordFromD10(value) {
  const roll = Math.max(1, Math.min(10, Number(value) || 1));
  const abilityKey = CUSTOM_KEYWORD_TABLE[roll];
  return {
    roll,
    abilityKey,
    label: abilityKey ? ABILITIES[abilityKey]?.label || abilityKey : "Choisissez un mot-clé"
  };
}

export function resolvedCustomKeywords(keywordRolls = []) {
  return [...new Set(
    keywordRolls
      .map((entry) => entry?.abilityKey)
      .filter((key) => Boolean(key) && Boolean(ABILITIES[key]))
  )];
}

export function customKeywordsReady(keywordRolls = []) {
  return keywordRolls.length === 3 && keywordRolls.every((entry) => Boolean(entry?.abilityKey));
}

export function customFindReward(rollValue) {
  const roll = Math.max(1, Math.min(10, Number(rollValue) || 1));
  const mapping = {
    1: [{ resourceKey: "data", amount: 1 }],
    2: [{ resourceKey: "resources", amount: 1 }],
    3: [{ resourceKey: "energy", amount: 1 }],
    4: [{ resourceKey: "data", amount: 1 }, { resourceKey: "resources", amount: 1 }],
    5: [{ resourceKey: "resources", amount: 1 }, { resourceKey: "energy", amount: 1 }],
    6: [{ resourceKey: "energy", amount: 1 }, { resourceKey: "data", amount: 1 }],
    7: [{ resourceKey: "data", amount: 2 }],
    8: [{ resourceKey: "resources", amount: 2 }],
    9: [{ resourceKey: "energy", amount: 2 }],
    10: [
      { resourceKey: "data", amount: 1 },
      { resourceKey: "resources", amount: 1 },
      { resourceKey: "energy", amount: 1 }
    ]
  };
  return { roll, rewards: mapping[roll].map((reward) => ({ ...reward })) };
}

export function aggregateCustomRewards(findRolls = []) {
  const totals = { data: 0, resources: 0, energy: 0 };
  for (const result of findRolls) {
    for (const reward of result?.rewards || []) {
      if (Object.hasOwn(totals, reward.resourceKey)) {
        totals[reward.resourceKey] += Number(reward.amount || 0);
      }
    }
  }
  return ["data", "resources", "energy"]
    .filter((key) => totals[key] > 0)
    .map((resourceKey) => ({ resourceKey, amount: totals[resourceKey] }));
}

export function customEncounterRequirements(type, draft = {}) {
  if (type === "challenge") {
    return {
      ready: Boolean(draft.anomaly) && customKeywordsReady(draft.keywordRolls || []),
      rewardRollsRequired: 0
    };
  }
  if (type === "find") {
    return {
      ready: Array.isArray(draft.findRolls) && draft.findRolls.length >= 1,
      rewardRollsRequired: 1
    };
  }
  if (type === "opportunity") {
    return {
      ready:
        Boolean(draft.anomaly) &&
        customKeywordsReady(draft.keywordRolls || []) &&
        Array.isArray(draft.findRolls) &&
        draft.findRolls.length >= 2,
      rewardRollsRequired: 2
    };
  }
  return { ready: false, rewardRollsRequired: 0 };
}
