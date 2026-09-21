import { ABILITIES, SYSTEM_ID, TRAITS } from "./constants.mjs";
import { CORE_TABLES } from "./data/tables.mjs";
import { appendJournalEntry, closeMissionJournalPage, ensureDiscoveryState, startMissionJournalPage, syncDiscoveriesPage } from "./journal.mjs";
import { refreshActionRollMessage, rollThresholdAction } from "./dice.mjs";
import { isActorCreationReady } from "./creation-rules.mjs";
import { clearPendingEffects } from "./improvements.mjs";
import {
  clampDataSpend,
  locationEncounterPlan,
  missionNumberFromKey,
  parseEncounterRewards,
  opportunityOutcome,
  resolveChallengeOutcome,
  resolveRangedEntry,
  secondaryGain,
  travelEncounterType
} from "./workflow-rules.mjs";

const DEFAULT_WORKFLOW = {
  stage: "idle",
  powerConstraintPending: false,
  location: null,
  travel: null,
  locationEncounter: null,
  queue: [],
  currentEncounter: null
};

function tableByKey(key) {
  return CORE_TABLES.find((table) => table.key === key);
}

function workflowCopy(actor) {
  return foundry.utils.mergeObject(
    foundry.utils.deepClone(DEFAULT_WORKFLOW),
    foundry.utils.deepClone(actor.getFlag(SYSTEM_ID, "workflow") || {}),
    { inplace: false }
  );
}

async function saveWorkflow(actor, workflow) {
  await actor.setFlag(SYSTEM_ID, "workflow", workflow);
  actor.sheet?.render({ force: true });
  return workflow;
}

function encounterTableKey(type) {
  if (type === "challenge") return "challenges";
  if (type === "opportunity") return "opportunities";
  if (type === "find") return "finds";
  return null;
}

function encounterLabel(type) {
  if (type === "challenge") return "Défi";
  if (type === "opportunity") return "Opportunité";
  if (type === "find") return "Trouvaille";
  if (type === "aspect") return "Aspect";
  return type;
}

function htmlParagraph(text) {
  return "<p>" + String(text || "") + "</p>";
}

async function postWorkflowMessage(actor, title, body) {
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content:
      "<div class=\"entity-chat entity-workflow-card\">" +
      "<span class=\"entity-kicker\">EXPÉDITION</span>" +
      "<h3>" + title + "</h3>" +
      body +
      "</div>"
  });
}

async function rollDetailedEncounter(type, meta = {}) {
  const table = tableByKey(encounterTableKey(type));
  if (!table) return null;

  const roll = await new Roll("1d100").evaluate();
  const value = roll.total;
  const entry = resolveRangedEntry(table.entries, value);
  const rewardSpec = parseEncounterRewards(entry?.text || "");

  return {
    id: (meta.context || "location") + "-" + type + "-" + value + "-" + Date.now(),
    type,
    label: encounterLabel(type),
    detailRoll: value,
    text: entry?.text || "",
    keywords: entry?.keywords || [],
    threat: meta.threat || 1,
    disadvantage: Boolean(meta.disadvantage),
    context: meta.context || "location",
    rewardMode: rewardSpec.mode,
    rewards: rewardSpec.rewards,
    rewardApplied: false,
    rolls: [],
    challengeOutcome: null,
    opportunityResolved: false,
    opportunityOutcome: null,
    opportunityRoll: null
  };
}

async function loadNextLocationEncounter(actor, workflow) {
  if (!workflow.queue.length) {
    workflow.currentEncounter = null;
    workflow.stage = "secondary";
    await saveWorkflow(actor, workflow);
    await appendJournalEntry(
      actor,
      "Exploration terminée",
      "<p>La Rencontre de Lieu est résolue. Il reste à effectuer une Activité Secondaire pour achever l’Expédition.</p>"
    );
    return workflow;
  }

  const next = workflow.queue.shift();
  if (next.type === "aspect") {
    workflow.currentEncounter = {
      id: "location-aspect-" + Date.now(),
      type: "aspect",
      label: "Aspect",
      context: "location",
      text: "Vous découvrez un Aspect utile à la Mission en cours.",
      keywords: [],
      threat: 0,
      disadvantage: false,
      rolls: [],
      challengeOutcome: null
    };
  } else {
    workflow.currentEncounter = await rollDetailedEncounter(next.type, {
      ...next,
      context: "location"
    });
  }

  workflow.stage = "encounter";
  await saveWorkflow(actor, workflow);

  const current = workflow.currentEncounter;
  const details = current.type === "aspect"
    ? htmlParagraph(current.text)
    : "<p><strong>d100 " + current.detailRoll + "</strong> — " + current.text + "</p>" +
      (current.keywords.length
        ? "<p><strong>Mots-clés :</strong> " +
          current.keywords.map((key) => ABILITIES[key]?.label || key).join(", ") +
          "</p>"
        : "") +
      (current.threat > 1 ? "<p><strong>Valeur de Menace : " + current.threat + "</strong></p>" : "") +
      (current.disadvantage ? "<p><strong>Désavantage (D)</strong></p>" : "");

  await postWorkflowMessage(actor, "Rencontre de Lieu — " + current.label, details);
  await appendJournalEntry(actor, "Rencontre de Lieu — " + current.label, details);
  return workflow;
}

