---
objective: "La release GitHub immuable v2.5.0 attache exactement l'archive de la candidate v2.5.0-rc.2, après des preuves protocol-1 valides de Lantern et Handbook."
status: implemented
---

# Plan: Promouvoir schema-adrenaline 2.5.0 depuis rc.2

## Overview

| Field | Value |
| ----- | ----- |
| **Goal** | Converger le fournisseur vers le contrat de train `protocol: 1`, obtenir la preuve des deux consommateurs, puis publier les octets candidats sous `v2.5.0`. |
| **Source** | Issue [RebelliousSmile/schema-adrenaline#32](https://github.com/RebelliousSmile/schema-adrenaline/issues/32) |

## Phases

| # | Phase | File |
| --- | ----- | ---- |
| 1 | Aligner le fournisseur sur protocol 1 | [`phase-1.md`](./phase-1.md) |
| 2 | Réconcilier l'historique et valider le train 2.5.0 | [`phase-2.md`](./phase-2.md) |
| 3 | Promouvoir l'archive candidate identique | [`phase-3.md`](./phase-3.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| [schema-adrenaline#32](https://github.com/RebelliousSmile/schema-adrenaline/issues/32) | La candidate, son SHA-256, le commit fournisseur, les dépendances Lantern/Handbook et la définition de fini de la release. |
| [candidate v2.5.0-rc.2](https://github.com/RebelliousSmile/schema-adrenaline/releases/tag/v2.5.0-rc.2) | La prerelease est immuable et son asset `schema-adrenaline-2.5.0.tgz` a le SHA-256 `62033e75384f17ee21e4e5e76d231b84c25b3fdcb0d5de74ecdbc89c94be95cc`. |
| [Lantern commit 4a63bf4](https://github.com/RebelliousSmile/lantern/commit/4a63bf40102120b9bda5b60b3a6396b4e243049e) | `release-train:assert` accepte une candidate Adrenaline protocol 1, contrôle les lockfiles et émet une evidence structurée. |
| [Handbook commit 5f0b0f2](https://github.com/RebelliousSmile/obsidian-handbook/commit/5f0b0f262d789831ceb823a55df3284516ffe7b2) | `release-train:assert` accepte une candidate Adrenaline protocol 1, contrôle l'installation et le rendu, et émet une evidence structurée. |
| [schema-adrenaline#15](https://github.com/RebelliousSmile/schema-adrenaline/issues/15) | Les tags prématurés doivent être retirés plutôt que recevoir une archive reconstruite qui ne correspond pas à leur package déclaré. |
| [Release train 35988789960](https://github.com/RebelliousSmile/schema-adrenaline/actions/runs/35988789960) | Les preuves Lantern et Handbook sont toutes deux `passed`; le commit attesté est conservé dans l'ascendance de `main`. |
| [Release contract 35993832839](https://github.com/RebelliousSmile/schema-adrenaline/actions/runs/35993832839) | La porte de train passe, puis `validate:version` refuse `v2.5.0` parce que la release que le workflow doit créer n'existe pas encore. |
| [Release contract 35996024394](https://github.com/RebelliousSmile/schema-adrenaline/actions/runs/35996024394) | La promotion a publié la release immuable avec les octets candidats exacts, mais sous les noms `candidate.tgz` et `candidate.tgz.sha256`; la validation ordinaire attend encore les noms canoniques. |
| [GitHub Docs — Managing releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository) | Une fois une release immuable publiée, ses assets ne peuvent plus être ajoutés, remplacés ou supprimés; la récupération doit donc préserver la release existante. |

## Decisions

| Decision | Why |
| -------- | --- |
| Le manifeste fournisseur adopte sans adaptation le format `protocol: 1` des deux consommateurs. | Les issues consommateurs fermées ont déjà fixé ce contrat strict (`candidate` et liste `consumers`); conserver le format local `manifestVersion` rendrait le train inexécutable. |
| Les preuves sont lues depuis `*.evidence.json`, jamais déduites de la dernière ligne standard. | Lantern écrit son evidence complète; Handbook affiche seulement le chemin de son evidence. Les fichiers sont la sortie stable commune. |
| Le train épingle Lantern `4a63bf40102120b9bda5b60b3a6396b4e243049e` et Handbook `5f0b0f262d789831ceb823a55df3284516ffe7b2`. | Ces commits complets suivent la clôture de #45/#60 et leurs deux lockfiles résolvent précisément la candidate RC. |
| La stable télécharge l'asset RC contrôlé et ne l'upload qu'après égalité des digests. | Le tag final peut contenir le manifeste et les correctifs de pipeline, mais l'asset publié doit rester l'octet attesté par les consommateurs. |
| Les tags locaux stables sans équivalent sur `origin` ni release GitHub sont retirés avant la validation fournisseur. | `v1.0.1`, `v1.1.1`, `v2.1.0` et `v2.2.0` ne portent pas la version de package qu'ils annoncent ; les conserver fait échouer la porte sans représenter une publication réelle. |
| La validation de promotion peut déclarer un unique tag courant comme release en attente, sans relâcher la validation ordinaire. | Le workflow doit contrôler le fournisseur avant de créer la release ; l'exception est bornée au tag de la version du package, à son ascendance et à une release absente ou encore brouillon. |
| Le tag `v2.5.0` déjà poussé reste fixé sur `8276dda`; la récupération se fait par `workflow_dispatch` depuis `main`. | Déplacer ou recréer le tag détruirait la provenance déjà publiée. Les correctifs portent uniquement sur l'outillage exclu du tarball, dont les octets doivent encore égaler la RC. |
| La release immuable `v2.5.0` et ses deux assets `candidate.*` sont conservés tels quels. | Son tarball a le digest attendu et l'issue exige les octets et le checksum, pas leurs noms; GitHub interdit désormais de renommer ou remplacer ces assets. |
| `validate-versioning.ts` accepte les noms `candidate.tgz` et `candidate.tgz.sha256` uniquement pour `v2.5.0`; toutes les autres releases restent soumises aux noms canoniques. | Une compatibilité explicite à une seule release rend l'écart auditable sans transformer l'erreur publiée en règle générale. |
| `release.yml` publie désormais les assets futurs sous `schema-adrenaline-<version>.tgz` et `.sha256`. | La compatibilité ne doit pas se reproduire; le workflow et le validateur partagent à nouveau le contrat canonique pour les prochaines promotions. |
