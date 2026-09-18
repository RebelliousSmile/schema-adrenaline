# Les clés d'adaptateur publiées restent déclaratives et fermées par Lantern

- Date: 2026-09-18
- Status: Accepted

## Context

Les documents Adrenaline ne publient actuellement aucun descripteur de
présentation. Les schémas et codecs stricts doivent donc rejeter toute tentative
d'ajouter une clé d'adaptateur à un document portable.

Si le contrat publie plus tard une sémantique de présentation nécessitant un
éditeur spécialisé, le package de schémas ne peut ni importer React ni résoudre
un composant consommateur.

## Decision

Tant qu'aucun descripteur n'est publié, aucun vocabulaire de clés n'est exposé.
Le corpus couvre cette absence : une métadonnée `presentation.adapter` est une
clé inconnue pour PJ, PNJ et monstre.

Toute future clé est une chaîne déclarative, stable et appartenant à un
vocabulaire fini validé par le producteur. Elle ne contient ni import de
composant, ni chemin de module, ni classe CSS, ni configuration exécutable.
Lantern possède le registre exhaustif qui associe cette clé à son adaptateur
React et échoue explicitement face à une clé inconnue ; il ne déduit pas un
éditeur de secours. La clé et ce registre doivent être coordonnés avant la
release du contrat qui les publie.

## Consequences

Les données interchangeables restent indépendantes de leur rendu. Une évolution
de présentation commence par le contrat versionné, est couverte par son corpus,
puis est adoptée par Lantern seulement lorsque son registre fermé est prêt.