function completionCounts(actor) {
  return foundry.utils.deepClone(actor.getFlag(SYSTEM_ID, "missionCompletions") || {});
}

function missionCatalog() {
  return game.items
    .filter((item) => item.type === "mission" && item.getFlag(SYSTEM_ID, "coreKey"))
    .sort((a, b) =>
      missionNumberFromKey(a.getFlag(SYSTEM_ID, "coreKey")) -
      missionNumberFromKey(b.getFlag(SYSTEM_ID, "coreKey"))
    );
}

function cloneEmbeddedItem(source) {
  const object = source.toObject();
  return {
    name: source.name,
    type: source.type,
    img: source.img,
    system: foundry.utils.deepClone(object.system),
    flags: foundry.utils.deepClone(object.flags)
  };
}

export function getWorkflow(actor) {
  return workflowCopy(actor);
}

export async function resetWorkflowState(actor) {
  return saveWorkflow(actor, foundry.utils.deepClone(DEFAULT_WORKFLOW));
}

export function getMissionCatalog(actor) {
  const counts = completionCounts(actor);
  return missionCatalog().map((item) => {
    const key = item.getFlag(SYSTEM_ID, "coreKey");
    const completed = Number(counts[key] || 0);
    const max = item.system.repeatable ? Number(item.system.maxRepeats || 1) : 1;
    return {
      id: item.id,
      key,
      name: item.name,
      aspectsRequired: Number(item.system.aspectsRequired || 0),
      completed,
      max,
      available: completed < max,
      repeatable: Boolean(item.system.repeatable)
    };
  });
}

export async function startMission(actor, missionKey) {
  if (!actor || actor.type !== "pia") return false;
  if (actor.system.destroyed) {
    ui.notifications.warn("Ce PIA est détruit. Créez son successeur avant de poursuivre.");
    return false;
  }
  if (!isActorCreationReady(actor)) {
    ui.notifications.warn("Terminez d’abord la création du PIA.");
    return false;
  }
  if (actor.system.mission?.activeKey) {
    ui.notifications.warn("Une Mission est déjà en cours.");
    return false;
  }

  const mission = missionCatalog().find((item) => item.getFlag(SYSTEM_ID, "coreKey") === missionKey);
  if (!mission) {
    ui.notifications.warn("Mission introuvable dans le catalogue Entité.");
    return false;
  }

  const counts = completionCounts(actor);
  const completed = Number(counts[missionKey] || 0);
  const max = mission.system.repeatable ? Number(mission.system.maxRepeats || 1) : 1;
  if (completed >= max) {
    ui.notifications.warn("Cette Mission a déjà atteint son nombre maximal d’accomplissements.");
    return false;
  }

  // A pre-roll effect paid in a previous Mission must never become a free effect
  // after the new Mission refills Energy.
  await clearPendingEffects(actor, { refund: false });

  await actor.update({
    "system.mission.activeKey": missionKey,
    "system.mission.name": mission.name,
    "system.mission.aspectsRequired": Number(mission.system.aspectsRequired || 0),
    "system.mission.aspectsCurrent": 0,
    "system.energy.value": Number(actor.system.energy?.max || 10),
    "system.resources.value": 0,
    "system.data.value": 0,
    "system.constraints": []
  });

  await saveWorkflow(actor, foundry.utils.deepClone(DEFAULT_WORKFLOW));
  await startMissionJournalPage(actor, {
    missionKey,
    missionName: mission.name,
    occurrence: completed + 1,
    aspectsRequired: Number(mission.system.aspectsRequired || 0)
  });
  await appendJournalEntry(
    actor,
    "Mission commencée",
    "<p>Objectif : " + Number(mission.system.aspectsRequired || 0) + " Aspect(s).</p>"
  );
  await postWorkflowMessage(
    actor,
    "Mission commencée — " + mission.name,
    "<p>Énergie remise à pleine capacité, Ressources et Données à 0, Contraintes éliminées.</p>"
  );
  return true;
}

