export async function chooseRollMode(abilityLabel, pendingEffects = []) {
  const { DialogV2 } = foundry.applications.api;
  const pendingAdvantage = pendingEffects.some((effect) => effect.type === "advantage");

  const content = document.createElement("div");
  content.className = "entity-roll-dialog";
  const intro = document.createElement("p");
  intro.textContent = "Choisissez les conditions de ce jet de " + abilityLabel + ".";
  content.append(intro);

  if (pendingAdvantage) {
    const note = document.createElement("p");
    note.className = "entity-dialog-note";
    note.textContent = "Une Amélioration donnant Avantage est déjà armée pour ce jet. Un Désavantage choisi ici l’annulera.";
    content.append(note);
  }

  return DialogV2.wait({
    window: { title: "Jet d’Action — " + abilityLabel },
    content,
    modal: true,
    rejectClose: false,
    buttons: [
      {
        action: "advantage",
        label: "Avantage",
        icon: "fa-solid fa-angles-down"
      },
      {
        action: "normal",
        label: "Normal",
        icon: "fa-solid fa-dice-d10",
        default: true
      },
      {
        action: "disadvantage",
        label: "Désavantage",
        icon: "fa-solid fa-angles-up"
      }
    ]
  });
}

export async function chooseImprovementToDiscard(actor, consequenceLabel) {
  const { DialogV2 } = foundry.applications.api;
  const improvements = actor.items.filter((item) => item.type === "improvement");
  if (!improvements.length) return null;

  const content = document.createElement("div");
  content.className = "entity-discard-dialog";

  const warning = document.createElement("p");
  warning.textContent = "La Combinaison est pleine. Pour subir " + consequenceLabel + ", choisissez une Amélioration à défausser.";
  content.append(warning);

  const label = document.createElement("label");
  label.textContent = "Amélioration à défausser";

  const select = document.createElement("select");
  select.name = "itemId";
  for (const item of improvements) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    select.append(option);
  }

  label.append(select);
  content.append(label);

  const data = await DialogV2.input({
    window: { title: "Combinaison saturée" },
    content,
    modal: true,
    rejectClose: false,
    ok: {
      label: "Défausser et continuer",
      icon: "fa-solid fa-trash"
    }
  });

  return data?.itemId || null;
}
