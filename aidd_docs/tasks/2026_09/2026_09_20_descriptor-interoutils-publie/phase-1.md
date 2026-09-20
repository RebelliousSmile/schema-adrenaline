---
status: done
---

# Instruction: Contrat du descripteur et validation locale

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
.
├── cross-tool-provider.json       ✏️ annoncer le manifeste de corpus réel et contractVersion 2
└── tools/
    └── validate-packs.ts          ✏️ vérifier les champs consommés du descripteur et leurs chemins publiés
```

## User Journey

```mermaid
flowchart TD
  A[Consommateur lit cross-tool-provider.json] --> B[corpus/cases.json]
  A --> C[contractVersion 2]
  A --> D[handbook/*/pack.json]
  B --> E[Corpus trouvé]
  C --> F[Contrat identifié]
  D --> G[Pack validé]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    system: charger le descripteur et les constantes du contrat => sources de vérité disponibles: 5: cli
  section Happy path
    system: valider le descripteur déclaré => corpus réel version de contrat et manifeste de pack sont cohérents: 5: cli
  section Edge case - chemin de corpus obsolète
    system: remplacer le corpus par corpus/contract/cases.json dans une copie de test => la validation refuse le descripteur: 1: cli
```

## Tasks to do

### `1)` Corriger les métadonnées publiées

> Faire correspondre le descripteur aux fichiers et à la version du contrat qu'il annonce.

1. Remplacer le chemin de corpus inexistant par `corpus/cases.json`.
2. Ajouter `contractVersion` avec la valeur du contrat Adrenaline actuel.
3. Conserver les capacités, le motif de manifeste Handbook et la commande de validation existants.

### `2)` Refuser les dérives du descripteur

> Étendre le validateur piloté par le descripteur afin que les champs consommés par les outils croisés ne soient plus décoratifs.

1. Lire et typer `corpus` et `contractVersion` avec les champs déjà consommés.
2. Vérifier que la version est celle de `ADRENALINE_CONTRACT_VERSION`, que le corpus est un chemin relatif sûr vers un fichier, et qu'il peut être lu comme manifeste de corpus.
3. Conserver la découverte des packs depuis `packManifest`, et ajouter une auto-vérification qui refuse le chemin de corpus historique.

## Test acceptance criteria

| Task | Acceptance criteria |
| ---- | ------------------- |
| 1 | `cross-tool-provider.json` annonce `corpus/cases.json` et la version majeure du contrat effectivement publiée. |
| 1 | Les capacités Handbook et Lantern, le motif de pack et la commande de validation restent inchangés. |
| 2 | `npm run validate:packs` échoue si le corpus est absent, sort du dépôt, n'est pas un manifeste lisible ou si `contractVersion` diverge du contrat exporté. |
| 2 | La validation locale refuse explicitement le chemin historique `corpus/contract/cases.json`. |
