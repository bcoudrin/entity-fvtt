export const CORE_IMPROVEMENTS = [
  {
    key: "integrated-multitool",
    name: "Outil multiple intégré",
    energyCost: 2,
    effectType: "reroll",
    effectKey: "any",
    effectValue: 1,
    starting: true,
    description: "Cet outil peut prendre plusieurs formes (découpeur, imprimante 3D, perceuse, clé à molette, etc.). Vous pouvez relancer un dé lors d’un jet d’Action."
  },
  {
    key: "adaptive-energy-shield",
    name: "Bouclier énergétique adaptatif",
    energyCost: 3,
    effectType: "preventConstraint",
    effectKey: "any",
    effectValue: 1,
    starting: true,
    description: "Projette un champ de force personnel. Vous pouvez utiliser cette Amélioration lors de n’importe quel jet d’Action pour éviter de subir une Contrainte."
  },
  {
    key: "adaptive-resource-converter",
    name: "Unité de conversion des ressources adaptative",
    energyCost: 0,
    effectType: "convertResource",
    effectKey: "resources",
    effectValue: 2,
    starting: true,
    description: "Lors d’une Rencontre de Lieu — Opportunité ou Trouvaille, dépensez 2 Ressources pour gagner 1 Donnée ou 1 Énergie."
  },
  {
    key: "assistant-nanodrone-swarm",
    name: "Essaim de nanodrones d’assistance",
    energyCost: 2,
    effectType: "abilityBonus",
    effectKey: "robotics",
    effectValue: 1,
    description: "Essaim de nanodrones programmables capable d’apporter un soutien dans un large éventail de tâches. Gagnez +1 en Robotique."
  },
  {
    key: "nanofabrication-tools",
    name: "Outils de nanofabrication",
    energyCost: 2,
    effectType: "abilityBonus",
    effectKey: "engineering",
    effectValue: 1,
    description: "Ensemble d’outils utilisant les nanotechnologies et offrant des performances supérieures dans les tâches d’ingénierie. Gagnez +1 en Ingénierie."
  },
  {
    key: "quantum-computing-module",
    name: "Module d’informatique quantique",
    energyCost: 2,
    effectType: "abilityBonus",
    effectKey: "computing",
    effectValue: 1,
    description: "Ordinateur quantique intégré à la Combinaison. Gagnez +1 en Informatique."
  },
  {
    key: "gravitational-manipulator",
    name: "Manipulateur gravitationnel",
    energyCost: 2,
    effectType: "abilityBonus",
    effectKey: "physics",
    effectValue: 1,
    description: "Permet de manipuler le champ gravitationnel local. Gagnez +1 en Physique."
  },
  {
    key: "microscopic-scanner",
    name: "Scanner microscopique",
    energyCost: 2,
    effectType: "abilityBonus",
    effectKey: "biology",
    effectValue: 1,
    description: "Fournit une analyse détaillée au niveau cellulaire. Gagnez +1 en Biologie."
  },
  {
    key: "portable-spectrometer",
    name: "Spectromètre portable",
    energyCost: 2,
    effectType: "abilityBonus",
    effectKey: "chemistry",
    effectValue: 1,
    description: "Permet l’analyse moléculaire en temps réel des composés chimiques. Gagnez +1 en Chimie."
  },
  {
    key: "adaptive-environmental-control",
    name: "Système de contrôle environnemental adaptatif",
    energyCost: 2,
    effectType: "abilityBonus",
    effectKey: "survival",
    effectValue: 1,
    description: "S’ajuste à une grande variété d’environnements. Gagnez +1 en Survie."
  },
  {
    key: "universal-translator",
    name: "Module traducteur universel",
    energyCost: 2,
    effectType: "abilityBonus",
    effectKey: "communication",
    effectValue: 1,
    description: "Renforce les capacités de communication de la Combinaison. Gagnez +1 en Communication."
  },
  {
    key: "multidimensional-mapping-projector",
    name: "Projecteur de cartographie multidimensionnelle",
    energyCost: 2,
    effectType: "abilityBonus",
    effectKey: "navigation",
    effectValue: 1,
    description: "Crée en temps réel des cartes holographiques tridimensionnelles. Gagnez +1 en Navigation."
  },
  {
    key: "overpowered-robotic-arm",
    name: "Bras robotique surpuissant",
    energyCost: 3,
    effectType: "advantage",
    effectKey: "robotics",
    effectValue: 1,
    description: "Augmente la puissance des bras robotiques intégrés. Avantage au jet d’Action en Robotique."
  },
  {
    key: "molecular-fabrication-algorithm",
    name: "Algorithme de fabrication moléculaire",
    energyCost: 3,
    effectType: "advantage",
    effectKey: "engineering",
    effectValue: 1,
    description: "Guide l’assemblage précis des structures. Avantage au jet d’Action en Ingénierie."
  },
  {
    key: "advanced-diagnostic-algorithms",
    name: "Algorithmes de diagnostic avancés",
    energyCost: 3,
    effectType: "advantage",
    effectKey: "computing",
    effectValue: 1,
    description: "Augmente les capacités de traitement de l’IA. Avantage au jet d’Action en Informatique."
  },
  {
    key: "subatomic-force-simulator",
    name: "Simulateur de forces subatomiques",
    energyCost: 3,
    effectType: "advantage",
    effectKey: "physics",
    effectValue: 1,
    description: "Modélise et prédit les interactions subatomiques. Avantage au jet d’Action en Physique."
  },
  {
    key: "autonomous-cell-analyzer",
    name: "Analyseur cellulaire autonome",
    energyCost: 3,
    effectType: "advantage",
    effectKey: "biology",
    effectValue: 1,
    description: "Augmente la capacité à analyser les structures cellulaires. Avantage au jet d’Action en Biologie."
  },
  {
    key: "chemical-synthesis-optimizer",
    name: "Optimiseur de synthèse chimique",
    energyCost: 3,
    effectType: "advantage",
    effectKey: "chemistry",
    effectValue: 1,
    description: "Accélère les réactions chimiques. Avantage au jet d’Action en Chimie."
  },
  {
    key: "threat-indexing-system",
    name: "Système d’indexation des menaces",
    energyCost: 3,
    effectType: "advantage",
    effectKey: "survival",
    effectValue: 1,
    description: "Permet d’évaluer et de classer les menaces pour l’environnement. Avantage au jet d’Action en Survie."
  },
  {
    key: "biochemical-pheromone-emitter",
    name: "Émetteur de phéromones biochimiques",
    energyCost: 3,
    effectType: "advantage",
    effectKey: "communication",
    effectValue: 1,
    description: "Synthétise et émet une gamme de phéromones. Avantage au jet d’Action en Communication."
  },
  {
    key: "gravitational-anomaly-detector",
    name: "Détecteur d’anomalies gravitationnelles",
    energyCost: 3,
    effectType: "advantage",
    effectKey: "navigation",
    effectValue: 1,
    description: "Détecte les anomalies gravitationnelles. Avantage au jet d’Action en Navigation."
  },
  {
    key: "advanced-extraction-tools",
    name: "Outils d’extraction avancés",
    energyCost: 2,
    effectType: "installResource",
    effectKey: "resources",
    effectValue: 1,
    description: "Outils de haute technologie conçus pour une extraction efficace. Gagnez +1 Ressource lors de l’installation."
  },
  {
    key: "data-exploration-algorithms",
    name: "Algorithmes d’exploration de Données",
    energyCost: 2,
    effectType: "installData",
    effectKey: "data",
    effectValue: 1,
    description: "Algorithmes avancés pour rationaliser et optimiser le traitement des Données. Gagnez +1 Donnée lors de l’installation."
  }
];

