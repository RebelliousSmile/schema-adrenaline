---
status: pending
---

# Instruction: Prévisualisation locale dans Handbook

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
../handbook/src/features/adrenaline{Pj,Pnj,Monstre}/{parser,schema,renderer,shape}.ts ✏️ décodage et rendu local des métadonnées du brouillon
../handbook/src/features/adrenaline/{document,view}.ts             ✏️ primitives communes des trois fiches
../handbook/src/styles/adrenaline/_*.scss                       ✏️ styles pilotés par les tokens du brouillon
../handbook/tools/assertAdrenalineZombiologyStyle.harness.mts  ✏️ vérification des trois fiches
```

## User Journey

```mermaid
flowchart TD
  A[Contrat brouillon validé] --> B[Branchement Handbook local réversible]
  B --> C[Ouvrir la note de test réelle]
  C --> D[Comparer PJ PNJ et monstre aux JPG]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    Relier localement le schéma brouillon à Handbook => trois blocs actifs: 5: cli
  section Happy path
    Ouvrir la note de test => trois fiches rendues: 5: browser
    Comparer les JPG => sections et styles observables: 5: browser
  section Edge case - valeurs absentes
    Retirer la fatigue et les états du TOML => cases vides sans données inventées: 1: browser
  section Teardown
    Retirer le lien local provisoire => installation Handbook restaurée: 5: cli
```

## Wireframe

```txt
┌──────────────────────────────────────┐
│ (1) Note de test                      │
├──────────────────────────────────────┤
│ (2) Fiche PJ rendue                   │
├──────────────────────────────────────┤
│ (3) Fiche PNJ rendue                  │
├──────────────────────────────────────┤
│ (4) Fiche monstre rendue              │
└──────────────────────────────────────┘
```

1. Note : le fichier Markdown existant reste la cible de contrôle.
2. PJ : mise en page complète et champs de santé.
3. PNJ : carte compacte et sections narratives.
4. Monstre : état principal et état alternatif.

## Tasks to do

### `1)` Brancher le brouillon sans le livrer

> L'utilisateur doit voir le résultat dans sa note avant toute version officielle.

1. Utiliser une dépendance locale ou un mécanisme équivalent réversible, sans changer le paquet publié ni la note de test.
2. Adapter décodage et rendu des trois fiches aux sections, blocs et styles du schéma ; les adaptateurs restent propres à Handbook.
3. Préserver les valeurs des TOML existants et afficher des cases vides lorsque les compteurs sont absents.

### `2)` Vérifier visuellement

> La comparaison porte sur les JPG d'origine et les corrections demandées, pas sur le HTML autonome.

1. Ouvrir `Test Handbook — Adrenaline.md` dans l'environnement Handbook et contrôler les trois fiches, y compris à largeur réduite.
2. Documenter les écarts observés et itérer localement jusqu'à une prévisualisation présentable.
3. Débrancher tout lien temporaire après vérification sans perdre les modifications de code prêtes pour la phase 4.

## Test acceptance criteria

| Task | Acceptance criteria |
| --- | --- |
| 1 | Les trois blocs se rendent dans la note réelle à partir du contrat local, sans publication ni altération du Markdown ; aucun min/max n'apparaît sur la fiche. |
| 2 | Les références JPG et la prévisualisation locale sont comparables, les cases absentes restent vides, et le branchement provisoire est réversible. |
