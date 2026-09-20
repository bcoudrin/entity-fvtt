# Entité — Foundry VTT

Système Foundry VTT v14 pour **Entité — Jeu de rôle solo NASA Punk**.

## Phase actuelle

Le système couvre les règles de base jusqu’à la page 30 et propose maintenant un **workflow guidé Mission → Expédition** :

- Actor PIA unique ;
- trois Traits et neuf Capacités ;
- jets d’Action 2d10 / 3d10 avec Avantage et Désavantage ;
- réussite totale, réussite partielle et échec ;
- boutons de Chat pour appliquer explicitement Contraintes, Défaillances et effets d’Activités Secondaires ;
- combinaison spatiale à 20 emplacements ;
- 23 Améliorations de base, dont les 3 Améliorations de départ ;
- 21 Structures et leurs effets structurés ;
- 21 Missions ;
- 10 Découvertes, conservées dans l’ordre de progression ;
- six RollTables natives : Voyage, Lieu, Défis, Opportunités, Trouvailles et Lieux ;
- journal de bord Foundry lié au PIA et alimenté par le workflow.

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
- gains d’installation des Outils d’extraction avancés et des Algorithmes d’exploration de Données.

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

## Limites actuelles

- pas encore d’assistant de création ;
- les gains d’Opportunités et de Trouvailles sont détectés et proposés par boutons explicites ; les rares gains alternatifs (« ou ») restent un choix du joueur ;
- l’Unité de conversion adaptative des Ressources est disponible explicitement lors des Opportunités et Trouvailles de Lieu ;
- la Valeur de Menace est suivie jet par jet : chaque résultat est enregistré explicitement depuis le Chat, puis le panneau détermine si le Défi est réussi ou échoué avant validation ;
- règles avancées exclues ;
- Extras exclus.

## Validation

```bash
npm run check
npm test
```

Les tests vérifient notamment les quantités du corpus, la couverture sans trou ni chevauchement des tables d10/d100 et les règles pures du workflow d’Expédition.

Un plan de test manuel Foundry est disponible dans [TESTING.md](TESTING.md).

## Compatibilité

Foundry VTT v14.
