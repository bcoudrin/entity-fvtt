import { SYSTEM_ID } from "./constants.mjs";
import { ADVANCED_NARRATIVE_TABLES } from "./data/advanced-narrative-tables.mjs";
import { appendJournalEntry } from "./journal.mjs";
import { resolveRangedEntry } from "./workflow-rules.mjs";

const FLAG = "actionInterpretation";

function stateCopy(message) {
  return foundry.utils.mergeObject(
    { action: null, theme: null },
    foundry.utils.deepClone(message.getFlag(SYSTEM_ID, FLAG) || {}),
    { inplace: false }
  );
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function rollTable(tableKey) {
  const table = ADVANCED_NARRATIVE_TABLES[tableKey];
  if (!table) return null;
  const roll = await new Roll(table.formula || "1d100").evaluate();
  const entry = resolveRangedEntry(table.entries, Number(roll.total));
  return {
    tableKey,
    tableName: table.name,
    roll: Number(roll.total),
    text: entry?.text || ""
  };
}

export function getActionInterpretationState(message) {
  return stateCopy(message);
}

export async function rollActionInterpretationOracle(message, tableKey) {
  if (!["actions", "themes"].includes(tableKey)) return false;
  const state = stateCopy(message);
  const result = await rollTable(tableKey);
  state[tableKey === "actions" ? "action" : "theme"] = result;
  await message.setFlag(SYSTEM_ID, FLAG, state);
  return true;
}

export async function rollActionThemePair(message) {
  const state = stateCopy(message);
  state.action = await rollTable("actions");
  state.theme = await rollTable("themes");
  await message.setFlag(SYSTEM_ID, FLAG, state);
  return true;
}

export async function journalActionInterpretation(message, note = "") {
  const rollState = foundry.utils.deepClone(message.getFlag(SYSTEM_ID, "actionRoll") || {});
  const actor = rollState.actorUuid ? await fromUuid(rollState.actorUuid) : null;
  if (!actor) return false;

  const oracle = stateCopy(message);
  const cleanNote = String(note || "").trim();
  if (!cleanNote && !oracle.action && !oracle.theme) {
    ui.notifications.warn("Ajoutez une note ou générez au moins une inspiration Action / Thème.");
    return false;
  }

  let body =
    "<p><strong>Jet :</strong> " + escapeHtml(rollState.actionLabel || "Action") +
    " — " + escapeHtml(rollState.resultLabel || rollState.result || "") + ".</p>";

  if (oracle.action || oracle.theme) {
    const pair = [
      oracle.action ? escapeHtml(oracle.action.text) : "",
      oracle.theme ? escapeHtml(oracle.theme.text) : ""
    ].filter(Boolean).join(" + ");
    body += "<p><strong>Inspiration :</strong> " + pair + ".</p>";
  }

  if (cleanNote) {
    body += "<p><strong>Interprétation :</strong> " + escapeHtml(cleanNote).replaceAll("\n", "<br>") + "</p>";
  }

  await appendJournalEntry(actor, "Interprétation d’Action", body);
  ui.notifications.info("Interprétation ajoutée au Journal de bord.");
  return true;
}
