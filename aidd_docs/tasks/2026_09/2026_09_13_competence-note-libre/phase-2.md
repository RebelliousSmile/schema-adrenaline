---
status: done
---

# Instruction: Rendu de la note de compétence (Handbook)

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
handbook-zombiology-phase2/
└── src/features/
    ├── adrenaline/document.ts          ✏️ Competence.notes?: string
    ├── adrenalinePj/renderer.ts        ✏️ sous-ligne notes dans l'entrée compétence
    ├── adrenalinePnj/renderer.ts       ✏️ idem
    └── adrenalineMonstre/renderer.ts   ✏️ idem (ligne `capabilities`)
```

## Tasks to do

### `1)` Étendre le type et le parsing Competence

> Le type TypeScript et le parseur runtime reflètent tous deux le nouveau champ.

1. Dans `src/features/adrenaline/document.ts`, ajouter `notes?: string;` à l'interface `Competence` (ligne ~54-61), juste après `avantages`.
2. Dans `readCompetences()` (ligne ~261) : ajouter `"notes"` à la liste `warnUnknownKeys` (ligne ~266), sinon chaque compétence portant `notes` déclenche un warning "unknown key".
3. Toujours dans `readCompetences()` : après `if (avantages.length > 0) competence.avantages = avantages;` (ligne ~282), ajouter `const notes = asString(record.notes); if (notes) competence.notes = notes;` — sans cette extraction, `notes` reste absent de l'objet `Competence` même présent dans le TOML source, et la tâche 2 n'aurait rien à afficher.

### `2)` Afficher la note en sous-ligne

> La note de compétence apparaît sous l'entrée, comme les avantages.

1. Dans `adrenalinePj/renderer.ts` et `adrenalinePnj/renderer.ts` : dans la construction de `subLines` de chaque compétence, ajouter `if (competence.notes) subLines.push(competence.notes);` après la ligne des avantages.
2. Dans `adrenalineMonstre/renderer.ts`, fonction `capabilities()` (ligne ~71) : ajouter `competence.notes` comme élément du tableau `details`, juste après `...(competence.avantages ?? [])`, avant le `.filter((value): value is string => Boolean(value))` — le filter existant élimine déjà la valeur si `notes` est absent, aucune condition supplémentaire à écrire.

## Test acceptance criteria

| Task | Acceptance criteria                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------ |
| 1... | `tsc -noEmit` passe ; une compétence TOML portant `notes` produit un `Competence.notes` peuplé (pas seulement absent de warning). |
| 2... | Une compétence avec `notes` rempli affiche la note en sous-ligne (PJ/PNJ) ou dans sa ligne (Monstre) ; une compétence sans `notes` ne montre aucune ligne vide. |
