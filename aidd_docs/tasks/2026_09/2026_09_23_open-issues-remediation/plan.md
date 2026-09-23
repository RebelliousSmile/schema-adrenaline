---
objective: "Les issues ouvertes non obsolètes sont corrigées, vérifiées et clôturables : les contrôles locaux sont complets, la CI est à nouveau verte, et les publications suivent une preuve de promotion immuable."
status: blocked
---

# Plan: Remédier aux issues ouvertes d'Adrenaline

## Overview

| Field | Value |
| ----- | ----- |
| **Goal** | Corriger les régressions de versionnement, de validation, de dépendances et de contraste, puis achever la publication et le release-train. |
| **Source** | Objectif utilisateur et issues GitHub `#11`, `#13` à `#19`, `#21`. |

## Phases

| # | Phase | File |
| --- | ----- | ---- |
| 1 | Rétablir le contrat local de version et de dépendances | [`phase-1.md`](./phase-1.md) |
| 2 | Étendre la porte de qualité et protéger le contraste des liens | [`phase-2.md`](./phase-2.md) |
| 3 | Rendre les publications et le release-train vérifiables | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| [Issue #13](https://github.com/RebelliousSmile/schema-adrenaline/issues/13) | La version npm doit être indépendante du baseline de contrat, dont seul le gel immuable doit être vérifié. |
| [Issue #15](https://github.com/RebelliousSmile/schema-adrenaline/issues/15) | Les tags publiés doivent correspondre aux releases complètes, ou les tags prématurés doivent être retirés. |
| [Issue #21](https://github.com/RebelliousSmile/schema-adrenaline/issues/21) | La promotion doit prouver chez les deux consommateurs la même archive candidate avant de joindre ces octets au tag final. |

## Decisions

| Decision | Why |
| -------- | --- |
| Le baseline de schéma est dérivé de `ADRENALINE_SCHEMA_VERSION` dans toutes les assertions, jamais de la version npm. | Un patch de package sans changement de contrat doit rester publiable, tandis qu'un gel de contrat modifié doit échouer. |
| Les preuves Lantern et Handbook restent implémentées dans leurs dépôts consommateurs. | Les adaptateurs, lockfiles, builds et rendus appartiennent aux consommateurs selon le contrat inter-dépôts. |
| Les anciens tags non publiés sont traités explicitement, sans les maquiller par une reconstruction tardive. | Une release historique doit soit attacher les octets compatibles au tag, soit laisser disparaître le tag prématuré; une nouvelle archive incompatible ne prouve pas l'historique. |
