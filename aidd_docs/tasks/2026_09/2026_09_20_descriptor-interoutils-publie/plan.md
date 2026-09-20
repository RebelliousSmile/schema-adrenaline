---
objective: "Le descripteur inter-outils et le catalogue Handbook d'Adrenaline sont exacts, inclus dans le tarball de release et résolubles par leurs consommateurs."
status: implemented
---

# Plan: Publier le descripteur inter-outils Adrenaline

## Overview

| Field | Value |
| ----- | ----- |
| **Goal** | Corriger le manifeste de corpus, déclarer la version de contrat et rendre le descripteur ainsi que le pack Handbook réellement accessibles depuis le package publié. |
| **Source** | Issue GitHub `RebelliousSmile/schema-adrenaline#10` — https://github.com/RebelliousSmile/schema-adrenaline/issues/10 |

## Phases

| # | Phase | File |
| --- | ----- | ---- |
| 1 | Contrat du descripteur et validation locale | [`phase-1.md`](./phase-1.md) |
| 2 | Surface tarball consommable | [`phase-2.md`](./phase-2.md) |

## Decisions

| Decision | Why |
| -------- | --- |
| Le corpus déclaré pointe vers `corpus/cases.json`, le manifeste réellement publié à la racine du corpus. | Le répertoire `corpus/contract/` ne contient que les fixtures TOML `valid/` et `invalid/`; annoncer un fichier absent ferait échouer le futur résolveur de fournisseur. |
| Le package exporte explicitement le descripteur JSON, `handbook.json` et le sous-arbre `handbook/`, en plus de les inclure dans `files`. | Un fichier inclus mais non exporté reste inaccessible via `import.meta.resolve`; le catalogue publié est aussi la source de vérité pour dériver la version du pack référencé. |
| `contractVersion` reste une valeur JSON explicite, mais le validateur attend la valeur dérivée de `ADRENALINE_CONTRACT_VERSION`. | Un fichier JSON ne peut pas importer la constante TypeScript ; la preuve locale évite néanmoins que les deux valeurs divergent silencieusement. |
