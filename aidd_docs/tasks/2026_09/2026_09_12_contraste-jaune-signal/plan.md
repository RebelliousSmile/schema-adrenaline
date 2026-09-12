---
objective: "En light, --color-yellow et --adrenaline-signal passent leur seuil AA respectif sans casser le contraste encre/signal déjà validé, et le validateur empêche la régression de revenir sans être détectée."
status: in-progress
---

<!-- Fill or omit these sections; never add, rename, or reorder one. -->

# Plan: Corriger le contraste du jaune et du signal Adrenaline (issue #5)

## Overview

| Field      | Value                   |
| ---------- | ----------------------- |
| **Goal**   | Remonter `--color-yellow` et `--adrenaline-signal` en polarité light au-dessus de leur seuil AA respectif (4.5:1 texte normal, 3:1 UI/large texte), sans repasser sous le seuil `--adrenaline-signal-ink`/`--adrenaline-signal` déjà exigé par le validateur, puis fermer le trou de couverture qui a laissé ces deux jetons régresser sans alerte. |
| **Source** | [Issue #5](https://github.com/RebelliousSmile/schema-adrenaline/issues/5) — reprend le constat déjà consigné dans `CLAUDE.md` (§ « `handbook/adrenaline/pack.json` : deux jetons déclarés jamais consommés, un jaune sous le seuil »). |

## Phases

| #   | Phase                                          | File                          |
| --- | ----------------------------------------------- | ----------------------------- |
| 1   | Corriger les valeurs du pack en polarité light  | [`phase-1.md`](./phase-1.md)  |
| 2   | Durcir le validateur contre la régression        | [`phase-2.md`](./phase-2.md)  |
| 3   | Trancher le sort des jetons morts et clore l'issue | [`phase-3.md`](./phase-3.md) |

## Resources

<!-- External sources only (URLs, docs), not code files. Omit if none consulted. -->

| Source | Verified |
| ------ | -------- |
| [Issue #5](https://github.com/RebelliousSmile/schema-adrenaline/issues/5) | Constat initial et deux commentaires de l'auteur proposant `--color-yellow → #956114` et `--adrenaline-signal → #8B6419`. |
| `zombiology/_sources/Design/` (hors dépôt, maquettes Zombiology fournies par l'utilisateur, `Sidebar-Motel.png` exclue — essai de fond, pas une évidence) | Les statuts jaune/or dans les maquettes (`tags-couleur.jpg`, `monstre.jpg`, `pnj.jpg`, `animal.jpg`) sont toujours rendus en aplat avec texte sombre dessus, jamais en texte fin sur fond clair : confirme que corriger `--adrenaline-signal` pour le rôle encre-sur-signal (déjà validé à 4.5:1) prime sur le calage exact proposé par l'auteur de l'issue. |

## Decisions

<!-- Architecture-magnitude only, one you'd regret reversing. Omit if none qualify. -->

| Decision | Why |
| -------- | --- |
| `--adrenaline-signal` passe à `#A6781F` (échelle ×0.90 depuis `#B98522`), pas `#8B6419` comme proposé dans l'issue. | `#8B6419` fait chuter le contraste `--adrenaline-signal-ink`/`--adrenaline-signal` de 5.73:1 à 3.50:1, sous le seuil 4.5:1 déjà imposé par `tools/validate-handbook-pack.ts`. Géométriquement, avec `--background-primary` (`L≈0.874`) et `--adrenaline-signal-ink` (`L≈0.006`) fixes, le plafond de contraste simultané contre les deux est `sqrt((L_bg+0.05)/(L_ink+0.05)) ≈ 4.055:1` (recalculé avec les fonctions du validateur), sous le seuil 4.5:1 : aucune couleur intermédiaire ne peut donc satisfaire 4.5:1 contre les deux à la fois, il faut arbitrer, et le rôle encre-sur-signal déjà validé et utilisé par les callouts prime sur le calibrage initial de l'issue. `#A6781F` garde l'encre à 4.74:1 et fait passer le signal de 2.87:1 à 3.47:1 (seuil UI/large texte 3:1 visé par l'issue). |
| Pas de bump de version sur `pack.json` ni sur l'entrée `handbook.json`. | Précédent direct (commit `326c127`, fix valeurs seules sans bump) et `CONTRIBUTING.md` : le versionnage du pack Handbook est indépendant du contrat npm. |
| Ce plan reste dans un dossier dédié, distinct de `aidd_docs/tasks/2026_09/2026_09_12_style-zombiology-adrenaline/`. | Ce dernier plan (déjà en attente) vise l'alignement visuel complet avec Zombiology côté Handbook (dépôt externe) et prévoit d'ajouter de nouveaux jetons de statut ; il ne corrige pas les valeurs `--color-yellow`/`--adrenaline-signal` existantes. Les deux plans touchent `pack.json` mais sans contradiction : ce plan-ci corrige des valeurs déjà publiées et référencées par l'issue #5, l'autre en ajoutera de nouvelles. Le durcissement du validateur ajouté en phase 2 profitera aussi à ce futur travail. |
