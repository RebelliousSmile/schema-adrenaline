---
objective: "Chaque release schema-adrenaline ne peut être promue qu'après des preuves Lantern et Handbook portant sur le même archive candidat immuable, et le tag final reçoit exactement ces octets sans reconstruction."
status: in-progress
---

# Plan: Promouvoir une release candidate immuable

## Overview

| Field | Value |
| ----- | ----- |
| **Goal** | Ajouter un release train fournisseur qui atteste une archive candidate exacte dans les deux consommateurs, puis promeut les mêmes octets sous un tag final immuable. |
| **Source** | Issue [RebelliousSmile/schema-adrenaline#21](https://github.com/RebelliousSmile/schema-adrenaline/issues/21) |

## Phases

| # | Phase | File |
| --- | ----- | ---- |
| 1 | Contrat de train immuable et assertion locale | [`phase-1.md`](./phase-1.md) |
| 2 | Orchestration des preuves consommateurs | [`phase-2.md`](./phase-2.md) |
| 3 | Promotion sans reconstruction | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| [schema-adrenaline#21](https://github.com/RebelliousSmile/schema-adrenaline/issues/21) | Le manifeste doit contenir archive, SHA-256, commit fournisseur, tag final et commits consommateurs; la promotion ne reconstruit pas. |
| [schema-pbta#23](https://github.com/RebelliousSmile/schema-pbta/issues/23) | Le protocole parent sépare la porte quotidienne épinglée du release train explicite et exige les preuves d'installation/bundle propres aux consommateurs. |
| [lantern#20](https://github.com/RebelliousSmile/lantern/issues/20) | Lantern doit retourner une preuve machine-readable de son lockfile et de son build Vite pour l'archive candidate reçue. |
| [obsidian-handbook#49](https://github.com/RebelliousSmile/obsidian-handbook/issues/49) | Handbook doit retourner une preuve machine-readable de son lockfile et de son parcours d'installation/rendu pour l'archive candidate reçue. |

## Decisions

| Decision | Why |
| -------- | --- |
| Un manifeste de train versionné dans `release-train/` est l'unique entrée de l'orchestrateur. | Il lie archive, intégrité, tag, commit fournisseur et deux commits consommateurs avant toute exécution; ni branches ni tags ni commandes arbitraires ne peuvent élargir l'autorité du train. |
| Les consommateurs conservent leurs assertions, appelées seulement via leur script `release-train:assert`. | Lantern et Handbook restent propriétaires de leurs lockfiles, rendus, builds et adaptateurs; le fournisseur coordonne et vérifie les preuves sans les réimplémenter. |
| La CI quotidienne existante reste distincte du workflow de promotion. | La porte de contrat partagée surveille le baseline courant; elle ne prouve ni l'adoption d'une candidate choisie ni l'identité des octets promus. |
| La promotion télécharge et vérifie l'archive candidate avant de l'attacher au tag final. | Réutiliser le fichier SHA-256 vérifié garantit qu'aucun `npm pack` ou préparation de release ne produit un artefact différent après les preuves consommateurs. |
