---
objective: "Le corpus Adrenaline distribué représente, en JSON et TOML, les refus PJ dont le nom ou les protections obligatoires sont absents."
status: in-progress
---

# Plan: Ajouter les refus PJ nom absent et protections absentes

## Overview

| Field | Value |
| --- | --- |
| **Goal** | Ajouter quatre fixtures de refus canoniques, deux défauts prouvés dans chacun des formats publics, puis les indexer et les valider. |
| **Source** | Issue GitHub [RebelliousSmile/schema-adrenaline#7](https://github.com/RebelliousSmile/schema-adrenaline/issues/7). |

## Phases

| # | Phase | File |
| --- | --- | --- |
| 1 | Fixtures de refus PJ et manifeste canonique | [phase-1.md](./phase-1.md) |

## Resources

| Source | Verified |
| --- | --- |
| https://github.com/RebelliousSmile/schema-adrenaline/issues/7 | Le consommateur attend deux défauts PJ métier absents du corpus ; l’âge textuel relève uniquement de la tolérance Handbook. |
| https://github.com/RebelliousSmile/schema-adrenaline/blob/main/corpus/cases.json | Le manifeste public indexe chaque fixture JSON et TOML avec cible, format et verdict. |

## Decisions

| Decision | Why |
| --- | --- |
| Représenter chacun des deux défauts dans les deux formats publics, soit quatre fixtures `reject`. | Les codecs JSON et TOML sont tous deux contractuels ; aucune conversion d’un refus ne doit masquer l’absence d’un champ obligatoire. |
| Partir d’un PJ autrement complet et retirer un seul champ requis par fixture. | Chaque refus reste lisible, isolé et attribuable au défaut annoncé par son nom de fichier. |
