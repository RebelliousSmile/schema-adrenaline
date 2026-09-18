---
status: pending
---

# Instruction: Contrat déclaratif optionnel des actions

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
schema-adrenaline/
├── handbook/
│   └── adrenaline/
│       └── pack.json                         ✏️ publier les actions contextuelles du pack
├── src/
│   └── …                                    ✏️ exposer et valider les métadonnées de contrat si nécessaire
├── schemas/adrenaline/2.0.0/
│   └── …                                    ✏️ régénérer les artefacts contractuels concernés
└── tools/
    └── …                                    ✏️ vérifier catalogue, manifeste et métadonnées d’actions
```

## User Journey

```mermaid
flowchart TD
  A[Mainteneur d'un pack] --> B[Déclare ses actions contextuelles optionnelles]
  B --> C[Le catalogue référence le manifeste du pack]
  C --> D[Les contrôles valident les identifiants et les cibles]
  D --> E[Le contrat est prêt à être publié]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    system: charger le catalogue et le manifeste Adrenaline => contrat 2.0.0 disponible: 5: cli
  section Happy path
    system: lire les actions contextuelles publiées => chaque action cible un bloc et une opération supportée: 5: cli
  section Edge case - pack sans action
    system: charger un pack qui ne déclare aucune action => contrat valide et liste vide: 5: cli
```

## Tasks to do

### `1)` Modéliser les métadonnées publiées

> Définir une capacité optionnelle, indépendante de tout pack particulier, qui identifie l’action, le bloc cible, son libellé, son icône et son opération générique.

1. Relever les opérations déjà rendues pour schema-in-the-mist dans Handbook.
2. Ajouter au manifeste Adrenaline les déclarations compatibles sans encoder d’adaptateur Obsidian.
3. Documenter les invariants d’identifiant, de bloc cible et d’absence d’action.

### `2)` Verrouiller le contrat et ses artefacts

> Garantir que la capacité publiée est découverte depuis le catalogue et le manifeste référencé.

1. Étendre les contrôles de source pour lire les métadonnées via le manifeste du pack.
2. Régénérer les artefacts gelés seulement lorsqu’ils sont concernés par le contrat.
3. Couvrir les déclarations Adrenaline et l’absence de déclaration d’un autre pack.

## Test acceptance criteria

| Task | Acceptance criteria |
| ---- | ------------------- |
| 1 | Un pack peut publier zéro ou plusieurs actions contextuelles sans dépendre de schema-in-the-mist. |
| 2 | Les contrôles rejettent une action dont l’identifiant, l’opération ou le bloc cible ne correspond pas au manifeste publié. |

