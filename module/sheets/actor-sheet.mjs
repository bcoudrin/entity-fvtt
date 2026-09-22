import { ABILITIES, SUIT_SLOTS, SYSTEM_ID, TRAITS } from "../constants.mjs";
import { chooseRollMode } from "../dialogs.mjs";
import { clearPendingEffects, getPendingEffects } from "../improvements.mjs";
import { ExpeditionPanel } from "../apps/expedition-panel.mjs";
import { openCreationWizard } from "../apps/creation-wizard.mjs";
import { isActorCreationReady, isActorCreationValid } from "../creation-rules.mjs";
import { getDiscoveryStatus, revealNextDiscovery } from "../journal.mjs";
import { prepareSuccessor } from "../destruction.mjs";
import { openOraclePanel } from "../apps/oracle-panel.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

function passiveAbilityBonus(actor, abilityKey) {
  return actor.items
    .filter((item) => item.type === "structure")
    .filter((item) => item.system.effectType === "abilityBonus" && item.system.effectKey === abilityKey)
    .reduce((sum, item) => sum + Number(item.system.effectValue || 0) * Number(item.system.ranks || 1), 0);
}

function resourceMeter(key, label, code, resource) {
  const value = Math.max(0, Number(resource?.value || 0));
  const max = Math.max(1, Number(resource?.max || 10));
  return {
    key,
    label,
    code,
    value,
    max,
    segments: Array.from({ length: max }, (_, index) => ({
      index: index + 1,
      filled: index < value
    }))
  };
}

function improvementSlot(item, pendingIds) {
  const type = item.system.effectType;
  const activatable = ["abilityBonus", "advantage"].includes(type);
  let status = "Module";

  if (type === "reroll") status = "Réactif au résultat";
  else if (type === "preventConstraint") status = "Réactif sur réussite partielle";
  else if (type === "convertResource") status = "Réactif en Rencontre";
  else if (["installResource", "installData"].includes(type)) status = "Effet d’installation";
  else if (activatable) status = pendingIds.has(item.id) ? "Armé" : "À activer";

  return {
    kind: "improvement",
    label: item.name,
    itemId: item.id,
    icon: "fa-solid fa-puzzle-piece",
    cost: Number(item.system.energyCost || 0),
    activatable,
    pending: pendingIds.has(item.id),
    status
  };
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
      openJournal: PiaSheet.#openJournal,
      openOracle: PiaSheet.#openOracle,
      revealDiscovery: PiaSheet.#revealDiscovery,
      openCreation: PiaSheet.#openCreation,
      openExpedition: PiaSheet.#openExpedition
    }
  };

  static PARTS = {
    main: { template: "systems/entity/templates/actor/pia-sheet.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.actor;

    context.actor = actor;
    context.system = actor.system;
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
    context.isDestroyed = Boolean(actor.system.destroyed);
    context.successorPending = Boolean(actor.getFlag(SYSTEM_ID, "successorPending"));
    context.creation = {
      completed: Boolean(actor.system.creationCompleted),
      valid: isActorCreationValid(actor),
      ready: isActorCreationReady(actor)
    };
    context.creation.needsCreation = !context.creation.ready;
    context.discoveries = getDiscoveryStatus(actor);
    context.discoveries.hasPending = context.discoveries.pending > 0;
    context.discoveries.complete = context.discoveries.revealed >= context.discoveries.total;
    context.rollsDisabled = Boolean(context.isDestroyed || context.creation.needsCreation);
    context.resourceMeters = [
      resourceMeter("resources", "Ressources", "R", actor.system.resources),
      resourceMeter("energy", "Énergie", "E", actor.system.energy),
      resourceMeter("data", "Données", "D", actor.system.data)
    ];
    context.missionSummary = {
      active: Boolean(actor.system.mission?.activeKey),
      name: actor.system.mission?.name || "",
      aspectsCurrent: Number(actor.system.mission?.aspectsCurrent || 0),
      aspectsRequired: Number(actor.system.mission?.aspectsRequired || 0),
      expeditionNumber: Number(actor.system.expeditionNumber || 0)
    };

    const pendingIds = new Set(context.pendingEffects.map((effect) => effect.itemId));
    const slots = context.improvements.map((item) => improvementSlot(item, pendingIds));

    Array.from(actor.system.constraints || []).forEach((label, index) => {
      slots.push({ kind: "constraint", label, index, removable: true, icon: "fa-solid fa-triangle-exclamation" });
    });

    Array.from(actor.system.failures || []).forEach((label, index) => {
      slots.push({ kind: "failure", label, index, removable: false, icon: "fa-solid fa-burst" });
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

    const nameField = this.element.querySelector('input[name="name"]');
    if (nameField) {
      nameField.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          nameField.blur();
        }
      });
    }
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

    if (path === "name") await this.actor.update({ name: value });
    else await this.actor.update({ [path]: value });
  }

  static async #rollAbility(event, target) {
    const abilityKey = target.dataset.ability;
    let mode;
    try {
      mode = await chooseRollMode(ABILITIES[abilityKey]?.label || abilityKey, getPendingEffects(this.actor));
    } catch (error) {
      console.error("entity | Impossible d’ouvrir le dialogue de jet", error);
      ui.notifications.error("Impossible d’ouvrir le dialogue de jet. Consultez la console.");
      return;
    }
    if (!mode) return;

    try {
      await this.actor.rollAction(abilityKey, { mode });
    } catch (error) {
      console.error("entity | Échec du jet d’Action", error);
      ui.notifications.error("Le jet d’Action a échoué. Consultez la console.");
    }
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
    if (this.actor.suitState.used >= SUIT_SLOTS) {
      ui.notifications.warn("La Combinaison ne dispose d’aucun emplacement libre.");
      return;
    }
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

  static #openOracle() {
    openOraclePanel(this.actor);
  }

  static async #revealDiscovery() {
    await revealNextDiscovery(this.actor);
    this.render({ force: true });
  }

  static async #openCreation() {
    if (this.actor.system.destroyed && !this.actor.getFlag(SYSTEM_ID, "successorPending")) {
      await prepareSuccessor(this.actor);
      return;
    }
    openCreationWizard(this.actor, { force: true });
  }

  static #openExpedition() {
    if (this.actor.system.destroyed) {
      ui.notifications.warn("Ce PIA est détruit. Créez son successeur avant de poursuivre.");
      return;
    }
    if (!isActorCreationReady(this.actor)) {
      ui.notifications.warn("Terminez d’abord la création du PIA.");
      openCreationWizard(this.actor);
      return;
    }
    const existing = foundry.applications.instances.get("entity-expedition-panel");
    if (existing) existing.close();
    new ExpeditionPanel(this.actor).render({ force: true });
  }
}
