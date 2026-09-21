import { SYSTEM_ID } from "./constants.mjs";

function missionNumberFromKey(key) {
  const match = String(key || "").match(/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function missionPageName(missionKey, missionName, occurrence = 1) {
  const number = missionNumberFromKey(missionKey);
  const prefix = number === null ? "Mission" : "Mission " + String(number).padStart(2, "0");
  const repeat = Number(occurrence || 1) > 1 ? " — Passage " + Number(occurrence) : "";
  return prefix + " — " + missionName + repeat;
}

function legacyPageData() {
  return {
    name: "Journal de bord",
    type: "text",
    text: {
      content: "<h2>Journal de bord</h2><p>Chaque Mission dispose de sa propre page. Cette page reste disponible pour les notes générales et l’historique créé avant cette organisation.</p>"
    },
    flags: {
      [SYSTEM_ID]: {
        pageType: "overview"
      }
    }
  };
}

async function getActiveMissionPage(actor, journal) {
  const pageId = actor.getFlag(SYSTEM_ID, "journalMissionPageId");
  if (!pageId) return null;

  const page = journal.pages?.get?.(pageId) || journal.pages?.contents?.find((candidate) => candidate.id === pageId);
  if (page) return page;

  await actor.unsetFlag(SYSTEM_ID, "journalMissionPageId");
  return null;
}

export async function ensurePiaJournal(actor) {
  if (!actor || actor.type !== "pia") return null;

  const storedUuid = actor.getFlag(SYSTEM_ID, "journalUuid");
  if (storedUuid) {
    const existing = await fromUuid(storedUuid);
    if (existing) return existing;
  }

  const journal = await JournalEntry.create({
    name: "Journal de bord — " + actor.name,
    pages: [legacyPageData()]
  });

  if (journal) await actor.setFlag(SYSTEM_ID, "journalUuid", journal.uuid);
  return journal;
}

export async function openPiaJournal(actor) {
  const journal = await ensurePiaJournal(actor);
  if (journal) journal.sheet?.render({ force: true });
}

export async function startMissionJournalPage(actor, {
  missionKey,
  missionName,
  occurrence = 1,
  aspectsRequired = 0
} = {}) {
  const journal = await ensurePiaJournal(actor);
  if (!journal) return null;

  const previous = await getActiveMissionPage(actor, journal);
  if (previous) {
    const previousKey = previous.getFlag(SYSTEM_ID, "missionKey");
    const previousOccurrence = Number(previous.getFlag(SYSTEM_ID, "missionOccurrence") || 1);
    if (previousKey === missionKey && previousOccurrence === Number(occurrence || 1)) return previous;
  }

  const pageName = missionPageName(missionKey, missionName, occurrence);
  const created = await journal.createEmbeddedDocuments("JournalEntryPage", [{
    name: pageName,
    type: "text",
    text: {
      content:
        "<section class=\"entity-mission-log\">" +
        "<h2>" + pageName + "</h2>" +
        "<p><strong>Objectif :</strong> " + Number(aspectsRequired || 0) + " Aspect(s).</p>" +
        "</section>"
    },
    flags: {
      [SYSTEM_ID]: {
        pageType: "mission",
        missionKey,
        missionOccurrence: Number(occurrence || 1),
        actorId: actor.id
      }
    }
  }]);

  const page = created?.[0] || null;
  if (page) await actor.setFlag(SYSTEM_ID, "journalMissionPageId", page.id);
  return page;
}

export async function closeMissionJournalPage(actor) {
  if (!actor || actor.type !== "pia") return;
  await actor.unsetFlag(SYSTEM_ID, "journalMissionPageId");
}

async function ensureMissionPageForCurrentState(actor, journal) {
  const active = await getActiveMissionPage(actor, journal);
  if (active) return active;

  const mission = actor.system.mission;
  if (!mission?.activeKey) return null;

  return startMissionJournalPage(actor, {
    missionKey: mission.activeKey,
    missionName: mission.name || "Mission",
    occurrence: 1,
    aspectsRequired: Number(mission.aspectsRequired || 0)
  });
}

function overviewPage(journal) {
  return journal.pages?.contents?.find((page) => page.getFlag(SYSTEM_ID, "pageType") === "overview")
    || journal.pages?.contents?.[0]
    || null;
}

export async function appendJournalEntry(actor, title, body) {
  const journal = await ensurePiaJournal(actor);
  if (!journal) return null;

  let page = await ensureMissionPageForCurrentState(actor, journal);

  if (!page) {
    page = overviewPage(journal);
    if (!page) {
      const created = await journal.createEmbeddedDocuments("JournalEntryPage", [legacyPageData()]);
      page = created[0];
    }
  }

  const current = page.text?.content || "";
  const addition = "<hr><section class=\"entity-log-entry\"><h3>" + title + "</h3>" + body + "</section>";
  await page.update({ "text.content": current + addition });
  return page;
}
