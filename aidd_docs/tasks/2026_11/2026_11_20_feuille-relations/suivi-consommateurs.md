# Suivi des consommateurs — feuille de relations

Brouillons d'issues. **Aucune n'est publiée** : à poster seulement sur demande explicite.

## `RebelliousSmile/obsidian-handbook`

**Titre** : Rendre la feuille de relations Adrenaline (`block:adrenaline-relations`)

`schema-adrenaline@6.4.0` publie une quatrième cible de document, `relations` : la feuille
de relations d'un personnage, une page A4 séparée de la fiche PJ.

- Schéma : `schemas/adrenaline/relations.schema.json` (gel `schemas/adrenaline/6.4.0/`).
- Présentation : annotation `x-adrenaline-presentation`, exportée sous le nom
  `RELATIONS_PRESENTATION`, de capacité `block:adrenaline-relations`.
- Contrat 6 et TOML 1.0.0 inchangés : aucune fiche existante n'est touchée.

À rendre :

1. Trois sections : la ligne d'en-tête (`name-card` : personnage, joueur, partie sur une
   rangée), les autres personnages (`pc-ties`, 4 emplacements côte à côte), puis les PNJ
   (`counter` des tests de drame et `npc-entries`, deux colonnes de cinq fiches).
2. Sur `pc-ties` et `npc-entries`, `fieldRows` nomme les propriétés de **chaque élément** de
   la liste, pas celles du chemin. Le nombre d'emplacements imprimés est le `maxItems` du
   schéma ; la présentation ne déclare ni `pages` ni `minimumRows`.
3. `attitudeLevels` (bloc `npc-entries`) : imprimer après l'attitude saisie le modificateur
   qu'elle fixe (nature `bonus` / `malus` / `aucun` et nombre). Le modificateur n'est jamais
   stocké dans le document.
4. Ajouter `block:adrenaline-relations` au `requires` du pack se décide ensemble, une fois le
   rendu en place : il n'y figure pas aujourd'hui.

Limite connue : les capacités des textes (`maxLength`) ont été estimées sans mesure de
rendu. Le premier rendu réel peut demander de les ajuster, ce qui passerait par une
nouvelle version mineure du schéma.

## `RebelliousSmile/lantern`

**Titre** : Éditer la feuille de relations Adrenaline (schéma `relations`, 6.4.0)

`schema-adrenaline@6.4.0` publie la cible `relations`
(`schemas/adrenaline/relations.schema.json`, codecs `parseRelationsJson` /
`parseRelationsToml` / `stringifyRelationsJson` / `stringifyRelationsToml`, présentation
`RELATIONS_PRESENTATION`, capacité `block:adrenaline-relations`).

À proposer dans l'éditeur :

1. La ligne d'en-tête : personnage (requis), joueur, partie.
2. Jusqu'à 4 autres personnages : nom, ce que je sais, ce que je lui dois, ce qu'il me doit.
3. Jusqu'à 10 PNJ. À la création, attribuer le **prochain numéro libre** (1 à 99) et le
   garder stable ensuite : le schéma ne vérifie ni l'unicité des numéros ni l'existence de
   ceux qu'on référence.
4. `reliesA` : proposer les numéros des PNJ existants plutôt qu'une saisie libre, et
   signaler un numéro qui ne renvoie plus à rien.
5. L'attitude se choisit dans l'enum ; le modificateur s'affiche d'après `ATTITUDE_LEVELS`
   et ne se saisit pas.
6. Le décompte des tests de drame, un entier de 0 à 100.

Limite connue : les capacités des textes ont été estimées sans mesure de rendu. Le
premier rendu réel peut demander de les ajuster.
