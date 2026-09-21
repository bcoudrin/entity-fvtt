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


## 10. Workflow Mission / Expédition

### Démarrage d’une Mission

1. Ouvrir un PIA puis cliquer sur **Mission / Expédition**.
2. Choisir une Mission et la démarrer.
3. Vérifier que la Mission active et son nombre d’Aspects requis sont affichés.
4. Vérifier le début de Mission :
   - Énergie à sa capacité maximale actuelle ;
   - Ressources à 0 ;
   - Données à 0 ;
   - Contraintes supprimées ;
   - Défaillances et Structures conservées.
5. Vérifier qu’une entrée correspondante est ajoutée au Journal de bord.

### Démarrage d’une Expédition

1. Démarrer une Expédition.
2. Vérifier l’incrément du numéro d’Expédition.
3. Avec une Énergie strictement positive, vérifier l’accès direct à l’Identification du Lieu.
4. Refaire le test avec Énergie à 0.

Attendu avec Énergie à 0 :
- le panneau exige explicitement **Ajouter la Contrainte** ;
- aucun ajout silencieux ;
- l’Identification du Lieu reste bloquée tant que la Contrainte n’a pas été confirmée.

### Identification et Voyage

1. Cliquer **Identifier le Lieu**.
2. Vérifier un résultat d100 et le texte du Lieu.
3. À l’étape Voyage, saisir 0 puis lancer.
4. Refaire avec plusieurs Données disponibles et en dépenser une quantité choisie.

Attendu :
- les Données sont dépensées au clic ;
- chaque point ajoute +1 au résultat du d10 ;
- 1–4 → Défi ;
- 5–7 → aucune Rencontre ;
- 8–9 → Opportunité ;
- 10+ → Trouvaille.

Pour une Rencontre de Voyage, vérifier qu’un Défi échoué permet quand même de poursuivre vers la Rencontre de Lieu.

### Rencontre de Lieu

Tester plusieurs résultats, si nécessaire en dépensant des Données :

- 1–2 → Défi VM 3 ;
- 3–4 → Défi VM 2 ;
- 5 → Défi avec Désavantage ;
- 6 → Défi + Opportunité avec Désavantage ;
- 7–8 → Défi + Opportunité ;
- 9 → Défi + Opportunité + Trouvaille ;
- 10+ → Défi + Opportunité + Trouvaille + Aspect.

Vérifier que le panneau présente les éléments dans l’ordre **Défi → Opportunité → Trouvaille → Aspect**.

Pour un Défi :
1. vérifier les boutons de Capacités correspondant aux mots-clés ;
2. vérifier qu’une Capacité non proposée n’est pas utilisée par le workflow ;
3. pour chaque jet, utiliser **Enregistrer pour le Défi** dans le Chat ;
4. vérifier que le compteur de VM progresse et que les boutons de mots-clés restent disponibles tant que tous les jets requis n’ont pas été enregistrés ;
5. sur VM 2 ou VM 3, inclure un Échec parmi les jets enregistrés.

Attendu :
- tous les jets imposés par la VM doivent être enregistrés, même après un Échec ;
- une réussite partielle ne compte pas comme un Échec du Défi ;
- dès que la VM est satisfaite, le panneau détermine automatiquement « réussi » ou « échoué » et propose un bouton de validation ;
- en cas d’échec du Défi de Lieu, les Opportunités, Trouvailles et Aspects restants sont abandonnés et le panneau passe à l’Activité Secondaire.

Pour un Aspect, cliquer **Ajouter l’Aspect à la Mission** et vérifier l’incrément du compteur.

## 11. Activités Secondaires guidées

### Collecte de Données

1. Choisir **Collecte de Données**.
2. Vérifier que le seuil est Analyse + 4.
3. Résoudre le jet dans le Chat.
4. Sur réussite totale, cliquer **Appliquer le gain**.
5. Sur réussite partielle, cliquer **Appliquer le demi-gain**.
6. Sur échec, cliquer **Résoudre le Défi**.

Attendu :
- réussite totale → gain égal à Analyse ;
- réussite partielle → gain égal à la moitié d’Analyse, arrondie à l’inférieur ;
- échec → génération d’un Défi ;
- la ressource ne dépasse pas sa capacité maximale ;
- aucun bouton **Ajouter une Contrainte** ou **Ajouter une Défaillance** n’est proposé pour ce jet d’Activité Secondaire ;
- une Réussite partielle propose uniquement le demi-gain ;
- un Échec propose uniquement de résoudre le Défi prévu par l’Activité Secondaire.

### Recharge d’Énergie

Même procédure, avec :
- seuil Technologie + 4 ;
- gain basé sur Technologie.

### Collecte de Ressources

Même procédure, avec :
- seuil Adaptabilité + 4 ;
- gain basé sur Adaptabilité.

### Amélioration

