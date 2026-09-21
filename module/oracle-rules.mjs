export function askOracleOutcome(total) {
  const value = Number(total || 0);
  if (value <= 1) return { key: "no-and", label: "Non, et aussi…" };
  if (value === 2) return { key: "no-but", label: "Non, mais…" };
  if (value <= 5) return { key: "no", label: "Non" };
  if (value <= 8) return { key: "yes", label: "Oui" };
  if (value === 9) return { key: "yes-but", label: "Oui, mais…" };
  return { key: "yes-and", label: "Oui, et aussi…" };
}
