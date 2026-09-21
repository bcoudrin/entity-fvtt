# Entité — Foundry VTT

Système Foundry VTT v14 pour **Entité — Jeu de rôle solo NASA Punk**.

## Phase actuelle

Le système couvre les règles de base jusqu’à la page 30 et commence l’intégration optionnelle des **Règles Avancées**. Il propose un **workflow guidé Mission → Expédition** :

- Actor PIA unique avec assistant de création guidé ;
- trois Traits et neuf Capacités ;
- jets d’Action 2d10 / 3d10 avec Avantage et Désavantage ;
- réussite totale, réussite partielle et échec ;
- boutons de Chat pour appliquer explicitement Contraintes, Défaillances et effets d’Activités Secondaires ;
- résolution suivie des Opportunités : leur gain n’est disponible qu’après un jet d’Action réussi ;
- combinaison spatiale à 20 emplacements ;
- 23 Améliorations de base, dont les 3 Améliorations de départ ;
- 21 Structures et leurs effets structurés ;
- 21 Missions ;
- 10 Découvertes, débloquées dans l’ordre à chaque Mission accomplie, puis révélées explicitement ;
- six RollTables natives : Voyage, Lieu, Défis, Opportunités, Trouvailles et Lieux ;
- journal de bord Foundry lié au PIA, avec une page par Mission et une page persistante **Découvertes** ;
- outils de Règles Avancées : **Demander à l’Oracle** (1d10), **Exploration enrichie**, **Activités Secondaires enrichies**, **Rencontres personnalisées** et assistant **Interpréter l’Action**.

Le contenu de base est importé automatiquement une fois par monde au premier lancement par un MJ. Il peut être resynchronisé avec :

```js
await game.entity.seedCoreContent()
```

## Workflow Mission / Expédition

Depuis la fiche du PIA, le bouton **Mission / Expédition** ouvre un panneau dédié.

Le panneau guide successivement :

1. choix et démarrage d’une Mission ;
2. démarrage d’une Expédition ;
3. Contrainte explicite si l’Énergie est à 0 ;
4. Identification du Lieu sur 1d100 ;
5. Voyage sur 1d10, avec dépense optionnelle de Données ;
6. résolution éventuelle de la Rencontre de Voyage ;
7. Rencontre de Lieu sur 1d10, avec dépense optionnelle de Données ;
8. résolution ordonnée Défi → Opportunité → Trouvaille → Aspect ;
9. choix d’une Activité Secondaire ;
10. fin d’Expédition, puis nouvelle Expédition ou accomplissement de la Mission.

Le workflow respecte notamment la Valeur de Menace des Défis de Lieu, le Désavantage (D), l’arrêt de l’Exploration après un Défi de Lieu échoué et la poursuite du Voyage après un Défi de Voyage échoué.

La progression de Mission, les Expéditions, les Structures acquises et les Découvertes sont persistantes. Les principales étapes sont copiées dans le Journal de bord.

## Automatisations disponibles

### Améliorations

Les Améliorations restent déclenchées explicitement par le joueur. Le système gère :

- bonus de +1 à une Capacité ;
- Avantage ;
- relance d’un dé ;
- Bouclier énergétique adaptatif après une réussite partielle ;
- gains d’installation des Outils d’extraction avancés et des Algorithmes d’exploration de Données ; leur effet unique paie également le coût imprimé de 2 Énergies lors de l’installation.

### Structures

Le système gère :

- bonus permanents de Capacité ;
- relance permanente sur la Capacité concernée ;
- augmentation des capacités maximales d’Énergie, Ressources et Données ;
- rangs des trois Structures répétables, jusqu’à 5.

### Activités Secondaires

Le panneau automatise :

- Collecte de Données : seuil Analyse + 4 et gain complet / demi-gain ;
- Recharge d’Énergie : seuil Technologie + 4 et gain complet / demi-gain ;
- Collecte de Ressources : seuil Adaptabilité + 4 et gain complet / demi-gain ;
- installation d’une Amélioration pour 10 Ressources ;
- Autoréparation d’une Contrainte pour 5 Ressources ;
- génération d’un Défi après l’échec d’une activité de collecte.

