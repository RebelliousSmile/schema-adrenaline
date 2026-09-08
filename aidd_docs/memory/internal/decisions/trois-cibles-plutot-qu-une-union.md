# Trois cibles séparées plutôt qu'une union discriminée

- Date: 2026-09-08
- Status: Accepted

## Context

`pj`, `pnj` et `monstre` décrivent trois fiches qui partagent un socle — les
huit caractéristiques, les seuils de santé, les protections — mais divergent
franchement ensuite : un monstre n'a ni formation, ni équipement de départ, ni
paramètres de partie ; un PNJ n'exige que son nom.

## Decision

Trois cibles indépendantes, composant les mêmes sous-schémas de
`src/zod/common/`.

## Alternatives

Une union discriminée sur un champ `type` : rejeté. Pour qu'un monstre valide,
presque tout serait devenu optionnel, et `additionalProperties: false` ne
rattrape pas la validation ainsi perdue — il refuse les clés inconnues, pas les
clés absentes. Un PJ sans caractéristiques aurait validé.

## Consequences

Rend chaque schéma strict sur son propre domaine : les cas de refus de
`tests/refus/` s'appuient là-dessus (`formations-sur-creature.json`,
`caracteristique-manquante.json`). Rend plus coûteux un changement du socle,
qui doit être régénéré sur les trois cibles — le coût est absorbé par
`src/zod/common/`, où le changement ne s'écrit qu'une fois. Les sous-schémas
partagés sont inlinés dans chaque fichier généré : draft-7 en cible Zod n'émet
ni `$ref` ni `$defs`, la duplication est donc attendue.
