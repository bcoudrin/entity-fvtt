import { SUIT_SLOTS } from "../constants.mjs";
import { rollAction } from "../dice.mjs";
import { activateImprovement } from "../improvements.mjs";
import { openPiaJournal } from "../journal.mjs";

export class EntityActor extends Actor {
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

  async addConstraint(label = "Contrainte") {
    if (this.suitState.used >= SUIT_SLOTS) {
      ui.notifications.warn("La Combinaison est pleine. Défaussez d’abord une Amélioration pour créer un emplacement.");
      return false;
    }
    const constraints = Array.from(this.system.constraints || []);
    constraints.push(label);
    await this.update({ "system.constraints": constraints });
    await this.#checkDestruction();
    return true;
  }

  async addFailure(label = "Défaillance") {
    if (this.suitState.used >= SUIT_SLOTS) {
      ui.notifications.warn("La Combinaison est pleine. Défaussez d’abord une Amélioration pour créer un emplacement.");
      return false;
    }
    const failures = Array.from(this.system.failures || []);
    failures.push(label);
    await this.update({ "system.failures": failures });
    await this.#checkDestruction();
    return true;
  }

  async removeCondition(kind, index) {
    if (!["constraints", "failures"].includes(kind)) return;
    const values = Array.from(this.system[kind] || []);
    if (index < 0 || index >= values.length) return;
    values.splice(index, 1);
    await this.update({ ["system." + kind]: values });
  }

  async #checkDestruction() {
    if (!this.suitState.destroyed) return;
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: "<div class=\"entity-chat entity-destroyed\"><strong>PIA DÉTRUIT</strong><p>Les 20 emplacements de la Combinaison sont occupés par des Contraintes et/ou Défaillances.</p></div>"
    });
  }
}