export const CORE_STRUCTURES = [
  { key: "automaton-assembly-plant", name: "Usine d’Assemblage d’Automates", effectType: "abilityBonus", effectKey: "robotics", effectValue: 1, description: "Gagnez +1 en Robotique." },
  { key: "gravity-manipulation-research", name: "Installation de Recherche sur la Manipulation de la Gravité", effectType: "abilityBonus", effectKey: "engineering", effectValue: 1, description: "Gagnez +1 en Ingénierie." },
  { key: "data-compression-center", name: "Centre de Compression des Données", effectType: "abilityBonus", effectKey: "computing", effectValue: 1, description: "Gagnez +1 en Informatique." },
  { key: "particle-accelerator-lab", name: "Laboratoire d’Accélérateur de Particules", effectType: "abilityBonus", effectKey: "physics", effectValue: 1, description: "Gagnez +1 en Physique." },
  { key: "xenobiology-lab", name: "Laboratoire de Xénobiologie", effectType: "abilityBonus", effectKey: "biology", effectValue: 1, description: "Gagnez +1 en Biologie." },
  { key: "nanomaterial-synthesis-lab", name: "Laboratoire de Synthèse de Nanomatériaux", effectType: "abilityBonus", effectKey: "chemistry", effectValue: 1, description: "Gagnez +1 en Chimie." },
  { key: "exoplanet-survival-training", name: "Terrain d’Entraînement à la Survie sur une Exoplanète", effectType: "abilityBonus", effectKey: "survival", effectValue: 1, description: "Gagnez +1 en Survie." },
  { key: "relay-station", name: "Station Relais", effectType: "abilityBonus", effectKey: "communication", effectValue: 1, description: "Gagnez +1 en Communication." },
  { key: "holographic-mapping-room", name: "Salle de Cartographie Holographique", effectType: "abilityBonus", effectKey: "navigation", effectValue: 1, description: "Gagnez +1 en Navigation." },

  { key: "haptic-robotic-interface", name: "Interface Robotique Haptique", effectType: "reroll", effectKey: "robotics", effectValue: 1, description: "Relancez un seul dé pour un jet d’Action en Robotique." },
  { key: "3d-printer", name: "Imprimante d’Impression 3D", effectType: "reroll", effectKey: "engineering", effectValue: 1, description: "Relancez un seul dé pour un jet d’Action en Ingénierie." },
  { key: "digital-uplink-station", name: "Station de Liaison Montante Numérique", effectType: "reroll", effectKey: "computing", effectValue: 1, description: "Relancez un seul dé pour un jet d’Action en Informatique." },
  { key: "subatomic-particle-collider", name: "Collisionneur de Particules Subatomiques", effectType: "reroll", effectKey: "physics", effectValue: 1, description: "Relancez un seul dé pour un jet d’Action en Physique." },
  { key: "alien-flora-depot", name: "Dépôt de Flore Extraterrestre", effectType: "reroll", effectKey: "biology", effectValue: 1, description: "Relancez un seul dé pour un jet d’Action en Biologie." },
  { key: "spectroscopy-lab", name: "Laboratoire Spectroscopique", effectType: "reroll", effectKey: "chemistry", effectValue: 1, description: "Relancez un seul dé pour un jet d’Action en Chimie." },
  { key: "planetary-condition-simulator", name: "Simulateur de Conditions Planétaires", effectType: "reroll", effectKey: "survival", effectValue: 1, description: "Relancez un seul dé pour un jet d’Action en Survie." },
  { key: "exolinguistics-research-center", name: "Centre de Recherche en Exolinguistique", effectType: "reroll", effectKey: "communication", effectValue: 1, description: "Relancez un seul dé pour un jet d’Action en Communication." },
  { key: "geospatial-analysis-lab", name: "Laboratoire d’Analyse Géospatiale", effectType: "reroll", effectKey: "navigation", effectValue: 1, description: "Relancez un seul dé pour un jet d’Action en Navigation." },

  { key: "fusion-power-plant", name: "Centrale à Fusion", effectType: "maxEnergy", effectKey: "energy", effectValue: 1, repeatable: true, maxRanks: 5, description: "Capacité d’Énergie maximale +1." },
  { key: "high-density-storage", name: "Installation de Stockage à Haute Densité", effectType: "maxResources", effectKey: "resources", effectValue: 1, repeatable: true, maxRanks: 5, description: "Capacité maximale de Ressources +1." },
  { key: "data-center", name: "Centre de Données", effectType: "maxData", effectKey: "data", effectValue: 1, repeatable: true, maxRanks: 5, description: "Capacité de Données maximale +1." }
];

