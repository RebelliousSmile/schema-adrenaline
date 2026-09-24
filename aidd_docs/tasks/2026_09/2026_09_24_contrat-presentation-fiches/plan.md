---
objective: "Les schémas PJ, PNJ et Monstre publient une présentation déclarative fidèle aux fiches Zombiology, avec des valeurs bornées exploitables par tous les consommateurs."
status: in-progress
---

# Plan: Publier la présentation des fiches Zombiology

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Ajouter aux trois JSON Schemas un vocabulaire de présentation versionné, validé et indépendant des données utilisateur. |
| **Source** | Demande utilisateur du 24 septembre 2026 et `C:/Users/fxgui/Documents/Perso/RPG/zombiology/_sources/Design/{pj,pnj,monstre}.jpg`. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Contrat de présentation et nouvelle baseline | [`phase-1.md`](./phase-1.md) |
| 2 | Validation, documentation et paquet public | [`phase-2.md`](./phase-2.md) |

## Decisions

| Decision | Why |
| --- | --- |
| Publier la présentation dans l'annotation racine `x-adrenaline-presentation` des JSON Schemas. | Les blocs, régions et ordres restent versionnés à côté du contrat sans polluer les documents utilisateur stricts. |
| Référencer les blocs par les capacités `block:adrenaline-*` déjà publiées par le manifeste. | Handbook active ainsi le rendu par la même capacité déclarée, sans mode statique ni clé d'adaptateur locale. |
| Dériver les limites numériques des mots-clés JSON Schema `minimum` et `maximum`. | Les consommateurs obtiennent les bornes demandées sans dupliquer des nombres dans les métadonnées de présentation. |
| Créer la baseline additive `2.2.0`. | La baseline `2.1.0` est immuable ; les annotations publiées doivent avoir une identité épinglable distincte. |
