# Entité — Foundry VTT

Système Foundry VTT v14 pour **Entité — Jeu de rôle solo NASA Punk**.

## Phase actuelle

Le système couvre les règles de base jusqu’à la page 30 et propose maintenant un **workflow guidé Mission → Expédition** :

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
- journal de bord Foundry lié au PIA, avec une page par Mission et une page persistante **Découvertes**.

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
- un seul point éditorial des règles de base reste à arbitrer : le coût 2E des deux Améliorations dont l’effet se produit à l’installation ;
- les gains d’Opportunités et de Trouvailles sont détectés et proposés par boutons explicites ; les rares gains alternatifs (« ou ») restent un choix du joueur ; pour une Opportunité, le gain reste verrouillé jusqu’à validation d’une Réussite totale ou partielle ;
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
