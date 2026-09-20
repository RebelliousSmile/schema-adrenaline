---
status: pending
---

# Instruction: combler l'écart mesuré dans le contrôle de pack

## Architecture projection

```txt
.
├── tools/
│   └── validate-handbook-pack.ts     ✏️ ajoute les seuls contrôles absents, lus depuis pack.json
├── handbook/
│   └── adrenaline/
│       └── pack.json                 (inchangé — il est la source de vérité, pas la cible)
├── CHANGELOG.md                      ✏️ section `### Added` sous `## [Unreleased]`
└── CLAUDE.md                         ✏️ deux entrées de mémoire projet ; la checklist `ADRENALINE_SCHEMA_VERSION` reste intacte
```

## Tasks to do

### `1)` Ajouter les seuls contrôles absents

> Écart déjà mesuré contre `obsidian-handbook@2.7.0:tools/assertAdrenalineSource.harness.mts` l. 21-76. Ne pas réécrire l'existant.

Déjà couvert par `tools/validate-handbook-pack.ts`, à ne pas toucher : `requires` confronté à `ADRENALINE_CAPABILITIES` (l. 210-216), `pack.id === "adrenaline"`, `polarities` = `light,dark`, semver de `version` et de `minimumHandbookVersion`, extensions et existence des fichiers d'assets, sûreté des noms et valeurs de jetons.

Forme réelle du manifeste, vérifiée : `pack.style` porte trois couches `base`, `light`, `dark`, chacune avec `note` et `workspace`. `base.note` porte 30 jetons, `base.workspace` est **vide** ; `light` et `dark` portent 80 jetons `note` et 11 `workspace` chacune. Les douze jetons visés ci-dessous vivent en `light` **et** `dark`, jamais en `base`.

À ajouter :

1. `pack.label` — texte non vide. Attention : le seul contrôle `label` existant (l. 114) porte sur les entrées de `handbook.json`, est **optionnel** et vise un autre champ. Un `grep label` laisse croire au contraire.
2. Présence, **en `light` et en `dark`**, des sept jetons `note` qu'aucun `requireContrast` n'atteint : `--adrenaline-panel`, `--adrenaline-section-band`, `--adrenaline-section-band-ink`, `--adrenaline-band`, `--adrenaline-band-ink`, `--adrenaline-rule`, `--adrenaline-page-texture`. Ne rien exiger de `base`, qui n'en porte aucun.
3. Présence, **en `light` et en `dark`**, des cinq jetons `workspace` non atteints : `--background-primary-alt`, `--background-secondary`, `--text-muted`, `--background-modifier-border`, `--background-modifier-hover`. Ne rien exiger de `base.workspace`, vide par construction.
4. Interdiction d'un nom de jeton contenant `texture` dans **toute** couche `workspace`, `base` incluse : une couche vide passe trivialement, le contrôle reste correct.
5. Clés exactes de `assets.images` (`paper-grain`, `dark-organic`, `warning-stripe`) et de `assets.fonts` (`Adrenaline Body`, `Adrenaline Display`) — `validateAssetMap` vérifie les fichiers déclarés, pas qu'aucun ne manque à l'appel.
6. `minimumHandbookVersion` : refuser une valeur inférieure à `2.7.0`. Ce champ pilote la ref du checkout CI (`ci.yml:37`), donc une édition distraite déplace silencieusement la cible de test. Comparer **composante par composante, en entiers** : `SEMVER_PATTERN` ne valide que la forme, le fichier n'a aucun comparateur, et une comparaison de chaînes classe `"2.10.0"` avant `"2.7.0"` — elle refuserait précisément la balise où le harnais gelé a disparu en amont.

Les points 2 à 4 s'ajoutent au filtrage de `TOKEN_PATTERN`, qui accepte déjà tout nom bien formé ; ne pas modifier le motif lui-même.

Aucune de ces additions ne compare `version` à une valeur écrite dans le script : l'égalité catalogue ↔ pack existe déjà en fin de fichier et suffit.

### `2)` Étendre le self-test existant

> Les nouveaux refus passent par le mécanisme `refused(...)` en place, pas par un second dispositif.

1. Ajouter quatre manifestes dégradés au `selfTest` : un privé d'un jeton `note` requis en `light`, un dont une couche `workspace` porte un jeton `texture`, un dont `assets.fonts` perd une clé, un dont `minimumHandbookVersion` vaut `2.6.0`. Le fixture de polices couvre le point 5 dans son entier ; seul `pack.label` reste sans refus, vérifié par les critères d'acceptation manuels.
2. Chaque refus porte un message qui nomme le champ fautif, au même format que `missing capability` et `unsafe token`.
3. Conserver les **six** refus déjà présents (l. 318-327) et n'en dupliquer aucun : `catalogue version mismatch`, `escaping catalogue path`, `missing capability`, `missing asset`, `unsafe token`, `low contrast`.

### `3)` Vérifier la chaîne et documenter

> `npm run check` reste vert et la règle est inscrite là où le prochain bump la lira.

1. Lancer `npm.cmd run check`. Noter que la chaîne appelle `validate:handbook` (soit `validate-handbook-pack.ts --self-test`), pas `validate:pack` : les deux scripts pointent le même fichier, seul le premier exécute les refus.
2. Si `validate:release` échoue sur `tar` sous l'outil Bash, rejouer la commande identique via PowerShell — c'est le défaut d'environnement déjà consigné, pas une régression.
3. Ajouter au `CLAUDE.md` du dépôt une entrée de mémoire projet : la forme du pack Handbook est contrôlée par `validate-handbook-pack.ts` depuis `pack.json`, la version du pack n'est jamais recopiée dans un script, et la passerelle inter-dépôts ne rejoue plus le harnais gelé de 2.7.0.
4. Dans ce même `CLAUDE.md`, écrire une entrée **séparée** pour le plancher `2.7.0` posé en tâche 1 point 6 : il se relit à chaque relèvement du plancher Handbook, pas à chaque bump de schéma. Ne pas l'ajouter à la checklist `Bumper ADRENALINE_SCHEMA_VERSION touche 4 emplacements` — c'est un autre axe de version, et mélanger les deux enverrait le prochain bump de schéma relire une ligne qui ne le concerne pas.
5. Compléter le `CHANGELOG.md` sous `## [Unreleased]`, section `### Added` : contrôles de présence de jetons, de clés d'assets et de plancher Handbook.

