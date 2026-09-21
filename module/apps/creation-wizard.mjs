import { ABILITIES, SYSTEM_ID, TRAITS } from "../constants.mjs";
import { CORE_IMPROVEMENTS } from "../data/core-items.mjs";
import { ABILITY_VALUES, isActorCreationValid, TRAIT_VALUES, validateCreationState } from "../creation-rules.mjs";
import { appendJournalEntry } from "../journal.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const TRAIT_HELP = {
  technology: "Compétences techniques : informatique, ingénierie, robotique et systèmes complexes.",
  analysis: "Connaissances scientifiques, traitement de l’information, analyse et anticipation.",
  adaptability: "Capacité à s’adapter, improviser, naviguer et survivre dans des environnements inconnus."
};

const ABILITY_HELP = {
  computing: "Logiciels, code, réseaux numériques et recherche de données.",
  engineering: "Systèmes de vaisseaux et d’habitats, diagnostic, réparation et machines.",
  robotics: "IA, systèmes de contrôle, robots, drones et véhicules autonomes.",
  biology: "Sciences de la vie, écologie extraterrestre et exobiologie.",
  chemistry: "Réactions chimiques, matériaux, éléments et extraction de ressources.",
  physics: "Forces fondamentales, énergie, radiations, gravité et anomalies.",
  communication: "Communication efficace et éthique, systèmes étrangers et informations sensibles.",
  navigation: "Perception spatiale, orientation, exploration et environnements en apesanteur.",
  survival: "Intégrité de la Combinaison, survie, défense, urgence et gestion des ressources."
};

const STEPS = [
  { key: "identity", label: "Identité" },
  { key: "traits", label: "Traits" },
  { key: "technology", label: "Technologie" },
  { key: "analysis", label: "Analyse" },
  { key: "adaptability", label: "Adaptabilité" },
  { key: "review", label: "Validation" }
];

function initialState(actor) {
  return {
    name: actor.name || "PIA",
    traits: Object.fromEntries(
      Object.entries(TRAITS).map(([traitKey, trait]) => [
        traitKey,
        {
          value: Number(actor.system.traits?.[traitKey]?.value || 0),
          abilities: Object.fromEntries(
            trait.abilities.map((abilityKey) => [
              abilityKey,
              Number(actor.system.traits?.[traitKey]?.abilities?.[abilityKey]?.value || 0)
            ])
          )
        }
      ])
    )
  };
}

function selectOptions(values, selected, placeholder = "Choisir") {
  return [
    { value: 0, label: "— " + placeholder + " —", selected: Number(selected || 0) === 0 },
    ...values.map((value) => ({
      value,
      label: String(value),
      selected: Number(selected || 0) === value
    }))
  ];
}

function traitView(state, traitKey) {
  const trait = TRAITS[traitKey];
  const traitState = state.traits[traitKey];
  return {
    key: traitKey,
    label: trait.label,
    description: TRAIT_HELP[traitKey],
    value: traitState.value,
    options: selectOptions(TRAIT_VALUES, traitState.value),
    abilities: trait.abilities.map((abilityKey) => ({
      key: abilityKey,
      label: ABILITIES[abilityKey].label,
      description: ABILITY_HELP[abilityKey],
      value: traitState.abilities[abilityKey],
      options: selectOptions(ABILITY_VALUES, traitState.abilities[abilityKey])
    }))
  };
}

function captureFields(app) {
  app.element.querySelectorAll("[data-creation-field]").forEach((field) => {
    const path = field.dataset.creationField;
    if (!path) return;
    const value = field.type === "number" || field.tagName === "SELECT"
      ? Number(field.value)
      : field.value;
    foundry.utils.setProperty(app.creationState, path, value);
  });
}

function stepValidation(state, stepKey) {
  if (stepKey === "identity") return { valid: true, errors: [] };

  if (stepKey === "traits") {
    const values = Object.keys(TRAITS).map((key) => Number(state.traits[key].value || 0));
    const valid = values.slice().sort((a,b)=>a-b).join(",") === "3,4,5";
    return {
      valid,
      errors: valid ? [] : ["Attribuez une fois chacune les valeurs 3, 4 et 5 aux trois Traits."]
    };
  }

  if (Object.hasOwn(TRAITS, stepKey)) {
    const trait = TRAITS[stepKey];
    const values = trait.abilities.map((key) => Number(state.traits[stepKey].abilities[key] || 0));
    const valid = values.slice().sort((a,b)=>a-b).join(",") === "1,2,3";
    return {
      valid,
      errors: valid ? [] : ["Attribuez une fois chacune les valeurs 1, 2 et 3 aux Capacités de " + trait.label + "."]
    };
  }

  return validateCreationState(state);
}

async function ensureStartingImprovements(actor) {
  const existingKeys = new Set(
    actor.items
      .filter((item) => item.type === "improvement")
      .map((item) => item.getFlag(SYSTEM_ID, "coreKey"))
      .filter(Boolean)
  );
  const existingNames = new Set(actor.items.filter((item) => item.type === "improvement").map((item) => item.name));

  const missing = CORE_IMPROVEMENTS
    .filter((definition) => definition.starting)
    .filter((definition) => !existingKeys.has(definition.key) && !existingNames.has(definition.name))
    .map((definition) => {
      const { key, name, ...system } = definition;
      return {
        name,
        type: "improvement",
        system,
        flags: { [SYSTEM_ID]: { coreKey: key } }
      };
    });

  if (missing.length) await actor.createEmbeddedDocuments("Item", missing);
}

