---
objective: "La CI de schema-adrenaline redevient verte et aucune assertion ne code en dur la version du pack Handbook : elle est lue dans handbook/adrenaline/pack.json."
status: in-progress
---

# Plan: dériver la version du pack Adrenaline de son manifeste

## Overview

| Field      | Value                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**   | Sortir l'égalité de version du consommateur gelé, rejouer côté source les seuls contrôles réellement perdus, et fermer la boucle sur l'issue amont. |
| **Source** | Issue [RebelliousSmile/obsidian-handbook#35](https://github.com/RebelliousSmile/obsidian-handbook/issues/35), corps tronqué à la création ; cause réelle reconstruite depuis le log CI `runs/35514657037`. |

## Phases

| #   | Phase                                                   | File                         |
| --- | ------------------------------------------------------- | ---------------------------- |
| 1   | Retirer l'assertion gelée de la CI                      | [`phase-1.md`](./phase-1.md) |
| 2   | Combler l'écart mesuré dans le contrôle de pack         | [`phase-2.md`](./phase-2.md) |
| 3   | Fermer la boucle sur l'issue amont                      | [`phase-3.md`](./phase-3.md) |

## Resources

| Source                                                                                     | Verified                                                                                                                                       |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `gh run view 35514657037 --log-failed`                                                     | `AssertionError` `actual '0.3.0'` / `expected '0.2.0'` dans l'étape « Check package against declared Handbook release », job `assert:adrenaline-source`. |
| `obsidian-handbook@2.7.0:tools/assertAdrenalineSource.harness.mts`                          | Ligne 21 `assert.equal(gamePlugin.version, "0.2.0")` — littéral dans un tag immuable, donc non corrigeable en amont. Lignes 21-76 : liste exacte des assertions à reprendre. |
| `obsidian-handbook` — `git log --diff-filter=D -- tools/assert-adrenaline-source.mjs`       | Supprimé le 2026-09-15 par `7b374c3` (« refactor: use canonical Adrenaline corpus ») ; absent de `v2.10.0` et de toutes les balises suivantes.   |
| `obsidian-handbook@2.7.0:tools/assert-adrenaline-theme.mjs` et son harnais                  | Ne code en dur aucune version de pack, et n'exige que `handbook/adrenaline/pack.json` à la racine source — pas de `tsx`, contrairement au harnais `source`. Rejouable en local. |
| `obsidian-handbook@2.7.0` — `git ls-tree`                                                   | Le tag ne suit que `pnpm-lock.yaml` ; la CI y lance pourtant `npm install`. Dette consignée, hors périmètre.                                    |
| `obsidian-handbook@main:package.json` et issue [#36](https://github.com/RebelliousSmile/obsidian-handbook/issues/36) | Handbook épingle `schema-adrenaline` sur le tarball **v1.0.0** alors que ce dépôt est en 2.2.0 : `assert:adrenaline-contract` teste donc un paquet périmé. #36 porte le **même motif sur `schema-pbta`**, pas sur Adrenaline, et il est **fermé** (corrigé par un bump de pin). À citer comme précédent, jamais comme le ticket jumeau ouvert. |

## Decisions

| Decision                                                                                                              | Why                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `minimumHandbookVersion` reste à `2.7.0` ; c'est le job CI qui change, pas le contrat.                                  | Le champ déclare le plancher de compatibilité du pack **et** pilote la ref du checkout CI (`ci.yml:37`). Le relever pour verdir la CI mentirait sur le support et déplacerait la cible de test. |
| `assert:adrenaline-source` est abandonné, pas réparé.                                                                  | Il n'existe qu'aux balises 2.7.x, gelées. Aucun correctif amont ne peut l'atteindre, et tout bump futur de la version du pack le referait échouer à l'identique.                            |
| `assert:adrenaline-theme` est conservé dans le job inter-dépôts.                                                       | Sa valeur pour ce dépôt n'est pas de tester le SCSS gelé de Handbook, mais de prouver que l'hôte plancher sait encore lire le manifeste courant. Sans cette phrase écrite, un prochain lecteur le retirerait par le même raisonnement que `source`. |
| Seuls les contrôles réellement absents migrent vers `tools/validate-handbook-pack.ts`.                                  | L'écart a été mesuré ligne à ligne : `requires`, `pack.id`, `polarities`, semver et existence des assets y sont **déjà** couverts. Réécrire l'existant gonflerait le contrôle sans rien prouver de neuf. |
| L'écriture sortante de la phase 3 passe par une validation explicite de l'utilisateur. | Le corps réécrit et le commentaire de clôture sont publiés sur un dépôt public. Rien n'est posté ni fermé sans accord, et la clôture attend un run CI vert observé, pas une intention. |
| L'aller-retour `block.parse` → `toToml` → cible Zod, perdu avec le job, n'est pas reconstruit ici.                      | Il exige le code Handbook et ne peut pas vivre dans ce dépôt. Il est couvert en amont par `assert:adrenaline-contract`, contre le paquet publié — dette suivie séparément, cf. #36.        |
