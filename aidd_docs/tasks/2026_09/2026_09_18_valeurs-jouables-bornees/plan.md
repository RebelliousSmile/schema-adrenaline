---
objective: "Le contrat Adrenaline 2.0.0 publie toutes les valeurs numériques jouables sous la forme { minimum, current, maximum }, les codecs refusent un intervalle incohérent, et Lantern peut adopter l'archive immuable exacte avec sa migration et ses parcours d'édition validés."
status: in-progress
---

# Plan: Exporter les valeurs numériques jouables bornées

## Overview

| Field      | Value |
| ---------- | ----- |
| **Goal**   | Remplacer les scalaires numériques jouables par un intervalle exporté, livrer le contrat majeur et permettre l'adoption consommateur de la release immuable. |
| **Source** | Ticket GitHub [#8](https://github.com/RebelliousSmile/schema-adrenaline/issues/8) — `feat: export ranged playable numeric values`. |

## Phases

| #   | Phase | File |
| --- | ----- | ---- |
| 1 | Contrat v2 et validation d'intervalle | [`phase-1.md`](./phase-1.md) |
| 2 | Corpus, génération et contrôles du contrat | [`phase-2.md`](./phase-2.md) |
| 3 | Release immuable et relais Lantern | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| [Ticket #8](https://github.com/RebelliousSmile/schema-adrenaline/issues/8) | Portée : valeurs jouables bornées, ordre `minimum ≤ current ≤ maximum`, major, corpus, release et adoption Lantern. |
| [Zod JSON Schema](https://zod.dev/json-schema) | Le JSON Schema généré est structurel ; la relation entre champs doit être vérifiée hors de la représentation draft-7 publiée. |

## Decisions

| Decision | Why |
| -------- | --- |
| Publier un objet `ValeurJouable` commun, avec les clés `minimum`, `current` et `maximum`, pour les nombres jouables seulement. | Le ticket impose une forme homogène sans transformer les nombres de structure ou d'éditorial en faux états de jeu. |
| Garder le schéma draft-7 structurel et faire respecter l'ordre par un validateur inter-champs appelé par les codecs publics. | Draft-7 décrit les trois entiers et leurs bornes, mais pas leur ordre relatif ; un `.refine()` disparaîtrait du schéma et est explicitement interdit par l'audit. |
| Livrer `2.0.0` avant toute modification Lantern ; la migration et les adaptateurs restent dans Lantern. | La règle inter-dépôts impose contrat puis release avant adoption, et réserve les adaptateurs d'exécution au consommateur. |
