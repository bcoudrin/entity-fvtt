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

La répartition 3/4/5 et 1/2/3 est désormais contrôlée par l’assistant de création ; voir la régression v0.3.0.

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
- la Découverte suivante est débloquée sans révéler automatiquement son contenu ;
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


## Régression v0.3.0 — Assistant de création du PIA

1. Créer un nouvel Actor de type `pia`.
   - l’assistant **Création du PIA** s’ouvre automatiquement ;
   - la fiche peut exister derrière l’assistant mais **Mission / Expédition** est désactivé tant que la création n’est pas valide.
2. Étape **Identité** :
   - saisir une désignation ;
   - passer à l’étape suivante.
3. Étape **Traits** :
   - tenter 5 / 5 / 3 ;
   - **Suivant** doit refuser et expliquer qu’il faut utiliser exactement 3, 4 et 5 ;
   - choisir ensuite une permutation valide, par exemple Technologie 5 / Analyse 4 / Adaptabilité 3.
4. Étapes **Technologie**, **Analyse** et **Adaptabilité** :
   - tenter un doublon, par exemple 3 / 3 / 1 ;
   - l’étape doit refuser ;
   - attribuer ensuite exactement 1, 2 et 3 aux trois Capacités de chaque Trait.
5. Étape **Validation** :
   - vérifier le récapitulatif complet ;
   - vérifier l’annonce de l’état initial : 10 Énergies, 0 Ressource, 0 Donnée et les trois Améliorations de départ ;
   - cliquer **Initialiser le PIA**.
6. Après validation :
   - le nom choisi apparaît sur la fiche ;
   - les trois Traits correspondent à la permutation choisie ;
   - chaque groupe de Capacités contient exactement 1, 2 et 3 ;
   - Énergie = 10, Ressources = 0, Données = 0 ;
   - aucune Contrainte ni Défaillance ;
   - les trois Améliorations de départ sont présentes ;
   - **Mission / Expédition** est maintenant disponible.
7. Créer un autre PIA, fermer l’assistant avant validation puis tenter **Mission / Expédition**.
   - la Mission ne doit pas pouvoir démarrer ;
   - le système doit proposer de terminer la création.
8. Sur un PIA déjà configuré et ayant progressé en campagne :
   - cliquer **Création** ;
   - modifier uniquement une répartition valide ;
   - valider ;
   - vérifier que Ressources, Données, Contraintes/Défaillances, Structures, progression de Découvertes et Journal ne sont pas remis à zéro.
9. Migration d’un PIA créé avant v0.3.0 mais déjà configuré manuellement avec une répartition valide :
   - il est considéré comme prêt ;
   - aucune création forcée ne bloque sa campagne.


## Régression v0.4.0 — Destruction et succession du PIA

1. Utiliser un PIA configuré avec :
   - une Mission active ;
   - au moins 1 Aspect collecté ;
   - au moins une Structure construite ;
   - plusieurs Améliorations ;
   - éventuellement une Découverte déjà révélée.
2. Remplir progressivement la Combinaison avec des Contraintes et/ou Défaillances.
   - à 19 dommages, le PIA n’est pas détruit ;
   - si les 20 emplacements physiques sont occupés mais qu’il reste une Amélioration, l’ajout d’un dommage doit d’abord demander de défausser une Amélioration ;
   - la destruction ne survient que lorsque les 20 emplacements sont effectivement des Contraintes et/ou Défaillances.
3. Au vingtième dommage :
   - le Chat affiche **PIA DÉTRUIT** ;
   - la fiche affiche l’état **UNITÉ HORS SERVICE** ;
   - le panneau Mission / Expédition se ferme ;
   - aucun nouveau jet d’Action ne peut être lancé ;
   - aucune Contrainte ne peut être réparée pour annuler rétroactivement la destruction ;
   - la page de la Mission active reçoit une entrée **Destruction du PIA**.
4. Avant de créer le successeur, fermer/recharger le monde.
   - l’état détruit doit persister ;
   - la Mission ne doit pas pouvoir reprendre.
