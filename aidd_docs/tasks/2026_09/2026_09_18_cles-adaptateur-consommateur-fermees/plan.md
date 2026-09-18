---
objective: "Le contrat Adrenaline atteste qu'il ne publie encore aucun descripteur de présentation ni aucune clé d'adaptateur, refuse ces métadonnées dans son corpus, et documente que Lantern devra résoudre toute future clé dans son registre fermé."
status: pending
---

# Plan: Fermer les clés d'adaptateur du consommateur

## Overview

| Field | Value |
| ----- | ----- |
| **Goal** | Rendre explicite et vérifiable que les documents Adrenaline n'exposent pas encore de métadonnée de présentation, tout en fixant la frontière d'une future clé d'adaptateur avec Lantern. |
| **Source** | Issue GitHub [#9](https://github.com/RebelliousSmile/schema-adrenaline/issues/9) — `feat: publish only closed consumer adapter keys`. |

## Phases

| # | Phase | File |
| --- | ----- | ---- |
| 1 | Absence de métadonnées et frontière Lantern | [`phase-1.md`](./phase-1.md) |

## Decisions

| Decision | Why |
| -------- | --- |
| Publier explicitement un vocabulaire d'adaptateurs vide plutôt qu'un champ de présentation prématuré. | Aucun document Adrenaline ne requiert aujourd'hui d'éditeur spécialisé publié ; inventer une clé ou une structure créerait un faux contrat stable. |
| Prouver le refus de toute tentative de métadonnée d'adaptateur par le corpus des trois cibles et le validateur de contrat. | Les objets Zod et JSON Schema stricts ferment déjà cette surface ; les contre-exemples rendent cette garantie visible et empêchent une ouverture accidentelle. |
| Réserver à Lantern le registre exhaustif clé → adaptateur React et son échec explicite. | Le package de schémas reste déclaratif, sans import, chemin, classe CSS ni configuration exécutable de consommateur ; une future clé ne peut être publiée qu'après coordination avec ce registre. |
