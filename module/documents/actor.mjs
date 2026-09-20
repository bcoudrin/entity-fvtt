import { SUIT_SLOTS } from "../constants.mjs";
import { rollAction } from "../dice.mjs";
import { chooseImprovementToDiscard } from "../dialogs.mjs";
import { activateImprovement } from "../improvements.mjs";
import { openPiaJournal } from "../journal.mjs";

function structureTotal(actor, effectType) {
  return actor.items
    .filter((item) => item.type === "structure" && item.system.effectType === effectType)
    .reduce((sum, item) => sum + Number(item.system.effectValue || 0) * Number(item.system.ranks || 1), 0);
}

export class EntityActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type !== "pia" || !this.system) return;

    this.system.energy.max = 10 + structureTotal(this, "maxEnergy");
    this.system.resources.max = 10 + structureTotal(this, "maxResources");
    this.system.data.max = 10 + structureTotal(this, "maxData");
  }

  get suitState() {
    const improvements = this.items.filter((item) => item.type === "improvement");
    const constraints = Array.from(this.system.constraints || []);
    const failures = Array.from(this.system.failures || []);
    const used = improvements.length + constraints.length + failures.length;

    return {
      max: SUIT_SLOTS,
      improvements,
      constraints,
      failures,
      used,
      free: Math.max(0, SUIT_SLOTS - used),
      destroyed: constraints.length + failures.length >= SUIT_SLOTS
    };
  }

  rollAction(abilityKey, options = {}) {
    return rollAction(this, abilityKey, options);
  }

  activateImprovement(itemId) {
    return activateImprovement(this, this.items.get(itemId));
  }

  openJournal() {
    return openPiaJournal(this);
  }

  async #makeRoomForDamage(consequenceLabel) {
    if (this.suitState.used < SUIT_SLOTS) return true;

    const improvements = this.items.filter((item) => item.type === "improvement");
    if (!improvements.length) {
      if (this.suitState.destroyed) ui.notifications.warn("Le PIA est déjà détruit.");
      else ui.notifications.warn("La Combinaison ne dispose d’aucun emplacement libre.");
      return false;
    }

    const itemId = await chooseImprovementToDiscard(this, consequenceLabel);
    if (!itemId) return false;

    const item = this.items.get(itemId);
    if (!item) return false;

    await item.delete();
    return this.suitState.used < SUIT_SLOTS;
  }

  async addConstraint(label = "Contrainte") {
    if (!await this.#makeRoomForDamage("une Contrainte")) return false;

    const constraints = Array.from(this.system.constraints || []);
    constraints.push(label);
    await this.update({ "system.constraints": constraints });
    await this.#checkDestruction();
    return true;
  }

  async addFailure(label = "Défaillance") {
    if (!await this.#makeRoomForDamage("une Défaillance")) return false;

    const failures = Array.from(this.system.failures || []);
    failures.push(label);
    await this.update({ "system.failures": failures });
    await this.#checkDestruction();
    return true;
  }

  async removeCondition(kind, index) {
    if (kind !== "constraints") {
      ui.notifications.warn("Une Défaillance est permanente jusqu’à la destruction du PIA.");
      return;
    }

    const values = Array.from(this.system.constraints || []);
    if (index < 0 || index >= values.length) return;
    values.splice(index, 1);
    await this.update({ "system.constraints": values });
  }

  async #checkDestruction() {
    const damage = Array.from(this.system.constraints || []).length + Array.from(this.system.failures || []).length;
    if (damage < SUIT_SLOTS) return;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: "<div class=\"entity-chat entity-destroyed\"><strong>PIA DÉTRUIT</strong><p>Les 20 emplacements de la Combinaison sont occupés par des Contraintes et/ou Défaillances. Les Améliorations et la progression de Mission sont perdues ; les Structures persistent.</p></div>"
    });
  }
}