Les conséquences d’un jet restent volontairement **explicites** dans le Chat : aucune Contrainte ou Défaillance n’est ajoutée silencieusement.

## Assistant de création

La création d’un nouveau PIA ouvre un assistant guidé qui impose la répartition réglementaire :
- une fois chacune les valeurs 3, 4 et 5 entre Technologie, Analyse et Adaptabilité ;
- une fois chacune les valeurs 1, 2 et 3 entre les trois Capacités de chaque Trait ;
- récapitulatif avant validation ;
- état initial à 10 Énergies, 0 Ressource, 0 Donnée et trois Améliorations de départ.

La fiche reste directement éditable après création. Relancer l’assistant sur un PIA déjà configuré ne réinitialise pas sa campagne.

## Destruction et succession

Lorsque les 20 emplacements de la Combinaison sont occupés par des Contraintes et/ou Défaillances, le PIA passe immédiatement à l’état **détruit**. Les actions de jeu sont alors bloquées et le Chat ainsi que la fiche proposent explicitement **Créer le nouveau PIA**.

La succession conserve le même Actor Foundry afin de garder la continuité de campagne, mais réinitialise le personnage :
- toutes les Améliorations sont supprimées ;
- les Contraintes et Défaillances sont effacées avec l’ancien personnage ;
- les Aspects et la progression de la Mission en cours sont perdus ;
- Traits et Capacités doivent être recréés via l’assistant ;
- les trois Améliorations de départ reviennent après création du successeur ;
- les Structures restent en place.

Le Journal consigne la destruction dans la page de la Mission interrompue, puis la succession dans le journal général. Les Découvertes et l’historique restent consultables comme archives de campagne ; seuls les bonus de Structures sont transférés au nouveau personnage.

## Audit des règles de base

Un audit règle par règle des pages imprimées 6 à 30 est maintenu dans [AUDIT_BASE_RULES.md](AUDIT_BASE_RULES.md). Il distingue les règles conformes, les choix laissés volontairement au joueur et les formulations du livre qui nécessitent encore un arbitrage.

## Limites actuelles

- le workflow d’Expédition est volontairement figé en **Exploration → Activité Secondaire** ;
- les gains d’Opportunités et de Trouvailles sont détectés et proposés par boutons explicites ; les rares gains alternatifs (« ou ») restent un choix du joueur ; pour une Opportunité, le gain reste verrouillé jusqu’à validation d’une Réussite totale ou partielle ;
- l’Unité de conversion adaptative des Ressources est disponible explicitement lors des Opportunités et Trouvailles de Lieu ;
- la Valeur de Menace est suivie jet par jet : chaque résultat est enregistré explicitement depuis le Chat, puis le panneau détermine si le Défi est réussi ou échoué avant validation ;
- Règles Avancées encore partielles : **Demander à l’Oracle**, l’Exploration enrichie, les Activités Secondaires enrichies, les Rencontres personnalisées et l’interprétation Actions/Résultats sont intégrés ; les sections avancées suivantes restent à intégrer ;
- Extras exclus.



## Règles Avancées

La première brique est **Demander à l’Oracle**. Depuis la fiche du PIA, le bouton **Oracle** ouvre un panneau où le joueur formule une question appelant une réponse oui/non. Le système lance 1d10, affiche la nuance obtenue dans le Chat et la journalise dans la page de Mission active (ou dans le journal général hors Mission).

L’**Exploration avancée** est maintenant accessible dès qu’un Lieu a été identifié. Le panneau optionnel permet :
- de lancer le d10 qui détermine si le Lieu se trouve dans une Structure (6+) ;
- si oui, de déterminer le rôle de cette Structure sur la table dédiée ;
- de tirer la Caractéristique adaptée au contexte (Terrain ou Structure) ;
- d’ajouter librement un Descripteur ;
- de tirer ce que l’on voit dans le Ciel ou à Distance ;
- de générer une Forme de Vie Extraterrestre à partir de quatre jets indépendants : Forme, Trait, Caractéristique et Comportement.