export async function completeMission(actor) {
  await ensureDiscoveryState(actor);

  const missionState = actor.system.mission;
  if (!missionState?.activeKey) return false;
  if (Number(missionState.aspectsCurrent || 0) < Number(missionState.aspectsRequired || 0)) {
    ui.notifications.warn("Tous les Aspects requis n’ont pas encore été collectés.");
    return false;
  }

  const mission = missionCatalog().find((item) => item.getFlag(SYSTEM_ID, "coreKey") === missionState.activeKey);
  if (!mission) return false;

  const structure = game.items.find((item) =>
    item.type === "structure" &&
    item.name === mission.system.structureName &&
    item.getFlag(SYSTEM_ID, "coreKey")
  );

  if (structure) {
    await actor.createEmbeddedDocuments("Item", [cloneEmbeddedItem(structure)]);
  } else {
    ui.notifications.warn("Structure de récompense introuvable : " + mission.system.structureName);
  }

  const counts = completionCounts(actor);
  counts[missionState.activeKey] = Number(counts[missionState.activeKey] || 0) + 1;
  await actor.setFlag(SYSTEM_ID, "missionCompletions", counts);

  const discoveriesBefore = Number(actor.system.discoveriesUnlocked || 0);
  const discoveriesAfter = Math.min(10, discoveriesBefore + 1);
  const discoveryUnlocked = discoveriesAfter > discoveriesBefore ? discoveriesAfter : null;

  await actor.update({
    "system.discoveriesUnlocked": discoveriesAfter,
    "system.constraints": [],
    "system.mission.activeKey": "",
    "system.mission.name": "",
    "system.mission.aspectsRequired": 0,
    "system.mission.aspectsCurrent": 0
  });
  await saveWorkflow(actor, foundry.utils.deepClone(DEFAULT_WORKFLOW));
  await syncDiscoveriesPage(actor);

  const baseBody = "<p>Mission accomplie. Structure construite : <strong>" + mission.system.structureName + "</strong>.</p>";
  let journalBody = baseBody;
  let chatBody = baseBody;

  if (discoveryUnlocked) {
    journalBody +=
      "<hr><p><strong>Découverte " + discoveryUnlocked + " débloquée.</strong> " +
      "Son contenu peut être révélé depuis la fiche du PIA ou le bouton proposé dans le Chat.</p>";

    chatBody +=
      "<hr><div class=\"entity-discovery-unlock\">" +
      "<span class=\"entity-kicker\">NOUVELLE DÉCOUVERTE DÉBLOQUÉE</span>" +
      "<h4>Découverte " + discoveryUnlocked + "</h4>" +
      "<p>Le contenu reste masqué jusqu’à ce que vous choisissiez de le révéler.</p>" +
      "<button type=\"button\" data-entity-chat-action=\"reveal-discovery\" data-actor-uuid=\"" + actor.uuid + "\">" +
      "<i class=\"fa-solid fa-eye\"></i> Révéler la Découverte" +
      "</button></div>";
  } else {
    journalBody += "<p>Les 10 Découvertes ont déjà été débloquées.</p>";
    chatBody += "<p>Les 10 Découvertes ont déjà été débloquées.</p>";
  }

  await postWorkflowMessage(actor, "Mission accomplie — " + mission.name, chatBody);
  await appendJournalEntry(actor, "Mission accomplie", journalBody);
  await closeMissionJournalPage(actor);
  return true;
}

export async function startExpedition(actor) {
  if (actor.system.destroyed) {
    ui.notifications.warn("Ce PIA est détruit. Créez son successeur avant de poursuivre.");
    return false;
  }
  if (!actor.system.mission?.activeKey) {
    ui.notifications.warn("Choisissez d’abord une Mission.");
    return false;
  }

  const number = Number(actor.system.expeditionNumber || 0) + 1;
  await actor.update({ "system.expeditionNumber": number });

  const workflow = foundry.utils.deepClone(DEFAULT_WORKFLOW);
  workflow.stage = "identify";
  workflow.powerConstraintPending = Number(actor.system.energy?.value || 0) === 0;
  await saveWorkflow(actor, workflow);

  await appendJournalEntry(
    actor,
    "Expédition " + number,
    "<p>Début de l’Expédition pour la Mission <strong>" + actor.system.mission.name + "</strong>.</p>"
  );
  return true;
}

