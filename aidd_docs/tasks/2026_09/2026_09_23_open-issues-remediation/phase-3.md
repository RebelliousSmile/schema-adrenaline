---
status: in-progress
---

# Instruction: Rendre les publications et le release-train vérifiables

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
.
├── .github/workflows/ci.yml       ✏️ ne redevient verte qu'avec les assertions locales réparées
├── release-train/                 ✏️ contient le manifeste de la candidate finale
├── .github/workflows/release.yml  ✏️ lit le manifeste du tag sans résolution Node ambiguë
├── .github/workflows/release-train.yml ✏️ installe et isole les consommateurs avant leurs preuves
└── aidd_docs/tasks/.../plan.md    ✏️ consigne les preuves observées et la clôture des tickets
```

## User Journey

```mermaid
flowchart TD
  A[Commit fournisseur + archive candidate] --> B[Preuve Lantern]
  A --> C[Preuve Handbook]
  B --> D[Train approuvé]
  C --> D
  D --> E[Manifeste final, descendant du commit fournisseur]
  E --> F[Correction de promotion vérifiée]
  F --> G[Tag final recréé avec autorisation]
  G --> H[Release avec mêmes octets]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    system: publier une candidate avec manifeste et commits immuables => train prêt à être asserté: 5: system
  section Happy path
    system: exécuter le workflow de train puis le tag final => deux preuves et une release digest-identique sont publiés: 5: system
  section Edge case - tag stable défaillant
    system: corriger le workflow sans créer d'asset puis recréer le tag autorisé => la promotion reprend depuis l'archive candidate inchangée: 1: system
```

## Tasks to do

### `1)` Corriger la reprise sûre de promotion

> Rendre lisible depuis le workflow le manifeste déjà validé, sans modifier l'archive candidate ni créer un asset supplémentaire.

1. Remplacer la résolution Node du manifeste par un chemin relatif explicite (`./release-train/...`).
2. Valider la PR et confirmer que le workflow échoué n'a créé ni draft ni asset `v2.4.0`.

### `2)` Reprendre le tag final sous contrôle

> Après autorisation explicite, faire pointer `v2.4.0` vers le commit de correction, puis laisser le workflow promouvoir l'archive RC inchangée.

1. Supprimer localement et à distance le tag sans release, puis le recréer au commit approuvé et le pousser.
2. Observer le workflow `release.yml` : train vert au même SHA, SHA-256 de l'asset candidat, tarball local équivalent, deux assets et release immuable.

### `3)` Auditer la clôture des issues


1. Vérifier le catalogue final : chaque tag conservé possède une release complète, et `v2.4.0` expose `cross-tool-provider.json`.
2. Recueillir les preuves Lantern et Handbook de l'exécution de train, puis contrôler les trois CI `main` consécutives demandées.
3. Vérifier issue par issue les critères #11, #13 à #19 et #21 ; fermer uniquement celles dont la preuve est complète.

## Test acceptance criteria

| Task | Acceptance criteria |
| ---- | ------------------- |
| 1 | Le workflow de release peut lire le manifeste sur le tag et aucun asset n'est créé par le chemin de reprise. |
| 2 | `v2.4.0` est immuable, comporte exactement le tarball candidat et son checksum, et leurs SHA-256 correspondent au manifeste. |
| 3 | Toutes les issues ciblées ont une preuve d'acceptation actuelle; les issues satisfaites sont fermées seulement après cet audit. |
