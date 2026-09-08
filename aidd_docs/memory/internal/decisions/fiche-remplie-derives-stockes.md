# Le schéma décrit la fiche remplie : les valeurs dérivées sont stockées

- Date: 2026-09-08
- Status: Accepted

## Context

Le moteur dérive plusieurs valeurs imprimées sur la feuille : les seuils de
dégât se calculent depuis la solidité et deux caractéristiques, le total d'une
compétence est la somme de son pourcentage et de la caractéristique visée, le ND
d'une créature additionne trois composants. JSON Schema ne calcule rien.

## Decision

Les valeurs dérivées sont stockées telles que lues sur la feuille, jamais
recalculées ni vérifiées.

## Alternatives

Ne stocker que les entrées et laisser le consommateur dériver : rejeté. Un
fichier cesserait d'être lisible seul, il faudrait un moteur de règles pour
l'afficher. Surtout, deux fiches publiées s'écartent de la dérivation d'un
point : la règle imprimée et la règle appliquée ne coïncident pas, et c'est la
feuille qui fait foi.

Vérifier la cohérence par une contrainte de schéma : impossible en draft-7 pour
le total d'une compétence, dont la dépendance vit dans un autre bloc du
document. Écrire un `.refine()` aurait été pire que rien : en Zod 4 il rend un
`ZodObject`, passe le typecheck, et disparaît sans trace du JSON généré.

## Consequences

Rend un fichier autonome et lisible sans moteur. Laisse passer un document
incohérent — un `total` faux valide. La description publiée de `total` dit
explicitement qu'un consommateur doit recalculer la valeur plutôt que la croire.
`tools/audit-schemas.ts` interdit `.refine()` dans les sources pour que
personne ne croie avoir posé la contrainte manquante.