export async function markPowerConstraint(actor) {
  const workflow = workflowCopy(actor);
  if (!workflow.powerConstraintPending) return false;

  const applied = await actor.addConstraint("Contrainte — Manque de puissance");
  if (!applied) return false;

  workflow.powerConstraintPending = false;
  await saveWorkflow(actor, workflow);
  return true;
}

export async function rollLocation(actor) {
  const workflow = workflowCopy(actor);
  if (workflow.stage !== "identify" || workflow.powerConstraintPending) return false;

  const roll = await new Roll("1d100").evaluate();
  const table = tableByKey("locations");
  const entry = resolveRangedEntry(table.entries, roll.total);
  workflow.location = {
    roll: roll.total,
    text: entry?.text || "Lieu inconnu"
  };
  workflow.stage = "travel";
  await saveWorkflow(actor, workflow);

  const body = "<p><strong>d100 " + roll.total + "</strong> — " + workflow.location.text + "</p>";
  await postWorkflowMessage(actor, "Identification du Lieu", body);
  await appendJournalEntry(actor, "Lieu — Expédition " + actor.system.expeditionNumber, body);
  return true;
}

export async function rollTravel(actor, requestedData = 0) {
  const workflow = workflowCopy(actor);
  if (workflow.stage !== "travel") return false;

  const availableData = Number(actor.system.data?.value || 0);
  const dataSpent = clampDataSpend(requestedData, availableData);
  if (Number(requestedData || 0) > availableData) {
    ui.notifications.warn("Dépense de Données ramenée au maximum disponible : " + availableData + ".");
  }
  if (dataSpent > 0) {
    await actor.update({ "system.data.value": Number(actor.system.data.value) - dataSpent });
  }

  const roll = await new Roll("1d10").evaluate();
  const total = Number(roll.total) + dataSpent;
  const type = travelEncounterType(total);
  workflow.travel = { roll: roll.total, dataSpent, total, type };

  let body =
    "<p><strong>d10 " + roll.total + "</strong>" +
    (dataSpent ? " + " + dataSpent + " Donnée(s)" : "") +
    " = <strong>" + total + "</strong></p>";

  if (type === "none") {
    workflow.stage = "locationEncounter";
    workflow.currentEncounter = null;
    body += "<p>Aucune Rencontre n’interrompt le Voyage.</p>";
  } else {
    workflow.currentEncounter = await rollDetailedEncounter(type, {
      context: "travel",
      threat: 1,
      disadvantage: false
    });
    workflow.stage = "encounter";
    const current = workflow.currentEncounter;
    body += "<p><strong>" + current.label + " — d100 " + current.detailRoll + "</strong></p>" +
      htmlParagraph(current.text);
    if (current.keywords.length) {
      body += "<p><strong>Mots-clés :</strong> " +
        current.keywords.map((key) => ABILITIES[key]?.label || key).join(", ") +
        "</p>";
    }
  }

  await saveWorkflow(actor, workflow);
  await postWorkflowMessage(actor, "Voyage", body);
  await appendJournalEntry(actor, "Voyage — Expédition " + actor.system.expeditionNumber, body);
  return true;
}

export async function rollLocationEncounter(actor, requestedData = 0) {
  const workflow = workflowCopy(actor);
  if (workflow.stage !== "locationEncounter") return false;

  const availableData = Number(actor.system.data?.value || 0);
  const dataSpent = clampDataSpend(requestedData, availableData);
  if (Number(requestedData || 0) > availableData) {
    ui.notifications.warn("Dépense de Données ramenée au maximum disponible : " + availableData + ".");
  }
  if (dataSpent > 0) {
    await actor.update({ "system.data.value": Number(actor.system.data.value) - dataSpent });
  }

  const roll = await new Roll("1d10").evaluate();
  const total = Number(roll.total) + dataSpent;
  workflow.locationEncounter = {
    roll: roll.total,
    dataSpent,
    total
  };
  workflow.queue = locationEncounterPlan(total);
  workflow.currentEncounter = null;

  const body =
    "<p><strong>d10 " + roll.total + "</strong>" +
    (dataSpent ? " + " + dataSpent + " Donnée(s)" : "") +
    " = <strong>" + total + "</strong></p>";

  await postWorkflowMessage(actor, "Rencontre de Lieu", body);
  await appendJournalEntry(actor, "Jet de Rencontre de Lieu", body);
  return loadNextLocationEncounter(actor, workflow);
}

