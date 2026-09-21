export const ACTION_INTERPRETATION_GUIDES = {
  robotics: {
    label: "Robotique",
    summary: "Interagir avec des robots, drones, systèmes de sécurité ou technologies inconnues : diagnostiquer, reprogrammer, neutraliser ou manipuler des machines à l’aide de la Combinaison, des drones et de l’outil multifonction."
  },
  computing: {
    label: "Informatique",
    summary: "Décoder des transmissions et interfaces, comprendre des systèmes numériques inconnus, contourner des sécurités, contrer une attaque informatique ou traduire des protocoles et langages techniques."
  },
  engineering: {
    label: "Ingénierie",
    summary: "Gérer un risque structurel, renforcer un abri, construire une défense ou un piège, réparer un équipement et exploiter les systèmes physiques de la Combinaison pour franchir un environnement dangereux."
  },
  physics: {
    label: "Physique",
    summary: "Analyser gravité, énergie, rayonnements, température ou phénomènes anormaux ; calibrer les protections de la Combinaison et comprendre une technologie à partir de principes physiques."
  },
  biology: {
    label: "Biologie",
    summary: "Étudier la physiologie et le comportement d’une forme de vie, identifier une menace biologique, concevoir une contre-mesure non agressive, un traitement ou une méthode d’observation adaptée."
  },
  chemistry: {
    label: "Chimie",
    summary: "Analyser une substance inconnue, produire un composé protecteur ou neutralisant, modifier chimiquement un matériau et concevoir une réponse aux toxines, radiations, corrosifs ou menaces biologiques."
  },
  survival: {
    label: "Survie",
    summary: "Anticiper les dangers naturels, trouver un abri, traverser un terrain hostile, éviter ou supporter une menace et employer les systèmes de protection ou d’augmentation physique de la Combinaison."
  },
  communication: {
    label: "Communication",
    summary: "Interpréter signaux, gestes, glyphes ou enregistrements, établir un contact, comprendre une intention et exploiter des dispositifs de relais ou de traduction pour échanger avec l’inconnu."
  },
  navigation: {
    label: "Navigation",
    summary: "S’orienter par les étoiles ou les instruments, lire ou produire une carte, rester sur sa route malgré une visibilité dégradée et comprendre des données de navigation ou des dispositifs inconnus."
  }
};

export const RESULT_INTERPRETATION_GUIDES = {
  full: {
    label: "Réussite totale",
    summary: "L’action atteint pleinement son objectif. Décrivez ce que le PIA fait concrètement, quels instruments il mobilise et ce qu’il apprend ou modifie dans la scène."
  },
  partial: {
    label: "Réussite partielle",
    summary: "L’action réussit, mais un problème réparable apparaît. La Contrainte doit évoquer une perturbation temporaire de la Combinaison ou de l’IA plutôt qu’un dommage irréversible.",
    suitExamples: "Exemples : fonctionnement intermittent d’un système, visière momentanément gênée, jet-pack instable, servomoteur ralenti, filtre obstrué ou surcharge temporaire.",
    aiExamples: "Exemples : message d’erreur intermittent, imprécision sensorielle ou de navigation, délai de traitement, cache mémoire perturbé ou brève interruption de données."
  },
  failure: {
    label: "Échec",
    summary: "L’action échoue et provoque une Défaillance permanente. Décrivez un dommage durable de la Combinaison ou du noyau d’IA, cohérent avec la manière dont l’action a mal tourné.",
    suitExamples: "Exemples : perforation ou étanchéité compromise, circuits endommagés, propulsion ou ventilation défaillante, blindage dégradé ou affichage durablement altéré.",
    aiExamples: "Exemples : données corrompues, puissance de traitement réduite, module devenu inaccessible, perte sensorielle, secteur mémoire effacé ou erreur logique durable."
  }
};

export function actionInterpretationGuide(abilityKey) {
  return ACTION_INTERPRETATION_GUIDES[abilityKey] || null;
}

export function resultInterpretationGuide(result, { secondary = false } = {}) {
  if (secondary) {
    if (result === "full") {
      return {
        label: "Réussite totale",
        summary: "Appliquez le gain complet de l’Activité Secondaire. La description narrative peut expliquer pourquoi la collecte ou la recharge est particulièrement efficace."
      };
    }
    if (result === "partial") {
      return {
        label: "Réussite partielle",
        summary: "Appliquez le demi-gain. Il n’y a pas de Contrainte générique : la complication reste narrative et peut décrire une collecte difficile, incomplète ou coûteuse en temps."
      };
    }
    return {
      label: "Échec",
      summary: "L’Activité Secondaire ne produit aucun gain et déclenche le Défi prévu par ses règles. Elle n’ajoute pas directement de Défaillance générique."
    };
  }
  return RESULT_INTERPRETATION_GUIDES[result] || null;
}
