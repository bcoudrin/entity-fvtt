import { ABILITIES, ROLL_MODES, SUIT_SLOTS, TRAITS } from "../constants.mjs";
import { clearPendingEffects, getPendingEffects } from "../improvements.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

function passiveAbilityBonus(actor, abilityKey) {
  return actor.items
    .filter((item) => item.type === "structure")
    .filter((item) => item.system.effectType === "abilityBonus" && item.system.effectKey === abilityKey)
    .reduce((sum, item) => sum + Number(item.system.effectValue || 0) * Number(item.system.ranks || 1), 0);
}

export class PiaSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static TABS = {
    primary: {
      tabs: [
        { id: "systems", label: "Systèmes", icon: "fa-solid fa-microchip" },
        { id: "suit", label: "Combinaison", icon: "fa-solid fa-user-astronaut" },
        { id: "structures", label: "Structures", icon: "fa-solid fa-building" },
        { id: "journal", label: "Journal", icon: "fa-solid fa-book" }
      ],
      initial: "systems"
    }
  };

  static DEFAULT_OPTIONS = {
    classes: ["entity", "sheet", "pia-sheet"],
    tag: "form",
    position: { width: 920, height: 800 },
    window: { resizable: true },
    form: { submitOnChange: false, closeOnSubmit: false },
    actions: {
      rollAbility: PiaSheet.#rollAbility,
      activateImprovement: PiaSheet.#activateImprovement,
      clearPending: PiaSheet.#clearPending,
      addConstraint: PiaSheet.#addConstraint,
      addFailure: PiaSheet.#addFailure,
      removeCondition: PiaSheet.#removeCondition,
      openItem: PiaSheet.#openItem,
      deleteItem: PiaSheet.#deleteItem,
      createImprovement: PiaSheet.#createImprovement,
      createStructure: PiaSheet.#createStructure,
      openJournal: PiaSheet.#openJournal
    }
  };

  static PARTS = {
    main: { template: "systems/entity/templates/actor/pia-sheet.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.actor;

    context.system = actor.system;
    context.rollModes = Object.entries(ROLL_MODES).map(([key, value]) => ({ key, ...value }));
    context.traits = Object.entries(TRAITS).map(([traitKey, trait]) => {
      const traitData = actor.system.traits?.[traitKey];
      return {
        key: traitKey,
        label: trait.label,
        value: traitData?.value ?? 0,
        abilities: trait.abilities.map((abilityKey) => {
          const ability = ABILITIES[abilityKey];
          const value = traitData?.abilities?.[abilityKey]?.value ?? 0;
          const structureBonus = passiveAbilityBonus(actor, abilityKey);
          return {
            key: abilityKey,
            label: ability.label,
            value,
            target: Number(traitData?.value || 0) + Number(value || 0) + structureBonus,
            structureBonus
          };
        })
      };
    });

    context.improvements = actor.items.filter((item) => item.type === "improvement");
    context.structures = actor.items.filter((item) => item.type === "structure");
    context.missions = actor.items.filter((item) => item.type === "mission");
    context.pendingEffects = getPendingEffects(actor);

    const slots = [];
    for (const item of context.improvements) {
      slots.push({ kind: "improvement", label: item.name, itemId: item.id, icon: "fa-solid fa-puzzle-piece" });
    }
    Array.from(actor.system.constraints || []).forEach((label, index) => {
      slots.push({ kind: "constraint", label, index, removable: true, icon: "fa-solid fa-triangle-exclamation" });
    });
    Array.from(actor.system.failures || []).forEach((label, index) => {
      slots.push({ kind: "failure", label, index, removable: true, icon: "fa-solid fa-burst" });
    });
    while (slots.length < SUIT_SLOTS) slots.push({ kind: "empty", label: "Libre" });

    context.suitSlots = slots.slice(0, SUIT_SLOTS);
    context.suit = actor.suitState;
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
    await this.actor.update({ [path]: value });
  }

  static async #rollAbility(event, target) {
    const mode = this.element.querySelector("[data-roll-mode]")?.value || "normal";
    await this.actor.rollAction(target.dataset.ability, { mode });
  }

  static async #activateImprovement(event, target) {
    await this.actor.activateImprovement(target.dataset.itemId);
    this.render({ force: true });
  }

  static async #clearPending() {
    await clearPendingEffects(this.actor, { refund: true });
    this.render({ force: true });
  }

  static async #addConstraint() {
    await this.actor.addConstraint();
    this.render({ force: true });
  }

  static async #addFailure() {
    await this.actor.addFailure();
    this.render({ force: true });
  }

  static async #removeCondition(event, target) {
    await this.actor.removeCondition(target.dataset.kind, Number(target.dataset.index));
    this.render({ force: true });
  }

  static async #openItem(event, target) {
    this.actor.items.get(target.dataset.itemId)?.sheet?.render({ force: true });
  }

  static async #deleteItem(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (item) await item.delete();
    this.render({ force: true });
  }

  static async #createImprovement() {
    await this.actor.createEmbeddedDocuments("Item", [{ name: "Nouvelle Amélioration", type: "improvement" }]);
    this.render({ force: true });
  }

  static async #createStructure() {
    await this.actor.createEmbeddedDocuments("Item", [{ name: "Nouvelle Structure", type: "structure" }]);
    this.render({ force: true });
  }

  static async #openJournal() {
    await this.actor.openJournal();
  }
}