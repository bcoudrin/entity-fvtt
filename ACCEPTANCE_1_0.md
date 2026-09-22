# Recette finale avant 1.0

Ce document est le plan recommandé pour la validation manuelle finale dans Foundry VTT v14.

`TESTING.md` reste l’historique détaillé des régressions par version. Il n’est pas nécessaire de rejouer intégralement toutes ses sections si les versions précédentes ont déjà été testées. Pour valider la branche actuelle, exécuter cette recette finale, puis utiliser `TESTING.md` uniquement pour approfondir un point qui échoue.

## A. Installation et migration

1. Mettre à jour un monde existant vers la dernière version.
2. Ouvrir la console navigateur et vérifier l’absence d’erreur bloquante au chargement.
3. Vérifier la présence du contenu de base, avancé et Extra sans doublons.
4. Recharger une seconde fois le monde et vérifier qu’aucun contenu n’est recréé en double.

## B. Fiche PIA

1. Ouvrir un PIA existant à la taille par défaut.
2. Vérifier l’ordre visuel :
   - Technologie : Robotique / Ingénierie / Informatique ;
   - Analyse : Physique / Biologie / Chimie ;
   - Adaptabilité : Survie / Navigation / Communication.
3. Vérifier les scores dans losanges / cercles et les seuils calculés.
4. Vérifier les jauges R / E / D, puis une capacité maximale augmentée par Structure.
5. Vérifier l’onglet Combinaison : 20 emplacements, deux colonnes de dix.
6. Réduire la fenêtre sous ~900 px puis ~700 px et vérifier que les contrôles restent utilisables.

## C. Création et jet d’Action

1. Créer un nouveau PIA.
2. Vérifier l’assistant 3/4/5 puis 1/2/3.
3. Vérifier les 3 Améliorations de départ et les valeurs initiales 10E / 0R / 0D.
4. Faire un jet normal, un jet avec Avantage et un avec Désavantage.
5. Vérifier : réussite totale, réussite partielle, échec.
6. Sur réussite partielle, appliquer explicitement une Contrainte.
7. Sur échec, appliquer explicitement une Défaillance.

## D. Améliorations et Structures

1. Tester une Amélioration +1.
2. L’activer deux fois avant le même jet : deux coûts d’Énergie doivent être payés et les deux bonus doivent s’additionner.
3. Tester une Amélioration donnant Avantage.
4. Tester l’Outil multiple intégré sur un résultat de jet.
5. Tester le Bouclier énergétique adaptatif sur une réussite partielle.
6. Tester une Structure +1.
7. Tester une Structure de relance.
8. Avec deux Structures de relance pour la même Capacité, vérifier deux relances distinctes.

## E. Mission et Expédition

1. Démarrer une Mission.
2. Vérifier : Énergie au maximum, Ressources 0, Données 0, Contraintes supprimées, Défaillances conservées.
3. Démarrer une Expédition.
4. Identifier un Lieu.
5. Résoudre le Voyage avec puis sans dépense de Données.
6. Résoudre une Rencontre de Lieu complète en respectant Défi → Opportunité → Trouvaille → Aspect.
7. Vérifier qu’un Défi de Voyage échoué permet de continuer.
8. Vérifier qu’un Défi de Lieu échoué abandonne les éléments restants du Lieu.

## F. Activité Secondaire

Tester au moins une fois chacune :

1. Collecte de Données ;
2. Recharge d’Énergie ;
3. Collecte de Ressources ;
4. Amélioration pour 10 Ressources ;
5. Autoréparation pour 5 Ressources.

Pour les trois activités avec jet, vérifier que réussite partielle = demi-gain sans Contrainte générique, et échec = Défi sans Défaillance générique.

## G. Règles Avancées et Extras

1. Demander à l’Oracle.
2. Ouvrir Exploration avancée et tirer au moins : Structure/Terrain, Descripteur et Forme de Vie.
3. Tester une Activité Secondaire avancée.
4. Personnaliser une Rencontre.
5. Ouvrir Interpréter le jet et tirer Action + Thème.
6. Tester une Mission Extra et vérifier la Structure Extra gagnée.
7. Installer une Amélioration Extra.
8. Tirer Carcasses et épaves puis Sons et lumières.

## H. Journal et Découvertes

1. Vérifier qu’une Mission possède sa propre page de Journal.
2. Vérifier qu’une Mission accomplie débloque la Découverte suivante.
3. Révéler explicitement la Découverte.
4. Vérifier qu’elle reste visible après rechargement.

## I. Destruction et succession

1. Monter progressivement à 19 Contraintes/Défaillances : le PIA ne doit pas être détruit.
2. Ajouter le 20e dommage : le PIA doit être détruit.
3. Vérifier que les actions de jeu sont bloquées.
4. Créer le successeur.
5. Vérifier :
   - Améliorations de l’ancien PIA perdues ;
   - Contraintes et Défaillances remises à zéro ;
   - Mission et Aspects en cours perdus ;
   - Traits/Capacités recréés ;
   - trois Améliorations de départ restaurées ;
   - Structures conservées ;
   - **Journal conservé** ;
   - **Découvertes débloquées/révélées conservées** ;
   - historique d’accomplissement des Missions conservé.

## J. Smoke test final

Après toutes les vérifications ci-dessus, recharger Foundry puis exécuter un parcours court sans erreur console :

`PIA → Mission → Expédition → Lieu → Rencontre → Activité Secondaire → fin d’Expédition → Mission accomplie → Découverte → Journal`

Si cette recette passe, la version peut être considérée comme candidate 1.0. Les sections historiques de `TESTING.md` ne doivent être reprises que pour diagnostiquer un comportement précis ou revalider une ancienne correction sensible.