export class CreationWizard extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    this.creationState = initialState(actor);
    this.stepIndex = 0;
    this.wasConfigured = Boolean(actor.system.creationCompleted) || isActorCreationValid(actor);
    this.validationErrors = [];
  }

  static DEFAULT_OPTIONS = {
    id: "entity-creation-wizard",
    classes: ["entity", "creation-wizard"],
    tag: "section",
    position: { width: 690, height: 680 },
    window: { title: "Entité — Création du PIA", resizable: true },
    actions: {
      previous: CreationWizard.#previous,
      next: CreationWizard.#next,
      finish: CreationWizard.#finish,
      cancel: CreationWizard.#cancel
    }
  };

  static PARTS = {
    main: { template: "systems/entity/templates/creation-wizard.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const step = STEPS[this.stepIndex];
    const validation = stepValidation(this.creationState, step.key);

    context.actor = this.actor;
    context.state = this.creationState;
    context.step = step;
    context.stepNumber = this.stepIndex + 1;
    context.stepCount = STEPS.length;
    context.progressPercent = Math.round(((this.stepIndex + 1) / STEPS.length) * 100);
    context.isFirst = this.stepIndex === 0;
    context.isLast = this.stepIndex === STEPS.length - 1;
    context.isIdentity = step.key === "identity";
    context.isTraits = step.key === "traits";
    context.isAbilityStep = Object.hasOwn(TRAITS, step.key);
    context.isReview = step.key === "review";
    context.currentTrait = context.isAbilityStep ? traitView(this.creationState, step.key) : null;
    context.traits = Object.keys(TRAITS).map((key) => traitView(this.creationState, key));
    context.validStep = validation.valid;
    context.errors = this.validationErrors.length ? this.validationErrors : validation.errors;
    context.wasConfigured = this.wasConfigured;
    context.startingImprovements = CORE_IMPROVEMENTS.filter((item) => item.starting).map((item) => item.name);
    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);

    this.element.querySelectorAll("[data-creation-field]").forEach((field) => {
      field.addEventListener("change", () => {
        captureFields(this);
        this.validationErrors = [];
        this.render({ force: true });
      });
    });
  }

  static #cancel() {
    this.close();
  }

  static #previous() {
    captureFields(this);
    this.validationErrors = [];
    this.stepIndex = Math.max(0, this.stepIndex - 1);
    this.render({ force: true });
  }

  static #next() {
    captureFields(this);
    const step = STEPS[this.stepIndex];
    const validation = stepValidation(this.creationState, step.key);
    if (!validation.valid) {
      this.validationErrors = validation.errors;
      this.render({ force: true });
      return;
    }

    this.validationErrors = [];
    this.stepIndex = Math.min(STEPS.length - 1, this.stepIndex + 1);
    this.render({ force: true });
  }

  static async #finish() {
    captureFields(this);
    const validation = validateCreationState(this.creationState);
    if (!validation.valid) {
      this.validationErrors = validation.errors;
      this.render({ force: true });
      return;
    }

    const successorPending = Boolean(this.actor.getFlag(SYSTEM_ID, "successorPending"));
    const update = {
      name: this.creationState.name || this.actor.name || "PIA",
      "system.creationCompleted": true,
      "system.destroyed": false
    };

    for (const [traitKey, trait] of Object.entries(TRAITS)) {
      update["system.traits." + traitKey + ".value"] = Number(this.creationState.traits[traitKey].value);
      for (const abilityKey of trait.abilities) {
        update["system.traits." + traitKey + ".abilities." + abilityKey + ".value"] =
          Number(this.creationState.traits[traitKey].abilities[abilityKey]);
      }
    }

    if (!this.wasConfigured) {
      update["system.energy.value"] = 10;
      update["system.resources.value"] = 0;
      update["system.data.value"] = 0;
      update["system.constraints"] = [];
      update["system.failures"] = [];
    }

    await this.actor.update(update);
    await ensureStartingImprovements(this.actor);

    if (successorPending) {
      await this.actor.unsetFlag(SYSTEM_ID, "successorPending");
      await appendJournalEntry(
        this.actor,
        "Nouveau PIA opérationnel",
        "<p><strong>" + this.actor.name + "</strong> reprend l’exploration avec les Structures laissées par ses prédécesseurs.</p>"
      );
    }

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content:
        "<div class=\"entity-chat entity-creation-card\">" +
        "<span class=\"entity-kicker\">" + (successorPending ? "SUCCESSEUR INITIALISÉ" : "PIA INITIALISÉ") + "</span>" +
        "<h3>" + this.actor.name + "</h3>" +
        "<p>Traits et Capacités configurés conformément aux règles de création.</p>" +
        "</div>"
    });

    this.actor.sheet?.render({ force: true });
    await this.close();
  }
}

export function openCreationWizard(actor, { force = false } = {}) {
  if (!actor || actor.type !== "pia") return null;
  if (actor.system.destroyed && !actor.getFlag(SYSTEM_ID, "successorPending")) {
    ui.notifications.warn("Le PIA est détruit. Lancez d’abord la procédure de succession.");
    return null;
  }
  if (!force && (actor.system.creationCompleted || isActorCreationValid(actor))) return null;

  const existing = foundry.applications.instances.get("entity-creation-wizard");
  if (existing) existing.close();

  const wizard = new CreationWizard(actor);
  wizard.render({ force: true });
  return wizard;
}