export async function rollEncounterAbility(actor, abilityKey) {
  const workflow = workflowCopy(actor);
  const encounter = workflow.currentEncounter;
  if (!encounter || !["challenge", "opportunity"].includes(encounter.type)) return false;
  if (!encounter.keywords.includes(abilityKey)) {
    ui.notifications.warn("Cette Capacité ne correspond pas aux mots-clés de la Rencontre.");
    return false;
  }

  await actor.rollAction(abilityKey, {
    mode: encounter.disadvantage ? "disadvantage" : "normal",
    workflow: encounter.type === "challenge"
      ? { encounter: true, encounterId: encounter.id }
      : { opportunity: true, encounterId: encounter.id }
  });
  return true;
}

export async function recordEncounterRoll(message) {
  const state = foundry.utils.deepClone(message.getFlag(SYSTEM_ID, "actionRoll"));
  if (!state?.workflow?.encounter || state.encounterRecorded) return false;

  const actor = await fromUuid(state.actorUuid);
  if (!actor) return false;

  if (["partial", "failure"].includes(state.result) && !state.consequenceApplied) {
    ui.notifications.warn("Appliquez d’abord la conséquence du jet avant de l’enregistrer pour le Défi.");
    return false;
  }

  const workflow = workflowCopy(actor);
  const encounter = workflow.currentEncounter;
  if (!encounter || encounter.type !== "challenge" || encounter.id !== state.workflow.encounterId) {
    ui.notifications.warn("Ce jet ne correspond plus au Défi actuellement affiché.");
    return false;
  }

  const rolls = Array.from(encounter.rolls || []);
  const threat = Math.max(1, Number(encounter.threat || 1));
  if (rolls.length >= threat) {
    ui.notifications.info("Tous les jets requis par la Valeur de Menace ont déjà été enregistrés.");
    return false;
  }

  rolls.push({
    abilityKey: state.abilityKey,
    abilityLabel: ABILITIES[state.abilityKey]?.label || state.actionLabel || "Jet d’Action",
    result: state.result,
    resultLabel: state.resultLabel
  });
  encounter.rolls = rolls;

  encounter.challengeOutcome = resolveChallengeOutcome(rolls, threat);

  workflow.currentEncounter = encounter;
  state.encounterRecorded = true;

  await refreshActionRollMessage(message, state, actor);
  await saveWorkflow(actor, workflow);

  await appendJournalEntry(
    actor,
    "Défi — jet " + rolls.length + "/" + threat,
    "<p><strong>" + rolls[rolls.length - 1].abilityLabel + "</strong> : " + state.resultLabel + ".</p>"
  );
  return true;
}

export async function recordOpportunityRoll(message) {
  const state = foundry.utils.deepClone(message.getFlag(SYSTEM_ID, "actionRoll"));
  if (!state?.workflow?.opportunity || state.encounterRecorded) return false;

  const actor = await fromUuid(state.actorUuid);
  if (!actor || actor.system.destroyed) return false;

  if (["partial", "failure"].includes(state.result) && !state.consequenceApplied) {
    ui.notifications.warn("Appliquez d’abord la conséquence du jet avant de valider l’Opportunité.");
    return false;
  }

  const workflow = workflowCopy(actor);
  const encounter = workflow.currentEncounter;
  if (!encounter || encounter.type !== "opportunity" || encounter.id !== state.workflow.encounterId) {
    ui.notifications.warn("Ce jet ne correspond plus à l’Opportunité actuellement affichée.");
    return false;
  }
  if (encounter.opportunityResolved) {
    ui.notifications.info("Cette Opportunité a déjà été résolue.");
    return false;
  }

  const outcome = opportunityOutcome(state.result);
  if (!outcome) return false;

  encounter.opportunityResolved = true;
  encounter.opportunityOutcome = outcome;
  encounter.opportunityRoll = {
    abilityKey: state.abilityKey,
    abilityLabel: ABILITIES[state.abilityKey]?.label || state.actionLabel || "Jet d’Action",
    result: state.result,
    resultLabel: state.resultLabel
  };
  workflow.currentEncounter = encounter;

  state.encounterRecorded = true;
  state.opportunityOutcome = outcome;

  await refreshActionRollMessage(message, state, actor);
  await saveWorkflow(actor, workflow);

  await appendJournalEntry(
    actor,
    "Opportunité — " + (outcome === "success" ? "réussie" : "échouée"),
    "<p><strong>" + encounter.opportunityRoll.abilityLabel + "</strong> : " + state.resultLabel + ".</p>" +
      (outcome === "success"
        ? "<p>Le gain de l’Opportunité peut maintenant être récupéré.</p>"
        : "<p>Aucun gain n’est obtenu.</p>")
  );
  return true;
}

