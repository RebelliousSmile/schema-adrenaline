---
objective: "Le dépôt expose un catalogue Handbook versionné qui permet à Handbook 2.7.0 ou plus récent d'installer et de mettre à jour le pack Adrenaline, ses fonds et ses polices sans copie manuelle."
status: implemented
---

# Plan: Publier le catalogue Handbook du dépôt

## Overview

| Field      | Value |
| ---------- | ----- |
| **Goal**   | Publier le pack Adrenaline comme source Handbook installable et actualisable depuis le dépôt. |
| **Source** | Issue GitHub `RebelliousSmile/schema-adrenaline#3` — https://github.com/RebelliousSmile/schema-adrenaline/issues/3 |

## Phases

| #   | Phase | File |
| --- | ----- | ---- |
| 1   | Catalogue et contrat de validation | [`phase-1.md`](./phase-1.md) |
| 2   | Parcours d'installation et publication | [`phase-2.md`](./phase-2.md) |

## Resources

| Source | Verified |
| ------ | -------- |
| https://github.com/RebelliousSmile/obsidian-handbook/blob/2.7.0/src/games/repositoryManifest.ts | Le catalogue racine accepte uniquement `manifestVersion`, `repository`, les métadonnées facultatives et une liste non vide de packs aux chemins relatifs sûrs et versions SemVer. |
| https://github.com/RebelliousSmile/obsidian-handbook/blob/2.7.0/src/games/sourceInstaller.ts | Handbook lit `handbook.json`, exige l'égalité de l'id et de la version entre catalogue et pack, puis matérialise seulement le manifeste et les assets déclarés. |
| https://github.com/RebelliousSmile/obsidian-handbook/blob/2.7.0/src/games/pluginManifest.ts | Le manifeste de pack exige une version SemVer, une version minimale de Handbook, des capacités valides et un pack exploitable. |
| https://github.com/RebelliousSmile/obsidian-handbook/blob/2.7.0/src/games/capabilities.ts | Handbook 2.7.0 fournit à Adrenaline les trois capacités de bloc `pj`, `pnj`, `monstre` et la capacité de style `adrenaline` déjà annoncées par le pack. |
| https://github.com/RebelliousSmile/obsidian-handbook/blob/2.7.0/README.md#3-install-another-schema-source | Le parcours public est **Settings → Handbook → Schema sources → Add source**, suivi du dépôt GitHub, de la référence puis de **Save and check** ; **Check** actualise ensuite la source atomiquement. |

## Decisions

| Decision | Why |
| -------- | --- |
| Le catalogue racine utilise `manifestVersion: 1` et ne reçoit pas de champ de version supplémentaire. | Le lecteur Handbook est strict et rejette les champs inconnus ; la version installable est celle de chaque entrée de pack et doit égaler celle de son `pack.json`. |
| Les fichiers binaires restent exclusivement sous `handbook/adrenaline/assets/` et sont référencés depuis `pack.json`. | L'installateur Handbook ne télécharge que les assets déclarés relativement au manifeste du pack, ce qui maintient ce dossier comme source de vérité. |
| La validation structurelle rejoint le validateur existant, tandis qu'un harness CI passe la source réelle dans l'installateur de la release Handbook déclarée. | Le contrôle local reste rapide et autonome ; la preuve croisée évite qu'une réimplémentation du contrat accepte un catalogue que Handbook refuserait ou installerait mal. |
