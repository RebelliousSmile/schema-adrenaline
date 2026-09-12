---
status: done
---

# Instruction: Champ `notes` sur Competence

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
schema-adrenaline/
├── src/zod/common/formations.ts        ✏️ ajoute Competence.notes
├── package.json                        ✏️ version 1.0.0 → 1.1.0, exports["./schemas/*"] et files → 1.1.0
├── src/contract-version.ts             ✏️ ADRENALINE_SCHEMA_VERSION → "1.1.0"
├── tools/validate-package.ts           ✏️ littéraux figés 1.0.0 → 1.1.0 (constante + $id + fichiers empaquetés)
├── schemas/adrenaline/**/*.schema.json ✏️ régénérés (npm run gen), nouveau dossier 1.1.0/
├── examples/adrenaline/pj/survivante-complete.toml   ✏️ une compétence porte `notes`
├── examples/adrenaline/pnj/pnj-majeur.toml           ✏️ une compétence porte `notes`
└── CHANGELOG.md                        ✏️ entrée [1.1.0]
```

## Tasks to do

### `1)` Ajouter le champ au schéma Zod

> `Competence` porte une ligne de note libre, optionnelle.

1. Dans `src/zod/common/formations.ts`, ajouter à `Competence` un champ `notes` :
   `z.string().min(1).optional().meta({ description: "Note libre rattachée à la compétence, en une ligne : arme utilisée, contexte, précision laissée à l'utilisateur.", examples: ["Judo"] })`.
2. Placer le champ après `avantages` (dernier champ actuel).
3. Ne pas toucher `caracteristiques.ts` ni `sante.ts` (malus/stress restent hors fiche, aucun changement).

### `2)` Bumper la version du contrat

> `1.0.0` est le dossier figé du tag `v1.0.0` (`CONTRIBUTING.md`, « Publishing a version ») : `npm run gen` l'écraserait sinon. Seul un bump fait écrire un nouveau dossier `schemas/adrenaline/<version>/`.

1. Dans `package.json`, passer `version` de `1.0.0` à `1.1.0` (mineur : ajout additif optionnel, rétrocompatible).
2. Dans `src/contract-version.ts`, aligner `ADRENALINE_SCHEMA_VERSION` sur `"1.1.0"`.
3. `validate:versioning.ts` impose `packageJson.version === ADRENALINE_SCHEMA_VERSION` strictement : les deux bumps sont solidaires, pas optionnels l'un sans l'autre.
4. Le paquet exporté doit suivre : dans `package.json`, `exports["./schemas/*"]` et l'entrée `files` passent de `schemas/adrenaline/1.0.0` à `schemas/adrenaline/1.1.0` — sinon le tarball exporterait les schémas `1.0.0` avec une constante `ADRENALINE_SCHEMA_VERSION` à `1.1.0`, incohérence détectée par `validate:package`.
5. Dans `tools/validate-package.ts`, les 3 littéraux figés `"1.0.0"` (assertion sur `ADRENALINE_SCHEMA_VERSION`, regex sur `$id`, préfixe de fichier empaqueté) passent à `"1.1.0"` — ce fichier teste le contrat public du paquet, il doit suivre chaque bump de baseline, taggé ou non.
6. Le tag `v1.1.0` n'est **pas** posé ici — il l'est au moment du release réel (`CONTRIBUTING.md` étapes 3-4), hors scope de ce plan.

### `3)` Régénérer et valider

> Le JSON Schema publié et les exemples reflètent le nouveau champ.

1. `npm run gen` (ou `npm.cmd run gen` — `npm` nu ne se résout pas sous Bash sur cette machine) pour régénérer `schemas/adrenaline/**` : écrit un nouveau `schemas/adrenaline/1.1.0/` sans toucher `1.0.0/`.
2. Ajouter `notes = "..."` à une compétence dans `examples/adrenaline/pj/survivante-complete.toml` et dans `examples/adrenaline/pnj/pnj-majeur.toml`, en respectant l'ordre TOML (scalaires/tableaux racine avant tables, `[meta]` en dernier).
3. `npm run check` (typecheck + gen + validate + audit) et confirmer une sortie verte.

### `4)` Documenter le changement

> Le changelog du dépôt (Keep a Changelog / SemVer, cf. entrées `[1.0.1]`/`[1.0.0]` existantes) trace les évolutions du contrat ; `README.md` reste correct sans modification (« stable contract » désigne la dernière version **taguée**, encore `1.0.0` tant que `v1.1.0` n'est pas publié — hors scope de ce plan).

1. Dans `CHANGELOG.md`, ajouter une entrée `## [1.1.0] - 2026-09-13` sous `### Added` : « `Competence.notes` — a free-text note line on a skill entry (weapon reference, context), optional, no cross-schema link. ».

## Test acceptance criteria

| Task | Acceptance criteria                                                                                  |
| ---- | ----------------------------------------------------------------------------------------------------- |
| 1... | `Competence` compile, `notes` est optionnel, absent des schémas ne casse rien de rétro-compatible.     |
| 2... | `package.json` et `contract-version.ts` portent `1.1.0`, cohérents entre eux.                          |
| 3... | `npm run check` sort 0 ; `schemas/adrenaline/1.0.0/*` inchangé (hash égal à `HEAD`) ; `schemas/adrenaline/1.1.0/*` créé ; les deux exemples modifiés valident avec `notes` rempli sur une compétence. |