export async function advanceEncounter(actor, outcome = "resolved") {
  const workflow = workflowCopy(actor);
  const current = workflow.currentEncounter;
  if (!current) return false;

  if (current.type === "challenge") {
    if (!current.challengeOutcome) {
      ui.notifications.warn("Enregistrez tous les jets requis par la Valeur de Menace avant de résoudre le Défi.");
      return false;
    }
    outcome = current.challengeOutcome;
  }

  if (current.type === "opportunity" && !current.opportunityResolved) {
    await appendJournalEntry(
      actor,
      "Opportunité ignorée",
      "<p>L’Opportunité a été laissée de côté sans effectuer de jet d’Action ni obtenir son gain.</p>"
    );
  }

  if (current.type === "challenge" && outcome === "failed" && current.context === "location") {
    workflow.currentEncounter = null;
    workflow.queue = [];
    workflow.stage = "secondary";
    await saveWorkflow(actor, workflow);
    await appendJournalEntry(
      actor,
      "Défi de Lieu échoué",
      "<p>Le Défi n’a pas été relevé : les Opportunités, Trouvailles et Aspects restants ne sont pas résolus. L’Exploration prend fin.</p>"
    );
    return true;
  }

  if (current.context === "travel") {
    workflow.currentEncounter = null;
    workflow.stage = "locationEncounter";
    await saveWorkflow(actor, workflow);
    return true;
  }

  if (current.context === "secondary") {
    workflow.currentEncounter = null;
    workflow.stage = "done";
    await saveWorkflow(actor, workflow);
    await appendJournalEntry(actor, "Activité Secondaire terminée", "<p>Le Défi déclenché par l’échec de l’Activité Secondaire est résolu.</p>");
    return true;
  }

  workflow.currentEncounter = null;
  return loadNextLocationEncounter(actor, workflow);
}

export async function addAspectAndAdvance(actor) {
  const workflow = workflowCopy(actor);
  if (workflow.currentEncounter?.type !== "aspect") return false;

  const current = Number(actor.system.mission?.aspectsCurrent || 0);
  const required = Number(actor.system.mission?.aspectsRequired || 0);
  const next = Math.min(required, current + 1);
  await actor.update({ "system.mission.aspectsCurrent": next });

  await appendJournalEntry(
    actor,
    "Aspect découvert",
    "<p>Progression de Mission : <strong>" + next + " / " + required + "</strong> Aspect(s).</p>"
  );

  workflow.currentEncounter = null;
  return loadNextLocationEncounter(actor, workflow);
}

export async function rollSecondaryActivity(actor, kind) {
  const workflow = workflowCopy(actor);
  if (workflow.stage !== "secondary") return false;

  const definitions = {
    data: { label: "Collecte de Données", traitKey: "analysis", resourceKey: "data" },
    energy: { label: "Recharge d’Énergie", traitKey: "technology", resourceKey: "energy" },
    resources: { label: "Collecte de Ressources", traitKey: "adaptability", resourceKey: "resources" }
  };
  const definition = definitions[kind];
  if (!definition) return false;

  const traitValue = Number(actor.system.traits?.[definition.traitKey]?.value || 0);
  workflow.stage = "secondaryRoll";
  await saveWorkflow(actor, workflow);

  try {
    return await rollThresholdAction(actor, {
      label: definition.label,
      traitLabel: TRAITS[definition.traitKey]?.label || definition.traitKey,
      target: traitValue + 4,
      mode: "normal",
      workflow: {
        secondary: true,
        secondaryKind: kind,
        traitKey: definition.traitKey,
        resourceKey: definition.resourceKey
      }
    });
  } catch (error) {
    workflow.stage = "secondary";
    await saveWorkflow(actor, workflow);
    throw error;
  }
}

