---
objective: "Le fournisseur peut publier manuellement une archive candidate Linux/Node 20, immuable et SHA-256-vérifiée, sans déclencher la promotion finale."
status: in-progress
---

# Plan: Publier une candidate Adrenaline reproductible

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Créer une prerelease `vX.Y.Z-rc.N` avec le tarball exact que la promotion stable pourra reproduire. |
| **Source** | Demande utilisateur du 23 septembre 2026. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Rendre la baseline 2.1 publiable | [`phase-1.md`](./phase-1.md) |
| 2 | Ajouter le workflow candidate manuel | [`phase-2.md`](./phase-2.md) |
| 3 | Prouver le parcours et documenter le train | [`phase-3.md`](./phase-3.md) |

## Decisions

| Decision | Why |
| --- | --- |
| Le workflow vit dans le dépôt fournisseur. | Seul le fournisseur peut attester ses sources, son paquet et sa release. |
| Le déclencheur est uniquement `workflow_dispatch`. | Aucune minute Actions n'est consommée sur les pushes ordinaires. |
| Le workflow crée une prerelease, jamais une stable. | Le train consommateur et la promotion stable restent des portes séparées. |
| La tag candidate est créée par la release ciblée sur le SHA dispatché. | Une branche ou un tag mutable ne peut pas changer l'origine de l'archive. |
