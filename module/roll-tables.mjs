import { CORE_TABLES } from "./data/tables.mjs";

function toRange(range) {
  return Array.isArray(range) ? range : [range, range];
}

function resultData(entry) {
  const text = entry.keywords?.length
    ? entry.text + "<hr><strong>Mots-clés :</strong> " + entry.keywords.join(", ")
    : entry.text;

  return {
    type: CONST.TABLE_RESULT_TYPES.TEXT,
    text,
    range: toRange(entry.range),
    weight: 1,
    drawn: false
  };
}

export async function createCoreRollTables() {
  if (!game.user?.isGM) {
    ui.notifications.warn("Seul le MJ peut créer les RollTables du système.");
    return [];
  }

  const created = [];
  for (const definition of CORE_TABLES) {
    let table = game.tables.find((candidate) => candidate.getFlag("entity", "coreKey") === definition.key);
    if (!table) {
      table = await RollTable.create({
        name: definition.name,
        formula: definition.formula,
        results: definition.entries.map(resultData),
        flags: { entity: { coreKey: definition.key } }
      });
    }
    created.push(table);
  }

  ui.notifications.info(created.length + " RollTables Entité disponibles dans ce monde.");
  return created;
}