export async function applySecondaryGain(message) {
  const state = foundry.utils.deepClone(message.getFlag(SYSTEM_ID, "actionRoll"));
  if (!state?.workflow?.secondary || state.secondaryApplied) return false;
  if (!["full", "partial"].includes(state.result)) return false;

  const actor = await fromUuid(state.actorUuid);
  if (!actor) return false;

  const traitValue = Number(actor.system.traits?.[state.workflow.traitKey]?.value || 0);
  const gain = secondaryGain(state.result, traitValue);
  const key = state.workflow.resourceKey;
  const current = Number(actor.system[key]?.value || 0);
  const max = Number(actor.system[key]?.max || 10);
  await actor.update({ ["system." + key + ".value"]: Math.min(max, current + gain) });

  state.secondaryApplied = true;
  state.secondaryGain = gain;
  await refreshActionRollMessage(message, state, actor);

  const workflow = workflowCopy(actor);
  workflow.stage = "done";
  await saveWorkflow(actor, workflow);
  await appendJournalEntry(
    actor,
    state.actionLabel + " — " + state.resultLabel,
    "<p>Gain appliqué : <strong>+" + gain + "</strong> " +
      (key === "data" ? "Donnée(s)" : key === "energy" ? "Énergie" : "Ressource(s)") +
      ".</p>"
  );
  return true;
}

export async function resolveSecondaryFailure(message) {
  const state = foundry.utils.deepClone(message.getFlag(SYSTEM_ID, "actionRoll"));
  if (!state?.workflow?.secondary || state.result !== "failure" || state.secondaryApplied) return false;

  const actor = await fromUuid(state.actorUuid);
  if (!actor) return false;

  const workflow = workflowCopy(actor);
  workflow.currentEncounter = await rollDetailedEncounter("challenge", {
    context: "secondary",
    threat: 1,
    disadvantage: false
  });
  workflow.stage = "encounter";
  state.secondaryApplied = true;

  await refreshActionRollMessage(message, state, actor);
  await saveWorkflow(actor, workflow);

  const current = workflow.currentEncounter;
  const body =
    "<p><strong>d100 " + current.detailRoll + "</strong> — " + current.text + "</p>" +
    (current.keywords.length
      ? "<p><strong>Mots-clés :</strong> " +
        current.keywords.map((key) => ABILITIES[key]?.label || key).join(", ") +
        "</p>"
      : "");
  await postWorkflowMessage(actor, "Défi — Échec d’Activité Secondaire", body);
  await appendJournalEntry(actor, "Défi — Activité Secondaire", body);
  return true;
}

export async function installImprovementAsSecondary(actor, itemId) {
  const workflow = workflowCopy(actor);
  if (workflow.stage !== "secondary") return false;
  if (Number(actor.system.resources?.value || 0) < 10) {
    ui.notifications.warn("Il faut 10 Ressources pour installer une Amélioration.");
    return false;
  }
  if (actor.suitState.used >= actor.suitState.max) {
    ui.notifications.warn("La Combinaison ne dispose d’aucun emplacement libre.");
    return false;
  }

  const source = game.items.get(itemId);
  if (!source || source.type !== "improvement") return false;
  const key = source.getFlag(SYSTEM_ID, "coreKey");
  const duplicate = actor.items.some((item) =>
    item.type === "improvement" &&
    ((key && item.getFlag(SYSTEM_ID, "coreKey") === key) || item.name === source.name)
  );
  if (duplicate) {
    ui.notifications.warn("Cette Amélioration est déjà installée.");
    return false;
  }

  await actor.update({ "system.resources.value": Number(actor.system.resources.value) - 10 });
  await actor.createEmbeddedDocuments("Item", [cloneEmbeddedItem(source)]);
  workflow.stage = "done";
  await saveWorkflow(actor, workflow);
  await appendJournalEntry(actor, "Amélioration installée", "<p><strong>" + source.name + "</strong> a été installée pour 10 Ressources.</p>");
  return true;
}

export async function selfRepairAsSecondary(actor, constraintIndex) {
  const workflow = workflowCopy(actor);
  if (workflow.stage !== "secondary") return false;
  if (Number(actor.system.resources?.value || 0) < 5) {
    ui.notifications.warn("Il faut 5 Ressources pour effectuer l’Autoréparation.");
    return false;
  }

  const constraints = Array.from(actor.system.constraints || []);
  if (constraintIndex < 0 || constraintIndex >= constraints.length) return false;
  const removed = constraints[constraintIndex];

  constraints.splice(constraintIndex, 1);
  await actor.update({
    "system.resources.value": Number(actor.system.resources.value) - 5,
    "system.constraints": constraints
  });
  workflow.stage = "done";
  await saveWorkflow(actor, workflow);
  await appendJournalEntry(actor, "Autoréparation", "<p>Contrainte éliminée : <strong>" + removed + "</strong>. Coût : 5 Ressources.</p>");
  return true;
}


