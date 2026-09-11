# Le contrat Adrenaline est distribué par release GitHub immuable

- Date: 2026-09-11
- Status: Accepted

## Context

Handbook et Lantern doivent consommer les mêmes schémas, types, codecs et
témoins sans recopier les sources ni dépendre d'un registre npm. Une ref Git ou
le chemin mouvant d'un schéma ne fournit pas une identité de contenu stable,
et une validation de sources ne prouve pas la surface réellement installée.

Le premier contrat publié doit aussi conserver la fermeture des objets : les
JSON Schemas déclarent `additionalProperties: false`, donc l'API Zod ne peut
pas supprimer silencieusement les clés inconnues.

## Decision

`schema-adrenaline@1.0.0` est livré comme tarball d'une GitHub Release
immuable. Le package expose une entrée ESM racine, les schémas gelés, les
exemples et `corpus/cases.json`; son workflow construit et vérifie les assets
dans un brouillon avant publication. Tous les objets Zod utilisent
`z.strictObject`, et la CI prouve la surface tarball dans Node et esbuild ainsi
que les aller-retours JSON/TOML.

La version du contrat reste indépendante de la version du pack Handbook : le
contrat est `1.0.0`, tandis que le catalogue et le pack restent `0.2.0`.

## Alternatives

Publier sur npm a été écarté : les consommateurs doivent pouvoir épingler un
asset de GitHub Release avec son URL et son intégrité dans leur lockfile.

Copier les fichiers Zod ou les corpus dans Handbook et Lantern a été écarté :
les deux intégrations dériveraient et perdraient la preuve d'un contrat commun.

Laisser Zod utiliser `z.object` a été écarté : il supprime les propriétés
inconnues alors que les JSON Schemas les refusent.

Faire évoluer le contrat et le pack sous une version unique a été écarté : ce
sont deux surfaces compatibles mais indépendantes.

## Consequences

Les consommateurs disposent d'une URL, d'un checksum et d'un lockfile
reproductibles, et les versions publiées ne peuvent plus être remplacées. Une
évolution de forme exige un nouveau gel SemVer et une nouvelle release.

La publication demande d'activer l'immuabilité GitHub et de joindre tous les
assets au brouillon avant promotion. Chaque modification du contrat doit
maintenir le manifeste du corpus, les tests d'installation et la preuve du
bundle.
