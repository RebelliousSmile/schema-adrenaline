---
objective: "Le contrat Adrenaline représente sans perte les données portables visibles sur les fiches Zombiology PJ, PNJ et Monstre, tout en gardant l'état de partie et le rendu explicitement séparés."
status: in-progress
---

# Plan: Parité des fiches Zombiology et du schéma Adrenaline

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Résorber les écarts sémantiques relevés sur les références PJ, PNJ et Monstre, avec une évolution de contrat compatible et consommable. |
| **Source** | Demande utilisateur du 23 septembre 2026 et `C:/Users/fxgui/Documents/Perso/RPG/zombiology/_sources/Design/{pj,pnj,monstre}.jpg`. |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Inventaire normatif et frontières de données | [`phase-1.md`](./phase-1.md) |
| 2 | Contrat de profil et deltas d'état Monstre | [`phase-2.md`](./phase-2.md) |
| 3 | État de partie et corpus canonique | [`phase-3.md`](./phase-3.md) |
| 4 | Publication versionnée et adoption des consommateurs | [`phase-4.md`](./phase-4.md) |

## Resources

| Source | Verified |
| --- | --- |
| `C:/Users/fxgui/Documents/Perso/RPG/zombiology/_sources/Design/pj.jpg` | La feuille PJ porte paramètres, compétences/formations, identité, caractéristiques, équipement/protections et compteurs de partie. |
| `C:/Users/fxgui/Documents/Perso/RPG/zombiology/_sources/Design/pnj.jpg` | La carte PNJ confirme le profil persistant complet et les compteurs de stress/malus en jeu. |
| `C:/Users/fxgui/Documents/Perso/RPG/zombiology/_sources/Design/monstre.jpg` | La carte Monstre expose un état actif, un état alternatif et des différences de santé, défense, comportement, actions et équipement. |

## Decisions

| Decision | Why |
| --- | --- |
| Distinguer dans l'inventaire « couvert », « transformation d'import », « état de partie » et « rendu ». | Une différence visuelle ne justifie pas nécessairement une propriété durable du contrat. |
| Faire évoluer le profil Monstre par une version de schéma additive et gelée. | Les répertoires de schémas publiés sont immuables ; les consommateurs épinglés doivent pouvoir continuer à lire `2.0.0`. |
| Représenter les compteurs transitoires dans une couche d'état de partie distincte du profil. | Stress, malus et blessures varient pendant une scène ; ils ne doivent pas masquer les valeurs de référence du personnage ou de la créature. |
| Publier avant toute adaptation de Lantern ou Handbook. | Les consommateurs doivent dériver leurs capacités et versions d’un contrat publié, jamais d’un repli local. |
