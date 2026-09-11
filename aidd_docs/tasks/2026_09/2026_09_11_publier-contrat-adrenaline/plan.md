---
objective: "Handbook et Lantern peuvent installer depuis la même GitHub Release immuable un contrat Adrenaline 1.0.0 qui expose les schémas, types, codecs JSON/TOML et le kit de conformité sans copie locale."
status: in-progress
---

# Plan: Publier le contrat Adrenaline commun

## Overview

| Field      | Value |
| ---------- | ----- |
| **Goal**   | Livrer une API ESM Adrenaline versionnée et vérifiable, distribuée comme tarball de GitHub Release pour Handbook et Lantern. |
| **Source** | Issue GitHub `RebelliousSmile/schema-adrenaline#4` — https://github.com/RebelliousSmile/schema-adrenaline/issues/4 |

## Phases

| #   | Phase | File |
| --- | ----- | ---- |
| 1   | Surface publique et codecs canoniques | [`phase-1.md`](./phase-1.md) |
| 2   | Kit de conformité et preuve du tarball | [`phase-2.md`](./phase-2.md) |
| 3   | Publication immuable et documentation des consommateurs | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| https://github.com/RebelliousSmile/schema-pbta/blob/v1.0.0/package.json | Le précédent PbtA publie une racine ESM compilée, des sous-chemins de schémas et de corpus, et limite explicitement le contenu du tarball avec `files`. |
| https://github.com/RebelliousSmile/schema-pbta/blob/v1.0.0/src/codecs/toml.ts | Un registre typé par cible peut réunir schéma, parseur et sérialiseur tout en normalisant chaque valeur avec Zod avant émission. |
| https://github.com/RebelliousSmile/schema-pbta/blob/v1.0.0/tools/validate-contract.ts | Le corpus partagé peut imposer acceptation, refus, couverture par cible et aller-retour TOML sur la valeur normalisée. |
| https://github.com/RebelliousSmile/schema-pbta/blob/v1.0.0/tools/validate-package.ts | La surface réellement distribuée se prouve en emballant puis installant le tarball dans un consommateur temporaire, au lieu de tester les chemins source. |
| https://github.com/RebelliousSmile/schema-pbta/blob/v1.0.0/handbook.json | Le précédent PbtA publie un contrat `1.0.0` tout en conservant des versions de packs Handbook indépendantes en `0.1.x`. |
| https://docs.npmjs.com/files/package-lock.json/ | Une dépendance HTTP conserve l'URL complète du tarball dans `resolved` et son empreinte SHA-512 au format SRI dans `integrity`. |
| https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases | Une release immuable verrouille le tag et les assets après publication ; GitHub recommande de joindre tous les assets au brouillon avant de le publier. |
| https://github.com/RebelliousSmile/obsidian-handbook/issues/27 | Handbook 2.8.0 fournit le registre générique de capacités et prouve déjà la consommation d'un contrat depuis un asset de release avec URL et intégrité épinglées. |
| https://github.com/RebelliousSmile/lantern/issues/2 | Lantern attend un registre par type de document, les codecs du contrat, le corpus partagé et la conservation de `0`, `false`, listes vides et clés citées. |

## Decisions

| Decision | Why |
| -------- | --- |
| Stabiliser le package ESM en `schema-adrenaline@1.0.0`, avec une seule entrée racine pour le code, `./schemas/*` pour le gel `1.0.0`, `./corpus/*` pour le kit JSON et `./examples/*` pour les témoins TOML existants. | Handbook et Lantern obtiennent les mêmes chemins publics testables ; les modules internes restent libres d'évoluer et aucune publication au registre npm n'est nécessaire. |
| Conserver l'identité existante des JSON Schemas par chemin SemVer exact sous `schemas/adrenaline/<version>/` et interdire toute réécriture d'un gel déjà tagué. | Cette stratégie respecte la décision de projet existante et garde chaque `$id` égal à l'emplacement immuable qu'un consommateur cite. |
| Faire passer JSON et TOML par le même schéma Zod dans un registre de codecs indexé par `pj`, `pnj` et `monstre`. | La validation, la normalisation et les types restent identiques dans les deux consommateurs, tandis que leurs formulaires et renderers demeurent hors du package. |
| Indexer le corpus JSON et les exemples TOML existants dans un manifeste public unique, avec seulement les cas syntaxiques absents ajoutés sous `corpus/contract/`. | Le kit distribué réutilise les documents déjà maintenus et ajoute une couverture ciblée sans multiplier les copies équivalentes. |
| Conserver `minimumHandbookVersion: 2.7.0` tant que le pack n'utilise aucune capacité plus récente, tout en le validant contre cet hôte déclaré. | Le contrat npm n'est pas chargé par l'installateur du pack ; relever arbitrairement le minimum casserait une compatibilité existante sans bénéfice fonctionnel. |
| Laisser le catalogue et le pack Handbook en `0.2.0`, indépendamment du contrat `1.0.0`. | La version du contrat décrit l'API, les schémas et les codecs ; celle du pack décrit ses données visuelles. Les synchroniser artificiellement ferait évoluer chaque produit quand seul l'autre change. |
| Tester la racine publique dans Node et dans un bundle esbuild de consommateur. | Node prouve les exports ESM et esbuild représente le mode de consommation de Handbook ; les tickets consommateurs gardent la responsabilité de leurs parcours applicatifs complets. |
| Publier par brouillon de release, ajouter le tarball et son checksum, puis rendre la release publique après activation de l'immuabilité. | L'ordre recommandé par GitHub garantit que le tag et tous les assets épinglés deviennent non modifiables ensemble. |