1. Disposer d’au moins 10 Ressources.
2. Choisir une Amélioration non installée.
3. Cliquer **Installer**.

Attendu :
- coût de 10 Ressources ;
- l’Amélioration occupe un emplacement de Combinaison ;
- impossible si la Combinaison est pleine ;
- impossible d’installer un doublon ;
- les éventuels effets d’installation continuent de s’appliquer.

### Autoréparation

1. Disposer d’au moins une Contrainte et 5 Ressources.
2. Cliquer sur la Contrainte à réparer.

Attendu :
- coût de 5 Ressources ;
- retrait de la Contrainte choisie ;
- la Défaillance reste non réparable.

## 12. Accomplissement d’une Mission

1. Accumuler tous les Aspects requis.
2. Cliquer **Accomplir la Mission**.

Attendu :
- la Structure associée est ajoutée au PIA ;
- une Structure non répétable n’est pas dupliquée ;
- les Structures 19–21 augmentent leur rang jusqu’à 5 ;
- les Contraintes sont supprimées ;
- la progression de Mission active revient à zéro ;
- la Découverte suivante est révélée dans le Chat et le Journal ;
- les Défaillances restent présentes ;
- la Structure reste disponible pour la Mission suivante.

Pour les Missions 19–21, vérifier qu’elles peuvent être accomplies au maximum cinq fois.

## 13. Journal de bord automatisé

Effectuer une Expédition complète et vérifier que le Journal reçoit au minimum :

- démarrage de Mission ;
- démarrage d’Expédition ;
- Lieu identifié ;
- Voyage ;
- Rencontre de Lieu ;
- Aspect éventuel ;
- Activité Secondaire ;
- accomplissement de Mission et Découverte éventuelle.

Le texte doit rester librement éditable après génération.

## 14. Gains de Rencontre et conversion adaptative

### Trouvaille

1. Obtenir une Trouvaille de Voyage ou de Lieu.
2. Vérifier que le gain extrait du texte est affiché.
3. Cliquer **Appliquer le gain**.

Attendu :
- la bonne ressource augmente ;
- le maximum de capacité est respecté ;
- le bouton de continuation apparaît après application du gain.

### Opportunité

1. Obtenir une Opportunité.
2. Effectuer le jet d’Action via l’un des mots-clés.
3. En cas de succès, appliquer explicitement le gain.
4. Tester une entrée proposant plusieurs gains avec « et ».
5. Tester l’entrée proposant « 2 Données ou 3 Ressources ».

Attendu :
- les gains avec « et » sont appliqués ensemble ;
- les gains avec « ou » sont proposés comme deux boutons de choix ;
- **Passer sans gain** reste disponible.

### Unité de conversion adaptative

Sur une Opportunité ou une Trouvaille de **Lieu** :
1. disposer d’au moins 2 Ressources ;
2. utiliser le bouton +1 Donnée ou +1 Énergie ;
3. vérifier le coût de 2 Ressources ;
4. vérifier que la conversion n’est pas proposée pour une Rencontre de Voyage ;
5. vérifier qu’elle est désactivée si la capacité cible est pleine.

## Limites connues de la Phase 2A

- l’assistant de création reste reporté ;
- règles avancées et Extras toujours exclus.


## Régression v0.2.1

Ces contrôles sont prioritaires après les corrections issues du premier passage réel sous Foundry v14.

1. Créer un PIA nommé `TEST-PIA`, ouvrir sa fiche et vérifier que **Nom / Désignation** affiche immédiatement `TEST-PIA`.
2. Effectuer un jet d’Action et vérifier qu’aucun warning Firefox `URI invalide. Le chargement de la ressource média a échoué.` n’est émis au moment de la création du message de jet.
3. Ouvrir **Mission / Expédition**, sélectionner une Mission puis cliquer **Commencer la Mission**.
4. Vérifier qu’aucune erreur `can't access private field or method: object is not the right class` n’apparaît.
5. Vérifier immédiatement après le démarrage :
   - nom de Mission affiché ;
   - compteur d’Aspects correct ;
   - Énergie au maximum ;
   - Ressources et Données à 0 ;
   - Contraintes supprimées ;
   - Défaillances conservées.
6. Ouvrir le Journal et vérifier qu’une entrée de début de Mission a bien été ajoutée.
7. Continuer ensuite le plan à partir de **D — Expédition normale**.


## Régression v0.2.2

1. Au Voyage avec 3 Données disponibles, saisir/passer une valeur supérieure à 3.
   - le champ doit être immédiatement ramené à 3 ;
   - la valeur disponible est affichée à côté du champ ;
   - la logique serveur conserve également une borne de sécurité et signale tout écrêtage résiduel.
