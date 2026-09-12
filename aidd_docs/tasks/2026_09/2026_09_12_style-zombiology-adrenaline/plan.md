---
objective: "Le pack Adrenaline restitue les repères visuels de Zombiology dans Handbook, en lecture et en Live Preview, sans introduire de contenu sous copyright ni modifier le contrat de données."
status: implemented
---

# Plan: Rapprocher le style Adrenaline de Zombiology

## Overview

| Field | Value |
| ----- | ----- |
| **Goal** | Reproduire la hiérarchie éditoriale, les callouts, les statuts, les tableaux et les fiches PNJ observés dans les références Zombiology. |
| **Source** | Demande utilisateur et sept captures de référence du 12 septembre 2026. |

## Phases

| # | Phase | File |
| --- | ----- | ---- |
| 1 | Contrat visuel déclaratif du pack | [`phase-1.md`](./phase-1.md) |
| 2 | Rendu générique Handbook et fiche PNJ | [`phase-2.md`](./phase-2.md) |
| 3 | Validation, synchronisation et publication | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| `schema-adrenaline/handbook/adrenaline/pack.json` | Le pack fournit les polices, assets et tokens par polarité ; il ne peut pas embarquer de feuille CSS ou de sélecteurs. |
| `schema-adrenaline/handbook/adrenaline/README.md` | La source Adrenaline possède les valeurs et assets visuels, tandis que Handbook fournit les sélecteurs, le layout et les repli. |
| `handbook/src/styles/adrenaline/` | Le host possède déjà les sélecteurs Adrenaline pour la page, les callouts et les trois fiches ; il doit consommer les nouveaux tokens sans y figer de choix Zombiology. |
| `handbook/src/features/adrenalinePnj/renderer.ts` | Les données actuelles couvrent en-tête, présentation, caractéristiques, santé/protections, formations/compétences et équipement ; aucun champ de schéma supplémentaire n'est requis pour cette passe. |

## Decisions

| Decision | Why |
| -------- | --- |
| Les couleurs, polices, dimensions et ornements restent déclarés dans `schema-adrenaline/handbook/adrenaline/pack.json`. | Le pack est la source de vérité visuelle synchronisée vers Handbook et permet les variations clair/sombre sans dupliquer les choix du jeu dans le host. |
| Handbook ne reçoit que des sélecteurs structurels et des variables sémantiques, jamais de valeurs Zombiology codées en dur. | Le host doit rester capable d'héberger d'autres packs Adrenaline. |
| Les schémas `src/zod/` ne changent pas dans cette itération. | Les écarts montrés sont de rendu ; la fiche PNJ possède déjà les zones nécessaires. |
