# Entité — Foundry VTT

Système Foundry VTT v14 pour **Entité — Jeu de rôle solo NASA Punk**.

## Phase actuelle

Le socle jouable couvre les règles de base jusqu’à la page 30 :

- Actor PIA unique ;
- trois Traits et neuf Capacités ;
- jets d’Action 2d10 / 3d10 avec Avantage et Désavantage ;
- réussite totale, réussite partielle et échec ;
- boutons de Chat pour ajouter explicitement Contraintes et Défaillances ;
- combinaison spatiale à 20 emplacements ;
- 23 Améliorations de base, dont les 3 Améliorations de départ ;
- 21 Structures et leurs effets structurés ;
- 21 Missions ;
- 10 Découvertes, conservées dans l’ordre de progression ;
- six RollTables natives : Voyage, Lieu, Défis, Opportunités, Trouvailles et Lieux ;
- journal de bord Foundry lié au PIA.

Le contenu de base est importé automatiquement une fois par monde au premier lancement par un MJ. Il peut être resynchronisé avec :

```js
await game.entity.seedCoreContent()
```

## Règles déjà automatisées

Les Améliorations sont activées explicitement avant le jet. Le système sait actuellement gérer :

- bonus de +1 à une Capacité ;
- Avantage ;
- relance d’un dé ;
- Bouclier énergétique adaptatif après une réussite partielle ;
- gains d’installation des Outils d’extraction avancés et des Algorithmes d’exploration de Données.

Les Structures gèrent :

- bonus permanents de Capacité ;
- relance permanente sur la Capacité concernée ;
- augmentation des capacités maximales d’Énergie, Ressources et Données ;
- rangs des trois Structures répétables, jusqu’à 5.

## Hors périmètre actuel

- assistant de création ;
- automatisation Mission → Expédition → Exploration → Activité secondaire ;
- dépense de Données sur les jets de Rencontre ;
- résolution guidée VM / Désavantage des Rencontres ;
- règles avancées ;
- Extras.

## Validation

```bash
npm run check
npm test
```

Les tests vérifient notamment les quantités du corpus et la couverture sans trou ni chevauchement des tables d10/d100.

## Compatibilité

Foundry VTT v14.
