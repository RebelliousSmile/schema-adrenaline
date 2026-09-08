# Les enums décrivent la forme ; tout catalogue reste une chaîne libre

- Date: 2026-09-08
- Status: Accepted

## Context

Une fiche nomme des formations, des métiers, des armes, des avantages, des
traits de caractère, des types d'infecté. Fermer ces listes rendrait la
validation plus stricte. Elles sont aussi du contenu éditorial sous copyright,
et s'allongent à chaque supplément.

## Decision

Est fermé ce que le moteur fixe : les huit clés de caractéristique, les douze
localisations de la table du d100, les quatre seuils de dégât, les trois types
de formation, les quatre types de publication. Tout le reste est `z.string()`.

## Alternatives

Énumérer les catalogues publiés : rejeté sur deux motifs indépendants. Il fige
une liste que l'éditeur fait évoluer, donc chaque supplément casserait la
validation des fichiers existants. Et il reproduit du contenu éditorial dans un
dépôt public sous MIT, ce que la licence du dépôt ne couvre pas — le risque
vaut aussi pour l'adaptation d'un univers tiers déclarée dans `GAMES`.

## Consequences

Rend les schémas utilisables par un jeu maison ou une adaptation sans les
modifier. Rend impossible d'attraper une faute de frappe dans un nom d'arme :
c'est au consommateur de tenir son propre catalogue. Fixe la règle d'arbitrage
écrite dans `CONTRIBUTING.md` : fermer ce que le moteur fixe, laisser ouvert ce
qu'un éditeur écrit. Contraint aussi les fichiers d'`examples/`, qui ne doivent
recopier aucun matériel publié.
