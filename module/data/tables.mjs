import { CHALLENGE_TABLE } from "./challenges.mjs";
import { OPPORTUNITY_TABLE } from "./opportunities.mjs";
import { FIND_TABLE } from "./finds.mjs";
import { LOCATION_TABLE } from "./locations.mjs";

export const CORE_TABLES = [
  {
    key: "travel-encounter",
    name: "Entité — Rencontres de Voyage",
    formula: "1d10",
    entries: [
      { range: [1, 4], text: "Défi" },
      { range: [5, 7], text: "Aucune Rencontre" },
      { range: [8, 9], text: "Opportunité" },
      { range: [10, 10], text: "Trouvaille" }
    ]
  },
  {
    key: "location-encounter",
    name: "Entité — Rencontres de Lieu",
    formula: "1d10",
    entries: [
      { range: [1, 2], text: "Défi (VM 3)" },
      { range: [3, 4], text: "Défi (VM 2)" },
      { range: [5, 5], text: "Défi (D)" },
      { range: [6, 6], text: "Défi + Opportunité (D)" },
      { range: [7, 8], text: "Défi + Opportunité" },
      { range: [9, 9], text: "Défi + Opportunité + Trouvaille" },
      { range: [10, 10], text: "Défi + Opportunité + Trouvaille + Aspect" }
    ]
  },
  {
    key: "challenges",
    name: "Entité — Rencontres — Défis",
    formula: "1d100",
    entries: CHALLENGE_TABLE
  },
  {
    key: "opportunities",
    name: "Entité — Rencontres — Opportunités",
    formula: "1d100",
    entries: OPPORTUNITY_TABLE
  },
  {
    key: "finds",
    name: "Entité — Rencontres — Trouvailles",
    formula: "1d100",
    entries: FIND_TABLE
  },
  {
    key: "locations",
    name: "Entité — Lieux",
    formula: "1d100",
    entries: LOCATION_TABLE
  }
];