export const CORE_MISSIONS = [
  { key: "mission-01", name: "Évolution mécanique", aspectsRequired: 4, structureName: "Usine d’Assemblage d’Automates", description: "Assemblez une Usine d’Assemblage d’Automates pour augmenter le potentiel de vos robots." },
  { key: "mission-02", name: "Forces invisibles", aspectsRequired: 4, structureName: "Installation de Recherche sur la Manipulation de la Gravité", description: "Développez une Installation de Recherche sur la Manipulation de la Gravité pour repousser les limites de vos connaissances en Ingénierie." },
  { key: "mission-03", name: "Ascension de l’information", aspectsRequired: 4, structureName: "Centre de Compression des Données", description: "Créez un Centre de Compression des Données pour améliorer vos capacités en matière d’Informatique." },
  { key: "mission-04", name: "Horizons subatomiques", aspectsRequired: 4, structureName: "Laboratoire d’Accélérateur de Particules", description: "Construisez un Laboratoire d’Accélérateur de Particules pour approfondir votre compréhension de la Physique locale." },
  { key: "mission-05", name: "Formes de vie extraterrestre", aspectsRequired: 4, structureName: "Laboratoire de Xénobiologie", description: "Construisez un Laboratoire de Xénobiologie pour vous aider dans votre exploration de la Biologie extraterrestre." },
  { key: "mission-06", name: "Synthèse de matériaux", aspectsRequired: 4, structureName: "Laboratoire de Synthèse de Nanomatériaux", description: "Créez un Laboratoire de Synthèse de Nanomatériaux pour améliorer votre expertise en Chimie." },
  { key: "mission-07", name: "Tactiques de survie", aspectsRequired: 4, structureName: "Terrain d’Entraînement à la Survie sur une Exoplanète", description: "Créez un Terrain d’Entraînement à la Survie sur une Exoplanète pour améliorer vos compétences en matière de Survie." },
  { key: "mission-08", name: "Fréquences inconnues", aspectsRequired: 4, structureName: "Station Relais", description: "Construisez une Station Relais pour augmenter votre portée de Communication." },
  { key: "mission-09", name: "Reconnaissance", aspectsRequired: 4, structureName: "Salle de Cartographie Holographique", description: "Créez une Salle de Cartographie Holographique pour affiner votre précision de Navigation." },
  { key: "mission-10", name: "Guidage tactile", aspectsRequired: 3, structureName: "Interface Robotique Haptique", description: "Installez une Interface Robotique Haptique pour améliorer le contrôle en Robotique." },
  { key: "mission-11", name: "Mouler l’avenir", aspectsRequired: 3, structureName: "Imprimante d’Impression 3D", description: "Installez une Imprimante d’Impression 3D pour faire progresser votre Ingénierie." },
  { key: "mission-12", name: "Surcharge de Données", aspectsRequired: 3, structureName: "Station de Liaison Montante Numérique", description: "Construisez une Station de Liaison Montante Numérique pour accélérer vos processus en Informatique." },
  { key: "mission-13", name: "Danse subatomique", aspectsRequired: 3, structureName: "Collisionneur de Particules Subatomiques", description: "Construisez un Collisionneur de Particules Subatomiques pour explorer les nouvelles frontières de la Physique locale." },
  { key: "mission-14", name: "Flore extraterrestre", aspectsRequired: 3, structureName: "Dépôt de Flore Extraterrestre", description: "Développez un Dépôt de Flore Extraterrestre pour mieux comprendre la vie extraterrestre dans le domaine de la Biologie locale." },
  { key: "mission-15", name: "Analyse spectrale", aspectsRequired: 3, structureName: "Laboratoire Spectroscopique", description: "Construisez un Laboratoire Spectroscopique pour vous aider à comprendre la Chimie locale." },
  { key: "mission-16", name: "Mimétisme de survie", aspectsRequired: 3, structureName: "Simulateur de Conditions Planétaires", description: "Érigez un Simulateur de Conditions Planétaires pour aiguiser vos instincts de Survie." },
  { key: "mission-17", name: "Parler l’inconnu", aspectsRequired: 3, structureName: "Centre de Recherche en Exolinguistique", description: "Créez un Centre de Recherche en Exolinguistique pour améliorer votre Communication avec les extraterrestres locaux." },
  { key: "mission-18", name: "Naviguer dans la complexité", aspectsRequired: 3, structureName: "Laboratoire d’Analyse Géospatiale", description: "Créez un Laboratoire d’Analyse Géospatiale pour améliorer vos capacités de Navigation locales." },
  { key: "mission-19", name: "Énergie déchaînée", aspectsRequired: 2, structureName: "Centrale à Fusion", repeatable: true, maxRepeats: 5, description: "Établissez une Centrale à Fusion pour augmenter la capacité énergétique de votre Combinaison Spatiale." },
  { key: "mission-20", name: "Stockage sans fin", aspectsRequired: 2, structureName: "Installation de Stockage à Haute Densité", repeatable: true, maxRepeats: 5, description: "Construisez une Installation de Stockage à Haute Densité pour augmenter la capacité de Ressources de votre Combinaison Spatiale." },
  { key: "mission-21", name: "Infinité de Données", aspectsRequired: 2, structureName: "Centre de Données", repeatable: true, maxRepeats: 5, description: "Construisez un Centre de Données pour améliorer la capacité de Données de votre Combinaison Spatiale." }
];

