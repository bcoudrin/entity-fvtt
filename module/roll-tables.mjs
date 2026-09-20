import { ABILITIES } from "./constants.mjs";
import { CORE_TABLES } from "./data/tables.mjs";

function toRange(range) {
  return Array.isArray(range) ? range : [range, range];
}

function resultData(entry) {
  const labels = (entry.keywords || []).map((key) => ABILITIES[key]?.label || key);
  const text = labels.length
    ? entry.text + "<hr><strong>Mots-clés :</strong> " + labels.join(", ")
    : entry.text;

  return {
    type: CONST.TABLE_RESULT_TYPES.TEXT,
    text,
    range: toRange(entry.range),
    weight: toRange(entry.range)[1] - toRange(entry.range)[0] + 1,
    drawn: false
  };
}

async function upsertRollTable(definition) {
  let table = game.tables.find((candidate) => candidate.getFlag("entity", "coreKey") === definition.key);
  const results = definition.entries.map(resultData);

  if (table) {
    const ids = table.results.map((result) => result.id);
    if (ids.length) await table.deleteEmbeddedDocuments("TableResult", ids);
    await table.update({
      name: definition.name,
      formula: definition.formula,
      replacement: true,
      displayRoll: true
    });
    await table.createEmbeddedDocuments("TableResult", results);
    return table;
  }

  return RollTable.create({
    name: definition.name,
    formula: definition.formula,
    replacement: true,
    displayRoll: true,
    results,
    flags: { entity: { coreKey: definition.key } }
  });
}

export async function createCoreRollTables() {
  if (!game.user?.isGM) {
    ui.notifications.warn("Seul le MJ peut créer les RollTables du système.");
    return [];
  }

  const tables = [];
  for (const definition of CORE_TABLES) {
    tables.push(await upsertRollTable(definition));
  }

  ui.notifications.info(tables.length + " RollTables Entité synchronisées.");
  return tables;
}
