---
objective: "Chaque pack de schéma peut publier ses actions de menu contextuel de façon optionnelle, et Handbook affiche les actions Adrenaline depuis le contrat 2.0.0 publié, avec la même couverture fonctionnelle que schema-in-the-mist."
status: pending
---

# Plan: Publier et afficher les actions contextuelles des packs

## Overview

| Field | Value |
| ----- | ----- |
| **Goal** | Décrire les actions contextuelles par pack dans le contrat publié, puis laisser Handbook les découvrir et les rendre sans logique Adrenaline codée en dur. |
| **Source** | Demande utilisateur : « les mêmes que pour schema-in-the-mist », avec schema-in-the-mist comme référence d’implémentation non normative. |

## Phases

| # | Phase | File |
| --- | ----- | ---- |
| 1 | Contrat déclaratif optionnel des actions | [`phase-1.md`](./phase-1.md) |
| 2 | Release immuable du contrat Adrenaline | [`phase-2.md`](./phase-2.md) |
| 3 | Découverte et rendu génériques dans Handbook | [`phase-3.md`](./phase-3.md) |

## Decisions

| Decision | Why |
| -------- | --- |
| Les actions contextuelles sont une capacité optionnelle publiée par chaque pack, et non une règle imposant un pack pilote. | Les schémas peuvent continuer à expérimenter indépendamment ; schema-in-the-mist sert uniquement de référence fonctionnelle actuelle. |
| Le contrat publie les métadonnées de présentation et d’identification ; Handbook conserve l’exécution, les adaptateurs Obsidian et les contrôles d’activation. | Cela respecte la séparation contrat/présentation, évite les fallbacks propres à Adrenaline et garde les préoccupations runtime dans le consommateur. |
| Handbook adopte uniquement une release Adrenaline immuable et résolue depuis le catalogue puis le manifeste référencé. | La règle inter-dépôts impose la publication avant consommation et la vérification ne doit pas figer un numéro de version du producteur. |
