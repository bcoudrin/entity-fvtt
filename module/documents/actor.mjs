import { SUIT_SLOTS } from "../constants.mjs";
import { rollAction } from "../dice.mjs";
import { chooseImprovementToDiscard } from "../dialogs.mjs";
import { activateImprovement } from "../improvements.mjs";
import { openPiaJournal } from "../journal.mjs";
import { isDestroyedByDamage } from "../destruction-rules.mjs";
import { markPiaDestroyed } from "../destruction.mjs";

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
    if (this.system.destroyed) {
      ui.notifications.warn("Ce PIA est détruit et ne peut plus effectuer de jet d’Action.");
      return false;
    }
    return rollAction(this, abilityKey, options);
  }

  activateImprovement(itemId) {
    if (this.system.destroyed) {
      ui.notifications.warn("Les Améliorations de ce PIA sont perdues à sa destruction.");
      return false;
    }
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
    if (this.system.destroyed) return false;
    if (!await this.#makeRoomForDamage("une Contrainte")) return false;

    const constraints = Array.from(this.system.constraints || []);
    constraints.push(label);
    await this.update({ "system.constraints": constraints });
    await this.#checkDestruction();
    return true;
  }

  async addFailure(label = "Défaillance") {
    if (this.system.destroyed) return false;
    if (!await this.#makeRoomForDamage("une Défaillance")) return false;

    const failures = Array.from(this.system.failures || []);
    failures.push(label);
    await this.update({ "system.failures": failures });
    await this.#checkDestruction();
    return true;
  }

  async removeCondition(kind, index) {
    if (this.system.destroyed) {
      ui.notifications.warn("La destruction du PIA est définitive. Créez un nouveau personnage.");
      return;
    }
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
    if (!isDestroyedByDamage(this.system.constraints, this.system.failures, SUIT_SLOTS)) return;
    await markPiaDestroyed(this);
  }
}