5. Cliquer **Créer le nouveau PIA**.
   - toutes les Améliorations de l’ancien PIA disparaissent ;
   - Contraintes et Défaillances sont remises à zéro ;
   - Mission active et Aspects reviennent à zéro ;
   - Ressources et Données reviennent à 0 ;
   - Traits et Capacités reviennent à 0 ;
   - les Structures sont toujours présentes avec leurs rangs ;
   - l’assistant de création s’ouvre ;
   - si l’assistant est fermé, le PIA reste hors service et Mission / Expédition reste bloqué.
6. Terminer l’assistant avec une nouvelle désignation et une répartition valide.
   - l’état détruit disparaît ;
   - les trois Améliorations de départ sont installées ;
   - le nouveau nom et les nouvelles caractéristiques sont appliqués ;
   - Mission / Expédition redevient accessible.
7. Vérifier la continuité :
   - Structures et rangs inchangés ;
   - Journal de campagne conservé ;
   - anciennes pages de Mission conservées ;
   - Découvertes déjà révélées toujours consultables ;
   - une entrée **Nouveau PIA opérationnel** est ajoutée au Journal général.
8. Commencer une nouvelle Mission.
   - Énergie remplie à la capacité maximale courante, y compris les bonus de Structures ;
   - aucune ancienne Contrainte, Défaillance ou progression de Mission ne réapparaît.


## Régression v0.4.1 — Défausse d’Amélioration sur Combinaison pleine

1. Remplir les 20 emplacements de la Combinaison avec un mélange de dommages et d’au moins une Amélioration.
2. Ajouter une Contrainte puis, dans un second test, une Défaillance.
3. Vérifier que le dialogue **Combinaison saturée** s’ouvre sans erreur JavaScript.
4. Vérifier qu’il liste toutes les Améliorations encore installées.
5. Annuler le dialogue.
   - aucune Amélioration ne doit être supprimée ;
   - aucun dommage supplémentaire ne doit être ajouté.
6. Refaire l’opération et sélectionner une Amélioration.
   - l’Amélioration choisie est supprimée ;
   - la Contrainte ou Défaillance demandée est ajoutée immédiatement après ;
   - le compteur de la Combinaison reste à 20.
7. Répéter jusqu’à ce que les 20 emplacements soient uniquement des Contraintes/Défaillances.
   - la destruction du PIA doit alors se déclencher normalement.


## Régression v0.5.0 — Résolution complète des Opportunités

Les règles de base présentent une petite tension éditoriale : la p.15 décrit le jet d’Action d’une Opportunité comme facultatif, tandis que la p.16 et les entrées de la table donnent le gain « en cas de succès ». Le système conserve donc le choix **Laisser l’Opportunité**, mais dès qu’elle est tentée, son gain est strictement lié au résultat du jet.

1. Obtenir une Opportunité de Voyage ou de Lieu.
   - les gains éventuels peuvent être affichés comme information ;
   - aucun bouton permettant de les appliquer ne doit être utilisable avant résolution du jet.
2. Cliquer une Capacité proposée et obtenir une **Réussite totale**.
   - le Chat propose **Valider pour l’Opportunité** ;
   - après validation, le panneau indique l’Opportunité réussie ;
   - le gain devient disponible ;
   - appliquer le gain puis continuer.
3. Obtenir une **Réussite partielle**.
   - le Chat demande d’abord de résoudre la Contrainte ;
   - tester une fois avec **Ajouter une Contrainte**, puis une autre fois avec le Bouclier énergétique adaptatif ;
   - **Valider pour l’Opportunité** ne devient disponible qu’après résolution de cette conséquence ;
   - le gain devient ensuite disponible.
4. Obtenir un **Échec**.
   - ajouter d’abord la Défaillance ;
   - valider ensuite pour l’Opportunité ;
   - le panneau affiche **Opportunité échouée** ;
   - aucun bouton d’application du gain ne doit apparaître ;
   - continuer après l’échec.
5. Tester une Opportunité marquée **(D)**.
   - le jet lié doit automatiquement utiliser le Désavantage ;
   - le reste du cycle est identique.
6. Tester **Laisser l’Opportunité** sans effectuer de jet.
   - aucun gain n’est appliqué ;
   - l’Expédition continue ;
   - le Journal note que l’Opportunité a été ignorée.
