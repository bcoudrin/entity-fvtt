import { askOracleOutcome } from "../oracle-rules.mjs";
import { appendJournalEntry } from "../journal.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class OraclePanel extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    this.question = "";
    this.last = null;
  }

  static DEFAULT_OPTIONS = {
    id: "entity-oracle-panel",
    classes: ["entity", "oracle-panel"],
    tag: "section",
    position: { width: 520, height: 430 },
    window: { title: "Entité — Demander à l’Oracle", resizable: true },
    actions: {
      ask: OraclePanel.#ask,
      clear: OraclePanel.#clear
    }
  };

  static PARTS = {
    main: { template: "systems/entity/templates/oracle-panel.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actor = this.actor;
    context.question = this.question;
    context.last = this.last;
    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    const field = this.element.querySelector("[name='oracleQuestion']");
    if (field) {
      field.addEventListener("input", () => {
        this.question = field.value;
      });
    }
  }

  static async #ask() {
    const field = this.element.querySelector("[name='oracleQuestion']");
    this.question = String(field?.value || this.question || "").trim();
    if (!this.question) {
      ui.notifications.warn("Formulez une question à laquelle l’Oracle peut répondre par oui ou non.");
      return;
    }

    const roll = await new Roll("1d10").evaluate();
    const total = Number(roll.total || 0);
    const outcome = askOracleOutcome(total);
    this.last = { total, ...outcome };

    const content =
      "<div class=\"entity-chat entity-oracle-card\">" +
      "<span class=\"entity-kicker\">DEMANDER À L’ORACLE</span>" +
      "<h3>" + this.question + "</h3>" +
      "<p class=\"entity-oracle-result\"><strong>d10 " + total + "</strong> — " + outcome.label + "</p>" +
      "</div>";

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content,
      sound: CONFIG.sounds?.dice || "sounds/dice.wav"
    });

    await appendJournalEntry(
      this.actor,
      "Oracle — " + outcome.label,
      "<p><strong>Question :</strong> " + this.question + "</p><p><strong>d10 " + total + "</strong> — " + outcome.label + "</p>"
    );

    this.render({ force: true });
  }

  static #clear() {
    this.question = "";
    this.last = null;
    this.render({ force: true });
  }
}

export function openOraclePanel(actor) {
  if (!actor || actor.type !== "pia") {
    ui.notifications.warn("Sélectionnez un PIA.");
    return null;
  }

  const existing = foundry.applications.instances.get("entity-oracle-panel");
  if (existing) existing.close();

  const panel = new OraclePanel(actor);
  panel.render({ force: true });
  return panel;
}
