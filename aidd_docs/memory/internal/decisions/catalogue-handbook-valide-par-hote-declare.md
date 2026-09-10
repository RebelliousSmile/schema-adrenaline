# Le catalogue Handbook est strict et validé par l'hôte déclaré

- Date: 2026-09-10
- Status: Accepted

## Context

Handbook 2.7.0 remplace la copie manuelle des packs par des dépôts de schémas
versionnés et potentiellement multi-packs. Son lecteur rejette les champs
inconnus, exige des chemins relatifs sûrs et vérifie que l'identifiant et la
version de chaque entrée de `handbook.json` correspondent au `pack.json`
désigné. L'installation ne matérialise que le manifeste et les images ou
polices que ce pack déclare.

Une validation locale qui reproduit seule ces règles peut dériver du contrat
réel de Handbook. Inversement, ne tester que le pack ne prouve ni que le
catalogue est lisible, ni que ses assets sont installés et mis à jour de façon
atomique.

## Decision

`handbook.json` reste un index strict : `manifestVersion` versionne son format,
tandis que la version installable appartient à chaque pack et doit correspondre
à celle de son manifeste. Les fichiers binaires restent sous le dossier du pack
et ne sont accessibles qu'au travers de ses déclarations d'assets.

La validation locale contrôle la structure et les relations du catalogue. La
CI dérive ensuite la release hôte depuis `minimumHandbookVersion` et passe la
source réelle dans l'installateur de cette release, y compris les scénarios de
mise à jour réussie et d'échec avant promotion.

## Alternatives

Ajouter une version globale au catalogue a été écarté : le lecteur strict de
Handbook rejetterait ce champ, et un dépôt multi-packs ne possède pas
nécessairement une version de contenu unique.

Copier les assets manuellement ou les déclarer hors du pack a été écarté : ils
ne suivraient plus la version installée et l'installateur Handbook ne les
téléchargerait pas.

Réimplémenter seulement le parseur Handbook dans ce dépôt a été écarté comme
preuve finale : deux implémentations identiques aujourd'hui peuvent diverger
demain.

## Consequences

Une modification de version, de chemin, de capacité ou d'asset doit maintenir
la cohérence entre le catalogue et le pack. Une hausse de
`minimumHandbookVersion` change aussi la release réellement testée par la CI.

Le dépôt détecte localement les erreurs courantes sans checkout externe, puis
la CI garantit que l'hôte minimal sait lire, installer et remplacer la source
entière sans perdre la version précédemment installée en cas d'échec. Cette
preuve croisée coûte l'installation des dépendances Handbook dans la CI, mais
évite de publier un catalogue valide uniquement selon une copie périmée du
contrat.
