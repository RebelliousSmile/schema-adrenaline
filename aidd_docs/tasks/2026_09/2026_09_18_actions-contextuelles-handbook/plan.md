---
objective: "Un harness Handbook prouve que les actions contextuelles Adrenaline suivent les capacités de blocs publiées, sans réimplémenter la logique déjà présente ni adopter le contrat 2.0.0 avant sa release."
status: pending
---

# Plan: Verrouiller les actions contextuelles des packs

## Overview

| Field | Value |
| ----- | ----- |
| **Goal** | Ajouter une preuve automatisée de la chaîne manifeste publié → disponibilité du bloc → insertion et export TOML dans le menu. |
| **Source** | Demande utilisateur, puis constat : `registry.ts`, `contextMenu/index.ts` et `copyAsToml.ts` réalisent déjà le comportement attendu. |

## Phases

| # | Phase | File |
| --- | ----- | ---- |
| 1 | Harness des capacités de blocs contextuelles | [`phase-1.md`](./phase-1.md) |

## Decisions

| Decision | Why |
| -------- | --- |
| Le présent lot ajoute une assertion, pas une nouvelle représentation des actions ni une modification de la logique du menu. | La chaîne `requires → isAvailableBlock → contributeBlockInsertions` et les exports filtrés existent déjà ; la couverture de régression manque. |
| La migration des gabarits et codecs vers Adrenaline 2.0.0 reste un lot ultérieur. | Elle dépend d’une release immuable qui n’est pas encore publiée ; l’assertion porte donc sur la release actuellement adoptée. |
