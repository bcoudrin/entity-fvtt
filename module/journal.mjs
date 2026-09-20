import { SYSTEM_ID } from "./constants.mjs";

export async function ensurePiaJournal(actor) {
  if (!actor || actor.type !== "pia") return null;

  const storedUuid = actor.getFlag(SYSTEM_ID, "journalUuid");
  if (storedUuid) {
    const existing = await fromUuid(storedUuid);
    if (existing) return existing;
  }

  const journal = await JournalEntry.create({
    name: "Journal de bord — " + actor.name,
    pages: [{
      name: "Journal de bord",
      type: "text",
      text: {
        content: "<h2>Journal de bord</h2><p>Ce journal sera enrichi automatiquement par le système et peut être complété librement.</p>"
      }
    }]
  });

  if (journal) await actor.setFlag(SYSTEM_ID, "journalUuid", journal.uuid);
  return journal;
}

export async function openPiaJournal(actor) {
  const journal = await ensurePiaJournal(actor);
  if (journal) journal.sheet?.render({ force: true });
}

export async function appendJournalEntry(actor, title, body) {
  const journal = await ensurePiaJournal(actor);
  if (!journal) return null;

  let page = journal.pages?.contents?.[0];
  if (!page) {
    const created = await journal.createEmbeddedDocuments("JournalEntryPage", [{
      name: "Journal de bord",
      type: "text",
      text: { content: "" }
    }]);
    page = created[0];
  }

  const current = page.text?.content || "";
  const addition = "<hr><section class=\"entity-log-entry\"><h3>" + title + "</h3>" + body + "</section>";
  await page.update({ "text.content": current + addition });
  return page;
}