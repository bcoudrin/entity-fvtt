# Plan de test manuel — Phase 1

Ces tests complètent la validation statique exécutée par GitHub Actions.

## 1. Installation / démarrage

1. Installer le dépôt dans `Data/systems/entity`.
2. Lancer Foundry VTT v14.
3. Créer un monde avec le système **Entité**.
4. Vérifier qu’aucune erreur bloquante n’apparaît dans la console.
5. Vérifier la création automatique des dossiers :
   - Entité — Améliorations ;
   - Entité — Structures ;
   - Entité — Missions.
6. Vérifier la présence des six RollTables Entité.

Attendu : 23 Améliorations, 21 Structures, 21 Missions et 6 RollTables.

## 2. Création d’un PIA

1. Créer un Actor de type `pia`.
2. Ouvrir sa fiche.
3. Vérifier la présence automatique des trois Améliorations de départ :
   - Outil multiple intégré ;
   - Bouclier énergétique adaptatif ;
   - Unité de conversion des ressources adaptative.
4. Vérifier Énergie 10/10, Ressources 0/10, Données 0/10.
5. Vérifier que la Combinaison affiche 20 emplacements, dont 3 occupés.

Le contrôle de la répartition 3/4/5 et 1/2/3 sera ajouté avec l’assistant de création.

## 3. Jets d’Action

Renseigner manuellement des valeurs de Trait et de Capacité.

### Jet normal

1. Sélectionner **Normal**.
2. Cliquer sur une Capacité.
3. Vérifier que 2d10 sont lancés.
4. Vérifier le seuil `Trait + Capacité + bonus de Structure éventuel`.
5. Vérifier :
   - deux dés sous ou égaux au seuil → Réussite totale ;
   - un seul → Réussite partielle ;
   - aucun → Échec.

### Avantage

1. Sélectionner **Avantage**.
2. Vérifier le lancer de 3d10.
3. Vérifier que le dé le plus élevé est visuellement écarté.

### Désavantage

1. Sélectionner **Désavantage**.
2. Vérifier le lancer de 3d10.
3. Vérifier que le dé le plus faible est visuellement écarté.

## 4. Conséquences explicites

Sur une Réussite partielle, vérifier la présence du bouton **Ajouter une Contrainte**.

Sur un Échec, vérifier la présence du bouton **Ajouter une Défaillance**.

Attendu :
- l’état du PIA ne change pas avant le clic ;
- la Contrainte occupe ensuite un emplacement ;
- la Défaillance occupe un emplacement et n’a pas de bouton de suppression sur la fiche ;
- une Contrainte peut être retirée depuis la fiche.

## 5. Améliorations

### Outil multiple intégré

1. Activer l’Amélioration.
2. Vérifier la dépense de 2 Énergies.
3. Faire un jet.
4. Vérifier qu’un bouton de relance est proposé.
5. Relancer un dé et vérifier le recalcul du résultat.

### Bouclier énergétique adaptatif

1. Obtenir une Réussite partielle.
2. Vérifier que le Bouclier est proposé si au moins 3 Énergies restent.
3. L’activer.
4. Vérifier la dépense de 3 Énergies et l’absence de Contrainte.

### Bonus +1 / Avantage

Glisser depuis le catalogue une Amélioration de chaque type, l’activer puis lancer la Capacité correspondante.

Attendu : coût en Énergie puis effet sur le prochain jet compatible.

### Effets d’installation

Glisser :
- Outils d’extraction avancés → +1 Ressource ;
- Algorithmes d’exploration de Données → +1 Donnée.

L’effet ne doit être appliqué qu’une seule fois à l’installation de l’Item.

## 6. Combinaison

1. Ajouter manuellement Contraintes et Défaillances.
2. Vérifier le compteur d’emplacements.
3. Vérifier qu’une nouvelle Amélioration est refusée si les 20 emplacements sont déjà utilisés.
4. Vérifier qu’une Amélioration en double est supprimée et signalée.
5. Pour atteindre la destruction, défausser les Améliorations puis remplir les 20 emplacements uniquement de Contraintes/Défaillances.

Attendu : message **PIA DÉTRUIT** au vingtième dommage.

## 7. Structures

Glisser une Structure de bonus +1 sur le PIA puis effectuer le jet correspondant.

Attendu : seuil augmenté de 1.

Glisser une Structure de relance puis effectuer le jet correspondant.

Attendu : une relance gratuite est disponible.

Pour les Structures répétables :
- Centrale à Fusion ;
- Installation de Stockage à Haute Densité ;
- Centre de Données.

Les glisser plusieurs fois.

Attendu :
- un seul Item reste sur le PIA ;
- son rang augmente ;
- le maximum correspondant augmente de 1 par rang ;
- impossible de dépasser 5 rangs.

## 8. RollTables

Vérifier :

- Rencontres de Voyage : d10, couverture 1–10 ;
- Rencontres de Lieu : d10, couverture 1–10 ;
- Rencontres — Défis : d100, 50 entrées couvrant 1–100 ;
- Rencontres — Opportunités : d100, 50 entrées couvrant 1–100 ;
- Rencontres — Trouvailles : d100, 50 entrées couvrant 1–100 ;
- Lieux : d100, 50 entrées couvrant 1–100.

Les mots-clés des Défis et Opportunités doivent être affichés en français.

## 9. Journal

1. Vérifier qu’un Journal de bord est créé avec le PIA.
2. Vérifier le bouton **Journal de bord** depuis la fiche.
3. Ajouter du texte manuellement.

Le pré-remplissage par Expédition viendra avec le workflow automatisé.

## Limites connues avant Phase 2

- pas d’assistant de création ;
- pas de validation automatique des répartitions initiales ;
- pas encore de workflow Mission/Expédition ;
- les Données ne modifient pas encore automatiquement les jets de Rencontres ;
- la VM et le Désavantage des Rencontres ne sont pas encore pilotés par un workflow ;
- l’Unité de conversion adaptative sera automatisée avec les Rencontres ;
- pas de règles avancées ni d’Extras.
