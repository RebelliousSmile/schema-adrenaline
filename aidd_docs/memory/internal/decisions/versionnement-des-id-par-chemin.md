# Les schémas sont versionnés par chemin, pas par ref git

- Date: 2026-09-08
- Status: Accepted

## Context

Les `$id` posés lors de la première implémentation pointent
`.../schema-adrenaline/main/schemas/adrenaline/<cible>.schema.json`. Un `$id`
sous `main` change de contenu sans changer d'identifiant : un outil tiers qui
l'épingle voit le document se transformer sous lui. Le plan avait acté la dette
et fixé son échéance au premier tag. Ce tag arrive.

## Decision

`npm run gen` écrit désormais **deux** fichiers par cible :

- `schemas/<jeu>/<cible>.schema.json` — la dernière version, `$id` sur `main`,
  qui continue de bouger ;
- `schemas/<jeu>/<version>/<cible>.schema.json` — un gel, dont l'`$id` porte le
  numéro de version dans son propre chemin.

La version est lue dans `package.json`. Un chemin versionné n'est plus réécrit
une fois sa version publiée, puisque le bump suivant en crée un autre.

## Alternatives

Faire pointer l'`$id` sur le tag git (`.../v0.1.0/schemas/...`) : rejeté. Le
document servi à cette URL porterait un `$id` déclarant `main`, donc une
identité différente de l'URL qui le sert — exactement l'incohérence que l'on
cherche à supprimer. Cela ferait aussi dépendre l'identité des schémas de la
politique de tags de l'hébergeur.

Deux `$id` dans un même fichier : impossible, draft-7 n'en admet qu'un.

Ne rien faire et noter la dette au `CHANGELOG.md` : rejeté ici. La dette était
déjà notée ; un premier tag publie les schémas, et c'est le moment précis où le
report cesse d'être gratuit.

## Consequences

Rend possible l'épinglage d'une version stable par un consommateur externe.
Double le nombre de fichiers sous `schemas/`, et impose de ne jamais éditer à la
main un dossier de version déjà publié. Le tag git reste utile pour l'historique
mais ne porte plus l'identité des schémas.
