# Callouts visuels Adrenaline

Le pack Adrenaline reconnaît sept callouts Markdown, relevés sur la maquette des livrets Zombiology. Leur contenu est libre : le pack ne change que leur mise en page. Ils n'ajoutent aucune mécanique et ne touchent à aucun document `pj`, `pnj` ou `monstre`.

La liste fait foi dans `ADRENALINE_VISUAL_CALLOUTS`, exporté par `schema-adrenaline` et par `schema-adrenaline/presentation`. Chaque entrée porte la capability `style:adrenaline`. Un consommateur n'affiche un callout que si le pack actif la déclare dans `requires`.

| Identifiant              | Alias par défaut     | Usage de présentation                                                                                                                                                  |
| ------------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `adrenaline-exemple`     | `exemple`, `example` | Exemple de jeu. Filets pointillés en haut et en bas, sans fond. L'étiquette est en cartouche sombre calée à droite, et le corps en italique.                           |
| `adrenaline-description` | `description`        | Texte à lire aux joueurs. Corps droit sur fond blanc, entre deux filets pointillés. L'étiquette est en cartouche grenat calée à droite, posée au-dessus du filet haut. |
| `adrenaline-encart`      | `encart`             | Encart de règle ou de conseil. Titre sur un bandeau grenat ajusté au texte, corps sur une surface rosée bordée d'un filet grenat.                                      |
| `adrenaline-formation`   | `formation`          | Paquetage ou formation. Bandeau sombre pleine largeur, puis le corps sans fond, qui porte en général une liste.                                                        |
| `adrenaline-action`      | `action`             | Action de combat. Carte à coins arrondis, titre sur un bandeau pêche. Le **premier paragraphe** du corps devient la bande grenat de la ligne de test.                  |
| `adrenaline-roller`      | `roller`             | Table à lancer. Même cadre et même bandeau grenat que l'encart, sans fond ; le tableau occupe toute la largeur, lignes alternées.                                      |
| `adrenaline-mention`     | `mention`            | Mention en ligne (vidéo, musique, lecture). Pastille d'une seule ligne à filet arrondi : une icône, le titre en gras rouge, puis le corps à la suite, sans gras.       |

`adrenaline-formation` vient du livret Police : il reste disponible, mais il est annexe à la gamme.

## Modificateurs

Un modificateur est un mot de métadonnée Obsidian, placé après une barre verticale : `[!alias|mot]`.

| Callout                | Modificateur | Effet                                                                                                                                    |
| ---------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `adrenaline-formation` | `fond`       | Le corps passe sur la surface grise `--adrenaline-formation-surface`, et son premier paragraphe devient une accroche en italique grenat. |
| `adrenaline-mention`   | `video`      | Icône `--adrenaline-mention-icon-video`.                                                                                                 |
| `adrenaline-mention`   | `audio`      | Icône `--adrenaline-mention-icon-audio`.                                                                                                 |
| `adrenaline-mention`   | `livre`      | Icône `--adrenaline-mention-icon-livre`.                                                                                                 |
| `adrenaline-mention`   | `lien`       | Icône `--adrenaline-mention-icon-lien`.                                                                                                  |

Sans modificateur, la mention prend l'icône `--adrenaline-mention-icon`. Un jeton d'icône porte un nom d'icône Obsidian (`lucide-…`).

```md
> [!mention|video] Vidéo YouTube
> Survivre à la vie (3/3) — Contamination
```

```md
> [!formation|fond] Trafic
> La formation de trafic dispense un apprentissage de la discrétion et de la négociation.
>
> - Art martial (Bagarre)
> - Discrétion
```

Le titre de tout callout, comme la ligne de test d'une action, est composé dans la police du corps en gras (`--adrenaline-callout-title-font`, `--adrenaline-callout-title-weight`) : la police d'affichage, érodée, reste réservée aux titres de page.

## Callouts natifs

Trois types natifs d'Obsidian reprennent une mise en page du livret de scénario. Ils ne sont pas dans `ADRENALINE_VISUAL_CALLOUTS` : leur identifiant appartient à Obsidian, le pack n'en fixe que les valeurs.