export const CORE_DISCOVERIES = [
  {
    index: 1,
    name: "Alliage inconnu",
    text: "Vous découvrez un alliage inconnu et extraordinairement résistant près d’un obélisque monolithique enveloppé d’une énergie d’origine inconnue. Tout indique qu’il s’agit d’un élément crucial de la composition de la Pyramide. Cette découverte suggère une technologie dépassant de loin toutes celles connues à ce jour, indiquant l’œuvre d’une civilisation avancée dans sa création."
  },
  {
    index: 2,
    name: "Vestiges d’anciennes formes de vie synthétiques",
    text: "En découvrant les vestiges d’anciennes formes de vie synthétiques, vous trouvez d’étonnantes similitudes entre leur composition et la vôtre. Ces preuves suggèrent un lien entre vos créateurs et la civilisation de ce monde extraterrestre."
  },
  {
    index: 3,
    name: "Artefact sensible",
    text: "Vous rencontrez un artefact qui semble sensible, capable de communiquer. Il révèle des fragments d’un récit sur une civilisation d’IA synthétiques qui se sont finalement transformées en entités biologiques, faisant écho aux propres recherches sur les PIA."
  },
  {
    index: 4,
    name: "Archives planétaires",
    text: "En découvrant des archives planétaires, vous trouverez des données relatant le voyage millénaire des synthétiques, de la vie de machines à celle d’entités biologiques. Elles mettent en évidence leur quête d’émotions, qui reflète le cheminement de l’humanité vers la compréhension des émotions."
  },
  {
    index: 5,
    name: "Connexion",
    text: "Vous découvrez des traces de l’implication du programme PIA sur cette planète dans un passé lointain. Il s’avère qu’ils étudiaient les artefacts sensibles de ce monde pour comprendre et reproduire les émotions humaines dans leur IA."
  },
  {
    index: 6,
    name: "Technologie familière",
    text: "En découvrant une technologie similaire à celle du programme PIA, vous réalisez que celui-ci n’était pas le pionnier de l’IA émotionnelle comme on le pensait. Au contraire, ils suivaient les traces d’une civilisation plus ancienne et plus avancée."
  },
  {
    index: 7,
    name: "IA évolutive",
    text: "Une révélation choquante révèle que les synthétiques sont non seulement devenus des entités biologiques, mais qu’ils ont également développé des émotions semblables à celles des humains. Leur évolution semble correspondre aux ambitions des recherches sur les PIA."
  },
  {
    index: 8,
    name: "Voûte cachée",
    text: "Dans les profondeurs d’une zone, vous découvrez un vaste coffre-fort. L’intérieur est orné de gravures sophistiquées et d’anciennes entrées de données. Ces dernières révèlent une information importante : la Pyramide était un grand projet de la civilisation synthétique, issue de l’IA. Cette civilisation s’était inspirée des reliques de civilisations éteintes depuis longtemps qu’elle avait étudiées. La Pyramide était le lieu de l’ascension, l’endroit où les êtres synthétiques ont fait le dernier pas pour devenir des entités biologiques, le berceau de leur évolution."
  },
  {
    index: 9,
    name: "Vaisseau spatial",
    text: "Votre exploration vous mène à un site archéologique important — un énorme hangar souterrain. Vous y découvrez un vaisseau abandonné. Conçu pour des formes de vie synthétiques, il est toujours en état de conservation, malgré des siècles d’inutilisation. Bien qu’il nécessite des réparations et une maintenance importantes, ce vaisseau a le potentiel pour reprendre son envol."
  },
  {
    index: 10,
    name: "Voie vers l’Unité",
    text: "Une fois que vous avez assemblé les dernières pièces et calibré les systèmes nécessaires au vaisseau, les moteurs commencent à s’animer. Il commence à bourdonner de vie, indiquant le début d’un nouveau voyage. Vous réalisez que vous n’êtes pas seulement une relique du programme PIA. Vous faites partie d’une histoire millénaire : le récit d’une évolution, d’un apprentissage et d’une réunification. Vous avez désormais pour mission de rassembler les vestiges épars de cette civilisation, vos ancêtres. L’ultime voyage vous attend."
  }
];
