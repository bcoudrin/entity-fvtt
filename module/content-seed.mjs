import { CORE_IMPROVEMENTS, CORE_MISSIONS, CORE_STRUCTURES } from "./data/core-items.mjs";
import { createCoreRollTables } from "./roll-tables.mjs";

async function ensureFolder(name) {
  let folder = game.folders.find((candidate) => candidate.type === "Item" && candidate.name === name);
  if (!folder) folder = await Folder.create({ name, type: "Item" });
  return folder;
}

function toItemData(definition, type, folderId) {
  const { key, name, ...system } = definition;
  return {
    name,
    type,
    folder: folderId,
    system,
    flags: { entity: { coreKey: key } }
  };
}

async function upsertCoreItem(definition, type, folderId) {
  const existing = game.items.find((item) =>
    item.type === type && item.getFlag("entity", "coreKey") === definition.key
  );
  const data = toItemData(definition, type, folderId);

  if (existing) {
    await existing.update({ name: data.name, folder: data.folder, system: data.system });
    return existing;
  }
  return Item.create(data);
}

export async function seedCoreContent() {
  if (!game.user?.isGM) {
    ui.notifications.warn("Seul le MJ peut importer le contenu de base Entité.");
    return null;
  }

  const improvementFolder = await ensureFolder("Entité — Améliorations");
  const structureFolder = await ensureFolder("Entité — Structures");
  const missionFolder = await ensureFolder("Entité — Missions");

  const improvements = [];
  for (const definition of CORE_IMPROVEMENTS) {
    improvements.push(await upsertCoreItem(definition, "improvement", improvementFolder.id));
  }

  const structures = [];
  for (const definition of CORE_STRUCTURES) {
    structures.push(await upsertCoreItem(definition, "structure", structureFolder.id));
  }

  const missions = [];
  for (const definition of CORE_MISSIONS) {
    missions.push(await upsertCoreItem(definition, "mission", missionFolder.id));
  }

  const tables = await createCoreRollTables();
  ui.notifications.info("Contenu de base Entité importé.");
  return { improvements, structures, missions, tables };
}