7. Tester un gain avec « et » puis un gain avec « ou ».
   - « et » applique tous les gains après succès ;
   - « ou » ne permet qu’un choix après succès.
8. Recharger le monde après avoir validé le jet mais avant d’appliquer le gain.
   - l’état **Opportunité réussie** persiste ;
   - le gain reste disponible une seule fois.


## Régression v0.6.0 — Consolidation des règles de base

### Conséquences avant validation d’un Défi

1. Obtenir un Défi et effectuer un jet donnant une **Réussite partielle**.
   - le Chat propose d’abord **Ajouter une Contrainte** ou le Bouclier énergétique ;
   - **Enregistrer pour le Défi** ne doit pas être disponible avant résolution de cette conséquence.
2. Ajouter la Contrainte.
   - **Enregistrer pour le Défi** devient disponible ;
   - enregistrer le jet et vérifier la progression de VM.
3. Refaire avec le Bouclier.
   - après utilisation du Bouclier, le jet devient enregistrable sans Contrainte.
4. Obtenir un **Échec**.
   - **Enregistrer pour le Défi** reste bloqué tant que la Défaillance n’est pas ajoutée.
5. Tester sur un Défi VM 2 ou VM 3 en mélangeant réussite totale, partielle et échec.
   - chaque jet impose sa propre conséquence avant enregistrement ;
   - tous les jets de VM restent requis.

### Effets d’Amélioration armés entre Missions

1. Pendant une Mission, armer une Amélioration pré-jet (+1 Capacité ou Avantage) sans effectuer le jet.
2. Accomplir la Mission ou quitter son workflow, puis commencer une nouvelle Mission.
3. Vérifier que l’effet armé précédent n’est plus présent.
4. Vérifier que l’Énergie de la nouvelle Mission est bien remplie normalement et qu’aucun effet payé dans l’ancienne Mission ne devient un bonus gratuit.

### Audit

Relire [AUDIT_BASE_RULES.md](AUDIT_BASE_RULES.md) lors de toute modification des règles de base. Les arbitrages mécaniques de base sont désormais figés.


## Régression v0.7.0 — Effets d’installation 2E et premier Oracle avancé

### Outils d’extraction avancés / Algorithmes d’exploration de Données

1. Préparer une Activité Secondaire **Améliorations** avec au moins 10 Ressources et au moins 2 Énergies.
2. Installer **Outils d’extraction avancés (2E)** avec exactement 10 Ressources.
   - l’installation réussit ;
   - les 10 Ressources sont payées puis le bonus d’installation rend 1 Ressource : stock final = **1 Ressource** ;
   - 2 Énergies sont dépensées ;
   - le Journal indique le coût d’installation et l’effet déclenché.
3. Refaire avec **Algorithmes d’exploration de Données (2E)**.
   - 10 Ressources sont payées ;
   - 2 Énergies sont dépensées ;
   - +1 Donnée est obtenue, sans dépasser la capacité maximale.
4. Tenter l’une de ces installations avec 10 Ressources mais seulement 0 ou 1 Énergie.
   - l’installation est refusée ;
   - aucune Ressource n’est dépensée ;
   - aucune Amélioration n’est ajoutée.
5. Défausser puis réinstaller le même module plus tard.
   - l’effet d’installation et son coût 2E se déclenchent à nouveau.
6. Vérifier qu’une installation directe par manipulation MJ d’un de ces Items applique aussi le coût 2E et le bonus une seule fois.

### Demander à l’Oracle

1. Depuis la fiche PIA, cliquer **Oracle**.
2. Tenter **Consulter l’Oracle** sans question.
   - le système refuse et demande une question oui/non.
3. Poser une question puis lancer plusieurs fois.
   - 1 → **Non, et aussi…**
   - 2 → **Non, mais…**
   - 3–5 → **Non**
   - 6–8 → **Oui**
   - 9 → **Oui, mais…**
   - 10 → **Oui, et aussi…**
4. Vérifier que chaque résultat apparaît dans le Chat avec le d10.
5. Pendant une Mission, vérifier que la question et la réponse sont ajoutées à la page de cette Mission.
6. Hors Mission, vérifier que l’entrée va dans la page générale du Journal.
7. Cliquer plusieurs fois avec la même question pour confirmer qu’une relance reste libre et ne modifie aucun état mécanique du PIA.


