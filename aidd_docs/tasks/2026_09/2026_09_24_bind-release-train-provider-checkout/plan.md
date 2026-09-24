---
objective: "Le Release train transmet aux preuves consommateurs un checkout schema-adrenaline au SHA exact déclaré par la candidate, puis le train v2.5.0 produit les deux evidences protocol-1."
status: in-progress
---

# Plan: Lier le checkout fournisseur à la candidate du Release train

## Overview

| Field | Value |
| ----- | ----- |
| **Goal** | Corriger l'interface entre le workflow fournisseur et Handbook : le chemin `SCHEMA_ADRENALINE_ROOT` doit désigner le commit immuable de la candidate, et non le commit qui contient le manifeste. |
| **Source** | Pull request fusionnée [RebelliousSmile/schema-adrenaline#33](https://github.com/RebelliousSmile/schema-adrenaline/pull/33) |
| **Out of scope** | Créer le tag stable `v2.5.0` ou sa release publique ; cette promotion reste la phase 3 du plan issu de l'issue #32, après un train vert. |

## Phases

| # | Phase | File |
| --- | ----- | ---- |
| 1 | Matérialiser la source fournisseur exacte | [`phase-1.md`](./phase-1.md) — fait sur le commit candidat |
| 2 | Intégrer le correctif et conserver son attestation | [`phase-2.md`](./phase-2.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| [PR #33](https://github.com/RebelliousSmile/schema-adrenaline/pull/33) | Elle a introduit le manifeste protocol 1 et le workflow qui checkout les deux consommateurs, mais son job passe encore `${{ github.workspace }}` comme source fournisseur. |
| [Run Release train 35984758041](https://github.com/RebelliousSmile/schema-adrenaline/actions/runs/35984758041) | Lantern produit une evidence valide ; Handbook échoue explicitement car le `HEAD` de `SCHEMA_ADRENALINE_ROOT` diffère de `candidate.providerCommit`. |
| [Commit `cc5d20a`](https://github.com/RebelliousSmile/schema-adrenaline/commit/cc5d20a20cfda8a2d78842c5fdd196b37dc7d5c9) et [run 35988789960](https://github.com/RebelliousSmile/schema-adrenaline/actions/runs/35988789960) | Le correctif checkout le SHA candidat dans un répertoire dédié ; le train protocol 1 est vert avec ses trois checkouts et son artefact de preuves. Ce commit est encore hors de `main`. |
| [Issue Handbook #61](https://github.com/RebelliousSmile/obsidian-handbook/issues/61) | Le contrat consommateur exige un remote fournisseur canonique, le tag RC au commit déclaré et un `HEAD` égal à ce même commit. |
| [`schema-adrenaline-v2.5.0.json`](../../../../release-train/schema-adrenaline-v2.5.0.json) | La candidate fixe `providerCommit` à `31c4576bc45e1fc16e4bf6592d3f3d62e7cf8b58`, `stagingTag` à `v2.5.0-rc.2` et les refs exactes des deux consommateurs. |

## Decisions

| Decision | Why |
| -------- | --- |
| Le SHA à checkout est lu du manifeste déjà validé et exposé comme sortie `candidate_provider_commit` de l'étape `train`. | Une valeur issue de la candidate immutable élimine l'ambiguïté entre le commit de la branche qui porte le manifeste et le commit fournisseur attesté. |
| Un checkout dédié `schema-adrenaline` est distinct du checkout initial du workflow. | Le checkout initial doit rester sur le commit qui contient et valide le manifeste ; modifier son `HEAD` rendrait le manifeste et les outils fournisseur indisponibles. |
| `SCHEMA_ADRENALINE_ROOT` ne change que pour les commandes des preuves consommateurs. | Lantern et Handbook conservent leurs responsabilités et leurs checks ; seul le contrat de source injecté est corrigé. |
| Le run vert déjà effectué est conservé lors de l'intégration, sans nouveau dispatch requis. | Son commit est ancêtre du futur commit de livraison et le garde-fou de release vérifie cette ancestry avec le digest du manifeste ; un nouveau run n'apporterait pas de preuve supplémentaire. |
