---
status: done
---

# Instruction: Réconcilier l'historique et valider le train 2.5.0

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
.
├── .git/refs/tags/                       ❌ retirer uniquement les quatre tags locaux obsolètes sans équivalent distant
└── release-train/
    └── schema-adrenaline-v2.5.0.json    ✅ épingler la candidate v2.5.0-rc.2 et les deux commits consommateurs prouvés
```

## User Journey

```mermaid
flowchart TD
  A[Tags locaux inspectés] --> B[Tags orphelins retirés]
  B --> C[Validation de version verte]
  C --> D[Manifeste 2.5.0 commité]
  D --> E[Workflow Release train]
  E --> F[Checkout Lantern 4a63bf4]
  E --> G[Checkout Handbook 5f0b0f2]
  F --> H[Evidence Lantern]
  G --> I[Evidence Handbook]
  H --> J[Train approuvé]
  I --> J
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    cli: comparer les tags locaux, origin et les releases GitHub => seuls les tags locaux orphelins sont identifiés: 5: cli
  section Happy path
    cli: retirer les tags orphelins puis déclencher Release train avec le manifeste commité => validation fournisseur et deux evidence files réussissent: 5: cli
  section Edge case - commit ou lockfile désaligné
    cli: remplacer un pin consommateur ou son intégrité par une valeur différente => assertion consommateur ou vérification finale échoue: 5: cli
```

## Tasks to do

### `1)` Retirer les références locales qui ne sont pas des publications

> Refaire correspondre le catalogue local de tags avec les releases immuables, sans fabriquer rétroactivement un artefact de version mensongère.

1. Confirmer que `v1.0.1`, `v1.1.1`, `v2.1.0` et `v2.2.0` sont absents d'`origin` et de l'API GitHub, et que leurs `package.json` taggés annoncent respectivement `1.0.0`, `1.1.0`, `2.0.0` et `2.0.0`.
2. Supprimer uniquement ces quatre refs locales explicites ; ne supprimer aucun tag distant ni release GitHub.
3. Vérifier que l'ensemble des tags stables locaux restant correspond aux releases GitHub complètes, puis exécuter `validate:version` avec succès.

### `2)` Écrire le manifeste immutable de la release

> Enregistrer une entrée auditable qui correspond à la candidate déjà vérifiée et aux consommateurs qui l'ont adoptée.

1. Créer `release-train/schema-adrenaline-v2.5.0.json` au format protocol 1.
2. Fixer `candidate.provider` à `schema-adrenaline`, `version` à `2.5.0`, `stagingTag` à `v2.5.0-rc.2`, `finalTag` à `v2.5.0` et `providerCommit` à `31c4576bc45e1fc16e4bf6592d3f3d62e7cf8b58`.
3. Fixer l'URL et le SHA-256 de l'issue, ainsi que le SRI commun `sha512-cb/ZUmHy5LYaMQPmit7tRQIybBQWW8fFN4fgeaHZYoSZHKFuQJgIFVc3p/BhgRVhT00dT7r9DZCk7gmPMTpkjQ==`.
4. Déclarer une entrée `lantern` avec le dépôt canonique et la ref `4a63bf40102120b9bda5b60b3a6396b4e243049e`, puis une entrée `handbook` avec la ref `5f0b0f262d789831ceb823a55df3284516ffe7b2`.
5. Avant de commiter, vérifier sur `origin` que le tag `v2.5.0-rc.2` se résout bien sur `31c4576bc45e1fc16e4bf6592d3f3d62e7cf8b58`, indépendamment du champ d'affichage de la release GitHub.

### `3)` Obtenir la preuve de train réutilisable par la stable

> Ne rendre la candidate promouvable qu'après une exécution commune dont le manifeste exact est visible dans le commit.

1. Exécuter les auto-tests, la validation du manifeste et la porte fournisseur sur le commit qui contient le manifeste.
2. Déclencher manuellement `Release train` avec le chemin commité et attendre son succès.
3. Vérifier les deux artefacts d'evidence et la correspondance de leur candidate, SRI et SHA-256 avec le manifeste.
4. Consigner l'URL du run vert dans la résolution de l'issue sans modifier le manifeste après cette approbation.

## Test acceptance criteria

| Task | Acceptance criteria |
| ---- | -------------------------------- |
| 1 | Seuls `v1.0.1`, `v1.1.1`, `v2.1.0` et `v2.2.0` sont retirés du clone local ; aucune référence sur origin ni release GitHub n'est modifiée. |
| 1 | `validate:version` réussit et chaque tag stable local restant possède une release GitHub complète, immuable, avec tarball SHA-256 et checksum. |
| 2 | Le manifeste versionné désigne exactement l'asset `v2.5.0-rc.2`, son SHA-256 `62033e75384f17ee21e4e5e76d231b84c25b3fdcb0d5de74ecdbc89c94be95cc`, son SRI et les deux SHAs complets attendus. |
| 2 | La résolution distante du tag RC et le `providerCommit` du manifeste sont le même SHA complet; toute variation de version, URL, SHA-256, SRI, rôle, dépôt ou commit échoue avant l'appel d'un consommateur. |
| 3 | Le run Release train réussit pour le digest exact du manifeste commité et archive une evidence Lantern ainsi qu'une evidence Handbook au statut `passed`. |
| 3 | Le run n'acquiert aucune autorité depuis une branche, un tag consommateur ou une commande contenue dans le manifeste. |
