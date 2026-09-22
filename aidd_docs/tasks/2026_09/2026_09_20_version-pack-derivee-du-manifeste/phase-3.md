---
status: pending
---

# Instruction: fermer la boucle sur l'issue amont

## Architecture projection

```txt
.
└── (hors dépôt)
    └── RebelliousSmile/obsidian-handbook#35   ✏️ corps réécrit, résolution consignée, issue fermée
```

Aucun fichier du dépôt n'est modifié dans cette phase : elle solde une dette d'information, pas une dette technique. Le `status` du plan n'y est pas touché non plus — cette transition appartient à la couche d'orchestration, pas à une tâche de phase.

## Tasks to do

### `1)` Réécrire le corps de l'issue #35

> Le corps déposé à la création est illisible ; il ne dit ni la cause ni où est le correctif.

1. Constat à consigner tel quel : le corps de #35 contient des `\n` littéraux, un caractère `^G` à la place d'un backtick, et s'arrête au milieu d'une phrase. Reproduit à l'identique via `gh issue view --json body` et `gh api`, donc ce n'est pas un artefact d'affichage.
2. Rédiger un corps qui porte les quatre faits établis : la CI de `schema-adrenaline` dérive sa ref de checkout de `minimumHandbookVersion` (`2.7.0`) ; le harnais `assertAdrenalineSource` de cette balise fige `assert.equal(gamePlugin.version, "0.2.0")` ligne 21 ; le pack vaut désormais `0.3.0` ; le script a été supprimé en amont le 2026-09-15 par `7b374c3` et n'existe plus depuis `v2.10.0`.
3. En tirer la conclusion explicite : la balise étant immuable, aucun correctif amont ne peut atteindre l'assertion — le correctif est dans `schema-adrenaline`, phases 1 et 2 de ce lot.
4. Signaler la dette voisine sans la confondre avec #35 : Handbook épingle `schema-adrenaline` sur le tarball **v1.0.0** quand ce dépôt est en 2.2.0, donc `assert:adrenaline-contract` valide un contrat périmé. `obsidian-handbook#36` est le **précédent** du même motif sur `schema-pbta`, déjà fermé par un bump de pin — ne pas le présenter comme un ticket jumeau ouvert sur Adrenaline. Vérifié le 2026-09-20 sur `main`.

### `2)` Fermer l'issue après vérification

> On ferme sur une CI verte observée, pas sur une intention.

1. Ne fermer qu'une fois la CI de `schema-adrenaline` verte sur la branche du lot, phases 1 et 2 fusionnées.
2. Le commentaire de clôture nomme le commit de `schema-adrenaline` qui retire l'appel, et dit ce que la couverture devient : forme du manifeste reprise par `validate:pack`, aller-retour bloc → TOML → Zod abandonné côté source.
3. Écriture sortante sur un dépôt public : soumettre le texte du corps et du commentaire à l'utilisateur avant de poster, et ne pas fermer l'issue sans son accord explicite.

## Test acceptance criteria

| Task | Acceptance criteria                                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `gh issue view 35 --repo RebelliousSmile/obsidian-handbook` rend un corps lisible, sans `\n` littéral ni caractère de contrôle, qui nomme le harnais gelé et le commit `7b374c3`. |
| 1    | Le corps dit que le correctif est dans `schema-adrenaline` et renvoie à #36 comme défaut distinct.                                          |
| 2    | L'issue #35 n'est fermée qu'après un run CI vert observé sur `schema-adrenaline`, et l'utilisateur a validé le texte posté.                 |