## Régression v0.8.0 — Exploration avancée

1. Démarrer une Expédition et identifier son Lieu.
   - sous le résultat du Lieu, un encart **Règles Avancées — Exploration** apparaît ;
   - cliquer **Enrichir l’Exploration** ouvre un panneau séparé ;
   - avant identification du Lieu, le scanner de Structure doit rester indisponible.
2. Cliquer **Scanner le Lieu** plusieurs fois au cours de tests séparés.
   - d10 1–5 → le Lieu est en terrain ouvert ;
   - d10 6–10 → le Lieu se trouve dans une Structure et un d100 détermine automatiquement son rôle.
3. Après un résultat terrain ouvert :
   - **Caractéristique** utilise la table des Caractéristiques de Terrain ;
   - le résultat apparaît dans le panneau, le Chat et la page Journal de la Mission.
4. Après un résultat Structure :
   - **Caractéristique** utilise la table des Caractéristiques de Structure ;
   - le rôle de la Structure tiré lors du scan reste visible ;
   - le résultat de caractéristique est également journalisé.
5. Tester **Descripteur**, **Ciel** et **À distance**.
   - chaque bouton peut être relancé sans limite ;
   - seul le dernier résultat reste affiché dans le panneau ;
   - chaque tirage effectué reste enregistré dans le Journal.
6. Tester **Forme de vie**.
   - quatre d100 distincts sont utilisés ;
   - le résultat comporte Forme, Trait, Caractéristique et Comportement ;
   - les quatre résultats apparaissent ensemble dans le Chat et le Journal.
7. Fermer puis rouvrir le panneau pendant la même Expédition.
   - le scan de Structure et les derniers résultats doivent être conservés.
8. Recharger le monde pendant la même Expédition.
   - les résultats persistants doivent revenir.
9. Commencer une nouvelle Expédition.
   - le contexte d’Exploration avancée précédent doit être remis à zéro ;
   - les anciennes entrées restent néanmoins dans le Journal de la Mission.
10. Vérifier qu’aucun tirage d’Oracle avancé ne modifie Énergie, Ressources, Données, Contraintes, Défaillances, Aspects ou résolution de Rencontre.


## Régression v0.9.0 — Activités Secondaires avancées

1. Arriver à l’étape **Activité Secondaire** d’une Expédition.
   - un encart facultatif **Règles Avancées — préparer le terrain** apparaît ;
   - les trois boutons Données / Énergie / Ressources ouvrent le panneau avancé sans lancer le jet mécanique.
2. Pour chacune des trois activités, tester **Lieu actuel**.
   - le Lieu identifié pendant l’Exploration est réutilisé ;
   - un d10 détermine Structure sur 6+ ;
   - la Caractéristique de Terrain ou de Structure appropriée est tirée automatiquement ;
   - le résultat apparaît dans le Chat et le Journal.
3. Tester **Nouveau Lieu**.
   - un nouveau Lieu d100 est tiré uniquement pour la visualisation de l’Activité Secondaire ;
   - le Lieu mécanique de l’Exploration n’est pas remplacé ;
   - Structure et Caractéristique sont ensuite déterminées de la même manière.
4. **Collecte de Données — Réussite totale** :
   - appliquer le gain mécanique ;
   - le Chat propose **Enrichir le résultat avec les Oracles** ;
   - le panneau propose Informations, Thèmes, Actions, Objets, Anomalies et Forme de Vie ;
   - chaque tirage est librement relançable et journalisé.
5. **Collecte de Données — Réussite partielle** :
   - le demi-gain reste inchangé ;
   - le panneau propose Incident, Caractéristique du lieu, Objets, Anomalies, Forme de Vie et Actions.
6. **Collecte de Ressources — Réussite totale** :
   - le panneau propose Matériaux, Objets et Actions.
7. **Collecte de Ressources — Réussite partielle** :
   - le panneau propose Incident + Caractéristique du lieu, avec Objets/Anomalies/Forme de Vie/Actions disponibles comme développements.
8. **Recharge d’Énergie — Réussite totale** :
   - le panneau propose Matériaux, Objets, Forme de Vie, Descripteurs et Actions.
