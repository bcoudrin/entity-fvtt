const fields = foundry.data.fields;

function number(initial, min = 0) {
  return new fields.NumberField({ required: true, nullable: false, integer: true, initial, min });
}
function text(initial = "") {
  return new fields.StringField({ required: true, nullable: false, initial });
}
function html() {
  return new fields.HTMLField({ required: true, nullable: false, initial: "" });
}

export class ImprovementData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      energyCost: number(0),
      effectType: text("special"),
      effectKey: text("any"),
      effectValue: number(0),
      starting: new fields.BooleanField({ required: true, nullable: false, initial: false }),
      description: html()
    };
  }
}

export class StructureData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      effectType: text("special"),
      effectKey: text("any"),
      effectValue: number(0),
      ranks: number(1, 1),
      repeatable: new fields.BooleanField({ required: true, nullable: false, initial: false }),
      maxRanks: number(1, 1),
      description: html()
    };
  }
}

export class MissionData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      aspectsRequired: number(0),
      aspectsCurrent: number(0),
      structureName: text(),
      repeatable: new fields.BooleanField({ required: true, nullable: false, initial: false }),
      maxRepeats: number(1, 1),
      completed: new fields.BooleanField({ required: true, nullable: false, initial: false }),
      description: html()
    };
  }
}
