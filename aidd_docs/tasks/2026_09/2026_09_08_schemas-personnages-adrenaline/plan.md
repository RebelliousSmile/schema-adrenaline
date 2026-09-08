---
objective: "Le dépôt publie trois schémas de personnage du socle Adrenaline System — pj, pnj, monstre — générés depuis Zod, chacun validé par deux exemples, `npm run check` affichant six lignes `✓` sans avertissement."
status: implemented
---

# Plan: Schémas de personnages Adrenaline System

## Overview

| Field      | Value                                                                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**   | Poser les trois premières cibles du dépôt (`pj`, `pnj`, `monstre`) sous une entrée `GAMES` `adrenaline`, en décrivant la forme des fiches et non le contenu du jeu. |
| **Source** | Brief de brainstorm produit en session le 2026-09-08 (non persisté), adossé au livre de base Zombiology et aux deux générateurs web.       |

## Phases

| #   | Phase                                               | File                         |
| --- | --------------------------------------------------- | ---------------------------- |
| 1   | Référence des cartouches → `reference-cartouches.md` | [`phase-1.md`](./phase-1.md) |
| 2   | Socle Zod et cible `pj`        | [`phase-2.md`](./phase-2.md) |
| 3   | Cible `pnj`                    | [`phase-3.md`](./phase-3.md) |
| 4   | Cible `monstre` et publication | [`phase-4.md`](./phase-4.md) |

## Resources

| Source                                                                                                  | Verified                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `~/Documents/Perso/RPG/zombiology/_sources/regles/zombiology_part_01.pdf`                                | Les seuils de santé sont **Superficiel / Léger / Grave / Profond**, physiques comme mentaux. La Feuille de PJ se décompose en blocs Paramètres de jeu, Compétence, Caractéristique, Équipement, Santé, Identité. |
| `~/Documents/Perso/RPG/zombiology/_sources/regles/Z1L01_Zombiology__1_Contamination_Ldb.pdf`             | Livre de base complet, autorité désignée en cas de divergence. 62 Mo, à découper avant lecture.                                                                        |
| https://www.adrenalinesystem.com/creation-de-pj                                                          | Le générateur borne armes et avantages à 3 entrées et propose 6 emplacements de protection physique et 6 de protection mentale. Ses libellés de seuils sont fautifs — le PDF prime. |
| https://www.adrenalinesystem.com/creation-de-zombie                                                      | Le cartouche monstre porte corps, état stimulé, type d'infecté, comportement, zone de détection, déplacement, SP et ND — jamais de formation ni de compétence chiffrée. |
| `~/Documents/Perso/RPG/zombiology/_sources/regles/Z1L05_Livret PNJ et animaux.pdf`                       | Source des formes de cartouche PNJ, à lire en phase 1.                                                                                                                 |
| `~/Documents/Perso/RPG/zombiology/_sources/regles/*.md` — `part_01_resume.md` à `part_06_resume.md`, `ZOMBIOLOGY_REGLES_COMPLETES.md`, `adrenaline-d100.md`, `template_pnj.md` | 86 Ko d'extractions markdown déjà faites, vérifiées présentes. `template_pnj.md` donne la forme du cartouche PNJ champ par champ — ND, identité, rôle narratif, personnalité, attitude PJ, stats, compétences clés, équipement, infos MJ, réplique. Point d'entrée de la phase 1 ; le PDF ne sert plus qu'à trancher les divergences. |
| https://zod.dev/json-schema                                                                              | Comportement de `z.toJSONSchema` en cible draft-7, confirmé par sonde sur la version 4.3.6 installée : `additionalProperties: false` est émis à tous les niveaux, les sous-schémas réutilisés sont inlinés sans `$ref`, un `.refine()` disparaît entièrement, et une intersection `.and()` produit un `allOf` insatisfiable. |

## Decisions

| Decision                                                                            | Why                                                                                                                                                                            |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Les trois cibles vivent sous une entrée `GAMES` `adrenaline`, pas sous `zombiology`. | Elles décrivent le socle du système, qui sert l'horreur au sens large. Le dossier de jeu détermine le chemin du fichier généré et l'`$id` qu'il porte ; ranger d'abord sous `zombiology` obligerait à changer les deux plus tard. |
| Chaque schéma porte un `$id`, posé via `.meta({ $id })` sur l'objet racine. | Sans `$id`, un schéma n'a pas d'identité propre et ne peut être référencé par un outil tiers. Vérifié sur Zod 4.3.6 : `.meta({ $id })` typecheck en strict, émet bien `$id` en draft-7, et Ajv le compile. À l'inverse `.meta({ id })` émet `id`, une clé draft-4 qu'Ajv ignore en silence. |
| L'`$id` pointe `main` — donc « dernière version », pas une version figée. | Un `$id` sous `main` change de contenu sans changer d'identifiant : c'est assumé tant que le dépôt est en 0.x et qu'aucun outil tiers ne consomme les schémas. Le jour du premier tag, ajouter un `$id` versionné à côté et le noter au `CHANGELOG.md` ; ne pas inventer aujourd'hui une URL de tag qui ne résout pas. |
| Trois cibles séparées plutôt qu'une union discriminée.                              | Un monstre n'a ni formation ni équipement de départ. Une union unique rendrait presque tout optionnel, et `additionalProperties: false` ne rattraperait pas la validation perdue. |
| Le schéma décrit la fiche remplie, dérivés stockés.                                 | JSON Schema ne calcule pas. Stocker SP, SM, PP et ND rend un fichier lisible seul, sans moteur de règles.                                                                        |
| Les enums se limitent à la forme ; tout catalogue reste chaîne libre.               | Les listes de formations, métiers, armes et avantages sont du contenu éditorial sous copyright, et changent à chaque supplément. La table de localisation du d100, elle, est de la mécanique. |