function rewardLabel(reward) {
  if (reward.resourceKey === "data") return reward.amount + " Donnée(s)";
  if (reward.resourceKey === "energy") return reward.amount + " Énergie";
  return reward.amount + " Ressource(s)";
}

async function addResource(actor, resourceKey, amount) {
  const current = Number(actor.system[resourceKey]?.value || 0);
  const max = Number(actor.system[resourceKey]?.max || 10);
  const next = Math.min(max, current + Number(amount || 0));
  await actor.update({ ["system." + resourceKey + ".value"]: next });
  return next - current;
}

export async function applyEncounterRewards(actor, choiceIndex = null) {
  const workflow = workflowCopy(actor);
  const encounter = workflow.currentEncounter;
  if (!encounter || !["opportunity", "find"].includes(encounter.type)) return false;
  if (encounter.type === "opportunity" && (!encounter.opportunityResolved || encounter.opportunityOutcome !== "success")) {
    ui.notifications.warn("Le gain d’une Opportunité n’est disponible qu’après un jet d’Action réussi.");
    return false;
  }
  if (encounter.rewardApplied) {
    ui.notifications.info("Le gain de cette Rencontre a déjà été appliqué.");
    return false;
  }

  const rewards = Array.from(encounter.rewards || []);
  if (!rewards.length) {
    ui.notifications.info("Aucun gain structuré n’a été détecté pour cette Rencontre.");
    return false;
  }

  let selected = rewards;
  if (encounter.rewardMode === "choice") {
    const index = Number(choiceIndex);
    if (!Number.isInteger(index) || index < 0 || index >= rewards.length) return false;
    selected = [rewards[index]];
  }

  const applied = [];
  for (const reward of selected) {
    const gained = await addResource(actor, reward.resourceKey, reward.amount);
    applied.push({ ...reward, gained });
  }

  encounter.rewardApplied = true;
  encounter.appliedRewards = applied;
  workflow.currentEncounter = encounter;
  await saveWorkflow(actor, workflow);

  const summary = applied.map((reward) => rewardLabel({ ...reward, amount: reward.gained })).join(" + ");
  await appendJournalEntry(
    actor,
    encounter.label + " — gain",
    "<p>Gain appliqué : <strong>" + summary + "</strong>.</p>"
  );
  return true;
}

export async function convertEncounterResource(actor, targetKey) {
  const workflow = workflowCopy(actor);
  const encounter = workflow.currentEncounter;
  if (!encounter || encounter.context !== "location" || !["opportunity", "find"].includes(encounter.type)) {
    ui.notifications.warn("Cette conversion n’est disponible que lors d’une Opportunité ou Trouvaille de Lieu.");
    return false;
  }

  if (!["data", "energy"].includes(targetKey)) return false;

  const converter = actor.items.find((item) =>
    item.type === "improvement" && item.system.effectType === "convertResource"
  );
  if (!converter) {
    ui.notifications.warn("L’Unité de conversion des ressources adaptative n’est pas installée.");
    return false;
  }

  const cost = Number(converter.system.effectValue || 2);
  if (Number(actor.system.resources?.value || 0) < cost) {
    ui.notifications.warn("Ressources insuffisantes pour la conversion.");
    return false;
  }

  const current = Number(actor.system[targetKey]?.value || 0);
  const max = Number(actor.system[targetKey]?.max || 10);
  if (current >= max) {
    ui.notifications.warn(targetKey === "data" ? "La capacité de Données est déjà pleine." : "La capacité d’Énergie est déjà pleine.");
    return false;
  }

  await actor.update({
    "system.resources.value": Number(actor.system.resources.value) - cost,
    ["system." + targetKey + ".value"]: Math.min(max, current + 1)
  });

  await appendJournalEntry(
    actor,
    "Conversion de Ressources",
    "<p>" + cost + " Ressources converties en 1 " + (targetKey === "data" ? "Donnée" : "Énergie") + ".</p>"
  );
  return true;
}
