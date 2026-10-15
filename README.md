# Schema Adrenaline

_Schémas de données ouverts et versionnés pour l'Adrenaline System, le moteur d100 de Damien Coltice derrière Zombiology : fiches de personnage, PNJ et monstres échangés en JSON ou TOML entre Handbook, Lantern et les autres outils, sans format propriétaire._

## État du projet

Ce dépôt déclare `schema-adrenaline@6.1.0` et la baseline de schéma `6.1.0`
(rupture avec le contrat 5 : voir le `CHANGELOG`). Les consommateurs épinglent une archive de release
publiée, pas la branche mouvante.

- _Ça marche aujourd'hui :_ trois schémas de personnage (`pj`, `pnj`, `monstre`) avec exemples JSON et TOML, un corpus de conformité partagé, des codecs TypeScript, et le pack Handbook (thèmes, polices, callouts)
- _Pas encore :_ les catalogues de jeu (formations, compétences, armes) ne sont volontairement pas énumérés ; aucun schéma n'existe pour les règles, seulement pour les fiches
- _Prochaine étape :_ l'intégration propre à Lantern vivra sous `lantern/` quand cet outil en aura besoin

## Aperçu

Une fiche de personnage Zombiology rendue dans Obsidian par Handbook, thème sombre :

![Fiche PJ Zombiology rendue dans Obsidian par Handbook](docs/images/handbook-fiche-pj.png)

Le même pack existe en polarité claire. Ces deux captures sont de vraies captures d'Obsidian 1.14.4 avec le plugin Handbook : la note de test porte un titre, un mot-clé, un seuil de dégâts, des encarts et une table de lancer, rendus avec les jetons, polices et textures de `handbook/adrenaline/pack.json`.

![Jetons du pack Adrenaline, polarité claire](docs/images/pack-light.png)
![Jetons du pack Adrenaline, polarité sombre](docs/images/pack-dark.png)

## Mettre en place Adrenaline chez toi

Il te faut Obsidian et deux plugins. Compte quelques minutes ; aucun fichier à copier à la main.

### 1. Prérequis

