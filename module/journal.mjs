import { SYSTEM_ID } from "./constants.mjs";
import { CORE_DISCOVERIES } from "./data/core-items.mjs";
import { isExtraMissionKey } from "./data/extras-items.mjs";

function missionNumberFromKey(key) {
  const match = String(key || "").match(/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function missionPageName(missionKey, missionName, occurrence = 1) {
  const number = missionNumberFromKey(missionKey);
  const prefix = number === null
    ? "Mission"
    : isExtraMissionKey(missionKey)
      ? "Mission Extra " + String(number).padStart(2, "0")
      : "Mission " + String(number).padStart(2, "0");
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

function discoveryStatus(actor) {
  const unlocked = Math.min(CORE_DISCOVERIES.length, Number(actor.system.discoveriesUnlocked || 0));
  const revealed = Math.min(unlocked, Number(actor.system.discoveriesRevealed || 0));
  return {
    total: CORE_DISCOVERIES.length,
    unlocked,
    revealed,
    pending: Math.max(0, unlocked - revealed),
    nextIndex: revealed < unlocked ? revealed + 1 : null
  };
}

function discoveriesPageContent(actor) {
  const status = discoveryStatus(actor);
  const entries = CORE_DISCOVERIES.map((discovery) => {
    if (discovery.index <= status.revealed) {
      return (
        "<section class=\"entity-discovery-entry entity-discovery-revealed\">" +
        "<h3>Découverte " + discovery.index + " — " + discovery.name + "</h3>" +
        "<p>" + discovery.text + "</p>" +
        "</section>"
      );
    }

    if (discovery.index <= status.unlocked) {
      return (
        "<section class=\"entity-discovery-entry entity-discovery-available\">" +
        "<h3>Découverte " + discovery.index + " — À révéler</h3>" +
        "<p>Cette entrée a été débloquée par une Mission accomplie. Révélez-la depuis la fiche du PIA.</p>" +
        "</section>"
      );
    }

    return (
      "<section class=\"entity-discovery-entry entity-discovery-locked\">" +
      "<h3>Découverte " + discovery.index + " — Verrouillée</h3>" +
      "<p>Accomplissez une Mission pour progresser dans le journal des Découvertes.</p>" +
      "</section>"
    );
  }).join("<hr>");

  return (
    "<section class=\"entity-discoveries-log\">" +
    "<h2>Découvertes</h2>" +
    "<p>Les Découvertes retracent les révélations majeures de votre voyage. Chaque Mission accomplie débloque l’entrée suivante.</p>" +
    "<p><strong>Révélées :</strong> " + status.revealed + " / " + status.total +
    " — <strong>Débloquées :</strong> " + status.unlocked + " / " + status.total + "</p>" +
    "<hr>" + entries +
    "</section>"
  );
}

function discoveriesPageData(actor) {
  return {
    name: "Découvertes",
    type: "text",
    text: { content: discoveriesPageContent(actor) },
    flags: {
      [SYSTEM_ID]: {
        pageType: "discoveries"
      }
    }
  };
}

function discoveriesPage(journal) {
  return journal.pages?.contents?.find((page) => page.getFlag(SYSTEM_ID, "pageType") === "discoveries")
    || null;
}

async function ensureDiscoveriesPage(actor, journal) {
  let page = discoveriesPage(journal);
  if (page) return page;

  const created = await journal.createEmbeddedDocuments("JournalEntryPage", [discoveriesPageData(actor)]);
  page = created?.[0] || null;
  return page;
}

async function getActiveMissionPage(actor, journal) {
  const pageId = actor.getFlag(SYSTEM_ID, "journalMissionPageId");
  if (!pageId) return null;

  const page = journal.pages?.get?.(pageId) || journal.pages?.contents?.find((candidate) => candidate.id === pageId);
  if (page) return page;

  await actor.unsetFlag(SYSTEM_ID, "journalMissionPageId");
  return null;
}

export async function ensureDiscoveryState(actor) {
  if (!actor || actor.type !== "pia") return;

  const version = Number(actor.getFlag(SYSTEM_ID, "discoveryStateVersion") || 0);
  if (version >= 1) return;

  // Avant v0.2.5, toute Découverte débloquée était immédiatement révélée.
  // La migration conserve donc exactement ce qui a déjà été vu.
  const legacyUnlocked = Math.min(CORE_DISCOVERIES.length, Number(actor.system.discoveriesUnlocked || 0));
  await actor.update({ "system.discoveriesRevealed": legacyUnlocked });
  await actor.setFlag(SYSTEM_ID, "discoveryStateVersion", 1);
}

export function getDiscoveryStatus(actor) {
  return discoveryStatus(actor);
}

export async function ensurePiaJournal(actor) {
  if (!actor || actor.type !== "pia") return null;

  await ensureDiscoveryState(actor);

  const storedUuid = actor.getFlag(SYSTEM_ID, "journalUuid");
  if (storedUuid) {
    const existing = await fromUuid(storedUuid);
    if (existing) {
      await ensureDiscoveriesPage(actor, existing);
      return existing;
    }
  }

  const journal = await JournalEntry.create({
    name: "Journal de bord — " + actor.name,
    pages: [legacyPageData(), discoveriesPageData(actor)]
  });

  if (journal) await actor.setFlag(SYSTEM_ID, "journalUuid", journal.uuid);
  return journal;
}

export async function syncDiscoveriesPage(actor) {
  const journal = await ensurePiaJournal(actor);
  if (!journal) return null;

  const page = await ensureDiscoveriesPage(actor, journal);
  if (!page) return null;

  await page.update({ "text.content": discoveriesPageContent(actor) });
  return page;
}

export async function revealNextDiscovery(actor) {
  if (!actor || actor.type !== "pia") return false;

  await ensureDiscoveryState(actor);

  const status = discoveryStatus(actor);
  if (!status.nextIndex) {
    ui.notifications.info(status.revealed >= status.total
      ? "Toutes les Découvertes ont déjà été révélées."
      : "Aucune nouvelle Découverte n’est disponible.");
    return false;
  }

  const discovery = CORE_DISCOVERIES.find((entry) => entry.index === status.nextIndex);
  if (!discovery) return false;

  await actor.update({ "system.discoveriesRevealed": discovery.index });
  await syncDiscoveriesPage(actor);

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content:
      "<div class=\"entity-chat entity-discovery-card\">" +
      "<span class=\"entity-kicker\">NOUVELLE DÉCOUVERTE</span>" +
      "<h3>Découverte " + discovery.index + " — " + discovery.name + "</h3>" +
      "<p>" + discovery.text + "</p>" +
      "<p><i class=\"fa-solid fa-book\"></i> Cette entrée est désormais conservée dans la page <strong>Découvertes</strong> du Journal de bord.</p>" +
      "</div>"
  });

  actor.sheet?.render({ force: true });
  return true;
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

  const completions = foundry.utils.deepClone(actor.getFlag(SYSTEM_ID, "missionCompletions") || {});
  const occurrence = Number(completions[mission.activeKey] || 0) + 1;

  return startMissionJournalPage(actor, {
    missionKey: mission.activeKey,
    missionName: mission.name || "Mission",
    occurrence,
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
