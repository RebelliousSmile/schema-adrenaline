# Review: Schémas de personnages Adrenaline System

- **Verdict**: approve
- **Diff**: `main...` + arbre de travail (révision post-fiches, non commitée)
- **Axes run**: code
- **Date**: 2026_09_08
- **Findings**: 0 critical, 0 warning, 6 minor — 5 corrigés, 1 assumé

## Phases

Not run — axe `functional` non demandé.

## Findings

| Sev | Kind | Phase | Location | Issue | Fix |
| --- | ---- | ----- | -------- | ----- | --- |
| 🟢 | code | 2 | `src/zod/common/formations.ts:29,36,68` · `equipement.ts:12,15` · `identite.ts:16` · `pj.ts:28` · `pnj.ts:31` · `monstre.ts:43,75,88` | `z.int().min(0)` est écrit en clair onze fois alors que trois primitives nommées existent — `Pourcentage` (`caracteristiques.ts:7`), `Points` (`protections.ts:4`), `ValeurDeSeuil` (`sante.ts:3`) — chacune privée à son fichier. `Competence.pourcentage` et `Competence.total` sont des pourcentages sans employer `Pourcentage`. | **Corrigé.** `src/zod/common/primitives.ts` exporte `Pourcentage`, `Points`, `Compte` et `Cumul`, importés partout. Chacune est bornée des deux côtés : un `z.int()` nu émettait `"maximum": 9007199254740991`, donc aucune borne réelle — le cas de refus `caracteristique-hors-borne.json` (`for = 100000`) était accepté et ne l'est plus. `Pourcentage` plafonne à 200 et non à 100 : les règles font passer un pourcentage au-delà de 100 %. |
| 🟢 | code | 3-4 | `src/zod/adrenaline/pnj.ts:31` · `monstre.ts:75` | `niveauDeDanger` est défini deux fois, même type, deux descriptions. Le ND est une mécanique du socle, pas une propriété de cible. | **Corrigé.** Déclaré une fois dans `src/zod/common/danger.ts`, avec une description qui couvre les deux emplois et dit que le ND d'une créature est cumulatif, donc non borné par le 5 de chaque composant. |
| 🟢 | code | 2 | `src/zod/common/sante.ts:3,14,27,45` | Deux mots pour un concept : les exports disent « seuil » (`ValeurDeSeuil`, `SeuilsPhysiques`) là où les types internes disent « palier » (`Palier`, `QuatrePaliers`). | **Corrigé.** « Seuil » partout, dans les exports comme dans les commentaires ; « palier » abandonné. Le JSON généré ne bouge pas, ces noms ne sortent pas. |
| 🟢 | code | 2 | `src/zod/common/formations.ts:29,36` | `total` est la somme de `pourcentage` et de la caractéristique désignée par `caracteristique`, mais rien ne lie les trois. Contrainte inexprimable en draft-7 — dépendance à une valeur vivant dans un autre bloc. | **Corrigé.** La description publiée dit désormais que le schéma ne vérifie pas la somme et qu'un consommateur doit recalculer la valeur plutôt que la croire. |
| 🟢 | code | 2-4 | `src/zod/common/equipement.ts:12` · `formations.ts:26` · `monstre.ts` | Deux mises en forme des `description:` coexistent — chaîne sur la même ligne, ou repliée sur la ligne suivante — y compris dans un même fichier. Aucun formateur n'est configuré dans le dépôt. | **Corrigé.** Prettier ajouté (`.prettierrc.json`, `.prettierignore`) avec les scripts `format` et `format:check`. `schemas/` est exclu : la génération le réécrit et annulerait le formatage. |
| 🟢 | code | 2 | `src/zod/common/identite.ts:18,22` | `taille` et `poids` restent des chaînes libres, décrites comme « telle qu'écrite sur la feuille, unité comprise ». Un consommateur recevra `"175"`, `"1,75 m"` ou `"1m75"` sans pouvoir comparer deux fiches. | **Assumé, désormais écrit.** La feuille est manuscrite et n'impose pas d'unité. Les descriptions publiées disent maintenant explicitement que deux fiches ne sont pas comparables sur ces deux champs. À rouvrir seulement si un outil tiers doit trier ou filtrer dessus. |

## Verification

Not run — axe `functional` non demandé.

Les corrections ci-dessus sont en revanche mesurées, pas affirmées, par
`npm run check` (typecheck → gen → validate → audit) :

- descriptions 351/351 (100 %), contre 61 % avant ;
- aucune valeur numérique laissée sans borne haute réelle ;
- 3 schémas draft-7 valides, compilés par Ajv, portant un `$id` ;
- 3 témoins acceptés, 23 cas de refus rejetés ;
- aucun `.refine()` ni `.default()` dans `src/zod/` ;
- `prettier --check .` vert.
