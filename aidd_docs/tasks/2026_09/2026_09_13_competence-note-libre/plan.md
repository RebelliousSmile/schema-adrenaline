---
objective: "Une compétence peut porter une ligne de note libre, propagée jusqu'au rendu Handbook (PJ/PNJ/Monstre)."
status: implemented
---

# Plan: Note libre sur Competence

## Overview

| Field      | Value                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| **Goal**   | Ajouter un champ optionnel `notes` (une ligne libre) à `Competence`, pour que l'utilisateur y note ce qu'il veut (ex. l'arme utilisée) sans lien de données arme↔compétence en dur. |
| **Source** | Demande utilisateur (conversation) : malus/stress écartés (déjà hors fiche par design, cf. `sante.ts`/`caracteristiques.ts`), lien arme↔compétence écarté ("je mettrai les détails de l'arme de mon côté") — ne reste que la note libre sur compétence. |

## Phases

| #   | Phase                              | File                          |
| --- | ----------------------------------- | ----------------------------- |
| 1   | Schéma — champ `notes` sur Competence | [`phase-1.md`](./phase-1.md) |
| 2   | Handbook — propagation et rendu     | [`phase-2.md`](./phase-2.md) |

## Decisions

| Decision                                                                 | Why                                                                                                                                                                    |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pas de champ malus / dés de stress                                        | Déjà exclu par design documenté dans `sante.ts` et `caracteristiques.ts` : ce sont des compteurs d'état de partie, jamais stockés sur la fiche. Aucun changement à faire. |
| Pas de lien structuré arme↔compétence                                    | Demande explicite de l'utilisateur : il gère ce rapprochement lui-même via la note libre, pas de référence croisée en schéma.                                          |
| Champ nommé `notes` (et non `description`)                               | Aligné sur le précédent `Arme.notes` (`equipement.ts`) — même rôle : ce que la ligne porte en plus, en une phrase.                                                     |
