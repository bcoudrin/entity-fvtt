import { ABILITIES } from "../constants.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class EntityItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["entity", "sheet", "entity-item-sheet"],
    tag: "form",
    position: { width: 660, height: 620 },
    window: { resizable: true },
    form: { submitOnChange: false, closeOnSubmit: false }
  };

  static PARTS = {
    main: { template: "systems/entity/templates/item/item-sheet.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.system = this.item.system;
    context.itemType = this.item.type;
    context.isImprovement = this.item.type === "improvement";
    context.isStructure = this.item.type === "structure";
    context.isMission = this.item.type === "mission";
    context.abilities = Object.entries(ABILITIES).map(([key, ability]) => ({ key, label: ability.label }));
    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this.element.querySelectorAll("input[name], textarea[name], select[name]").forEach((field) => {
      field.addEventListener("change", (event) => this.#updateField(event.currentTarget));
    });
  }

  async #updateField(field) {
    const path = field.name;
    if (!path || field.disabled) return;
    let value;
    if (field.type === "checkbox") value = field.checked;
    else if (field.type === "number") {
      if (field.value === "") return;
      value = Number(field.value);
    } else value = field.value;
    await this.item.update({ [path]: value });
  }
}