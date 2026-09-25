---
objective: "Les fiches PJ, PNJ et Monstre de la note Test Handbook — Adrenaline reprennent les références Zombiology à partir d'un contrat de présentation publié par schema-adrenaline."
status: in-progress
---

# Plan: Rendu Zombiology fondé sur le schéma

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Publier les règles de présentation avec le contrat de données, puis les consommer dans Handbook et Lantern. |
| **Source** | Demandes et captures de l'utilisateur du 24 septembre 2026 ; `C:/Users/fxgui/Documents/Perso/RPG/zombiology/_sources/Design/{pj,pnj,monstre}.jpg` ; `C:/Users/fxgui/Documents/Perso/RPG/zombiology/Test Handbook — Adrenaline.md`. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Branche sûre et contrat visuel | [`phase-1.md`](./phase-1.md) |
| 2 | Prévisualisation locale dans Handbook | [`phase-2.md`](./phase-2.md) |
| 3 | Revue et publication du contrat | [`phase-3.md`](./phase-3.md) |
| 4 | Adoption publiée dans Handbook et Lantern | [`phase-4.md`](./phase-4.md) |

## Decisions

| Decision | Why |
| --- | --- |
| Le schéma publié possède les sections, blocs, chemins, tokens, styles et règles de visibilité ; les documents TOML ne stockent que les données utilisateur. | Une même fiche peut être rendue par plusieurs consommateurs sans recopier sa sémantique dans chacun. |
| Les bornes `minimum` et `maximum` guident la saisie Lantern, mais seul `current` est affiché dans Handbook. | Cela suit la distinction demandée entre éditeur et fiche visible. |
| Une revue locale du rendu précède toute publication ; l'adoption permanente des consommateurs attend ensuite le paquet publié. | Cela respecte à la fois la demande de vérifier le résultat avant une nouvelle version et la règle inter-dépôts. |
| La prévisualisation de la phase 2 est un branchement local et réversible de Handbook, non une adoption livrée. | Le rendu doit être visible dans la vraie note avant accord, mais le consommateur livré ne peut dépendre que d'un paquet publié. |
| Les caractéristiques PJ exposent un maximum d'édition de 50 %, sans abaisser le primitif partagé des PNJ et monstres. | C'est la borne demandée pour le PJ ; les monstres d'exemple dépassent 50 % et doivent rester valides. |
