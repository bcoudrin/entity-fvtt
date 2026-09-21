import { SYSTEM_ID, SUIT_SLOTS } from "./constants.mjs";
import { openCreationWizard } from "./apps/creation-wizard.mjs";
import { successorResetUpdate } from "./destruction-rules.mjs";
import { clearPendingEffects } from "./improvements.mjs";
import { appendJournalEntry, closeMissionJournalPage } from "./journal.mjs";
import { resetWorkflowState } from "./workflow.mjs";

function closeExpeditionPanel(actor) {
  const panel = foundry.applications.instances.get("entity-expedition-panel");
  if (panel?.actor?.id === actor.id) panel.close();
}

export async function markPiaDestroyed(actor) {
  if (!actor || actor.type !== "pia" || actor.system.destroyed) return false;

  const missionName = actor.system.mission?.name || "";
  const aspects = Number(actor.system.mission?.aspectsCurrent || 0);

  if (actor.system.mission?.activeKey) {
    await appendJournalEntry(
      actor,
      "Destruction du PIA",
      "<p>Les " + SUIT_SLOTS + " emplacements de la Combinaison sont occupés par des Contraintes et/ou Défaillances.</p>" +
      "<p>La Mission <strong>" + missionName + "</strong> est abandonnée. Les " + aspects + " Aspect(s) collecté(s), les Améliorations et la progression de cette Mission sont perdus.</p>" +
      "<p>Les Structures construites restent disponibles pour le prochain PIA.</p>"
    );
  }

  await actor.update({ "system.destroyed": true });
  closeExpeditionPanel(actor);

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content:
      "<div class=\"entity-chat entity-destroyed\">" +
      "<span class=\"entity-kicker\">DESTRUCTION</span>" +
      "<h3>PIA DÉTRUIT</h3>" +
      "<p>Les " + SUIT_SLOTS + " emplacements de la Combinaison sont remplis de Contraintes et/ou Défaillances.</p>" +
      "<p>Toutes les Améliorations, tous les Aspects et la progression de la Mission en cours seront perdus. Les Structures restent en place.</p>" +
      "<button type=\"button\" data-entity-chat-action=\"prepare-successor\" data-actor-uuid=\"" + actor.uuid + "\">" +
      "<i class=\"fa-solid fa-user-gear\"></i> Créer le nouveau PIA" +
      "</button></div>"
  });

  actor.sheet?.render({ force: true });
  return true;
}

export async function prepareSuccessor(actor) {
  if (!actor || actor.type !== "pia" || !actor.system.destroyed) return false;

  closeExpeditionPanel(actor);

  await clearPendingEffects(actor, { refund: false });

  const improvements = actor.items
    .filter((item) => item.type === "improvement")
    .map((item) => item.id);
  if (improvements.length) {
    await actor.deleteEmbeddedDocuments("Item", improvements);
  }

  await actor.update(successorResetUpdate());
  await resetWorkflowState(actor);
  await closeMissionJournalPage(actor);

  await appendJournalEntry(
    actor,
    "Succession du PIA",
    "<p>Le PIA précédent a été détruit. Un nouveau personnage doit être créé.</p>" +
    "<p>Les Structures et l’historique de campagne sont conservés. Les caractéristiques, Améliorations, Contraintes, Défaillances et progression de la Mission précédente ont été remis à zéro.</p>"
  );

  await actor.setFlag(SYSTEM_ID, "successorPending", true);

  actor.sheet?.render({ force: true });
  openCreationWizard(actor, { force: true });
  return true;
}

export async function finalizeSuccessor(actor) {
  if (!actor || actor.type !== "pia") return;
  if (!actor.getFlag(SYSTEM_ID, "successorPending")) return;

  await actor.unsetFlag(SYSTEM_ID, "successorPending");
  await actor.update({ "system.destroyed": false });

  await appendJournalEntry(
    actor,
    "Nouveau PIA opérationnel",
    "<p><strong>" + actor.name + "</strong> reprend l’exploration avec les Structures laissées par ses prédécesseurs.</p>"
  );
}
