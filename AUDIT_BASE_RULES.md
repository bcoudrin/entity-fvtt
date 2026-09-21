# Audit des règles de base — Entité

Périmètre audité : règles de base, de la progression du jeu jusqu’aux Découvertes (pages imprimées 6 à 30).  
Les règles avancées (p.32+) et les Extras restent hors périmètre.

Statuts :
- **Conforme** : le comportement mécanique est pris en charge.
- **Manuel assumé** : le système laisse volontairement une décision ou une narration au joueur.
- **Partiel / à arbitrer** : le livre est ambigu ou le comportement numérique demande une décision avant automatisation.
- **Extension** : comportement Foundry utile, mais non imposé par le livre.

## Progression du jeu

| Domaine | Statut | Implémentation / constat |
| --- | --- | --- |
| Choix d’une Mission et nombre d’Aspects | Conforme | Catalogue de 21 Missions, objectif 4/3/2 Aspects selon la Mission, répétition limitée à 5 pour 19–21. |
| Boucle d’Expéditions | Conforme | Une Mission reste active jusqu’au nombre d’Aspects requis. |
| Exploration : Lieu → Voyage → Rencontre de Lieu | Conforme | d100 Lieu, d10 Voyage, d10 Rencontre de Lieu. |
| Ordre Exploration / Activité Secondaire | **Partiel / à arbitrer** | La p.7 indique que leur enchaînement est laissé à la discrétion du joueur, tandis que la p.8 présente l’Activité Secondaire « à la fin de l’Exploration ». Le système suit actuellement cette seconde présentation et impose Exploration puis Activité Secondaire. |
| Une seule Activité Secondaire par Expédition | Conforme | Le workflow se termine après l’activité choisie. |

## Création, Traits et jets d’Action

| Domaine | Statut | Implémentation / constat |
| --- | --- | --- |
| Traits 3/4/5 | Conforme | Assistant imposant chaque valeur exactement une fois. |
| Capacités 1/2/3 par Trait | Conforme | Assistant imposant chaque valeur exactement une fois dans chacun des trois groupes. |
| Jet d’Action 2d10 ≤ Trait + Capacité | Conforme | Seuil calculé et résultats déterminés dé par dé. |
| Réussite totale / partielle / échec | Conforme | 2 / 1 / 0 succès. |
| Contrainte sur réussite partielle | Conforme | Conséquence explicite dans le Chat ; désormais obligatoire avant de valider un jet de Rencontre. |
| Défaillance sur échec | Conforme | Conséquence explicite dans le Chat ; désormais obligatoire avant de valider un jet de Rencontre. |
| Avantage / Désavantage | Conforme | 3d10, dé le plus haut écarté avec Avantage, plus bas avec Désavantage ; opposition annulée. |

## Combinaison, dégâts et destruction

| Domaine | Statut | Implémentation / constat |
| --- | --- | --- |
| 20 emplacements partagés | Conforme | Améliorations + Contraintes + Défaillances. |
| Combinaison pleine | Conforme | Une Amélioration doit être choisie et défaussée avant l’ajout d’un dommage. |
| Contraintes temporaires | Conforme | Autoréparation 5 Ressources ; suppression à la fin d’une Mission. |
| Défaillances permanentes | Conforme | Impossible de les retirer avant destruction. |
| Destruction à 20 Contraintes/Défaillances | Conforme | État détruit persistant, actions bloquées, succession requise. |
| Perte des Améliorations / Aspects / Mission active | Conforme | Appliquée lors de la succession. |
| Structures conservées | Conforme | Conservées avec leurs rangs. |
| Journal et Découvertes historiques après destruction | **Extension** | Conservés comme archives de campagne. Ils ne donnent pas de bonus au successeur ; les bonus transférés restent ceux des Structures. |

## Améliorations, Énergie et ressources

| Domaine | Statut | Implémentation / constat |
| --- | --- | --- |
| 3 Améliorations de départ | Conforme | Installées automatiquement. |
| Une seule copie d’une Amélioration | Conforme | Doublons refusés. |
| Retrait volontaire à tout moment | Conforme | L’Amélioration peut être supprimée et doit être réinstallée ensuite. |
| Coût d’Énergie des effets | Conforme pour bonus, Avantage, relance, Bouclier et conversion | Les activations sont explicites et déduisent l’Énergie. |
| Réutilisation d’une Amélioration | Conforme | Une Amélioration n’est pas consommée ; elle peut être réactivée sur des actions ultérieures si l’Énergie le permet. Le livre ne précise pas explicitement que plusieurs activations du même module doivent se cumuler sur **un même** jet ; le système n’empile donc pas plusieurs armements pré-jet identiques. |
| Outils d’extraction / Algorithmes de Données : +1 à l’installation | **Partiel / à arbitrer** | Le bonus d’installation est automatisé. Les deux entrées portent cependant un coût « 2E », alors que le texte dit que le +1 survient « lors de l’installation ». Le livre ne précise pas clairement si ces 2E doivent être payées automatiquement lors de l’installation, si l’effet est optionnel, ou si le coût n’a pas vocation à s’appliquer à ce déclenchement unique. Actuellement le +1 est appliqué sans dépense d’Énergie. |
| Énergie au début d’une Mission | Conforme | Remplie à la capacité maximale actuelle (10 + Structures). |
| Manque de puissance à 0 Énergie | Conforme | Contrainte explicite au lancement d’une Expédition. |
| Ressources / Données à 0 au début d’une Mission | Conforme | Réinitialisées. |
| Capacités initiales 10 | Conforme | Énergie, Ressources, Données, augmentées par Structures répétables. |