| Type   | Usage de présentation                                                                                                                       | Jetons                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `note` | Document trouvé. Feuille claire tenue par un trombone, ombre portée, titre centré en majuscules, titre et corps dans la police manuscrite.  | `--adrenaline-note-surface`, `--adrenaline-note-ink`, `--adrenaline-note-font` |
| `info` | Information. La carte de `adrenaline-action` (titre sur bandeau pêche, corps sur surface claire), sans la bande grenat de la ligne de test. | ceux de `adrenaline-action`                                                    |
| `tip`  | Aide de jeu courte (phase, musique). Petite carte arrondie pêche à bord grenat, lignes compactes.                                           | `--adrenaline-callout-tip`, `-ink`, `-border`                                  |

## Titres et texte courant

| Élément       | Mise en page                                                                                                         | Jetons                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Titre 1       | Police d'affichage, majuscules, sur un panneau blanc fermé par un filet grenat, une frise grenat verticale à gauche. | `--h1-*`, `--adrenaline-h1-surface`, `-frieze`, `-rule` |
| Titre 2       | Comme le titre 1, plus petit, sur un filet fin.                                                                      | `--h2-*`, `--adrenaline-h2-rule`                        |
| Titre 3       | Serif du corps, semi-gras grenat, casse normale, sur un filet grenat fin.                                            | `--h3-*`, `--adrenaline-h3-rule`                        |
| Titre 4       | Serif du corps, gras brun-grenat, sans filet.                                                                        | `--h4-*`                                                |
| Titre 5       | Comme le titre 4, à la taille du niveau 5.                                                                           | `--h5-*`                                                |
| Gras          | Encre du texte.                                                                                                      | `--bold-color`                                          |
| Code en ligne | Balisage entre accents graves : majuscules grasses grenat dans la police du corps, sans fond.                        | `--adrenaline-inline-code-*`                            |
| Liste à puces | Glyphe du pack dans l'encre du texte.                                                                                | `--adrenaline-list-marker-glyph`, `--list-marker-color` |

## Éléments en ligne

Ce ne sont pas des callouts, mais ils appartiennent au même vocabulaire et le pack les habille.

| Balise                                                                           | Usage                                                                                 |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `<span class="adrenaline-keyword">Mot-clé.</span>`                               | Mot-clé en tête de paragraphe : majuscules grasses grenat (`--adrenaline-keyword-*`). |
| `<mark class="adrenaline-status-yellow">3 malus</mark>`, `adrenaline-status-red` | Badge de seuil (`--adrenaline-status-*`).                                             |
| `<mark class="adrenaline-result-success">A</mark>`, `adrenaline-result-failure`  | Pastille de résultat d'une action (`--adrenaline-result-*`).                          |

## Jetons

Le pack porte toutes les valeurs, et le consommateur ne fournit que les sélecteurs. Chaque paire encre/fond est vérifiée en light et en dark par `npm run validate:pack`.

| Callout     | Jetons                                                                                                                                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| exemple     | `--adrenaline-example-rule`, `--adrenaline-callout-cartouche-bg`/`-ink`, `--adrenaline-emphasis-*`                                                                                                               |
| description | `--adrenaline-description-rule`, `--adrenaline-description-label-bg`/`-ink`                                                                                                                                      |
| encart      | `--adrenaline-band`/`-ink`, `--adrenaline-callout-surface`, `--adrenaline-callout-ink`, `--adrenaline-callout-border`                                                                                            |
| formation   | `--adrenaline-callout-cartouche-bg`/`-ink`, `--adrenaline-formation-surface`, `--adrenaline-emphasis-color`                                                                                                      |
| action      | `--adrenaline-action-title-bg`/`-ink`, `--adrenaline-action-border`, `--adrenaline-band`/`-ink`, `--adrenaline-card-surface`                                                                                     |
| roller      | `--adrenaline-band`/`-ink`, `--adrenaline-callout-border`, `--adrenaline-table-*`                                                                                                                                |
| mention     | `--adrenaline-mention-surface`, `--adrenaline-mention-border`, `--adrenaline-mention-title`, `--adrenaline-mention-icon`, `--adrenaline-mention-icon-<modificateur>`, `--adrenaline-keyword-transform`/`-weight` |

Voir `callouts-example.md` pour une note qui couvre chaque callout, les titres h1 à h5 et une liste imbriquée.
