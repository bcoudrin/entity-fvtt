# QA globale — Entité Foundry VTT v14

Ce document distingue les contrôles automatisables de la validation runtime qui doit être faite dans Foundry.

## Couverture fonctionnelle

- Règles de base p.6–30 : couvertes et auditées dans `AUDIT_BASE_RULES.md`.
- Règles Avancées p.32–63 : couvertes et auditées dans `AUDIT_ADVANCED_RULES.md`.
- Extras p.65–71 : Missions, Structures, Améliorations, Carcasses/Épaves et Sons/Lumières intégrés.
- Feuille de personnage : passe visuelle effectuée à partir de la feuille imprimée.
- Foundry ciblé : v14.

## Contrôles automatisés

La validation CI vérifie notamment :

- intégrité et couverture des tables d100 ;
- quantités de Missions, Structures, Améliorations et Découvertes ;
- distributions de création 3/4/5 et 1/2/3 ;
- règles pures de destruction ;
- règles de Rencontre et Opportunité ;
- Oracles avancés ;
- Missions et contenus Extras ;
- relations Mission → Structure ;
- tables Carcasses/Épaves et Sons/Lumières.

## Correction issue de la QA

Le livre autorise explicitement l’activation répétée d’une même Amélioration tant que l’Énergie est disponible. Les effets pré-jet n’étaient jusque-là armables qu’une seule fois. La fiche et le moteur autorisent maintenant plusieurs activations du même module ; les bonus numériques se cumulent et le nombre d’activations armées est visible.

L’Avantage reste un état unique du jet : payer plusieurs activations d’une source d’Avantage ne crée pas de dé supplémentaire au-delà du fonctionnement normal de l’Avantage.

## Validation runtime ciblée restante

À vérifier dans une vraie instance Foundry v14 :

1. rendu de la fiche à sa taille par défaut 1040×860 ;
2. redimensionnement vers environ 700 px de large ;
3. édition des scores dans losanges et cercles ;
4. jauges R/E/D avec capacités 10 à 15 ;
5. vingt emplacements de Combinaison en deux colonnes de dix ;
6. état détruit et création de successeur ;
7. activations répétées d’une Amélioration +1 ;
8. coexistence de deux relances de Structures ;
9. changement d’onglets, Journal et contrôle Mission après rechargement du monde.

## Point de règle à confirmer avant « 1.0 »

Le texte de destruction précise que **seules les Structures** sont transférées dans la progression du nouveau personnage. Le système conserve actuellement le Journal de campagne ainsi que certains marqueurs de campagne (dont la progression des Découvertes et l’historique d’accomplissement des Missions) afin d’éviter de perdre l’historique et de reconstruire involontairement les mêmes Structures.

Le Journal peut raisonnablement rester une archive sans effet sur le personnage, mais la conservation des compteurs de Découvertes est une interprétation de campagne et mérite une décision explicite avant de figer une version 1.0. Aucune modification supplémentaire n’est faite silencieusement sur ce point.
