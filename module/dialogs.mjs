export async function chooseRollMode(abilityLabel, pendingEffects = []) {
  const { DialogV2 } = foundry.applications.api;
  const pendingAdvantage = pendingEffects.some((effect) => effect.type === "advantage");
  const note = pendingAdvantage
    ? "<p class=\"entity-dialog-note\">Une Amélioration donnant Avantage est déjà armée pour ce jet. Un Désavantage choisi ici l’annulera.</p>"
    : "";

  return DialogV2.wait({
    window: { title: "Jet d’Action — " + abilityLabel },
    content: "<div class=\"entity-roll-dialog\"><p>Choisissez les conditions de ce jet de <strong>" + abilityLabel + "</strong>.</p>" + note + "</div>",
    modal: true,
    rejectClose: false,
    buttons: [
      {
        action: "advantage",
        label: "Avantage",
        icon: "fa-solid fa-angles-down",
        callback: () => "advantage"
      },
      {
        action: "normal",
        label: "Normal",
        icon: "fa-solid fa-dice-d10",
        default: true,
        callback: () => "normal"
      },
      {
        action: "disadvantage",
        label: "Désavantage",
        icon: "fa-solid fa-angles-up",
        callback: () => "disadvantage"
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
