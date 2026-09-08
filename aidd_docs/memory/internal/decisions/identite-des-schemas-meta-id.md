# L'identité d'un schéma se pose avec `.meta({ $id })`, jamais `.meta({ id })`

- Date: 2026-09-08
- Status: Accepted

## Context

Sans identifiant, un schéma généré ne peut pas être cité par un outil tiers :
ni épinglé dans une configuration d'éditeur, ni référencé depuis un autre
schéma. Zod 4 accepte une clé libre dans `.meta()`, ce qui laisse passer les
deux orthographes sans le moindre avertissement.

## Decision

Chaque objet racine de cible porte `.meta({ $id: "<url raw github>" })`.

## Alternatives

`.meta({ id })` : rejeté après vérification sur Zod 4.3.6. Il émet bien une clé
`id`, mais c'est du draft-4 — **Ajv l'ignore en silence** en cible draft-7. Le
typecheck passe, la génération passe, la validation passe, et le schéma n'a
aucune identité. C'est un échec sans symptôme, le pire genre.

Ne pas poser d'identifiant du tout : rejeté, cela réserve les schémas à un usage
local alors que l'objet du dépôt est l'interopérabilité.

## Consequences

`tools/audit-schemas.ts` contrôle la présence d'un `$id` sur chaque schéma
généré, ce qui empêche la régression. Contrepartie mesurée : un `$id` interdit à
Ajv de compiler deux fois le même schéma dans une même instance — l'audit crée
donc une `new Ajv()` par compilation.
