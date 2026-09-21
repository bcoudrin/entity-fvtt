# Audit des Règles Avancées — Entité

Périmètre audité : pages imprimées **32 à 63**, depuis **Tables d’Oracle** jusqu’à la fin des tables avancées.  
Les **Extras** commencent page 65 et restent hors périmètre.

Statuts :
- **Conforme** : le système fournit l’outil ou le workflow décrit par le livre.
- **Conforme — narratif** : la section ne crée pas de mécanique supplémentaire ; Foundry fournit l’espace nécessaire sans imposer d’automatisation.
- **Couvert par table** : le corpus d100 correspondant est intégré et sa couverture 1–100 est vérifiée.
- **Choix de conception** : le système fixe une ergonomie sans modifier la règle.

## Tables d’Oracle — principes généraux

| Domaine | Statut | Implémentation |
| --- | --- | --- |
| Oracles comme outils d’inspiration | Conforme | Les panneaux avancés n’altèrent aucun état mécanique sauf lorsqu’une règle du livre le demande explicitement. |
| Ignorer / relancer un résultat | Conforme | Les tables avancées peuvent être relancées librement ; les résultats facultatifs ne sont jamais imposés. |
| Demander à l’Oracle | Conforme | Question oui/non, 1d10, six nuances de réponse, Chat + Journal. |
| Action + Thème | Conforme | Génération conjointe ou relance séparée depuis l’assistant d’interprétation et les générateurs qui les utilisent. |

## Exploration avancée — p.32–33

| Domaine | Statut | Implémentation |
| --- | --- | --- |
| Déterminer si le Lieu est dans une Structure | Conforme | 1d10 ; 6+ = Structure. |
| Type de Structure | Conforme | d100 automatique si le test indique une Structure. |
| Caractéristique de Terrain / Structure | Conforme | La table appropriée est choisie selon le contexte. |
| Descripteur | Conforme | Oracle facultatif et relançable. |
| Ciel | Conforme | Oracle facultatif et relançable. |
| À distance | Conforme | Oracle facultatif et relançable. |
| Forme de Vie Extraterrestre | Conforme | 4 d100 indépendants : Forme, Trait, Caractéristique, Comportement. |
| Persistance | Choix de conception | Les derniers résultats restent disponibles pendant l’Expédition puis sont remis à zéro à l’Expédition suivante ; l’historique reste dans le Journal. |

## Activités Secondaires avancées — p.34–36

| Domaine | Statut | Implémentation |
| --- | --- | --- |
| Préparer le terrain de l’activité | Conforme | Lieu courant ou nouveau Lieu narratif, Structure éventuelle, Caractéristique de contexte. |
| Collecte de Données — réussite totale | Conforme | Informations, Thèmes, Actions et enrichissements suggérés. |
| Collecte de Données — réussite partielle | Conforme | Incident + complication de contexte, avec enrichissements facultatifs. |
| Collecte de Ressources — réussite totale | Conforme | Matériaux / Objets / Actions. |
| Collecte de Ressources — réussite partielle | Conforme | Incident + complication de contexte, avec enrichissements facultatifs. |
| Recharge d’Énergie — réussite totale | Conforme | Matériaux / Objets / Forme de Vie / Descripteur / Actions. |
| Recharge d’Énergie — réussite partielle | Conforme | Incident + complication de contexte, avec enrichissements facultatifs. |
| Échec | Conforme | Aucun Oracle ne remplace la conséquence mécanique : le Défi prévu par les règles de base reste déclenché. |
| Neutralité mécanique des Oracles | Conforme | Les tables narratives ne modifient pas les gains. |

## Rencontres personnalisées — p.37–39