2. Répéter le même contrôle avant le jet de Rencontre de Lieu.
3. Lancer une Rencontre de Lieu et vérifier qu’un encart **Résultat global** reste visible pendant toute sa résolution :
   - résultat du d10 ;
   - Données dépensées ;
   - total ;
   - composition complète, par exemple **Défi (VM 2) + Opportunité** ou **Défi + Opportunité + Trouvaille + Aspect**.
4. Tester Collecte de Données, Recharge d’Énergie et Collecte de Ressources :
   - Réussite totale → seulement le gain complet ;
   - Réussite partielle → seulement le demi-gain ;
   - Échec → seulement **Résoudre le Défi** ;
   - aucune Contrainte/Défaillance générique et aucun Bouclier énergétique adaptatif ne doit être proposé sur ces trois jets.


## Régression v0.2.3 — warning média Firefox

1. Sous Firefox, ouvrir la console développeur.
2. Effectuer plusieurs jets d’Action normaux, avec Avantage et avec Désavantage.
3. Vérifier que le son de dés se joue normalement.
4. Vérifier l’absence du warning `URI invalide. Le chargement de la ressource média a échoué. game` au moment de la création du jet.


## Régression v0.2.4 — Journal par Mission

1. Créer un nouveau PIA et ouvrir son Journal.
   - une page générale **Journal de bord** existe pour les notes hors Mission ;
   - elle ne doit plus recevoir les événements automatiques d’une Mission.
2. Démarrer une première Mission.
   - une nouvelle page est créée immédiatement ;
   - son nom suit la forme **Mission NN — Nom de la Mission** ;
   - le démarrage de Mission est écrit dans cette page.
3. Effectuer une Expédition complète.
   - Lieu, Voyage, Rencontres, jets de Défi enregistrés, Aspect, Activité Secondaire et autres événements journalisés restent tous dans la page de cette Mission.
4. Accomplir la Mission.
   - l’accomplissement, la Structure et la Découverte éventuelle sont écrits dans la même page ;
   - la page est ensuite considérée comme close pour la journalisation automatique.
5. Démarrer une autre Mission.
   - une nouvelle page distincte est créée ;
   - aucune nouvelle entrée ne doit être ajoutée à la page précédente.
6. Pour une Mission répétable (19–21), accomplir puis redémarrer la même Mission.
   - le second passage crée une nouvelle page nommée avec **Passage 2** ;
   - les passages suivants créent chacun leur propre page.
7. Mettre à jour un monde existant possédant déjà l’ancienne page unique.
   - l’ancien contenu reste intact ;
   - les nouvelles Missions utilisent les nouvelles pages dédiées ;
   - aucune migration destructive de l’ancien texte n’est effectuée.


## Régression v0.2.5 — Révélation des Découvertes

1. Sur un PIA neuf, ouvrir l’onglet **Journal**.
   - afficher **0 révélée / 0 débloquée / 10** ;
   - aucun texte de Découverte ne doit être visible.
2. Ouvrir le Journal de bord.
   - une page dédiée **Découvertes** existe ;
   - les 10 entrées y apparaissent comme verrouillées.
3. Accomplir une Mission.
   - la Mission se clôt normalement et construit sa Structure ;
   - la Découverte 1 passe à l’état débloqué mais son texte n’est pas révélé ;
   - le message de fin de Mission propose **Révéler la Découverte** ;
   - la page de Mission indique seulement que la Découverte 1 a été débloquée ;
   - la page **Découvertes** affiche **Découverte 1 — À révéler** sans son contenu.
4. Ne pas révéler immédiatement et fermer/recharger le monde.
   - l’état 1 débloquée / 0 révélée persiste.
5. Révéler depuis l’onglet Journal de la fiche PIA.
   - le texte complet de la Découverte 1 apparaît dans le Chat ;
   - la page **Découvertes** est mise à jour avec son nom et son texte ;
   - le compteur devient 1 révélée / 1 débloquée.
6. Accomplir une deuxième Mission sans révéler immédiatement.
   - seule la Découverte 2 est disponible ;
   - la Découverte 1 reste visible ;
   - les Découvertes 3 à 10 restent verrouillées.
7. Tester le bouton de révélation directement depuis le message Chat de fin de Mission.
8. Accomplir plusieurs Missions sans révéler les Découvertes intermédiaires.
   - plusieurs entrées peuvent être débloquées ;
   - **Révéler** dévoile toujours l’entrée suivante dans l’ordre, jamais une entrée ultérieure.
9. Après la dixième Découverte :
   - toutes les entrées restent visibles ;
   - les Missions suivantes ne débloquent aucune Découverte supplémentaire ;
   - aucun onzième emplacement n’est créé.
10. Migration d’un monde v0.2.4 :
   - une Découverte déjà débloquée avant mise à jour doit être considérée comme déjà révélée ;
   - aucun texte déjà lu ne doit être remasqué ;
   - la page **Découvertes** est créée automatiquement sans modifier les anciennes pages de Mission.