9. **Recharge d’Énergie — Réussite partielle** :
   - le panneau propose Incident + Caractéristique du lieu, avec Objets/Anomalies/Forme de Vie/Actions disponibles.
10. Obtenir un **Échec** sur chacune des trois activités.
    - le système continue à proposer uniquement **Résoudre le Défi** comme conséquence mécanique ;
    - le panneau avancé, s’il est ouvert, indique que l’échec est traité par le Défi et ne propose pas de générateur de résultat.
11. Fermer/recharger Foundry pendant l’Activité Secondaire.
    - le terrain préparé, le type d’activité, le dernier résultat mécanique et les derniers Oracles restent persistants pour l’Expédition en cours.
12. Démarrer une nouvelle Expédition.
    - l’état avancé de l’Activité Secondaire précédente est remis à zéro ;
    - les anciennes entrées restent dans le Journal.
13. Vérifier qu’aucun Oracle avancé ne modifie le montant du gain, l’Énergie hors gain normal, les Ressources, les Données, les Contraintes, les Défaillances ou les Aspects.


## Régression v0.10.0 — Rencontres personnalisées

1. Obtenir un **Défi** de Voyage ou de Lieu avant d’effectuer le moindre jet d’Action.
   - le panneau affiche **Règles Avancées — Rencontre personnalisée** ;
   - cliquer **Personnaliser** ouvre le générateur.
2. Cliquer **Générer les éléments obligatoires** pour un Défi.
   - une Anomalie d100 est générée ;
   - trois d10 de mots-clés sont générés ;
   - 1–9 correspondent aux neuf Capacités dans l’ordre prévu par le livre ;
   - un résultat 10 affiche un choix manuel de Capacité.
3. Tester des doublons de mots-clés.
   - après application, un même mot-clé ne doit apparaître qu’une fois ;
   - le Défi possède donc naturellement entre 1 et 3 choix de Capacité.
4. Ajouter plusieurs enrichissements facultatifs : Incident, Terrain, Structure, Objet, Thème, Descripteur, Action, Forme de Vie.
   - chaque tirage s’ajoute au brouillon ;
   - un résultat facultatif peut être retiré individuellement ;
   - relancer l’Anomalie ou les mots-clés remplace uniquement ces éléments obligatoires.
5. Appliquer le Défi personnalisé.
   - l’entrée courante est marquée **Rencontre personnalisée** ;
   - la VM originale est inchangée ;
   - le Désavantage (D) original est inchangé ;
   - le contexte Voyage/Lieu est inchangé ;
   - seuls les mots-clés générés sont proposés pour les jets d’Action ;
   - la résolution VM et les conséquences fonctionnent comme pour un Défi de base.
6. Obtenir une **Trouvaille** et la personnaliser.
   - un seul d10 de Trouvaille est requis ;
   - vérifier les bornes 1, 7, 8, 9 et 10 sur plusieurs essais ;
   - appliquer la Rencontre puis vérifier que le bouton de gain utilise exactement les Ressources/Données/Énergie générées.
7. Obtenir une **Opportunité** et la personnaliser.
   - le générateur crée Anomalie + 3 mots-clés + **2 jets de Trouvaille** ;
   - les deux gains sont cumulés par type de ressource ;
   - la Rencontre reste facultative ;
   - en cas de réussite totale ou partielle, le gain cumulé devient disponible ;
   - en cas d’échec, aucun gain n’est obtenu.
8. Pour un résultat 10 sur le tableau des mots-clés :
   - l’application reste bloquée tant qu’aucune Capacité n’a été choisie ;
   - après choix, l’application devient possible si tous les autres éléments obligatoires sont présents.
9. Fermer le générateur avant application puis le rouvrir.
   - le brouillon doit être conservé tant que la même Rencontre reste active.
10. Commencer à résoudre une Rencontre puis tenter de la personnaliser.
    - après un jet de Défi enregistré, une Opportunité résolue ou une Trouvaille encaissée, le remplacement est refusé.
11. Vérifier le Journal.
    - l’application d’une Rencontre personnalisée ajoute une entrée avec les Oracles retenus, les mots-clés, le gain potentiel et VM/D le cas échéant.
