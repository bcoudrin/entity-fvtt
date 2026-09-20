const fields = foundry.data.fields;

function number(initial, min = 0, max = null) {
  const options = { required: true, nullable: false, integer: true, initial, min };
  if (max !== null) options.max = max;
  return new fields.NumberField(options);
}

function text(initial = "") {
  return new fields.StringField({ required: true, nullable: false, initial });
}

function resource(value = 0, max = 10) {
  return new fields.SchemaField({ value: number(value), max: number(max, 0) });
}

function abilitySchema() {
  return new fields.SchemaField({ value: number(0, 0, 20) });
}

function traitSchema(keys) {
  return new fields.SchemaField({
    value: number(0, 0, 20),
    abilities: new fields.SchemaField(Object.fromEntries(keys.map((key) => [key, abilitySchema()])))
  });
}

export class PiaData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      traits: new fields.SchemaField({
        technology: traitSchema(["computing", "engineering", "robotics"]),
        analysis: traitSchema(["biology", "chemistry", "physics"]),
        adaptability: traitSchema(["communication", "navigation", "survival"])
      }),
      energy: resource(10, 10),
      resources: resource(0, 10),
      data: resource(0, 10),
      constraints: new fields.ArrayField(text()),
      failures: new fields.ArrayField(text()),
      discoveriesUnlocked: number(0, 0, 10),
      notes: new fields.HTMLField({ required: true, nullable: false, initial: "" })
    };
  }
}
