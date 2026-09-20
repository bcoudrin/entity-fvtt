export const SYSTEM_ID = "entity";
export const SUIT_SLOTS = 20;

export const TRAITS = {
  technology: { label: "Technologie", abilities: ["computing", "engineering", "robotics"] },
  analysis: { label: "Analyse", abilities: ["biology", "chemistry", "physics"] },
  adaptability: { label: "Adaptabilité", abilities: ["communication", "navigation", "survival"] }
};

export const ABILITIES = {
  computing: { label: "Informatique", trait: "technology" },
  engineering: { label: "Ingénierie", trait: "technology" },
  robotics: { label: "Robotique", trait: "technology" },
  biology: { label: "Biologie", trait: "analysis" },
  chemistry: { label: "Chimie", trait: "analysis" },
  physics: { label: "Physique", trait: "analysis" },
  communication: { label: "Communication", trait: "adaptability" },
  navigation: { label: "Navigation", trait: "adaptability" },
  survival: { label: "Survie", trait: "adaptability" }
};

export const ROLL_MODES = {
  normal: { label: "Normal", modifier: 0 },
  advantage: { label: "Avantage", modifier: 1 },
  disadvantage: { label: "Désavantage", modifier: -1 }
};

export const STARTING_IMPROVEMENTS = [
  {
    name: "Outil multiple intégré",
    type: "improvement",
    system: {
      energyCost: 2,
      effectType: "reroll",
      effectKey: "any",
      effectValue: 1,
      starting: true,
      description: "Permet de relancer un dé lors d’un jet d’Action."
    }
  },
  {
    name: "Bouclier énergétique adaptatif",
    type: "improvement",
    system: {
      energyCost: 3,
      effectType: "preventConstraint",
      effectKey: "any",
      effectValue: 1,
      starting: true,
      description: "Peut être utilisé lors d’un jet d’Action pour éviter de subir une Contrainte."
    }
  },
  {
    name: "Unité de conversion des ressources adaptative",
    type: "improvement",
    system: {
      energyCost: 0,
      effectType: "convertResource",
      effectKey: "resources",
      effectValue: 2,
      starting: true,
      description: "Lors d’une Rencontre de Lieu — Opportunité ou Trouvaille, permet de dépenser 2 Ressources pour gagner 1 Donnée ou 1 Énergie."
    }
  }
];