## Structures

| Domaine | Statut | Implémentation / constat |
| --- | --- | --- |
| Construction par accomplissement de Mission | Conforme | Structure associée ajoutée à la fin. |
| Structures 1–9 : +1 Capacité | Conforme | Bonus permanent au seuil. |
| Structures 10–18 : relance d’un dé | Conforme | Une relance gratuite sur la Capacité concernée par jet. |
| Structures 19–21 répétables | Conforme | +1 capacité maximale par rang, maximum 5. |
| Pas de coût d’Énergie | Conforme | Effets passifs/gratuits. |

## Rencontres

| Domaine | Statut | Implémentation / constat |
| --- | --- | --- |
| Mots-clés limitant les Capacités | Conforme | Seules les Capacités de l’entrée sont proposées. |
| Défi obligatoire | Conforme | Impossible de poursuivre tant que la VM n’est pas résolue. |
| VM 2 / 3 | Conforme | Tous les jets requis sont enregistrés ; un seul échec fait échouer le Défi. |
| Conséquences individuelles des jets de VM | Conforme après v0.6 | Une réussite partielle/échec doit recevoir sa Contrainte/Défaillance avant enregistrement pour la VM. |
| Échec d’un Défi de Lieu | Conforme | Opportunités, Trouvailles et Aspect restants abandonnés. |
| Échec d’un Défi de Voyage | Conforme | L’Exploration continue vers le Lieu. |
| Opportunité | Conforme avec arbitrage éditorial explicite | La p.15 la présente comme facultative ; la p.16 dit qu’elle nécessite toujours un jet. Le système permet de **laisser l’Opportunité** ; si elle est tentée, le gain exige une réussite totale ou partielle. |
| Trouvaille | Conforme | Aucun jet d’Action ; gain explicite. |
| Désavantage (D) | Conforme | Appliqué automatiquement aux Rencontres concernées. |
| Dépense de Données avant Voyage / Lieu | Conforme | +1 par Donnée, dépense bornée au stock disponible. |
| Priorité Défi → Opportunité → Trouvaille → Aspect | Conforme | Queue résolue dans cet ordre. |

## Activités Secondaires

| Domaine | Statut | Implémentation / constat |
| --- | --- | --- |
| Collecte de Données | Conforme | Seuil Analyse + 4 ; gain complet / moitié ; échec → Défi. |
| Recharge d’Énergie | Conforme | Seuil Technologie + 4 ; gain complet / moitié ; échec → Défi. |
| Collecte de Ressources | Conforme | Seuil Adaptabilité + 4 ; gain complet / moitié ; échec → Défi. |
| Conséquence spéciale de ces trois jets | Conforme | Pas de Contrainte/Défaillance générique sur le jet d’Activité Secondaire ; l’échec déclenche le Défi prévu par cette règle spécifique. |
| Installation d’Amélioration | Conforme hors ambiguïté 2E ci-dessus | 10 Ressources, pas de jet, pas de doublon, emplacement libre requis. |
| Autoréparation | Conforme | 5 Ressources, retire une Contrainte. |

## Tables, Missions et Découvertes

| Domaine | Statut | Implémentation / constat |
| --- | --- | --- |
| 21 Missions | Conforme | Corpus complet. |
| 23 Améliorations (3 de départ incluses) | Conforme | Corpus complet. |
| 21 Structures | Conforme | Corpus complet. |
| Défis d100 | Conforme | Couverture 1–100 validée par tests. |
| Opportunités d100 | Conforme | Couverture 1–100 validée par tests. |
| Trouvailles d100 | Conforme | Couverture 1–100 validée par tests. |
| Lieux d100 | Conforme | Couverture 1–100 validée par tests. |
| 10 Découvertes dans l’ordre | Conforme | Une Mission accomplie débloque l’entrée suivante ; révélation volontaire et persistante. |

## Points restant à décider avant de déclarer les règles de base figées

1. **Ordre de l’Activité Secondaire** : conserver le workflow strict Exploration → Activité Secondaire, ou permettre de faire l’Activité Secondaire avant l’Exploration comme l’autorise la formulation de la p.7.
2. **Coût 2E des deux Améliorations à effet d’installation** : déterminer précisément comment appliquer le coût imprimé à un effet qui ne se déclenche qu’au moment de l’installation.
3. **Distribution du contenu** : le dépôt est public et contient actuellement des textes substantiels des tables et Découvertes du livre, alors que l’édition française est indiquée « tous droits réservés ». Pour une diffusion publique, il faudra soit obtenir l’autorisation adéquate, soit séparer/retirer ce contenu protégé. Cet audit n’ajoute aucun nouveau corpus de table.
