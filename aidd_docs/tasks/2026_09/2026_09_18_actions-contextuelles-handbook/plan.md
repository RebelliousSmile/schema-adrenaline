---
objective: "Les actions contextuelles Adrenaline sont activées uniquement par les capacités block publiées du manifeste, comme les actions PbtA, et un harness vérifie cette sélection."
status: implemented
---

# Plan: Relier les actions Adrenaline aux capacités publiées

## Overview

| Field | Value |
| ----- | ----- |
| **Goal** | Remplacer l’activation statique des trois blocs Adrenaline par leurs capacités `block:*` publiées et couvrir les insertions et exports contextuels résultants. |
| **Source** | Demande utilisateur : mêmes actions que schema-in-the-mist ; constat : les blocs Adrenaline utilisent encore `mode`, tandis que les blocs PbtA comparables utilisent `capability`. |

## Phases

| # | Phase | File |
| --- | ----- | ---- |
| 1 | Activation Adrenaline par capacité publiée | [`phase-1.md`](./phase-1.md) |

## Decisions

| Decision | Why |
| -------- | --- |
| Les trois blocs Adrenaline portent chacun leur capacité `block:*` au lieu du mode historique. | `isBlockEnabled` donne priorité à `capability` et relie alors directement le manifeste publié aux insertions et exports du menu. |
| Ce lot ne touche ni les gabarits ni les codecs Adrenaline 2.0.0. | La forme bornée attend encore une release immuable ; le manifeste 0.3.0 publié suffit aux capacités de blocs. |
