---
status: done
---

# Instruction: retirer l'assertion gelée de la CI

## Architecture projection

```txt
.
├── .github/
│   └── workflows/
│       └── ci.yml                    ✏️ l'étape inter-dépôts ne lance plus `assert:adrenaline-source`
├── handbook/
│   └── adrenaline/
│       └── pack.json                 (inchangé — `minimumHandbookVersion` reste `2.7.0`)
├── CHANGELOG.md                      ✏️ section `## [Unreleased]` créée, puis l'entrée
└── CLAUDE.md                         ✏️ mémoire projet : dette `npm install` / `pnpm-lock.yaml` du checkout Handbook
```

## Tasks to do

### `1)` Couper l'assertion impossible

> L'étape « Check package against declared Handbook release » ne lance plus qu'`assert:adrenaline-theme`.

1. Dans `.github/workflows/ci.yml`, supprimer la ligne `npm run assert:adrenaline-source` du bloc `run` (ligne 55), garder `npm run assert:adrenaline-theme`.
2. Ajouter au-dessus de l'étape un commentaire en deux temps : le script `source` n'existe qu'aux balises 2.7.x et y fige `0.2.0` ; le script `theme` reste parce qu'il prouve que l'hôte plancher sait lire le manifeste courant — ce n'est pas le SCSS gelé de Handbook qu'on teste.
3. Ne toucher ni à l'étape « Read minimum Handbook release » (elle dérive la ref du checkout de `pack.json`), ni au checkout de `RebelliousSmile/obsidian-handbook`, ni à `validate-handbook-install.ts`.

### `2)` Prouver que la passerelle restante passe

> `assert:adrenaline-theme` sous 2.7.0 accepte le pack `0.3.0`.

1. Rejouer localement : cloner `obsidian-handbook` sur la balise `2.7.0` hors du dépôt, puis `SCHEMA_ADRENALINE_ROOT=<racine schema-adrenaline> npm run assert:adrenaline-theme`. Installer avec `npm install`, **parce que c'est ce que fait la CI** (`ci.yml:48`) — pas parce que c'est le bon choix : la balise ne suit que `pnpm-lock.yaml`. Un `pnpm install` testerait un arbre de dépendances que la CI ne voit jamais.
2. Le harnais de thème n'exige que `handbook/adrenaline/pack.json` à la racine source — pas de `node_modules/.bin/tsx`, contrairement au harnais `source` supprimé. Aucun `npm ci` n'est requis côté schema-adrenaline pour cette vérification.
3. Sous l'outil Bash de cette machine, appeler `npm.cmd` ; si un shell-out échoue (`tar`, résolution de `npm`), rejouer la même commande via PowerShell.
4. Si le harnais de thème échoue pour une autre raison que la version, s'arrêter et remonter l'erreur telle quelle : c'est un second défaut, hors du périmètre de ce lot.

### `3)` Consigner le changement et la dette d'installation

> Le CHANGELOG dit ce que la CI ne vérifie plus, et la dette repérée est écrite plutôt qu'oubliée.

1. Créer une section `## [Unreleased]` en tête du `CHANGELOG.md`, au-dessus de `## [2.2.0] - 2026-09-20` : le fichier n'en porte pas et suit Keep a Changelog.
2. Y ajouter sous `### Changed` : la CI ne rejoue plus `assert:adrenaline-source` de Handbook 2.7.0, dont l'assertion de version du pack est un littéral gelé.
3. Nommer la couverture déplacée (forme du manifeste → `validate:pack`, phase 2) et celle abandonnée (aller-retour bloc Handbook → TOML → Zod, cf. obsidian-handbook#36).
4. Consigner dans le `CLAUDE.md` du dépôt la dette repérée : `ci.yml:48` lance `npm install` dans un checkout Handbook qui ne suit que `pnpm-lock.yaml`, donc l'installation de l'hôte de test n'est pas déterministe. Ne pas la corriger ici.

## Test acceptance criteria

| Task | Acceptance criteria                                                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `.github/workflows/ci.yml` ne contient plus aucune occurrence de `assert:adrenaline-source`, et `assert:adrenaline-theme` reste lancé avec `SCHEMA_ADRENALINE_ROOT`. |
| 1    | Le commentaire ajouté énonce la raison de garder `theme` autant que celle de retirer `source`.                                                  |
| 2    | `assert:adrenaline-theme` joué depuis un checkout Handbook `2.7.0` contre la racine courante sort en succès avec « Adrenaline theme assertions passed. ». |
| 2    | Le job `check` de la CI passe au vert sur la branche du lot, y compris l'étape « Install catalogue through declared Handbook release ».           |
| 3    | `CHANGELOG.md` porte une section `## [Unreleased]` avant `## [2.2.0]`, et son entrée distingue la couverture déplacée de la couverture abandonnée. |
| 3    | Le `CLAUDE.md` du dépôt porte la dette `npm install` / `pnpm-lock.yaml` du checkout Handbook, marquée comme non corrigée.                        |
