# Les cibles de personnage vivent sous `adrenaline`, pas sous `zombiology`

- Date: 2026-09-08
- Status: Accepted

## Context

`GAMES` déclare deux entrées, `zombiology` et `rdt`. Les trois premières cibles
— `pj`, `pnj`, `monstre` — décrivent une fiche de personnage. Le dossier de jeu
détermine à la fois le chemin du fichier généré et l'`$id` qu'il porte : le
choix n'est donc pas cosmétique, il fixe l'identité publique du schéma.

## Decision

Les trois cibles sont rangées sous une entrée `adrenaline`, qui n'est pas un jeu
mais le moteur. Un dossier de jeu ne contient que ce qui est propre à ce jeu.

## Alternatives

Ranger sous `zombiology`, le seul jeu publié à ce jour : rejeté, parce que
l'adaptation d100 de La Roue du Temps tourne sur le même moteur et partagerait
les mêmes fiches. Il aurait fallu déplacer les fichiers et casser les `$id` au
moment d'ajouter la deuxième cible.

## Consequences

Rend facile l'ajout d'un jeu sur le même moteur : il hérite des trois cibles
sans rien copier. Rend plus exigeante la frontière à tenir lors d'un ajout de
champ — il faut trancher, à chaque fois, entre systémique et propre à un jeu.
`CONTRIBUTING.md` porte ce critère. Verrouille les huit caractéristiques, les
douze localisations et les quatre seuils comme appartenant au moteur.