| Domaine | Statut | Implémentation |
| --- | --- | --- |
| Remplacer un Défi actif | Conforme | Anomalie + 3d10 de mots-clés ; le résultat 10 demande un choix explicite. |
| Doublons de mots-clés | Conforme | Un doublon ne crée pas une Capacité supplémentaire ; la liste finale est dédupliquée. |
| Remplacer une Trouvaille active | Conforme | 1d10 de gain selon la table avancée. |
| Remplacer une Opportunité active | Conforme | Squelette de Défi + deux jets de Trouvaille, gains cumulés. |
| Enrichissements facultatifs | Conforme | Incidents, Actions, Thèmes, Objets, Informations, Matériaux, Descripteurs, Terrain/Structure et Formes de Vie. |
| VM et Désavantage | Conforme | Conservés depuis la Rencontre d’origine. |
| Contexte Voyage / Lieu | Conforme | Conservé. |
| Ordre de résolution | Conforme | La personnalisation ne modifie pas Défi → Opportunité → Trouvaille → Aspect. |
| Verrouillage après début de résolution | Choix de conception | Empêche de changer rétroactivement le scénario après enregistrement d’un jet ou encaissement d’un gain. |

## Interpréter les Actions et les Résultats — p.40–42

| Domaine | Statut | Implémentation |
| --- | --- | --- |
| Pistes narratives pour les 9 Capacités | Conforme | Assistant disponible depuis chaque carte de jet, avec guide adapté à la Capacité utilisée. |
| Réussite totale | Conforme | Aide à décrire l’objectif pleinement atteint. |
| Réussite partielle / Contrainte | Conforme | Rappelle le caractère temporaire et réparable ; exemples Combinaison / IA. |
| Échec / Défaillance | Conforme | Rappelle le caractère permanent ; exemples Combinaison / IA. |
| Nommer une conséquence | Choix de conception | Le joueur peut donner un libellé narratif avant confirmation ; les boutons génériques restent disponibles. |
| Activités Secondaires | Conforme | L’assistant respecte leur règle spécifique et ne suggère pas de Contrainte/Défaillance générique. |
| Action + Thème | Conforme | Oracle intégré à l’assistant. |

## Journal de bord et rédaction — p.43

| Domaine | Statut | Implémentation |
| --- | --- | --- |
| Support libre du Journal | **Conforme — narratif** | Le JournalEntry Foundry reste éditable librement ; aucune structure de rédaction obligatoire n’est imposée. |
| Une page par Mission | Choix de conception | Les événements automatiques et notes liées à la Mission sont regroupés dans une page dédiée. |
| Notes générales | Conforme | Page générale persistante. |
| Découvertes | Conforme | Page dédiée et persistante. |
| Documenter Actions / Oracles / Rencontres | Conforme | Les principaux générateurs proposent ou produisent des entrées de Journal ; l’utilisateur peut ensuite éditer librement les pages. |
| Croquis / diagrammes / médias | **Conforme — narratif** | Le Journal natif Foundry peut être enrichi manuellement ; le système n’impose aucun format supplémentaire. |

## Tables avancées — p.44–63

| Table du livre | Statut | Données |
| --- | --- | --- |
| Formes de Vie Extraterrestre | Couvert par table | 4 colonnes d100 indépendantes : Forme, Trait, Caractéristique, Comportement. |
| Caractéristiques de Terrain | Couvert par table | d100 complet. |
| Caractéristiques de Structure | Couvert par table | d100 complet. |
| Anomalies | Couvert par table | d100 complet. |
| Informations | Couvert par table | d100 complet. |
| Ce que vous voyez dans le ciel | Couvert par table | d100 complet. |
| Ce que vous pouvez voir à distance | Couvert par table | d100 complet. |
| Incidents | Couvert par table | d100 complet. |
| Descripteurs | Couvert par table | d100 complet. |
| Structures | Couvert par table | d100 complet. |
| Actions | Couvert par table | d100 complet. |
| Thèmes | Couvert par table | d100 complet. |
| Objets | Couvert par table | d100 complet. |
| Matériaux | Couvert par table | d100 complet. |

Les tests automatiques vérifient la couverture **1–100 sans trou** des tables utilisées par le système et les quantités attendues pour les tables à plages.

## Conclusion

À l’issue de cet audit, les **Règles Avancées p.32–63 sont couvertes** par le système. Il ne reste pas de sous-système mécanique ou de table avancée du livre à ajouter avant les Extras.

La prochaine frontière fonctionnelle est donc explicite : **Extras p.65+**. Ils sont actuellement volontairement exclus du système et devront être intégrés séparément si le périmètre du projet est étendu.
