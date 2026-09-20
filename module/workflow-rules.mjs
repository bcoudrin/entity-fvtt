export function clampDataSpend(requested, available) {
  const amount = Number.isFinite(Number(requested)) ? Math.floor(Number(requested)) : 0;
  return Math.max(0, Math.min(amount, Math.max(0, Number(available) || 0)));
}

export function resolveRangedEntry(entries, value) {
  if (!entries?.length) return null;
  const total = Number(value);
  const direct = entries.find((entry) => total >= entry.range[0] && total <= entry.range[1]);
  if (direct) return direct;

  const sorted = [...entries].sort((a, b) => a.range[0] - b.range[0]);
  if (total < sorted[0].range[0]) return sorted[0];
  return sorted[sorted.length - 1];
}

export function travelEncounterType(total) {
  const value = Number(total);
  if (value <= 4) return "challenge";
  if (value <= 7) return "none";
  if (value <= 9) return "opportunity";
  return "find";
}

export function locationEncounterPlan(total) {
  const value = Number(total);

  if (value <= 2) {
    return [{ type: "challenge", threat: 3, disadvantage: false }];
  }
  if (value <= 4) {
    return [{ type: "challenge", threat: 2, disadvantage: false }];
  }
  if (value === 5) {
    return [{ type: "challenge", threat: 1, disadvantage: true }];
  }
  if (value === 6) {
    return [
      { type: "challenge", threat: 1, disadvantage: true },
      { type: "opportunity", threat: 1, disadvantage: true }
    ];
  }
  if (value <= 8) {
    return [
      { type: "challenge", threat: 1, disadvantage: false },
      { type: "opportunity", threat: 1, disadvantage: false }
    ];
  }
  if (value === 9) {
    return [
      { type: "challenge", threat: 1, disadvantage: false },
      { type: "opportunity", threat: 1, disadvantage: false },
      { type: "find", threat: 0, disadvantage: false }
    ];
  }
  return [
    { type: "challenge", threat: 1, disadvantage: false },
    { type: "opportunity", threat: 1, disadvantage: false },
    { type: "find", threat: 0, disadvantage: false },
    { type: "aspect", threat: 0, disadvantage: false }
  ];
}

export function missionNumberFromKey(key) {
  const match = String(key || "").match(/(\d+)$/);
  return match ? Number(match[1]) : 999;
}

export function secondaryGain(result, traitValue) {
  const value = Math.max(0, Number(traitValue) || 0);
  if (result === "full") return value;
  if (result === "partial") return Math.floor(value / 2);
  return 0;
}
