export const SYSTEM_ID = "entity";
export const SUIT_SLOTS = 20;
export const CORE_DATA_VERSION = 3;

export const TRAITS = {
  technology: { label: "Technologie", abilities: ["robotics", "engineering", "computing"] },
  analysis: { label: "Analyse", abilities: ["physics", "biology", "chemistry"] },
  adaptability: { label: "Adaptabilité", abilities: ["survival", "navigation", "communication"] }
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