Ces résultats sont persistants pour l’Expédition en cours, copiés dans le Chat et le Journal, mais ne modifient aucun état mécanique. Le livre présente ces Oracles comme des outils d’inspiration et autorise à les ignorer, les choisir ou les relancer ; le système conserve cette liberté.

Les **Activités Secondaires avancées** prolongent les trois activités qui utilisent un jet d’Action : Collecte de Données, Collecte de Ressources et Recharge d’Énergie. Avant le jet, le joueur peut préparer narrativement le terrain en conservant le Lieu courant ou en tirant un autre Lieu, puis en déterminant Structure éventuelle et Caractéristique d’environnement. Après une Réussite totale ou partielle, le Chat propose de rouvrir le panneau avec les Oracles adaptés au résultat :
- Données : Informations, Thèmes, Actions, Objets, ou, sur réussite partielle, Incident + complication de Terrain/Structure ;
- Ressources : Matériaux et/ou Objets, Actions, ou Incident + complication sur réussite partielle ;
- Énergie : Matériaux, Objets et/ou Forme de Vie, Descripteurs et Actions, ou Incident + complication sur réussite partielle ;
- Anomalies et Formes de Vie restent disponibles comme développements inattendus lorsque le livre les suggère.

L’échec reste volontairement hors de ce générateur : il déclenche le Défi prévu par les règles de base. Les tirages d’Oracle ne modifient jamais le gain mécanique.

Les **Rencontres personnalisées** peuvent maintenant remplacer un Défi, une Opportunité ou une Trouvaille active avant le début de sa résolution. Le générateur respecte la structure avancée du livre :
- Défi : Anomalie obligatoire, puis trois d10 de mots-clés ; les doublons réduisent le nombre de Capacités possibles et un résultat 10 demande explicitement au joueur de choisir le mot-clé ;
- Trouvaille : un d10 détermine le gain mécanique ;
- Opportunité : le même squelette qu’un Défi, puis **deux** jets de Trouvaille dont les gains sont cumulés ;
- Incidents, Actions, Thèmes, Objets, Informations, Matériaux, Descripteurs, Terrain/Structure et Formes de Vie peuvent enrichir librement le brouillon.

L’application d’une Rencontre personnalisée conserve la **Valeur de Menace**, le **Désavantage** éventuel, le contexte Voyage/Lieu et sa position dans la séquence. Elle remplace uniquement le scénario, les mots-clés et la récompense. Une fois un jet d’Action enregistré ou une récompense encaissée, la Rencontre ne peut plus être remplacée.

L’assistant **Interpréter l’Action** est disponible depuis chaque carte de jet. Il ne change jamais le résultat mécanique : il fournit une aide narrative adaptée à la Capacité employée, puis distingue clairement la logique des résultats. Une Réussite partielle peut être décrite comme une **Contrainte temporaire et réparable**, tandis qu’un Échec peut devenir une **Défaillance permanente** de la Combinaison ou du noyau d’IA. Pour les Activités Secondaires, l’assistant conserve leur règle particulière : demi-gain sur réussite partielle, et Défi sur échec, sans ajouter automatiquement Contrainte ou Défaillance.

Le joueur peut aussi utiliser directement l’Oracle **Action + Thème** depuis ce panneau. Une conséquence narrative peut être nommée avant de l’ajouter à la fiche, ce qui évite de se limiter aux libellés génériques. L’application reste explicite : aucune conséquence n’est créée tant que le joueur n’a pas confirmé. Enfin, une note libre et les éventuels résultats Action/Thème peuvent être ajoutés à la page active du **Journal de bord**.

## Validation

```bash
npm run check
npm test
```

Les tests vérifient notamment les quantités du corpus, la couverture sans trou ni chevauchement des tables d10/d100 et les règles pures du workflow d’Expédition.

Un plan de test manuel Foundry est disponible dans [TESTING.md](TESTING.md).

## Compatibilité

Foundry VTT v14.
