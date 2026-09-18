---
objective: "Handbook dérive les actions contextuelles Adrenaline à partir des blocs déjà publiés par le manifeste du pack, et crée ou exporte les mêmes types de blocs applicables que schema-in-the-mist sans métadonnée dupliquée."
status: pending
---

# Plan: Afficher les actions contextuelles déclarées par les packs

## Overview

| Field | Value |
| ----- | ----- |
| **Goal** | Faire de `requires` et des blocs publiés la source d’autorité des insertions contextuelles, puis raccorder les conversions TOML aux codecs du contrat publié. |
| **Source** | Demande utilisateur : « les mêmes que pour schema-in-the-mist », avec schema-in-the-mist comme référence d’implémentation non normative. |

## Phases

| # | Phase | File |
| --- | ----- | ---- |
| 1 | Projection des blocs publiés dans Handbook | [`phase-1.md`](./phase-1.md) |
| 2 | Rendu du menu depuis la release publiée | [`phase-2.md`](./phase-2.md) |
| 3 | Adoption des valeurs bornées après release | [`phase-3.md`](./phase-3.md) |

## Decisions

| Decision | Why |
| -------- | --- |
| Les entrées d’insertion sont dérivées des blocs déjà déclarés par `requires`, sans ajouter une surface `contextualActions` tant qu’une action réelle ne l’exige pas. | Le manifeste Adrenaline publie déjà ses trois blocs et Handbook sait déjà les insérer ; une seconde liste serait une duplication non prouvée. |
| schema-in-the-mist est une référence fonctionnelle ponctuelle, pas le modèle contractuel des autres schémas. | Tous les packs conservent leur droit d’expérimenter et une capacité partagée ne naît que d’implémentations compatibles réelles. |
| L’affichage des insertions adopte le manifeste Adrenaline 0.3.0 déjà publié ; seuls les gabarits et conversions de valeurs bornées attendent 2.0.0. | `requires` contient déjà les blocs nécessaires, tandis que la nouvelle forme `{ minimum, current, maximum }` n’est pas encore livrée sous une release immuable. |
| Handbook adopte uniquement une release Adrenaline immuable et résolue depuis le catalogue puis le manifeste référencé. | La règle inter-dépôts impose la publication avant consommation et la vérification ne doit pas figer un numéro de version du producteur. |