- [Obsidian](https://obsidian.md/) 1.12.7 ou plus récent
- Les plugins communautaires activés (**Réglages → Plugins communautaires**)
- Le plugin communautaire [BRAT](https://github.com/TfTHacker/obsidian42-brat), qui installe Handbook
- Facultatif : le plugin communautaire Dice Roller, pour tirer sur les tables aléatoires

### 2. Installer Handbook

Dans BRAT, ajoute le dépôt `RebelliousSmile/obsidian-handbook`, puis active **Handbook** dans la liste des plugins.

### 3. Ajouter la source Adrenaline

Ouvre **Réglages → Handbook → Schema sources**, choisis **Add source**, saisis `RebelliousSmile/schema-adrenaline`, sélectionne la release à suivre (ou une branche), puis **Save and check**. Handbook télécharge ensemble le catalogue, le pack, les polices et les textures.

Pour mettre à jour plus tard, utilise **Check** sur la même source : le remplacement est atomique, sans copie manuelle ni redémarrage.

### 4. Choisir le jeu

Dans **Réglages → Handbook → Jeu et apparence**, règle **Mode de jeu** sur **Adrenaline System**. **Jeu de couleurs** propose le clair, le sombre, ou de suivre Obsidian. Les versions installées s'affichent en haut de la page.

![Réglages Handbook avec Adrenaline System](docs/images/handbook-reglages.png)

### 5. Écrire et jouer

Tes notes prennent le thème Adrenaline : titres, tableaux et callouts (voir [la liste](handbook/adrenaline/callout-contract.md)). Les fiches `pj`, `pnj` et `monstre` s'affichent comme sur la capture d'en-tête. Le [guide d'écriture](https://github.com/RebelliousSmile/obsidian-handbook/wiki/Writing-Notes-FR) et les [exemples de fiches Adrenaline](https://github.com/RebelliousSmile/obsidian-handbook/wiki/Adrenaline-Sheets-FR) montrent le détail.

Pour créer une fiche sans l'écrire à la main, [Lantern](https://github.com/RebelliousSmile/lantern) propose un éditeur avec aperçu et export TOML ou PNG :

![Éditeur de fiche PJ dans Lantern](docs/images/lantern-fiche-pj.png)

## Ce que les outils apportent

Ce dépôt décrit les données. Ce sont **Handbook** et **Lantern** qui les rendent, les éditent et les rendent jouables. Chaque fonctionnalité ci-dessous vit dans l'outil indiqué, pas ici.

### Handbook (plugin Obsidian)

[Handbook](https://github.com/RebelliousSmile/obsidian-handbook) installe le pack Adrenaline depuis ce dépôt. Il fournit :

- **Thèmes clair et sombre** : couleurs, titres, tableaux, surfaces et textures de page du pack, dans les deux polarités
- **Polices du pack** : Adrenaline Body, Adrenaline Display et une police manuscrite, chargées localement
- **Fiches** : rendu des documents `pj`, `pnj` et `monstre`
- **Callouts visuels** : exemple, description, encart, rôle, formation, action, roller et mention (voir [`callout-contract.md`](handbook/adrenaline/callout-contract.md))
- **Tables aléatoires** : clic droit sur un tableau placé dans un callout `roller` pour tirer un résultat, avec le plugin Dice Roller ; le résultat se copie pour être collé dans un autre document, comme un compte rendu de séance, sans modifier la note source
- **Colonnes** : régions multi-colonnes dans une note, repliées sur une colonne quand le volet de lecture est étroit
- **Sections en mode alterné** : une partie de note affichée dans le mode opposé (sombre dans une note claire, et inversement)
- **Export PDF** : mise en page de la fiche PJ Zombiology telle que la fiche papier la dispose, et option d'export sur papier blanc

La [documentation de Handbook](https://github.com/RebelliousSmile/obsidian-handbook/wiki) détaille chacune de ces fonctions.

### Lantern (application web)

[Lantern](https://github.com/RebelliousSmile/lantern) permet de **créer des fiches** Adrenaline System (personnages joueurs, PNJ, monstres) :

- édition structurée avec aperçu en direct de la fiche imprimée
- import et export TOML, conformes à ces schémas
- export PNG pour le partage et l'impression
- stockage local dans le navigateur, sans compte

## Schémas publiés

Ils vivent sous `adrenaline` plutôt que sous un dossier de jeu : ils décrivent le moteur, que partagent tous les jeux qui l'utilisent. Un dossier de jeu ne contient que ce qui lui est propre.

| Schéma                                   | Couvre                                                                                                                                                                                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schemas/adrenaline/pj.schema.json`      | Une fiche de personnage joueur, bloc par bloc comme la fiche imprimée : nom, huit caractéristiques, quatre seuils physiques et quatre mentaux avec leur valeur couverte, protections, formations et compétences, équipement et paramètres de jeu. |
| `schemas/adrenaline/pnj.schema.json`     | Une fiche de personnage non joueur : seul le nom est requis, tout le reste est optionnel, d'un figurant nommé avec un niveau de danger et une ligne en italique jusqu'à un personnage majeur entièrement chiffré.                                 |
| `schemas/adrenaline/monstre.schema.json` | Une fiche de créature : nom et quatre caractéristiques physiques requis, mentales optionnelles, avec un état alternatif, un bloc de contagion générique et un bloc narratif.                                                                      |

## Provenance d'un fichier

Chaque cible porte un bloc optionnel `meta` qui enregistre l'origine de la fiche : `typeDePublication` (`officiel`, `tiers`, `communautaire`, `maison`), `source`, `auteurs`, `page` et `licence`. Il décrit le fichier. Ne le confonds pas avec `parametresDuJeu`, qui décrit la séance d'une table.

## Utiliser le contrat dans ton outil

Installe l'asset immuable de la release GitHub directement. npm enregistre cette URL complète et son intégrité SHA-512 dans le lockfile du consommateur :

```sh
npm install https://github.com/RebelliousSmile/schema-adrenaline/releases/download/v3.3.0/schema-adrenaline-3.3.0.tgz
```

### Types et codecs (applications TypeScript)

Importe le contrat public ; ne copie pas les sources Zod dans un consommateur :

```ts
import {
  ADRENALINE_DOCUMENT_CODECS,
  parsePjJson,
  parsePnjToml,
  type PersonnageJoueurValeur,
} from "schema-adrenaline";

const pj: PersonnageJoueurValeur = parsePjJson(JSON.stringify(userInputJson));
const pnj = parsePnjToml(tomlSource);
const json = ADRENALINE_DOCUMENT_CODECS.monstre.parseJson(jsonSource);
```

Les clés du registre sont `pj`, `pnj` et `monstre`. Chaque codec lit et sérialise JSON et TOML avec le même schéma Zod strict, puis vérifie `minimum ≤ current ≤ maximum` : les clés inconnues et les intervalles jouables inversés sont rejetés, pas supprimés en silence. Les schémas Zod exportés ne valident volontairement que la structure ; utilise un codec ou `validatePlayableRanges` pour le contrat portable complet.

### Valider des données (tout langage)

Utilise les JSON Schemas figés exportés par le paquet installé avec n'importe quel validateur JSON Schema (AJV, Python jsonschema, Rust jsonschema) :

```ts
import fs from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const schemaUrl = import.meta.resolve("schema-adrenaline/schemas/pj.schema.json");
const schema = JSON.parse(fs.readFileSync(new URL(schemaUrl), "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const data = JSON.parse(fs.readFileSync("path/to/data.json", "utf8"));
if (!validate(data)) console.error(validate.errors);
```

### Rejouer le kit de conformité partagé

`schema-adrenaline/corpus/cases.json` liste chaque cas accepté ou rejeté, en JSON ou en TOML. Chaque `path` se résout depuis le nom du paquet, par exemple :

```ts
const manifestUrl = import.meta.resolve("schema-adrenaline/corpus/cases.json");
const manifest = JSON.parse(fs.readFileSync(new URL(manifestUrl), "utf8"));
const firstCaseUrl = import.meta.resolve(`schema-adrenaline/${manifest.cases[0].path}`);
```

Les chemins qui commencent par `examples/` et `corpus/` sont des exports publics du paquet.

### Descripteur de présentation (cartes de la créature)

Chaque cible publie, dans son schéma JSON, un descripteur `x-adrenaline-presentation` (et l'export `schema-adrenaline/presentation`). Il dit quoi imprimer et où ; le consommateur le suit, il ne recopie pas la mise en page. Ce que chaque propriété lui demande :

- `pointerRows` (bloc) : lignes de JSON Pointers, chaque pointeur descendant d'un chemin du bloc. Imprime les cellules dans cet ordre, ligne par ligne, avec `label` à la place du nom quand il est donné. Une cellule sans valeur saisie n'est pas imprimée : ne la remplace ni par un zéro ni par un tiret, et n'en calcule aucune.
  Graisse : seule une cellule sans `label` (le sigle d'une caractéristique : FOR, CON, DEX, RAP, PER) imprime son nom en gras ; une cellule qui publie un `label` (« Zone de détection », « Dépl. ») l'imprime en graisse normale.
- `subtitlePaths` (blocs `name-card` et `game-parameters`) : pointeurs, parmi les chemins du bloc, imprimés sur une ligne sous le nom, dans cet ordre et séparés par une espace (créature : `/instinct`, `/typeDeCorps`, soit « Enragé Corps moyen »). Une valeur non saisie n'est pas imprimée, et ces chemins ne sont pas imprimés une seconde fois dans la bannière. Le PJ en publie un sur ses paramètres du jeu : le type de scénario s'imprime sous le libellé de la feuille et non dans les lignes des paramètres. Ni la PNJ ni la créature n'en publient.
- `rowLabels` (bloc `combat`) : le libellé imprimé de chaque chemin, dans l'ordre de `paths` (créature : « Actions », « Défense »), en gras devant sa valeur. La forme `combat` imprime `/actionsParRound` sous la forme `<n>/round` et `/defense` sous la forme `<niveau> (<bonus> bonus)` ; `niveau` s'écrit « Oui », « Exposé » ou « Non », et le bonus est omis quand il n'est pas saisi. Une précision saisie dans `/defense/notes` s'imprime à la suite, telle quelle : un champ déclaré n'est jamais masqué.
- `cards` (descripteur, créature seule) : déclare les cartes, `principal` (toujours imprimée, sans condition) et `secondaire`. La carte `secondaire` porte `existsWhenAny: ["/etats", "/etatAlternatif"]` : elle existe quand le document saisit une valeur à l'un de ces pointeurs, une liste comptant quand elle n'est pas vide. Sans valeur saisie, elle n'existe pas. Toute carte citée ailleurs dans le descripteur est déclarée ici.
- `cards` (section ou bloc, créature seule) : les cartes qui impriment cette section ou ce bloc ; absent sur un bloc, toutes les cartes de sa section. Une section sans `cards` s'imprime une fois, hors des cartes.
- `fallbackCard` (section) : quand aucune des cartes de `cards` n'existe, la section s'imprime sur cette carte (`principal`), à sa place d'`order` parmi les sections de cette carte. Une créature à un seul état n'a pas de carte `secondaire`.
- Valeurs numériques de la créature et de la PNJ : un nombre simple (la forme à écrire) ou le triplet `{minimum,current,maximum}` (toujours lu), mêmes bornes, y compris le pourcentage du test d'une action ou d'une suite d'action et le `delta` d'un état ; `minimum ≤ current ≤ maximum` reste vérifié pour un triplet. Elles ne gagnent pas d'XP, leur score n'évolue pas. Le PJ garde le triplet seul.
- Matériau du meneur : aucune section « Meneur » repliable. La créature imprime `/comportement` et `/traitsSpeciaux` (« Traits spéciaux ») à découvert dans la section `comportement`, sur la carte `principal` seulement, puis les sections ordinaires `competences`, `contagion` et `notes` (`/narratif`) hors des cartes ; la PNJ imprime `/narratif` dans la section `notes`. Une section dont tous les blocs sont vides n'est pas imprimée. La propriété `collapsible` reste dans le contrat (la fiche PJ s'en servira) ; aucune section de la créature ni de la PNJ ne la porte.
- `joinedTo` (section) : sur la carte nommée, la section s'imprime juste après la section `section`, sous le seul titre `title` qui couvre les deux. Ailleurs, les deux sections restent séparées.
- `decoration` `state-badge` (bloc `etat`) : un repère devant chaque déclencheur, et la case de l'état courant, lue à `/etatActif`, dessinée sur les cartes listées par `current.cards` seulement. La couleur est le jeton `--adrenaline-card-badge`, déclaré par le pack : le consommateur le lit. `current.position` (`end`) place la case à droite de la bande de titre de l'état.
- Forme `state-header` (bloc `etat`) : par définition de la forme, sans autre champ publié, le nom de l'état s'imprime sur une bande de titre de section (jeton `--adrenaline-section-band`), la case de l'état courant à l'extrémité de cette bande (`current.position`), et le déclencheur dessous : une icône ronde à flèche suivie du texte nu, sans pastille de fond. L'icône prend le jeton `--adrenaline-card-badge`, comme la case.
- Forme `threshold-rows` : sur la carte compacte (créature et PNJ), les seuils d'une rangée s'impriment après leur sigle, séparés par une barre oblique entourée d'espaces : « SP 7 / 14 / 19 / 24 ». La feuille de papier du PJ ne change pas.

- Fiche PJ, formes `reference-table` (table de règles à texte fixe, sans chemin lu : `referenceTable` porte colonnes, lignes, légende), `location-grid` (six localisations de trois cases, la localisation saisie coche la première), `wound-circles` (blessures par durée, deux colonnes, un cercle coché ou non par durée) et `circle-row` (quatre cercles). Propriétés de bloc : `thresholdLevels` (libellés des seuils par position, malus de 1 à 4) et `notes` (textes fixes de la feuille), `minimumRows` (formes `ruled-list` et `weapon-lines`, entier ≥ 1 : nombre minimal de lignes réglées imprimées, soit 5 pour `possessions`, 7 pour `armes-physiques`, 5 pour `avantages-immunites` ; les lignes saisies au-delà s'ajoutent, rien n'est tronqué, et la liste du document reste non bornée). Le PJ imprime la valeur courante seule des caractéristiques ; les valeurs ne sont jamais calculées.

### Compatibilité et versionnement

Le contrat npm et les chemins de schéma figés suivent le versionnement sémantique. Un changement cassant d'API ou de forme de document exige une nouvelle version majeure du contrat ; une forme modifiée reçoit toujours un nouveau dossier `schemas/adrenaline/<version>/`. Les dossiers de version, tags et assets de release publiés sont immuables.

Le catalogue Handbook et le pack de jeu ont leur propre version, qui ne change que lorsque le pack change et reste volontairement indépendante de la version du contrat.

### Autocomplétion dans l'éditeur

Configure le schéma dans les réglages de ton éditeur (`json.schemas` dans VS Code, `evenBetterToml.schema.associations` pour le TOML), associé à un glob de fichiers.

N'ajoute **pas** de clé `"$schema"` dans un fichier de données situé dans `examples/` : les schémas générés portent `"additionalProperties": false` à la racine, donc cette clé fait échouer `npm run validate` sur le fichier.

## Contribuer

Les retours sur les schémas (champ manquant, écart avec la fiche imprimée) et les cas de refus sont les contributions les plus utiles à ce stade. Ouvre d'abord une issue ; la procédure complète est dans [CONTRIBUTING.md](CONTRIBUTING.md).

## Travail dérivé

Ce dépôt dérive de [4rtamis/schema-in-the-mist](https://github.com/4rtamis/schema-in-the-mist), dont il réutilise l'outillage (`tools/`, chaîne de génération et de validation) sous licence MIT. Les schémas ici lui sont propres : rien des schémas du Mist Engine n'a été copié.

## Licence

- **Code et schémas :** MIT (voir [LICENSE](./LICENSE)). La notice porte deux lignes de copyright : l'auteur d'origine de l'outillage de build et l'auteur de ce dépôt.
- **Documentation :** CC BY 4.0 (voir [ici](./LICENSES/DOCS-LICENSE.md))
- **Marques et contenu communautaire :** notice à rédiger. L'Adrenaline System et _Zombiology_ sont l'œuvre de Damien Coltice. À compléter avec les conditions exactes avant publication.
