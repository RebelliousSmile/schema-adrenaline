---
objective: "Le paquet schema-adrenaline 6.4.0 publie une cible `relations`, une feuille A4 séparée de la fiche PJ : ligne d'en-tête personnage, joueur et partie, autres PJ sans modificateur, PNJ numérotés avec attitude, lien, liens croisés et compteur de tests de drame. Le tout est validé, présenté et documenté."
status: implemented
---

# Plan: Feuille de relations de l'Adrenaline System

## Overview

| Field      | Value |
| ---------- | ----- |
| **Goal**   | Ajouter au socle `adrenaline` une quatrième cible, `relations` : contrat Zod et JSON Schema, corpus, codecs, présentation papier A4 et documentation, sous une nouvelle base 6.4.0. |
| **Source** | Le brief issu de `/aidd-refine:01-brainstorm` (2026-11-20), complété le même jour par une demande de l'utilisateur : une ligne d'en-tête pour le nom du personnage, le nom du joueur et le nom de la partie. |

## Phases

| #   | Phase                                        | File                         |
| --- | -------------------------------------------- | ---------------------------- |
| 1   | Contrat de données `relations` et base 6.4.0 | [`phase-1.md`](./phase-1.md) |
| 2   | Présentation papier de la feuille            | [`phase-2.md`](./phase-2.md) |
| 3   | Documentation et suivi des consommateurs     | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| _Zombiology 1 — Contamination_, livre de base (`Documents/Perso/RPG/zombiology/_sources/regles/Z1L01_Zombiology__1_Contamination_Ldb.pdf`), folios 48 et 61 | Il y a cinq niveaux d'attitude, chacun avec un modificateur fixe aux tests d'Arme sociale. Ce modificateur dépend de l'attitude de la cible envers celui qui teste. Les valeurs se relisent dans le livre au moment de coder : elles ne sont jamais recopiées ici. |
| Même livre, folio 123 (session zéro) | Il existe trois types de lien entre personnages : familial, amitié et travail. |
| Même livre, folios 85, 86 et 128 | L'attitude change en jeu. L'attitude « amoureuse » ne fait pas partie des cinq niveaux. L'exemple du folio 128 confirme le sens du modificateur. |
| Même livre, folio 207 | Le test de drame est un jet du MJ, sans rapport mécanique avec le nombre de PNJ morts. On compte donc les tests faits ; on ne les déduit pas. |

## Decisions

| Decision | Why |
| -------- | --- |
| `relations` est une cible à part du socle `adrenaline`. Elle n'est ni imbriquée dans `pj`, ni rangée sous `zombiology`. | Le brief demande un document séparé. Le dépôt préfère des cibles séparées à une union (`trois-cibles-plutot-qu-une-union.md`), et attitude, lien et test de drame relèvent du moteur, pas d'un jeu. |
| Le modificateur social n'est pas stocké. On le déduit de l'attitude grâce à une table `ATTITUDE_LEVELS`, publiée dans la présentation comme `THRESHOLD_LEVELS`. | Le dépôt stocke d'habitude les valeurs lues : c'est un écart assumé. Ici le modificateur est entièrement déterminé par l'attitude, et le saisir permettrait d'écrire une valeur qui contredit la règle. |
| La capacité de la page A4 est inscrite dans le contrat : 4 emplacements pour les autres PJ, 10 PNJ, et tous les textes bornés. Quand la feuille est pleine, on ouvre un second document. Les numéros de PNJ vont de 1 à 99. | Une feuille papier a une contenance finie, comme la page de notes du PJ. Avec des numéros jusqu'à 99, une seconde feuille peut poursuivre la numérotation et renvoyer aux PNJ de la première. |
| Le numéro de PNJ est explicite et stable. Le schéma ne vérifie pas qu'il est unique, ni que les numéros cités existent. | `.refine()` est interdit dans le dépôt, et draft-7 ne sait pas exprimer l'unicité d'une propriété entre les éléments d'un tableau. Attribuer le prochain numéro libre est le travail de l'éditeur. |
| La version 6.4.0 est mineure. Elle est bumpée avant la première génération. | La cible est additive : le contrat 6 et le TOML 1.0.0 ne changent pas. Générer sous 6.3.0 écrirait dans un gel déjà publié, qu'on ne réécrit jamais. |
| `block:adrenaline-relations` reste hors de `requires` dans `handbook/adrenaline/pack.json`. | Le schéma s'étend avant que les consommateurs l'adoptent. Ajouter la capacité au pack l'imposerait à Handbook avant qu'il sache la rendre. |