12. Vérifier qu’une Rencontre personnalisée n’altère pas la composition globale de la Rencontre de Lieu : Défi → Opportunité → Trouvaille → Aspect reste inchangé.


## Régression v0.11.0 — Interpréter les Actions et les Résultats

1. Effectuer un jet avec chacune des neuf Capacités.
   - chaque carte de Chat affiche **Interpréter le jet** ;
   - le panneau reprend la Capacité et le résultat courant ;
   - un court guide narratif adapté à la Capacité est affiché sans limiter les actions autorisées.
2. Obtenir une **Réussite totale**.
   - l’assistant décrit un objectif pleinement atteint ;
   - aucune Contrainte ni Défaillance n’est proposée.
3. Obtenir une **Réussite partielle** hors Activité Secondaire.
   - l’assistant rappelle qu’une Contrainte est temporaire et réparable ;
   - des pistes distinctes pour la Combinaison et le noyau d’IA sont visibles ;
   - saisir un libellé personnalisé puis confirmer ;
   - la Contrainte apparaît sous ce libellé exact sur la fiche ;
   - fermer le panneau sans confirmer ne doit rien ajouter.
4. Obtenir un **Échec** hors Activité Secondaire.
   - l’assistant rappelle le caractère permanent de la Défaillance ;
   - saisir un libellé personnalisé et confirmer ;
   - la Défaillance apparaît sous ce libellé exact ;
   - le bouton générique du Chat continue aussi de fonctionner et conserve son libellé automatique.
5. Tester une **Activité Secondaire**.
   - réussite partielle : le panneau indique demi-gain et absence de Contrainte générique ;
   - échec : le panneau indique que le résultat déclenche un Défi, sans Défaillance générique ;
   - aucun bouton de conséquence narrative mécanique ne doit apparaître dans ces deux cas.
6. Tester **Action + Thème**.
   - le bouton principal génère un d100 Action et un d100 Thème ;
   - les boutons séparés permettent de relancer uniquement l’un des deux ;
   - fermer puis rouvrir le panneau du même message conserve les derniers résultats.
7. Effectuer une relance du jet d’Action après avoir généré Action + Thème.
   - le panneau relu depuis la carte doit afficher le nouveau résultat mécanique ;
   - les Oracles Action/Thème restent disponibles comme inspiration.
8. Ajouter une note dans **Journal de bord**.
   - la note contient le nom du jet et son résultat ;
   - les Oracles Action/Thème présents sont inclus ;
   - pendant une Mission, l’entrée va dans la page de cette Mission ;
   - hors Mission, elle va dans la page générale.
9. Tenter d’ajouter au Journal sans note et sans Oracle.
   - l’opération est refusée avec une notification ;
   - aucune entrée vide n’est créée.
10. Vérifier qu’ouvrir l’assistant, tirer les Oracles ou écrire une note ne modifie jamais le résultat du jet, l’Énergie, les Ressources, les Données, les Aspects ou la progression de Rencontre.


## Jalon v0.12.0 — Clôture des Règles Avancées

Ce jalon n’ajoute volontairement pas de nouvelle mécanique : il vérifie qu’aucune section p.32–63 n’a été oubliée.

1. Relire [AUDIT_ADVANCED_RULES.md](AUDIT_ADVANCED_RULES.md).
2. Vérifier que les outils suivants sont accessibles et fonctionnels :
   - Demander à l’Oracle ;
   - Exploration avancée ;
   - Activités Secondaires avancées ;
   - Rencontres personnalisées ;
   - Interpréter le jet / Action + Thème ;
   - Journal de bord et pages de Mission.
3. Vérifier la présence fonctionnelle de toutes les familles de tables avancées :
   - Formes de Vie Extraterrestre ;
   - Caractéristiques de Terrain ;
   - Caractéristiques de Structure ;
   - Anomalies ;
   - Informations ;
   - Ciel ;
   - Distance ;
   - Incidents ;
   - Descripteurs ;
   - Structures ;
   - Actions ;
   - Thèmes ;
   - Objets ;
   - Matériaux.
4. Confirmer qu’aucune fonctionnalité des **Extras p.65+** n’a été ajoutée implicitement à ce jalon.