## Test acceptance criteria

| Task | Acceptance criteria                                                                                                                                     |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `grep -nE '"[0-9]+\.[0-9]+\.[0-9]+"' tools/validate-handbook-pack.ts` ne renvoie que deux lignes : le plancher `2.7.0` ajouté ici, et le littéral `"0.2.1"` du fixture de self-test déjà présent l. 291. Aucune version de pack n'est écrite dans le contrôle lui-même. |
| 1    | Retirer `--adrenaline-panel` de `style.light.note` dans `pack.json` fait échouer `npm run validate:pack` avec un message nommant le jeton et la couche.  |
| 1    | Ajouter un jeton `--adrenaline-page-texture` à `style.light.workspace` fait échouer `npm run validate:pack`.                                             |
| 1    | Retirer la clé `dark-organic` de `assets.images` fait échouer `npm run validate:pack` en nommant la clé manquante.                                       |
| 1    | Ramener `minimumHandbookVersion` à `2.6.0` fait échouer `npm run validate:pack`.                                                                         |
| 1    | `npm run validate:pack` accepte le `pack.json` courant, inchangé, et sort en succès — `base.workspace` vide compris.                                     |
| 1    | Porter `minimumHandbookVersion` à `2.10.0` laisse `npm run validate:pack` en succès : la comparaison est numérique, pas lexicale. |
| 2    | `npm run validate:handbook` refuse les quatre nouveaux manifestes dégradés, chacun avec un message nommant le champ fautif, et exécute toujours les six refus existants. |
| 3    | `npm run check` sort en succès de bout en bout.                                                                                                          |
| 3    | Le `CLAUDE.md` du dépôt porte l'entrée sur la forme du pack, et une entrée distincte sur le plancher `2.7.0` de `validate-handbook-pack.ts` ; la checklist `ADRENALINE_SCHEMA_VERSION` compte toujours quatre emplacements. |
