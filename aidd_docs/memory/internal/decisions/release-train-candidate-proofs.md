# Les promotions de release exigent des preuves consommateurs sur la même candidate

- Date: 2026-09-22
- Status: Accepted

## Context

Une release GitHub immuable prouve l'identité finale du paquet, mais pas que
Lantern et Handbook ont effectivement résolu cette même archive ou exercé leurs
parcours de rendu et de bundle propriétaires.

## Decision

Chaque promotion référence un manifeste versionné qui fixe l'URL HTTPS et le
SHA-256 de l'archive candidate, le commit fournisseur, le tag final et les
commits complets Lantern et Handbook. L'orchestrateur ne peut lancer que la
commande `release-train:assert` des consommateurs et refuse toute référence
mutable ou commande injectée. La release finale télécharge puis attache les
octets SHA-vérifiés de cette candidate; elle ne reconstruit pas l'asset.

La CI inter-outils quotidienne reste une porte de baseline distincte. Les
adaptateurs, lockfiles et preuves de rendu restent dans les consommateurs.

## Consequences

Un tag final n'est promouvable qu'après les deux preuves machine-readable
correspondantes. La provenance de l'archive et des consommateurs est
consultable dans le manifeste et les artefacts du workflow.
